import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { displayedName } from '../config/irene'

// A friendly first-run tour (also reopenable from the header "?").
// A step carousel rather than DOM-anchored spotlights — reliable on mobile.

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

const Sparkle = () => (<svg viewBox="0 0 24 24" {...stroke}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" /></svg>)
const Board = () => (<svg viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11" /></svg>)
const Hanger = () => (<svg viewBox="0 0 24 24" {...stroke}><path d="M12 7a2 2 0 1 1 1.5 1.9L12 10l9 5.5a2 2 0 0 1-1 3.5H4a2 2 0 0 1-1-3.5L12 10" /></svg>)
const Book = () => (<svg viewBox="0 0 24 24" {...stroke}><path d="M12 6c-2-1.3-5-1.3-7-1v13c2-.3 5-.3 7 1 2-1.3 5-1.3 7-1V5c-2-.3-5-.3-7 1zM12 6v13" /></svg>)
const Camera = () => (<svg viewBox="0 0 24 24" {...stroke}><path d="M4 8h3l2-2h6l2 2h3v11H4z" /><circle cx="12" cy="13" r="3.2" /></svg>)
const Palette = () => (<svg viewBox="0 0 24 24" {...stroke}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-1.5 1-2 2-2h1a4 4 0 0 0 4-4 8 8 0 0 0-9-8z" /><circle cx="7.5" cy="12" r="1" /><circle cx="10" cy="8" r="1" /><circle cx="15" cy="8" r="1" /></svg>)

const steps = [
  { icon: <Sparkle />, eyebrow: 'Welcome', title: `Hi ${displayedName}`,
    body: 'This is Her Canvas — your private studio for moods, looks, and every fit worth keeping. Here’s a quick tour. It takes 30 seconds.' },
  { icon: <Board />, eyebrow: 'Mood Boards', title: 'Bring a vibe to life', to: '/boards',
    body: 'Type a vibe (like “soft glam” or “golden hour”) and get a visual board with a colour palette — or paste a Pinterest/Instagram link to add your own pins. Name it and save as many as you like.' },
  { icon: <Hanger />, eyebrow: 'Style Discovery', title: 'What should I wear?', to: '/discover',
    body: 'Describe a look and get outfit ideas with key pieces, colours, notes tuned to your frame, and real African designer picks.' },
  { icon: <Book />, eyebrow: 'My Fits', title: 'Your lookbook, as a real book', to: '/lookbook',
    body: 'Add photos of your fits — from your phone or a link — with tags and a handwritten note. Swipe through it like a journal and tap any photo to enlarge it.' },
  { icon: <Camera />, eyebrow: 'Shoot Planning', title: 'Plan every shoot', to: '/shoots',
    body: 'Pull a mood board, an outfit, a location and a prep checklist into one plan. Mark it complete and it joins your portfolio timeline.' },
  { icon: <Palette />, eyebrow: 'Make it yours', title: 'Yours to shape', to: '/profile',
    body: 'Switch the theme with the dots up top, and update your style profile anytime so suggestions keep matching you. Explore — everything saves automatically.' },
]

export default function Walkthrough({ open, onClose }) {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const navigate = useNavigate()
  const step = steps[i]
  const last = i === steps.length - 1

  function go(n) {
    setDir(n > i ? 1 : -1)
    setI(n)
  }
  function next() {
    if (last) onClose()
    else go(i + 1)
  }
  function takeMeThere() {
    if (step.to) navigate(step.to)
    onClose()
  }

  return (
    <AnimatePresence onExitComplete={() => setI(0)}>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/55 backdrop-blur-sm p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="w-full max-w-md overflow-hidden rounded-xl2 bg-surface shadow-soft"
          >
            <div className="bg-gradient-to-br from-primary-soft to-canvas px-7 pt-8 pb-6">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-primary shadow-soft">
                <span className="h-7 w-7">{step.icon}</span>
              </div>
            </div>

            <div className="px-7 pb-7">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={i}
                  custom={dir}
                  initial={(d) => ({ x: d * 40, opacity: 0 })}
                  animate={{ x: 0, opacity: 1 }}
                  exit={(d) => ({ x: d * -40, opacity: 0 })}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="caption text-primary">{step.eyebrow}</p>
                  <h2 className="mt-2 font-display text-2xl">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </motion.div>
              </AnimatePresence>

              {/* progress dots */}
              <div className="mt-6 flex items-center gap-1.5">
                {steps.map((_, n) => (
                  <button
                    key={n}
                    onClick={() => go(n)}
                    className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-primary' : 'w-1.5 bg-line'}`}
                    aria-label={`Step ${n + 1}`}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button onClick={onClose} className="caption text-muted hover:text-ink">
                  {last ? '' : 'Skip'}
                </button>
                <div className="flex items-center gap-2">
                  {step.to && !last && (
                    <button onClick={takeMeThere} className="btn-ghost">Take me there</button>
                  )}
                  <button onClick={next} className="btn-primary">
                    {last ? 'Start exploring' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
