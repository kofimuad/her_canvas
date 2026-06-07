// A scatter of twinkling glitter stars. Drop inside a `relative` parent.
const Star = ({ className, style, size = 16 }) => (
  <svg
    className={`sparkle pointer-events-none absolute ${className}`}
    style={style}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0c.7 5.6 5.7 10.6 12 11.3C17.7 12 12.7 17 12 24c-.7-7-5.7-12-12-12.7C6.3 10.6 11.3 5.6 12 0z" />
  </svg>
)

export default function Sparkles({ className = '' }) {
  return (
    <span className={`text-accent ${className}`} aria-hidden="true">
      <Star className="-left-6 top-0 text-primary" size={22} style={{ animationDelay: '0s' }} />
      <Star className="left-2 -top-5" size={12} style={{ animationDelay: '0.5s' }} />
      <Star className="right-0 -top-3 text-primary" size={16} style={{ animationDelay: '1s' }} />
      <Star className="-right-7 bottom-1" size={20} style={{ animationDelay: '1.4s' }} />
      <Star className="left-1/2 -bottom-5" size={12} style={{ animationDelay: '0.8s' }} />
    </span>
  )
}
