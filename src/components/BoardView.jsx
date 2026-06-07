// Renders a mood board: title, description, palette, and a masonry of images.
// Used for both freshly generated boards and saved ones.
export default function BoardView({ board }) {
  if (!board) return null
  const heading = board.name || board.title

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{heading}</h2>
          {board.description && (
            <p className="max-w-2xl text-sm text-muted">{board.description}</p>
          )}
        </div>
        {board.palette?.length > 0 && (
          <div className="flex gap-1.5">
            {board.palette.map((p, i) => (
              <div
                key={p.hex || i}
                className="h-9 w-9 rounded-lg border border-line"
                style={{ background: p.hex }}
                title={`${p.name || ''} ${p.hex || ''}`.trim()}
              />
            ))}
          </div>
        )}
      </div>

      {board.images?.length > 0 ? (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
          {board.images.map((img, i) => (
            <a
              key={i}
              href={img.link || img.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl2 border border-line"
            >
              <img
                src={img.thumb || img.url}
                alt={img.alt || heading}
                loading="lazy"
                className="w-full transition hover:scale-[1.03]"
              />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          No photos on this board. Add PEXELS_API_KEY / UNSPLASH_ACCESS_KEY to pull images.
        </p>
      )}
    </div>
  )
}
