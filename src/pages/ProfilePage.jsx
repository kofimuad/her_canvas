import { useEffect, useState } from 'react'
import { useProfile } from '../lib/profile'
import { aestheticOptions, profile as defaults } from '../config/irene'

export default function ProfilePage() {
  const { profile, save } = useProfile()
  const [displayName, setDisplayName] = useState('')
  const [picked, setPicked] = useState([])
  const [bodyType, setBodyType] = useState('')
  const [dressSize, setDressSize] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || defaults.firstName)
      setPicked(profile.aesthetics || [])
      setBodyType(profile.bodyType || '')
      setDressSize(profile.dressSize || '')
    }
  }, [profile])

  function toggle(tag) {
    setPicked((p) =>
      p.includes(tag) ? p.filter((t) => t !== tag) : p.length < 5 ? [...p, tag] : p
    )
    setStatus('')
  }

  async function onSave() {
    if (picked.length < 3) {
      setStatus('Keep at least 3 aesthetics.')
      return
    }
    setBusy(true)
    try {
      await save({
        displayName: displayName.trim(),
        aesthetics: picked,
        bodyType: bodyType.trim() || null,
        dressSize: dressSize.trim() || null,
      })
      setStatus('Saved ✓')
    } catch (e) {
      setStatus(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header>
        <p className="caption text-muted">Your style profile</p>
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="text-muted">This grows with you — update it whenever your taste evolves.</p>
      </header>

      <div className="card space-y-6 p-6">
        <div>
          <label className="caption text-muted">Name</label>
          <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div>
          <label className="caption text-muted">Your aesthetics (3–5)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {aestheticOptions.map((a) => (
              <button key={a} onClick={() => toggle(a)} className={`chip ${picked.includes(a) ? 'chip-active' : ''}`}>
                {a}
              </button>
            ))}
          </div>
          <p className="caption mt-2 text-muted">{picked.length}/5 selected</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="caption text-muted">Body type</label>
            <input className="input mt-1" value={bodyType} onChange={(e) => setBodyType(e.target.value)} />
          </div>
          <div>
            <label className="caption text-muted">Dress size</label>
            <input className="input mt-1" value={dressSize} onChange={(e) => setDressSize(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={onSave} disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
          {status && <span className="text-sm text-muted">{status}</span>}
        </div>
      </div>
    </div>
  )
}
