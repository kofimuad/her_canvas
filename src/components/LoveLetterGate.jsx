import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { profile, signin, images } from '../config/irene'

// Mobile-first editorial sign-in. Fills the viewport exactly (no scroll).
//  - Mobile: full-bleed portrait, content anchored to the bottom over a gradient.
//  - Desktop: image on the left, a cream invitation panel on the right.
// Underneath it's a Supabase passwordless magic link (instant demo unlock
// before keys are configured).
export default function LoveLetterGate() {
  const { sendLoveLetter, isSupabaseReady } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function enter() {
    setError('')
    if (isSupabaseReady && !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Add your email and I’ll send you a way in.')
      return
    }
    setBusy(true)
    try {
      const res = await sendLoveLetter(email)
      if (res.sent) setSent(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const ease = [0.22, 1, 0.36, 1]
  const rise = (delay) => ({
    initial: { y: 18, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.7, ease, delay },
  })

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-ink">
      {/* Full-bleed portrait (always present; the cream panel covers it on desktop) */}
      <motion.img
        src={images.signinHero}
        alt=""
        initial={{ scale: 1.14 }}
        animate={{ scale: 1 }}
        transition={{ duration: 9, ease: 'easeOut' }}
        className="absolute inset-0 h-full w-full object-cover md:w-[58%]"
      />
      {/* Mobile legibility gradient (hidden on desktop, where text sits on cream) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 md:hidden" />

      {/* Top wordmark, over the image on both layouts */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-6 sm:p-8">
        <span className="caption text-white/85">Her Canvas</span>
        <span className="caption text-white/60">{profile.sweetLine}</span>
      </div>

      {/* Desktop-only pull quote over the image */}
      <p className="absolute bottom-10 left-8 z-20 hidden max-w-[16rem] font-display text-2xl italic leading-snug text-white md:block">
        “{signin.quote}”
      </p>

      {/* Content layer */}
      <div className="relative z-10 flex h-full">
        <div className="hidden md:block md:flex-1" />

        <div className="flex w-full flex-col justify-end px-6 pb-12 pt-24 text-white md:w-[42%] md:justify-center md:bg-canvas md:px-12 md:py-0 md:text-ink">
          {!sent ? (
            <div className="w-full max-w-sm">
              <motion.p {...rise(0.1)} className="caption text-primary">
                {signin.eyebrow}
              </motion.p>

              <motion.h1
                {...rise(0.18)}
                className="mt-3 whitespace-pre-line font-display text-[2.6rem] leading-[1.05] sm:text-5xl"
              >
                {signin.heading}
              </motion.h1>

              <motion.div {...rise(0.26)} className="mt-5 h-px w-16 bg-accent" />

              <motion.p {...rise(0.32)} className="mt-5 text-white/85 md:text-muted">
                {signin.body}
              </motion.p>

              {isSupabaseReady && (
                <motion.input
                  {...rise(0.38)}
                  type="email"
                  className="input mt-7"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && enter()}
                />
              )}

              {error && <p className="mt-3 text-sm text-red-300 md:text-red-500">{error}</p>}

              <motion.button
                {...rise(0.44)}
                onClick={enter}
                disabled={busy}
                className="btn-primary mt-5 w-full"
              >
                {busy ? 'One moment…' : isSupabaseReady ? signin.ctaEmail : signin.cta}
              </motion.button>

              <motion.p {...rise(0.52)} className="caption mt-7 text-white/65 md:text-muted">
                {isSupabaseReady ? 'No password — ever.' : 'Demo mode'}
              </motion.p>
            </div>
          ) : (
            <motion.div {...rise(0)} className="w-full max-w-sm">
              <p className="caption text-primary">Sent</p>
              <h1 className="mt-3 font-display text-[2.6rem] leading-[1.05] sm:text-5xl">
                Check your email
              </h1>
              <div className="mt-5 h-px w-16 bg-accent" />
              <p className="mt-5 text-white/85 md:text-muted">
                Your way in is on its way to{' '}
                <span className="text-white md:text-ink">{email}</span>. Open the link on
                this device and you’re home.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
