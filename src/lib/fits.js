// Repository for "My Fits". Uses Supabase when configured, otherwise persists
// to localStorage so the feature works fully in demo mode.
import { supabase, isSupabaseReady } from './supabase'

const LS_KEY = 'herCanvas.fits'

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

// Normalize a Supabase row into the shape the UI uses.
const mapRow = (r) => ({
  id: r.id,
  src: r.image_url,
  title: r.title,
  occasion: r.occasion,
  aesthetic: r.aesthetic,
  note: r.note,
  favourite: r.is_favourite,
  storagePath: r.storage_path,
  createdAt: r.created_at,
})

async function currentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function listFits() {
  if (!isSupabaseReady) return lsGet()
  const user = await currentUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('fits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapRow)
}

export async function addFit({ blob, dataUrl, title, occasion, aesthetic, note, favourite }) {
  if (!isSupabaseReady) {
    const item = {
      id: newId(),
      src: dataUrl,
      title,
      occasion,
      aesthetic,
      note,
      favourite: !!favourite,
      createdAt: new Date().toISOString(),
    }
    lsSet([item, ...lsGet()])
    return item
  }

  const user = await currentUser()
  if (!user) throw new Error('Please sign in to save fits.')

  const path = `${user.id}/${newId()}.jpg`
  const { error: upErr } = await supabase.storage
    .from('lookbook')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (upErr) throw upErr

  const { data: pub } = supabase.storage.from('lookbook').getPublicUrl(path)

  const { data, error } = await supabase
    .from('fits')
    .insert({
      user_id: user.id,
      image_url: pub.publicUrl,
      storage_path: path,
      title,
      occasion,
      aesthetic,
      note,
      is_favourite: !!favourite,
    })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateFit(id, patch) {
  if (!isSupabaseReady) {
    const all = lsGet().map((f) => (f.id === id ? { ...f, ...patch } : f))
    lsSet(all)
    return all.find((f) => f.id === id)
  }
  const row = {}
  if ('favourite' in patch) row.is_favourite = patch.favourite
  if ('note' in patch) row.note = patch.note
  if ('title' in patch) row.title = patch.title
  const { data, error } = await supabase
    .from('fits')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function removeFit(fit) {
  const id = typeof fit === 'object' ? fit.id : fit
  if (!isSupabaseReady) {
    lsSet(lsGet().filter((f) => f.id !== id))
    return
  }
  if (fit?.storagePath) {
    await supabase.storage.from('lookbook').remove([fit.storagePath])
  }
  const { error } = await supabase.from('fits').delete().eq('id', id)
  if (error) throw error
}
