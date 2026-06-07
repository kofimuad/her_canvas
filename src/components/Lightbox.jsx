import { motion, AnimatePresence } from 'framer-motion'

// Smoothly grows an image from where it sits on the page to a centered view,
// and settles it right back when dismissed. Uses the clicked element's rect
// (FLIP-style) so it works even inside the 3D-transformed flip book.
export default function Lightbox({ item, onClose }) {
  const spring = { type: 'spring', stiffness: 200, damping: 26 }

  let target = null
  if (item) {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = Math.min(vw * 0.9, 560)
    const h = Math.min(vh * 0.85, 760)
    target = { top: (vh - h) / 2, left: (vw - w) / 2, width: w, height: h }
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.img
            src={item.src}
            alt={item.title || ''}
            className="fixed rounded-xl2 object-cover shadow-soft"
            initial={{
              top: item.rect.top,
              left: item.rect.left,
              width: item.rect.width,
              height: item.rect.height,
            }}
            animate={target}
            exit={{
              top: item.rect.top,
              left: item.rect.left,
              width: item.rect.width,
              height: item.rect.height,
              opacity: 0.6,
            }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
          />
          {item.note && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-x-0 bottom-8 mx-auto max-w-md px-6 text-center font-display text-lg italic text-white"
            >
              “{item.note}”
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
