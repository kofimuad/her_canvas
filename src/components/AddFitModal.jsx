import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { processImage, processDataUrl } from '../lib/image'
import { importImage } from '../lib/api'
import { occasions, presetCategories, profile } from '../config/irene'

const aestheticOptions = [...new Set([...profile.signatureAesthetics, ...presetCategories])]

export default function AddFitModal({ open, onClose, onSave }) {
  const [preview, setPreview] = useState(null) // dataUrl
  const [blob, setBlob] = useState(null)
  const [title, setTitle] = useState('')
  const [occasion, setOccasion] = useState('')
  const [aesthetic, setAesthetic] = useState('')
  const [note, setNote] = useState('')
  const [favourite, setFavourite] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [link, setLink] = useState('')
  const [importing, setImporting] = useState(false)

  function reset() {
    setPreview(null); setBlob(null); setTitle(''); setOccasion('')
    setAesthetic(''); setNote(''); setFavourite(false); setError(''); setLink('')
  }

  async function importFromLink() {
    if (!link.trim()) {
      setError('Paste a Pinterest / Instagram / image link first.')
      return
    }
    setImporting(true)
    setError('')
    try {
      const data = await importImage(link.trim())
      if (!data.dataUrl) throw new Error('Found the page but couldn’t fetch the image — try a direct image link.')
      const { dataUrl, blob } = await processDataUrl(data.dataUrl)
      setPreview(dataUrl)
      setBlob(blob)
      if (!title && data.title) setTitle(data.title.slice(0, 80))
    } catch (e) {
      setError(e.message)
    } finally {
      setImporting(false)
    }
  }
  function close() {
    reset()
    onClose()
  }

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const { dataUrl, blob } = await processImage(file)
      setPreview(dataUrl)
      setBlob(blob)
    } catch {
      setError('Could not read that image — try another.')
    }
  }

  async function save() {
    if (!preview) {
      setError('Add a photo first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onSave({ dataUrl: preview, blob, title: title.trim() || 'Untitled fit', occasion, aesthetic, note: note.trim(), favourite })
      close()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-xl2 bg-surface p-6 sm:max-w-md sm:rounded-xl2"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
            <p className="caption text-primary">A new fit</p>
            <h2 className="mt-1 font-display text-2xl">Add to your lookbook</h2>

            {/* Photo */}
            <label className="mt-5 block">
              {preview ? (
                <img src={preview} alt="preview" className="h-56 w-full rounded-xl2 object-cover" />
              ) : (
                <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl2 border border-dashed border-line text-muted">
                  <span className="caption">Tap to choose a photo</span>
                  <span className="mt-1 text-xs">from your camera or gallery</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={pick} />
            </label>

            {/* Or import from a shared link */}
            <div className="mt-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-line" />
              <span className="caption text-muted">or paste a link</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="input"
                placeholder="Pinterest / Instagram / image URL"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && importFromLink()}
              />
              <button className="btn-ghost whitespace-nowrap" onClick={importFromLink} disabled={importing}>
                {importing ? 'Fetching…' : 'Import'}
              </button>
            </div>

            <input
              className="input mt-4"
              placeholder="Title (e.g. Golden hour rooftop)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <p className="caption mt-5 text-muted">Occasion</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {occasions.map((o) => (
                <button key={o} type="button" onClick={() => setOccasion(occasion === o ? '' : o)}
                  className={`chip ${occasion === o ? 'chip-active' : ''}`}>{o}</button>
              ))}
            </div>

            <p className="caption mt-5 text-muted">Aesthetic</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {aestheticOptions.map((a) => (
                <button key={a} type="button" onClick={() => setAesthetic(aesthetic === a ? '' : a)}
                  className={`chip ${aesthetic === a ? 'chip-active' : ''}`}>{a}</button>
              ))}
            </div>

            <textarea
              className="input mt-5"
              rows={2}
              placeholder="A note… (e.g. wore this to the Luuma dinner, got so many compliments)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-[var(--c-primary)]" checked={favourite}
                onChange={(e) => setFavourite(e.target.checked)} />
              Mark as a favourite
            </label>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button className="btn-ghost flex-1" onClick={close} disabled={busy}>Cancel</button>
              <button className="btn-primary flex-1" onClick={save} disabled={busy}>
                {busy ? 'Saving…' : 'Save fit'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
