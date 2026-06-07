import { useRef, useState } from 'react'
import { processImage } from '../lib/image'

const KEY = 'herCanvas.pfp'

// Small circular profile photo at the top. Click it to swap in a new one
// (saved on this device). Defaults to her photo in /public/her/pfp.jpg.
export default function Avatar({ className = 'h-9 w-9' }) {
  const [src, setSrc] = useState(() => localStorage.getItem(KEY) || '/her/pfp.jpg')
  const inputRef = useRef(null)

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { dataUrl } = await processImage(file, { maxDim: 320, quality: 0.85 })
      localStorage.setItem(KEY, dataUrl)
      setSrc(dataUrl)
    } catch {
      /* ignore unreadable images */
    } finally {
      e.target.value = ''
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      title="Change photo"
      aria-label="Change profile photo"
      className={`group relative shrink-0 overflow-hidden rounded-full border-2 border-primary shadow-soft ${className}`}
    >
      <img
        src={src}
        alt="Profile"
        className="h-full w-full object-cover"
        style={{ objectPosition: '50% 32%' }}
      />
      <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
          <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
          <circle cx="12" cy="13" r="3.2" />
        </svg>
      </span>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
    </button>
  )
}
