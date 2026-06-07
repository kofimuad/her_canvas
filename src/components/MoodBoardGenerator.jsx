import { useEffect, useState } from 'react'
import { generateMoodBoard, importImage } from '../lib/api'
import { presetCategories } from '../config/irene'
import { useProfile } from '../lib/profile'
import BoardView from './BoardView'

export default function MoodBoardGenerator({ onSave }) {
  const { profile: styleProfile } = useProfile()
  const [vibe, setVibe] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [board, setBoard] = useState(null)

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [link, setLink] = useState('')
  const [importing, setImporting] = useState(false)

  // Prefill the save name when a new board arrives.
  useEffect(() => {
    if (board) {
      setName(board.title || vibe || category || 'My board')
      setSaved(false)
    }
  }, [board])

  async function run() {
    if (!vibe.trim() && !category) {
      setError('Type a vibe or pick a category first.')
      return
    }
    setLoading(true)
    setError('')
    setBoard(null)
    try {
      const data = await generateMoodBoard({ vibe: vibe.trim(), category, profile: styleProfile })
      setBoard({ ...data, vibe: vibe.trim(), category })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function addFromLink() {
    if (!link.trim()) {
      setError('Paste a Pinterest / Instagram / image link first.')
      return
    }
    setImporting(true)
    setError('')
    try {
      const data = await importImage(link.trim())
      const src = data.imageUrl
      if (!src) throw new Error('Couldn’t find an image at that link.')
      const newImg = { url: src, thumb: src, link: data.sourceUrl, source: 'Imported', alt: data.title }
      setBoard((prev) =>
        prev
          ? { ...prev, images: [...(prev.images || []), newImg] }
          : {
              title: 'My board',
              description: 'A board built from your own picks.',
              palette: [],
              keywords: [],
              images: [newImg],
              vibe: '',
              category: '',
            }
      )
      setSaved(false)
      setLink('')
    } catch (e) {
      setError(e.message)
    } finally {
      setImporting(false)
    }
  }

  async function save() {
    if (!name.trim()) {
      setError('Give your board a name.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        name: name.trim(),
        vibe: board.vibe,
        category: board.category,
        description: board.description,
        palette: board.palette,
        keywords: board.keywords,
        images: board.images,
      })
      setSaved(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <label className="text-sm font-medium text-ink">Describe a vibe</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            className="input"
            placeholder="e.g. dark academia, soft glam, golden hour rooftop…"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
          />
          <button className="btn-primary whitespace-nowrap" onClick={run} disabled={loading}>
            {loading ? 'Creating…' : 'Generate board'}
          </button>
        </div>

        <p className="mt-4 text-sm text-muted">Or pick a preset</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {presetCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? '' : c)}
              className={`chip ${category === c ? 'chip-active' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span className="h-px flex-1 bg-line" />
          <span className="caption text-muted">or add your own pins</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            className="input"
            placeholder="Paste a Pinterest / Instagram / image link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFromLink()}
          />
          <button className="btn-ghost whitespace-nowrap" onClick={addFromLink} disabled={importing}>
            {importing ? 'Fetching…' : 'Add image'}
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl2 bg-primary-soft" />
          ))}
        </div>
      )}

      {board && (
        <div className="space-y-5">
          <BoardView board={board} />

          {/* Save bar */}
          <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <input
              className="input flex-1"
              placeholder="Name this board (e.g. Editorial Shoot — March)"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSaved(false)
              }}
            />
            <button className="btn-primary whitespace-nowrap" onClick={save} disabled={saving || saved}>
              {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save board'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
