// Repository for saved mood boards. Supabase when configured, else localStorage.
import { supabase, isSupabaseReady } from './supabase'

const LS_KEY = 'herCanvas.boards'

const lsGet = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || []
  } catch {
    return []
  }
}
const lsSet = (v) => localStorage.setItem(LS_KEY, JSON.stringify(v))

const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

const mapRow = (r) => ({
  id: r.id,
  name: r.name,
  vibe: r.vibe,
  category: r.category,
  description: r.description,
  palette: r.palette || [],
  keywords: r.keywords || [],
  images: r.images || [],
  createdAt: r.created_at,
})

async function currentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Keep only the fields we persist (drop transient stuff like `title`).
const toPayload = (b) => ({
  name: b.name,
  vibe: b.vibe || null,
  category: b.category || null,
  description: b.description || null,
  palette: b.palette || [],
  keywords: b.keywords || [],
  images: b.images || [],
})

export async function listBoards() {
  if (!isSupabaseReady) return lsGet()
  const user = await currentUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('mood_boards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapRow)
}

export async function saveBoard(board) {
  const payload = toPayload(board)
  if (!isSupabaseReady) {
    const item = { id: newId(), ...payload, createdAt: new Date().toISOString() }
    lsSet([item, ...lsGet()])
    return item
  }
  const user = await currentUser()
  if (!user) throw new Error('Please sign in to save boards.')
  const { data, error } = await supabase
    .from('mood_boards')
    .insert({ user_id: user.id, ...payload })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export function duplicateBoard(board) {
  return saveBoard({ ...board, name: `${board.name} (copy)` })
}

// Update allowed fields (name, description, palette, keywords, images).
export async function updateBoard(id, patch) {
  const allowed = ['name', 'description', 'palette', 'keywords', 'images']
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([k]) => allowed.includes(k))
  )
  if (!isSupabaseReady) {
    const all = lsGet().map((b) => (b.id === id ? { ...b, ...clean } : b))
    lsSet(all)
    return all.find((b) => b.id === id)
  }
  const { data, error } = await supabase
    .from('mood_boards')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function renameBoard(id, name) {
  if (!isSupabaseReady) {
    const all = lsGet().map((b) => (b.id === id ? { ...b, name } : b))
    lsSet(all)
    return all.find((b) => b.id === id)
  }
  const { data, error } = await supabase
    .from('mood_boards')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function removeBoard(board) {
  const id = typeof board === 'object' ? board.id : board
  if (!isSupabaseReady) {
    lsSet(lsGet().filter((b) => b.id !== id))
    return
  }
  const { error } = await supabase.from('mood_boards').delete().eq('id', id)
  if (error) throw error
}
