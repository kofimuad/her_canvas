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
    const { vibe = '', occasion = '', profile = null } = JSON.parse(event.body || '{}')
    if (!vibe.trim()) return json(400, { error: 'Describe the look or vibe.' })

    const profileLine = buildProfileLine(profile)

    const text = await chatJSON({
      maxTokens: 1400,
      system: buildPersona(),
      user: `Suggest outfits for this look: "${vibe}".${
        occasion ? ` Occasion: ${occasion}.` : ''
      }${profileLine}
Return ONLY valid JSON (no prose, no markdown fences):
{
  "outfits": [
    {
      "name": string,                       // a style name
      "description": string,                // one or two sentences
      "keyPieces": string[],                // 3-5 concrete pieces
      "palette": [{ "name": string, "hex": "#rrggbb" }],  // 3-4 colours
      "bodyTypeNote": string,               // why it flatters her frame
      "africanDesignerPicks": string[]      // 1-3 REAL designers/brands that fit
    }
  ]   // 4 outfits
}`,
    })

    const data = parseJSON(text)
    return json(200, { outfits: data.outfits || [] })
  } catch (e) {
    return json(500, { error: e.message || 'Something went wrong.' })
  }
}

function buildProfileLine(p) {
  if (!p) return ''
  const bits = []
  if (p.aesthetics?.length) bits.push(`her signature aesthetics are ${p.aesthetics.join(', ')}`)
  if (p.bodyType) bits.push(`body type: ${p.bodyType}`)
  if (p.dressSize) bits.push(`dress size ${p.dressSize}`)
  return bits.length ? ` Tailor to her: ${bits.join('; ')}.` : ''
}

function parseJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    const m = text.match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : {}
  }
}
