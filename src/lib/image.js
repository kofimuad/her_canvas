// Downscale + compress a chosen photo before we store it. Keeps localStorage
// (demo mode) under control and makes Supabase uploads fast. Returns both a
// dataURL (for instant preview / local storage) and a Blob (for cloud upload).
export async function processImage(file, opts) {
  return processDataUrl(await readAsDataURL(file), opts)
}

// Resize/compress an image that's already a data URL (e.g. imported from a link).
export async function processDataUrl(sourceUrl, { maxDim = 1280, quality = 0.82 } = {}) {
  const img = await loadImage(sourceUrl)

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
  return { dataUrl, blob }
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
