import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseReady } from './supabase'
import { useAuth } from './auth'

const LS_KEY = 'herCanvas.profile'
const ProfileContext = createContext(null)
export const useProfile = () => useContext(ProfileContext)

const lsGet = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY))
  } catch {
    return null
  }
}
const lsSet = (v) => localStorage.setItem(LS_KEY, JSON.stringify(v))

const mapRow = (d) =>
  d && {
    displayName: d.display_name,
    aesthetics: d.aesthetics || [],
    bodyType: d.body_type,
    dressSize: d.dress_size,
    theme: d.theme,
  }

async function fetchProfile(user) {
  if (!isSupabaseReady) return lsGet()
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  return mapRow(data)
}

async function persistProfile(user, patch) {
  if (!isSupabaseReady) {
    const next = { ...(lsGet() || {}), ...patch }
    lsSet(next)
    return next
  }
  if (!user) throw new Error('Please sign in to save your profile.')
  const row = { id: user.id }
  if ('displayName' in patch) row.display_name = patch.displayName
  if ('aesthetics' in patch) row.aesthetics = patch.aesthetics
  if ('bodyType' in patch) row.body_type = patch.bodyType
  if ('dressSize' in patch) row.dress_size = patch.dressSize
  if ('theme' in patch) row.theme = patch.theme
  const { data, error } = await supabase.from('profiles').upsert(row).select().single()
  if (error) throw error
  return mapRow(data)
}

export function ProfileProvider({ children }) {
  const { session, isAuthed } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setProfile(await fetchProfile(session?.user))
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (isAuthed) load()
    else setLoading(false)
  }, [isAuthed, load])

  const save = useCallback(
    async (patch) => {
      const next = await persistProfile(session?.user, patch)
      setProfile(next)
      return next
    },
    [session]
  )

  const isOnboarded = Boolean(profile?.aesthetics?.length)

  return (
    <ProfileContext.Provider value={{ profile, loading, isOnboarded, save }}>
      {children}
    </ProfileContext.Provider>
  )
}
