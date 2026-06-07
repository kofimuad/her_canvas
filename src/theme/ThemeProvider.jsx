import { createContext, useContext, useEffect, useState } from 'react'

export const THEMES = [
  { id: 'blush', label: 'Blush', swatch: '#d98ca0' },
  { id: 'lavender', label: 'Lavender', swatch: '#a78bce' },
  { id: 'accra', label: 'Accra', swatch: '#d98248' },
  { id: 'sage', label: 'Sage', swatch: '#7fa07a' },
  { id: 'noir', label: 'Noir', swatch: '#1f1d1b' },
]

const ThemeContext = createContext({ theme: 'blush', setTheme: () => {} })
export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('herCanvas.theme') || 'blush'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('herCanvas.theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
