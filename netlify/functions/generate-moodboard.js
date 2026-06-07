import './_env.js'
import { buildPersona } from './_persona.js'
import { chatJSON } from './_llm.js'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    const { vibe = '', category = '', profile = null } = JSON.parse(event.body || '{}')
    const subject = [vibe, category].filter(Boolean).join(' — ')
    if (!subject) return json(400, { error: 'Provide a vibe or category.' })

    const profileLine = buildProfileLine(profile)

    const text = await chatJSON({
      maxTokens: 900,
      system: buildPersona(),
      user: `Create a mood board concept for: "${subject}".${profileLine}
Return ONLY valid JSON (no prose, no markdown fences) with this exact shape:
{
  "title": string,
  "description": string (one evocative sentence),
  "palette": [{ "name": string, "hex": "#rrggbb" }]  // exactly 5 colours,
  "searchTerms": string[]  // 6 short, concrete photo-search phrases that capture this aesthetic,
  "keywords": string[]     // 4-6 tags
}`,
    })

    const data = parseJSON(text)
    const images = await fetchImages(data.searchTerms?.length ? data.searchTerms : [subject])
    return json(200, { ...data, images })
  } catch (e) {
    return json(500, { error: e.message || 'Something went wrong.' })
  }
}

function buildProfileLine(p) {
  if (!p) return ''
  const bits = []
  if (p.aesthetics?.length) bits.push(`her signature aesthetics are ${p.aesthetics.join(', ')}`)
  if (p.bodyType) bits.push(`body type: ${p.bodyType}`)
  return bits.length ? ` Tailor it to her: ${bits.join('; ')}.` : ''
}

function parseJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    const m = text.match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : {}
  }
}

// Pull real photos from Pexels + Unsplash (whichever keys are configured).
async function fetchImages(terms) {
  const queries = terms.slice(0, 4)
  const results = []
  await Promise.all(
    queries.map(async (q) => {
      const [pex, uns] = await Promise.all([fromPexels(q, 2), fromUnsplash(q, 2)])
      results.push(...pex, ...uns)
    })
  )
  const seen = new Set()
  return results.filter((r) => r && !seen.has(r.url) && seen.add(r.url)).slice(0, 16)
}

async function fromPexels(query, n) {
  const key = process.env.PEXELS_API_KEY
  if (!key) return []
  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${n}&orientation=portrait`,
      { headers: { Authorization: key } }
    )
    if (!r.ok) return []
    const d = await r.json()
    return (d.photos || []).map((p) => ({
      url: p.src.large,
      thumb: p.src.medium,
      link: p.url,
      alt: p.alt || query,
      source: 'Pexels',
      photographer: p.photographer,
    }))
  } catch {
    return []
  }
}

async function fromUnsplash(query, n) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return []
  try {
    const r = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${n}&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${key}` } }
    )
    if (!r.ok) return []
    const d = await r.json()
    return (d.results || []).map((p) => ({
      url: p.urls.regular,
      thumb: p.urls.small,
      link: p.links.html,
      alt: p.alt_description || query,
      source: 'Unsplash',
      photographer: p.user?.name,
    }))
  } catch {
    return []
  }
}
