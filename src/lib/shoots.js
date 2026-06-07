// Repository for shoot/event plans. Supabase when configured, else localStorage.
import { supabase, isSupabaseReady } from './supabase'

const LS_KEY = 'herCanvas.shoots'

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
  shootDate: r.shoot_date,
  location: r.location,
  notes: r.notes,
  boardId: r.board_id,
  fitId: r.fit_id,
  checklist: r.checklist || [],
  isComplete: r.is_complete,
  createdAt: r.created_at,
})

const toRow = (p) => ({
  name: p.name,
  shoot_date: p.shootDate || null,
  location: p.location || null,
  notes: p.notes || null,
  board_id: p.boardId || null,
  fit_id: p.fitId || null,
  checklist: p.checklist || [],
  is_complete: !!p.isComplete,
})

async function currentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function listShoots() {
  if (!isSupabaseReady) return lsGet()
  const user = await currentUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('shoot_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('shoot_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  return (data || []).map(mapRow)
}

export async function saveShoot(plan) {
  if (!isSupabaseReady) {
    const item = {
      id: newId(),
      name: plan.name,
      shootDate: plan.shootDate || null,
      location: plan.location || null,
      notes: plan.notes || null,
      boardId: plan.boardId || null,
      fitId: plan.fitId || null,
      checklist: plan.checklist || [],
      isComplete: false,
      createdAt: new Date().toISOString(),
    }
    lsSet([item, ...lsGet()])
    return item
  }
  const user = await currentUser()
  if (!user) throw new Error('Please sign in to save shoot plans.')
  const { data, error } = await supabase
    .from('shoot_plans')
    .insert({ user_id: user.id, ...toRow(plan) })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateShoot(id, patch) {
  if (!isSupabaseReady) {
    const all = lsGet().map((p) => (p.id === id ? { ...p, ...patch } : p))
    lsSet(all)
    return all.find((p) => p.id === id)
  }
  const row = {}
  if ('checklist' in patch) row.checklist = patch.checklist
  if ('isComplete' in patch) row.is_complete = patch.isComplete
  if ('notes' in patch) row.notes = patch.notes
  if ('location' in patch) row.location = patch.location
  if ('name' in patch) row.name = patch.name
  if ('shootDate' in patch) row.shoot_date = patch.shootDate
  if ('boardId' in patch) row.board_id = patch.boardId
  if ('fitId' in patch) row.fit_id = patch.fitId
  const { data, error } = await supabase
    .from('shoot_plans')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function removeShoot(plan) {
  const id = typeof plan === 'object' ? plan.id : plan
  if (!isSupabaseReady) {
    lsSet(lsGet().filter((p) => p.id !== id))
    return
  }
  const { error } = await supabase.from('shoot_plans').delete().eq('id', id)
  if (error) throw error
}
