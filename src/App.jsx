import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import ThemeSwitcher from './components/ThemeSwitcher'
import Walkthrough from './components/Walkthrough'
import Avatar from './components/Avatar'
import LoveNote from './components/LoveNote'
import LoveLetterGate from './components/LoveLetterGate'
import Onboarding from './components/Onboarding'
import ErrorBoundary from './components/ErrorBoundary'
import { useAuth } from './lib/auth'
import { useProfile } from './lib/profile'
import { profile, displayedName } from './config/irene'

import Dashboard from './pages/Dashboard'
import MoodBoardsPage from './pages/MoodBoardsPage'
import StyleDiscoveryPage from './pages/StyleDiscoveryPage'
import LookbookPage from './pages/LookbookPage'
import ShootPlansPage from './pages/ShootPlansPage'
import ProfilePage from './pages/ProfilePage'

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/boards', label: 'Mood Boards' },
  { to: '/discover', label: 'Style Discovery' },
  { to: '/lookbook', label: 'My Fits' },
  { to: '/shoots', label: 'Shoots' },
]

export default function App() {
  const { isAuthed, loading, signOut } = useAuth()
  const { isOnboarded, loading: profileLoading } = useProfile()

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-muted">…</div>
  }
  if (!isAuthed) {
    return <LoveLetterGate />
  }
  if (profileLoading) {
    return <div className="grid min-h-screen place-items-center text-muted">…</div>
  }
  if (!isOnboarded) {
    return <Onboarding />
  }

  return <AppShell signOut={signOut} />
}

const TOUR_KEY = 'herCanvas.tourSeen'

function AppShell({ signOut }) {
  const [tourOpen, setTourOpen] = useState(false)

  // Auto-open the walkthrough once, on first arrival after onboarding.
  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) setTourOpen(true)
  }, [])

  function closeTour() {
    localStorage.setItem(TOUR_KEY, '1')
    setTourOpen(false)
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar />
            <NavLink to="/" className="hidden font-display text-xl tracking-tight sm:block">
              {displayedName}
            </NavLink>
          </div>

          <nav className="hidden gap-1 md:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm transition ${
                    isActive ? 'bg-primary text-white' : 'text-ink hover:bg-primary-soft'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setTourOpen(true)}
              title="How it works"
              aria-label="How it works"
              className="text-muted transition hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01" />
              </svg>
            </button>
            <NavLink
              to="/profile"
              title="Your profile"
              aria-label="Profile"
              className={({ isActive }) =>
                `transition hover:text-primary ${isActive ? 'text-primary' : 'text-muted'}`
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </NavLink>
            <button
              onClick={signOut}
              title="Lock the canvas"
              aria-label="Sign out"
              className="text-muted transition hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </button>
          </div>
        </div>

        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto px-5 pb-2 md:hidden">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1 text-sm ${
                  isActive ? 'bg-primary text-white' : 'text-ink'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/boards" element={<MoodBoardsPage />} />
            <Route path="/discover" element={<StyleDiscoveryPage />} />
            <Route path="/lookbook" element={<LookbookPage />} />
            <Route path="/shoots" element={<ShootPlansPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 pt-6 text-center text-sm text-muted">
        <LoveNote />
        <p className="caption mt-3">Her Canvas — made for {profile.firstName}</p>
      </footer>

      <Walkthrough open={tourOpen} onClose={closeTour} />
    </div>
  )
}
