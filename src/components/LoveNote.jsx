import { useMemo, useState } from 'react'
import { easterEggs, poems } from '../config/irene'

// Shows a special-date message if today matches, otherwise reveals a rotating
// poem / hidden note on click. A quiet little easter egg corner.
export default function LoveNote() {
  const [open, setOpen] = useState(false)

  const todayMessage = useMemo(() => {
    const d = new Date()
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`
    return easterEggs.specialDates?.[key]
  }, [])

  const poem = poems[0]

  if (todayMessage) {
    return (
      <div className="mx-auto max-w-md rounded-xl2 border border-primary-soft bg-primary-soft/50 p-4 text-ink">
        {todayMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="caption text-muted underline-offset-4 hover:text-primary hover:underline"
      >
        {open ? 'Close' : 'A note'}
      </button>
      {open && (
        <div className="mx-auto max-w-md rounded-xl2 border border-line bg-surface p-5 text-left">
          {poem && (
            <>
              <p className="font-display text-base text-ink">{poem.title}</p>
              <div className="mt-2 space-y-1 text-sm text-muted">
                {poem.lines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
            </>
          )}
          <p className="mt-4 border-t border-line pt-3 text-xs italic text-muted">
            {easterEggs.hiddenNote}
          </p>
        </div>
      )}
    </div>
  )
}
