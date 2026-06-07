import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MoodBoardGenerator from '../components/MoodBoardGenerator'
import BoardView from '../components/BoardView'
import { useBoards } from '../hooks/useBoards'
import { shareBoard } from '../lib/share'
import { importImage } from '../lib/api'

export default function MoodBoardsPage() {
  const { boards, loading, save, duplicate, update, remove } = useBoards()
  const [open, setOpen] = useState(null) // board being viewed
  const [toast, setToast] = useState('')
  const [link, setLink] = useState('')
  const [importing, setImporting] = useState(false)

  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  async function onShare(board) {
    const res = await shareBoard(board)
    if (res === 'copied') flash('Board details copied to clipboard')
    else if (res === 'shared') flash('Shared')
    else if (res === 'failed') flash('Could not share')
  }

  async function onDuplicate(board) {
    await duplicate(board)
    flash('Duplicated')
  }

  async function onDelete(board) {
    await remove(board)
    if (open?.id === board.id) setOpen(null)
    flash('Removed')
  }

  async function addPinToOpen() {
    if (!link.trim()) return
    setImporting(true)
    try {
      const data = await importImage(link.trim())
      const src = data.imageUrl
      if (!src) throw new Error('No image found at that link')
      const newImg = { url: src, thumb: src, link: data.sourceUrl, source: 'Imported', alt: data.title }
      const updated = await update(open, { images: [...(open.images || []), newImg] })
      setOpen(updated)
      setLink('')
      flash('Pin added to board')
    } catch (e) {
      flash(e.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl">Mood Boards</h1>
        <p className="text-muted">Type a vibe and watch your aesthetic come to life.</p>
      </header>

      <MoodBoardGenerator onSave={save} />

      {/* Saved boards */}
      <section className="border-t border-line pt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">My boards</h2>
          {boards.length > 0 && <span className="caption text-muted">{boards.length} saved</span>}
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading…</p>
        ) : boards.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No saved boards yet — generate one above and tap <em>Save board</em>.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {boards.map((b) => (
              <div key={b.id} className="card overflow-hidden">
                <button onClick={() => setOpen(b)} className="block w-full text-left">
                  <div className="grid aspect-[4/5] grid-cols-2 grid-rows-2 gap-px bg-line">
                    {(b.images?.slice(0, 4) || []).map((img, i) => (
                      <img key={i} src={img.thumb || img.url} alt="" className="h-full w-full object-cover" />
                    ))}
                    {(!b.images || b.images.length === 0) && (
                      <div className="col-span-2 row-span-2 grid grid-cols-4">
                        {(b.palette || []).slice(0, 4).map((p, i) => (
                          <div key={i} style={{ background: p.hex }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate font-display text-base">{b.name}</p>
                    <p className="caption text-muted">{b.images?.length || 0} visuals</p>
                  </div>
                </button>
                <div className="flex items-center justify-end gap-3 border-t border-line px-3 py-2 text-muted">
                  <button onClick={() => onShare(b)} className="caption hover:text-primary">Share</button>
                  <button onClick={() => onDuplicate(b)} className="caption hover:text-primary">Duplicate</button>
                  <button onClick={() => onDelete(b)} className="caption hover:text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Board viewer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto max-w-4xl rounded-xl2 bg-canvas p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl">{open.name}</h2>
                <div className="flex items-center gap-3 text-muted">
                  <button onClick={() => onShare(open)} className="caption hover:text-primary">Share</button>
                  <button onClick={() => onDuplicate(open)} className="caption hover:text-primary">Duplicate</button>
                  <button onClick={() => setOpen(null)} className="caption hover:text-ink">Close</button>
                </div>
              </div>
              {/* Add a pin to this saved board */}
              <div className="mt-2 mb-5 flex flex-col gap-2 sm:flex-row">
                <input
                  className="input"
                  placeholder="Add a pin: paste a Pinterest / Instagram / image link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPinToOpen()}
                />
                <button className="btn-ghost whitespace-nowrap" onClick={addPinToOpen} disabled={importing}>
                  {importing ? 'Fetching…' : 'Add image'}
                </button>
              </div>

              <BoardView board={open} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm text-white shadow-soft"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
