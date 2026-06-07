import { useState } from 'react'
import { THEMES, useTheme } from '../theme/ThemeProvider'

function Dot({ t, active, onClick, size = 'h-6 w-6' }) {
  return (
    <button
      onClick={onClick}
      title={t.label}
      aria-label={`${t.label} theme`}
      className={`${size} shrink-0 rounded-full border-2 transition ${
        active ? 'border-ink scale-110' : 'border-white/60'
      }`}
      style={{ background: t.swatch }}
    />
  )
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const current = THEMES.find((t) => t.id === theme) || THEMES[0]

  return (
    <>
      {/* Desktop: full inline row */}
      <div className="hidden items-center gap-1.5 sm:flex">
        {THEMES.map((t) => (
          <Dot key={t.id} t={t} active={theme === t.id} onClick={() => setTheme(t.id)} size="h-5 w-5" />
        ))}
      </div>

      {/* Mobile: collapsed swatch + arrow that expands */}
      <div className="relative sm:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Choose a theme"
          className="flex items-center gap-1 rounded-full border border-line bg-surface px-1.5 py-1"
        >
          <span className="h-5 w-5 rounded-full border-2 border-ink" style={{ background: current.swatch }} />
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-40 mt-2 grid w-max grid-cols-5 gap-2.5 rounded-xl2 border border-line bg-surface p-3 shadow-soft">
              {THEMES.map((t) => (
                <Dot
                  key={t.id}
                  t={t}
                  active={theme === t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setOpen(false)
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
