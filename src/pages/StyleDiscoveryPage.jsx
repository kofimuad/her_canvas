import { useState } from 'react'
import { getOutfitSuggestions } from '../lib/api'
import { occasions, profile } from '../config/irene'
import { useProfile } from '../lib/profile'

export default function StyleDiscoveryPage() {
  const { profile: styleProfile } = useProfile()
  const [vibe, setVibe] = useState('')
  const [occasion, setOccasion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [outfits, setOutfits] = useState([])

  async function run() {
    if (!vibe.trim()) {
      setError('Describe the look or vibe you’re going for.')
      return
    }
    setLoading(true)
    setError('')
    setOutfits([])
    try {
      const data = await getOutfitSuggestions({ vibe: vibe.trim(), occasion, profile: styleProfile })
      setOutfits(data.outfits || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Style Discovery</h1>
        <p className="text-muted">
          “What should I wear for this?” — outfit ideas tuned for a{' '}
          {profile.bodyType.label.toLowerCase()} frame, with African designer picks.
        </p>
      </header>

      <div className="card p-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input"
            placeholder="e.g. editorial rooftop shoot at golden hour"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
          />
          <button className="btn-primary whitespace-nowrap" onClick={run} disabled={loading}>
            {loading ? 'Styling…' : 'Get outfits'}
          </button>
        </div>

        <p className="mt-4 text-sm text-muted">Occasion</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {occasions.map((o) => (
            <button
              key={o}
              onClick={() => setOccasion(occasion === o ? '' : o)}
              className={`chip ${occasion === o ? 'chip-active' : ''}`}
            >
              {o}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl2 bg-primary-soft" />
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {outfits.map((o, i) => (
          <article key={i} className="card p-6">
            <h3 className="font-display text-xl">{o.name}</h3>
            <p className="mt-1 text-sm text-muted">{o.description}</p>

            {o.keyPieces?.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {o.keyPieces.map((k) => (
                  <li key={k} className="chip cursor-default">{k}</li>
                ))}
              </ul>
            )}

            {o.palette?.length > 0 && (
              <div className="mt-3 flex gap-1.5">
                {o.palette.map((p) => (
                  <div
                    key={p.hex || p}
                    className="h-6 w-6 rounded-md border border-line"
                    style={{ background: p.hex || p }}
                    title={p.name || p}
                  />
                ))}
              </div>
            )}

            {o.bodyTypeNote && (
              <div className="mt-4 border-l-2 border-accent pl-3">
                <span className="caption text-accent">For your frame</span>
                <p className="mt-1 text-sm text-ink">{o.bodyTypeNote}</p>
              </div>
            )}

            {o.africanDesignerPicks?.length > 0 && (
              <div className="mt-4">
                <span className="caption text-muted">Designer picks</span>
                <p className="mt-1 text-sm text-accent">
                  {o.africanDesignerPicks.join(' · ')}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
