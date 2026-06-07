import { useMemo, useState } from 'react'
import { useShoots } from '../hooks/useShoots'
import { useBoards } from '../hooks/useBoards'
import { useFits } from '../hooks/useFits'
import { preloadedFits } from '../config/irene'

const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''

export default function ShootPlansPage() {
  const { plans, loading, save, update, remove } = useShoots()
  const { boards } = useBoards()
  const { fits } = useFits()

  // Resolve linked board/fit by id for display.
  const boardById = useMemo(() => Object.fromEntries(boards.map((b) => [b.id, b])), [boards])
  const allFits = fits.length ? fits : preloadedFits
  const fitById = useMemo(() => Object.fromEntries(allFits.map((f) => [f.id, f])), [allFits])

  // ── New-plan form state ──
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [boardId, setBoardId] = useState('')
  const [fitId, setFitId] = useState('')
  const [checklist, setChecklist] = useState([])
  const [task, setTask] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function addTask() {
    if (!task.trim()) return
    setChecklist((c) => [...c, { id: newId(), label: task.trim(), done: false }])
    setTask('')
  }

  function resetForm() {
    setName(''); setDate(''); setLocation(''); setNotes('')
    setBoardId(''); setFitId(''); setChecklist([]); setTask(''); setError('')
  }

  async function createPlan() {
    if (!name.trim()) {
      setError('Give your shoot a name.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await save({ name: name.trim(), shootDate: date, location, notes, boardId, fitId, checklist })
      resetForm()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function toggleTask(plan, taskId) {
    const next = (plan.checklist || []).map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    )
    update(plan, { checklist: next })
  }

  const upcoming = plans.filter((p) => !p.isComplete)
  const past = plans
    .filter((p) => p.isComplete)
    .sort((a, b) => new Date(b.shootDate || b.createdAt) - new Date(a.shootDate || a.createdAt))

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl">Shoot Planning</h1>
        <p className="text-muted">
          Bring a mood board, an outfit, a location, and a prep checklist together for the day.
        </p>
      </header>

      {/* New plan */}
      <section className="card p-6">
        <h2 className="font-display text-xl">New shoot plan</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Shoot name (e.g. Editorial — March)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="input sm:col-span-2" placeholder="Location (e.g. Jamestown)" value={location} onChange={(e) => setLocation(e.target.value)} />

          <select className="input" value={boardId} onChange={(e) => setBoardId(e.target.value)}>
            <option value="">Link a mood board…</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select className="input" value={fitId} onChange={(e) => setFitId(e.target.value)}>
            <option value="">Link an outfit…</option>
            {allFits.map((f) => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>

          <textarea className="input sm:col-span-2" rows={2} placeholder="Notes & vision…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Checklist builder */}
        <p className="caption mt-5 text-muted">Prep checklist</p>
        <div className="mt-2 flex gap-2">
          <input className="input" placeholder="Add a step (e.g. steam dress)" value={task}
            onChange={(e) => setTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} />
          <button className="btn-ghost" onClick={addTask}>Add</button>
        </div>
        {checklist.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {checklist.map((t) => (
              <li key={t.id} className="flex items-center justify-between">
                <span>{t.label}</span>
                <button className="caption text-muted hover:text-red-500"
                  onClick={() => setChecklist((c) => c.filter((x) => x.id !== t.id))}>remove</button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <button className="btn-primary mt-6" onClick={createPlan} disabled={saving}>
          {saving ? 'Saving…' : 'Create plan'}
        </button>
      </section>

      {/* Upcoming */}
      <section>
        <h2 className="font-display text-2xl">Upcoming</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No upcoming shoots yet — plan one above.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {upcoming.map((p) => {
              const board = boardById[p.boardId]
              const fit = fitById[p.fitId]
              const done = (p.checklist || []).filter((t) => t.done).length
              return (
                <article key={p.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl">{p.name}</h3>
                      <p className="caption text-muted">
                        {[fmtDate(p.shootDate), p.location].filter(Boolean).join(' · ') || 'No date set'}
                      </p>
                    </div>
                    <button className="caption text-muted hover:text-red-500" onClick={() => remove(p)}>delete</button>
                  </div>

                  {(board || fit) && (
                    <div className="mt-3 flex gap-3">
                      {board && (
                        <div className="flex items-center gap-2">
                          {board.images?.[0] && <img src={board.images[0].thumb || board.images[0].url} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                          <span className="caption text-muted">{board.name}</span>
                        </div>
                      )}
                      {fit && (
                        <div className="flex items-center gap-2">
                          {fit.src && <img src={fit.src} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                          <span className="caption text-muted">{fit.title}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {p.notes && <p className="mt-3 text-sm text-ink/80">{p.notes}</p>}

                  {p.checklist?.length > 0 && (
                    <div className="mt-4">
                      <p className="caption text-muted">Checklist · {done}/{p.checklist.length}</p>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {p.checklist.map((t) => (
                          <li key={t.id}>
                            <label className="flex cursor-pointer items-center gap-2">
                              <input type="checkbox" className="accent-[var(--c-primary)]" checked={t.done} onChange={() => toggleTask(p, t.id)} />
                              <span className={t.done ? 'text-muted line-through' : ''}>{t.label}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button className="btn-primary mt-5 w-full" onClick={() => update(p, { isComplete: true })}>
                    Mark complete
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Past — portfolio timeline */}
      {past.length > 0 && (
        <section>
          <h2 className="font-display text-2xl">Past shoots</h2>
          <p className="caption text-muted">Your growth as a model, over time.</p>
          <div className="mt-5 border-l border-line pl-6">
            {past.map((p) => {
              const board = boardById[p.boardId]
              const fit = fitById[p.fitId]
              const thumb = fit?.src || board?.images?.[0]?.thumb || board?.images?.[0]?.url
              return (
                <div key={p.id} className="relative mb-7">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-canvas" />
                  <p className="caption text-muted">{fmtDate(p.shootDate) || fmtDate(p.createdAt)}</p>
                  <div className="mt-1 flex items-center gap-3">
                    {thumb && <img src={thumb} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                    <div>
                      <h3 className="font-display text-lg">{p.name}</h3>
                      {p.location && <p className="caption text-muted">{p.location}</p>}
                    </div>
                    <button className="caption ml-auto text-muted hover:text-red-500" onClick={() => remove(p)}>delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
