import { displayedName } from '../config/irene'

// Brand lockup for the nav: an editorial "seal" monogram + her name.
export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      {/* Seal monogram */}
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-soft">
        <span className="pointer-events-none absolute inset-[3px] rounded-full border border-white/45" />
        <span className="font-display text-[13px] leading-none tracking-tight">HC</span>
      </span>

      {/* Her name (alternates each visit) */}
      <span className="font-display text-xl leading-none">{displayedName}</span>
    </span>
  )
}
