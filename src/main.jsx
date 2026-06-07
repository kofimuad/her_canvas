import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import { AuthProvider } from './lib/auth'
import { ProfileProvider } from './lib/profile'
import App from './App'
import './index.css'

// NOTE: React.StrictMode is intentionally omitted. react-pageflip (the flip
// book) initializes on mount and is destroyed by StrictMode's dev-only
// double-mount, leaving the book blank. StrictMode only changes dev behaviour,
// so dropping it has no effect on the production build.
ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  </ThemeProvider>
)
