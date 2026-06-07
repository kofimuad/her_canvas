// Resolve a shared link (Pinterest pin, Instagram post, blog, or direct image)
// into an actual image. Browsers can't fetch those pages (CORS / login walls),
// so we do it server-side and read the Open Graph image.
const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

function fetchUA(url) {
  return fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml,image/*,*/*',
    },
  })
}

async function toDataUrl(res, contentType) {
  const buf = Buffer.from(await res.arrayBuffer())
  // Guard against oversized payloads (keep functions snappy).
  if (buf.byteLength > 8 * 1024 * 1024) return null
  return `data:${contentType};base64,${buf.toString('base64')}`
}

function metaContent(html, key) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i')
  const tag = html.match(re)
  if (!tag) return null
  const c = tag[0].match(/content=["']([^"']+)["']/i)
  return c ? c[1] : null
}

function extractImage(html, baseUrl) {
  const candidate =
    metaContent(html, 'og:image:secure_url') ||
    metaContent(html, 'og:image') ||
    metaContent(html, 'twitter:image') ||
    metaContent(html, 'twitter:image:src')
  if (!candidate) {
    const link = html.match(/<link[^>]+rel=["']image_src["'][^>]*>/i)
    if (link) {
      const href = link[0].match(/href=["']([^"']+)["']/i)
      if (href) return new URL(href[1], baseUrl).href
    }
    return null
  }
  try {
    return new URL(candidate, baseUrl).href
  } catch {
    return candidate
  }
}

function extractTitle(html) {
  return (
    metaContent(html, 'og:title') ||
    (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '').trim() ||
    ''
  )
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
  try {
    const { url } = JSON.parse(event.body || '{}')
    if (!url || !/^https?:\/\//i.test(url)) {
      return json(400, { error: 'Paste a valid http(s) link.' })
    }

    const res = await fetchUA(url)
    const contentType = res.headers.get('content-type') || ''

    // The link is already a direct image.
    if (contentType.startsWith('image/')) {
      const dataUrl = await toDataUrl(res, contentType)
      return json(200, { imageUrl: url, dataUrl, title: '', sourceUrl: url })
    }

    const html = await res.text()
    const imageUrl = extractImage(html, url)
    if (!imageUrl) {
      return json(422, {
        error:
          'Couldn’t find an image at that link. Instagram often needs a public post; try a Pinterest pin or a direct image URL.',
      })
    }

    const title = extractTitle(html)
    let dataUrl = null
    try {
      const imgRes = await fetchUA(imageUrl)
      if (imgRes.ok) {
        dataUrl = await toDataUrl(imgRes, imgRes.headers.get('content-type') || 'image/jpeg')
      }
    } catch {
      // keep imageUrl even if we couldn't download bytes
    }

    return json(200, { imageUrl, dataUrl, title, sourceUrl: url })
  } catch (e) {
    return json(500, { error: e.message || 'Could not import that link.' })
  }
}
