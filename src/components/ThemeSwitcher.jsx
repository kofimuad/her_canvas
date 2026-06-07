import { THEMES, useTheme } from '../theme/ThemeProvider'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center gap-2">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          aria-label={`${t.label} theme`}
          className={`h-6 w-6 rounded-full border-2 transition ${
            theme === t.id ? 'border-ink scale-110' : 'border-white/60'
          }`}
          style={{ background: t.swatch }}
        />
      ))}
    </div>
  )
}
