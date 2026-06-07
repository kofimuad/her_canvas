import { forwardRef, useMemo, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import Lightbox from '../components/Lightbox'
import AddFitModal from '../components/AddFitModal'
import { useFits } from '../hooks/useFits'
import { preloadedFits, poems, profile, occasions, images } from '../config/irene'

// A single book page (react-pageflip needs forwardRef on page elements).
const Page = forwardRef(function Page({ children, hard, className = '' }, ref) {
  return (
    <div ref={ref} data-density={hard ? 'hard' : 'soft'} className={`book-page ${className}`}>
      {children}
    </div>
  )
})

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.6">
    <path d="M12 21s-7.5-4.6-10-9.2C.5 8.4 2 5 5.3 5c2 0 3.4 1.2 4.2 2.4C10.3 6.2 11.7 5 13.7 5 17 5 18.5 8.4 17 11.8 14.5 16.4 12 21 12 21z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7" />
  </svg>
)

export default function LookbookPage() {
  const { fits, loading, add, toggleFavourite, remove } = useFits()
  const [filter, setFilter] = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const [zoom, setZoom] = useState(null)
  const [adding, setAdding] = useState(false)

  // Show her saved fits; fall back to the config samples only when empty.
  const usingSamples = fits.length === 0
  const source = usingSamples ? preloadedFits : fits

  const shown = useMemo(
    () =>
      source.filter(
        (f) => (!filter || f.occasion === filter) && (!favOnly || f.favourite)
      ),
    [source, filter, favOnly]
  )

  const poem = poems[0]

  function openZoom(e, fit) {
    setZoom({ src: fit.src, title: fit.title, note: fit.note, rect: e.currentTarget.getBoundingClientRect() })
  }

  // react-pageflip calls cloneElement on every child and throws on any
  // null/false child, so we build a clean array of real <Page> elements.
  const pages = []

  pages.push(
    <Page key="cover" hard className="book-cover relative overflow-hidden">
      {images.bookCover ? (
        // Cover photo speaks for itself — no overlay.
        <img src={images.bookCover} alt="Lookbook cover" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div className="pointer-events-none absolute inset-3 rounded-[14px] border border-white/35" />
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <p className="caption text-white/75">Her Canvas</p>
            <div className="my-5 flex items-center gap-2 text-white/60">
              <span className="h-px w-8 bg-white/50" />
              <span className="text-xs">✦</span>
              <span className="h-px w-8 bg-white/50" />
            </div>
            <p className="font-hand text-5xl text-white">{profile.firstName}’s</p>
            <h2 className="mt-1 font-display text-3xl uppercase tracking-[0.2em] text-white">
              Lookbook
            </h2>
            <p className="caption mt-10 text-white/60">swipe to open</p>
          </div>
        </>
      )}
    </Page>
  )

  if (poem) {
    pages.push(
      <Page key="dedication" className="lined">
        <div className="flex h-full flex-col justify-center">
          <p className="font-display text-xl">{poem.title}</p>
          <div className="mt-3 space-y-1 font-display italic text-ink/80">
            {poem.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        </div>
      </Page>
    )
  }

  shown.forEach((f, i) => {
    pages.push(
      <Page key={f.id || `fit-${i}`} className="lined">
        <figure className="flex h-full flex-col">
          <div className="relative overflow-hidden rounded-lg border border-line bg-white p-1.5 shadow-sm">
            {f.mediaType === 'video' ? (
              <video src={f.src} controls playsInline className="h-48 w-full rounded bg-black object-cover" />
            ) : (
              <button onClick={(e) => openZoom(e, f)} className="block w-full">
                <img src={f.src} alt={f.title} loading="lazy" className="h-48 w-full rounded object-cover transition hover:scale-[1.02]" />
              </button>
            )}
            {f.favourite && (
              <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 p-1.5 text-primary">
                <HeartIcon filled />
              </span>
            )}
          </div>

          <figcaption className="mt-3">
            <p className="caption text-muted">{[f.occasion, f.aesthetic].filter(Boolean).join(' · ')}</p>
            <p className="font-display text-lg leading-tight">{f.title}</p>
          </figcaption>

          {/* Handwritten note, sitting on the ruled lines (leading matches the
              2rem line grid of the page background). */}
          <div className="mt-2 flex-1 font-hand text-2xl leading-8 text-ink/80">
            {f.note || <span className="text-ink/30">A little note about this look…</span>}
          </div>

          <div className="flex items-center justify-between pt-2">
            {f.id ? (
              <div className="flex items-center gap-3 text-muted">
                <button onClick={() => toggleFavourite(f)} title="Favourite"
                  className={f.favourite ? 'text-primary' : 'hover:text-primary'}>
                  <HeartIcon filled={f.favourite} />
                </button>
                <button onClick={() => remove(f)} title="Remove" className="hover:text-red-500">
                  <TrashIcon />
                </button>
              </div>
            ) : <span />}
            <span className="caption text-muted">{i + 1}</span>
          </div>
        </figure>
      </Page>
    )
  })

  if (shown.length === 0) {
    pages.push(
      <Page key="empty" className="lined">
        <div className="flex h-full flex-col items-center justify-center text-center text-muted">
          <p className="font-display text-xl text-ink">Nothing here yet</p>
          <p className="mt-2 text-sm">Add a fit or clear your filters.</p>
        </div>
      </Page>
    )
  }

  pages.push(
    <Page key="back" hard className="book-cover relative overflow-hidden">
      {images.bookCoverBack ? (
        // Back photo speaks for itself — no overlay.
        <img src={images.bookCoverBack} alt="Back cover" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div className="pointer-events-none absolute inset-3 rounded-[14px] border border-white/35" />
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border border-white/40">
              <span className="font-display text-3xl tracking-[0.15em] text-white">{profile.initials}</span>
            </div>
            <div className="my-5 flex items-center gap-2 text-white/60">
              <span className="h-px w-8 bg-white/50" />
              <span className="text-xs">✦</span>
              <span className="h-px w-8 bg-white/50" />
            </div>
            <p className="font-hand text-2xl text-white/85">{profile.fullName}</p>
            <p className="caption mt-8 text-white/55">Her Canvas</p>
          </div>
        </>
      )}
    </Page>
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <div>
          <p className="caption text-muted">A personal lookbook</p>
          <h1 className="font-display text-3xl">My Fits</h1>
        </div>
        <button className="btn-primary" onClick={() => setAdding(true)}>+ Add a fit</button>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={() => setFilter('')} className={`chip ${!filter ? 'chip-active' : ''}`}>All</button>
        {occasions.map((o) => (
          <button key={o} onClick={() => setFilter(o)} className={`chip ${filter === o ? 'chip-active' : ''}`}>{o}</button>
        ))}
        <button onClick={() => setFavOnly((v) => !v)} className={`chip ${favOnly ? 'chip-active' : ''}`}>
          Favourites
        </button>
      </div>

      {usingSamples && !loading && (
        <p className="text-center text-xs text-muted">
          These are sample pages — add a fit to start your real book.
        </p>
      )}

      <div className="mx-auto w-full max-w-[860px]">
        <HTMLFlipBook
          key={`${filter}-${favOnly}-${shown.length}-${usingSamples}`}
          width={420}
          height={580}
          size="stretch"
          minWidth={300}
          maxWidth={430}
          minHeight={420}
          maxHeight={600}
          showCover={true}
          usePortrait={true}
          mobileScrollSupport={true}
          maxShadowOpacity={0.4}
          drawShadow={true}
          className="book-shadow"
        >
          {pages}
        </HTMLFlipBook>
      </div>

      <p className="text-center text-sm text-muted">
        Swipe or drag a corner to turn the page · tap a photo to enlarge
      </p>

      <Lightbox item={zoom} onClose={() => setZoom(null)} />
      <AddFitModal open={adding} onClose={() => setAdding(false)} onSave={add} />
    </div>
  )
}
