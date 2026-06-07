// One place to talk to whichever AI provider is configured.
// Prefers Groq (free) when GROQ_API_KEY is set, else Anthropic/Claude.
// Returns the model's raw text (expected to be JSON).
import Anthropic from '@anthropic-ai/sdk'

export async function chatJSON({ system, user, maxTokens = 1024 }) {
  if (process.env.GROQ_API_KEY) return viaGroq({ system, user, maxTokens })
  if (process.env.ANTHROPIC_API_KEY) return viaAnthropic({ system, user, maxTokens })
  throw new Error(
    'No AI key set. Add GROQ_API_KEY (free) or ANTHROPIC_API_KEY to your environment.'
  )
}

async function viaGroq({ system, user, maxTokens }) {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Groq error ${res.status}: ${t.slice(0, 200)}`)
  }
  const d = await res.json()
  return d.choices?.[0]?.message?.content || ''
}

async function viaAnthropic({ system, user, maxTokens }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'
  const msg = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: user }],
  })
  return msg.content?.[0]?.text || ''
}
