// Thin wrapper around the Netlify Functions backend (served at /api/*).

async function post(path, body) {
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const generateMoodBoard = (payload) => post('generate-moodboard', payload)
export const getOutfitSuggestions = (payload) => post('outfit-suggestions', payload)
export const importImage = (url) => post('import-image', { url })
