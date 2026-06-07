import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseReady } from './supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const DEMO_KEY = 'herCanvas.demoUnlocked'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // Demo unlock lets her in even before Supabase keys are configured.
  const [demoUnlocked, setDemoUnlocked] = useState(
    () => localStorage.getItem(DEMO_KEY) === '1'
  )

  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Send a passwordless magic link ("the love letter").
  async function sendLoveLetter(email) {
    if (!isSupabaseReady) {
      unlockDemo()
      return { demo: true }
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
    return { sent: true }
  }

  function unlockDemo() {
    localStorage.setItem(DEMO_KEY, '1')
    setDemoUnlocked(true)
  }

  async function signOut() {
    if (isSupabaseReady) await supabase.auth.signOut()
    localStorage.removeItem(DEMO_KEY)
    setDemoUnlocked(false)
    setSession(null)
  }

  const isAuthed = Boolean(session) || demoUnlocked

  return (
    <AuthContext.Provider
      value={{ session, isAuthed, loading, isSupabaseReady, sendLoveLetter, unlockDemo, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
