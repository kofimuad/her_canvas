import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { profile, displayedName } from '../config/irene'
import Sparkles from '../components/Sparkles'

const sections = [
  { to: '/boards', no: '01', title: 'Mood Boards', desc: 'Turn a vibe into a visual board.' },
  { to: '/discover', no: '02', title: 'Style Discovery', desc: 'What should I wear for this?' },
  { to: '/lookbook', no: '03', title: 'My Fits', desc: 'Your personal editorial lookbook.' },
  { to: '/shoots', no: '04', title: 'Shoot Planning', desc: 'Plan looks for shoots & events.' },
]

export default function Dashboard() {
  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-line pb-10"
      >
        <p className="caption text-muted">{profile.sweetLine} · {profile.pursuit}</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl">
          Welcome back,
        </h1>
        <div className="relative mt-1 inline-block">
          <span className="font-display text-6xl text-primary sm:text-7xl">{displayedName}</span>
          <Sparkles className="absolute inset-0" />
        </div>
        <p className="mt-5 max-w-md text-muted">{profile.tagline}</p>
      </motion.section>

      <section className="grid gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-2">
        {sections.map((s, i) => (
          <motion.div
            key={s.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={s.to} className="group flex h-full flex-col bg-surface p-8 transition hover:bg-primary-soft/40">
              <span className="caption text-accent">{s.no}</span>
              <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
              <span className="caption mt-8 inline-flex items-center gap-2 text-ink">
                Enter
                <span className="h-px w-6 bg-ink transition-all duration-300 group-hover:w-10" />
              </span>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
