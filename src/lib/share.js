// Share a mood board. Uses the native share sheet on mobile (so she can send
// it straight to a photographer/friend), and falls back to copying a rich text
// summary to the clipboard on desktop.
export async function shareBoard(board) {
  const title = board.name || board.title || 'My mood board'
  const lines = [
    title,
    board.description || '',
    board.palette?.length ? `Palette: ${board.palette.map((p) => p.hex).join(', ')}` : '',
    board.images?.length
      ? `\nVisuals:\n${board.images.slice(0, 8).map((i) => i.link || i.url).join('\n')}`
      : '',
  ].filter(Boolean)
  const text = lines.join('\n')

  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled'
      // fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
