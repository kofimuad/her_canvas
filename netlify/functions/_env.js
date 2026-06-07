// Local-dev safety net: load the project-root .env into process.env.
// `netlify dev` doesn't reliably inject .env into the functions runtime, and it
// bundles functions into a temp dir, so we search upward from the working
// directory (and this module) for a .env. In production there is no .env and
// env vars come from the Netlify dashboard, so this is a harmless no-op.
// Existing process.env values are never overwritten — real env always wins.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function findEnv(start) {
  let dir = start
  for (let i = 0; i < 8; i++) {
    const p = path.join(dir, '.env')
    if (fs.existsSync(p)) return p
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

try {
  const envPath =
    findEnv(process.cwd()) || findEnv(path.dirname(fileURLToPath(import.meta.url)))
  if (envPath) {
    const text = fs.readFileSync(envPath, 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
  }
} catch {
  // ignore — fall back to whatever is already in process.env
}
