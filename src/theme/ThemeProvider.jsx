import { createContext, useContext, useEffect, useState } from 'react'

export const THEMES = [
  { id: 'blush', label: 'Blush', swatch: '#d98ca0' },
  { id: 'bubblegum', label: 'Bubblegum', swatch: '#e8559e' },
  { id: 'coral', label: 'Coral', swatch: '#f06a4f' },
  { id: 'accra', label: 'Accra', swatch: '#d98248' },
  { id: 'butter', label: 'Butter', swatch: '#e0a92a' },
  { id: 'mint', label: 'Mint', swatch: '#2bb99a' },
  { id: 'sage', label: 'Sage', swatch: '#7fa07a' },
  { id: 'sky', label: 'Sky', swatch: '#4a90d9' },
  { id: 'lavender', label: 'Lavender', swatch: '#a78bce' },
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
