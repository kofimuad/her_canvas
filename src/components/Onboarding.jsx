import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProfile } from '../lib/profile'
import { profile as defaults, aestheticOptions } from '../config/irene'

// First-run style profile (US-031/033). Prefilled with her signatures so it's
// personalized from day one, but fully hers to change.
export default function Onboarding() {
  const { save } = useProfile()
  const [picked, setPicked] = useState(defaults.signatureAesthetics.slice(0, 5))
  const [bodyType, setBodyType] = useState(defaults.bodyType.label)
  const [dressSize, setDressSize] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function toggle(tag) {
    setPicked((p) =>
      p.includes(tag) ? p.filter((t) => t !== tag) : p.length < 5 ? [...p, tag] : p
    )
  }

  async function begin() {
    if (picked.length < 3) {
      setError('Pick at least 3 that feel like you.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await save({
        displayName: defaults.firstName,
        aesthetics: picked,
        bodyType: bodyType.trim() || null,
        dressSize: dressSize.trim() || null,
      })
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  const ease = [0.22, 1, 0.36, 1]

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-gradient-to-br from-primary-soft via-canvas to-canvas px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="w-full max-w-lg"
      >
        <p className="caption text-primary">Welcome, {defaults.firstName}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight">What’s your vibe?</h1>
        <p className="mt-3 text-muted">
          Pick 3–5 aesthetics that feel like you. They shape every suggestion — and you
          can change them anytime.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {aestheticOptions.map((a) => (
            <button
              key={a}
              onClick={() => toggle(a)}
              className={`chip ${picked.includes(a) ? 'chip-active' : ''}`}
            >
              {a}
            </button>
          ))}
        </div>
        <p className="caption mt-2 text-muted">{picked.length}/5 selected</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="caption text-muted">Body type (optional)</label>
            <input className="input mt-1" value={bodyType} onChange={(e) => setBodyType(e.target.value)} />
          </div>
          <div>
            <label className="caption text-muted">Usual dress size (optional)</label>
            <input className="input mt-1" placeholder="e.g. S / 8" value={dressSize} onChange={(e) => setDressSize(e.target.value)} />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button className="btn-primary mt-7 w-full" onClick={begin} disabled={busy}>
          {busy ? 'Setting up…' : 'Step into Her Canvas'}
        </button>
      </motion.div>
    </div>
  )
}
