# Her Canvas 💛

A personal style & visual identity studio, built for **Irene Obenewaa Boafo**.
Mood boards, outfit discovery tuned to her frame, a personal lookbook, and shoot
planning — full-stack on **Netlify** (frontend + serverless functions).

## Tech
- **Frontend:** React + Vite + Tailwind (switchable themes, girly by default)
- **Backend:** Netlify Functions (`netlify/functions/`)
- **Auth + DB + Storage:** Supabase (free tier)
- **Styling brain:** Claude API (Anthropic)
- **Mood-board photos:** Pexels + Unsplash (+ paste-any-URL importer)

## Quick start
```bash
npm install
cp .env.example .env      # then fill in keys (PowerShell: copy .env.example .env)
npm run start             # netlify dev → http://localhost:8888
```
> `npm run start` runs `netlify dev` so the `/api/*` functions work locally.
> Install the Netlify CLI once with `npm i -g netlify-cli` if you don't have it.
> Plain `npm run dev` runs the UI only (no backend functions).

The app runs in **demo mode** without keys — pages load, but AI generation and
login need the env vars below.

## Environment variables
See `.env.example`. Set the same values in Netlify → Site settings → Environment.
Only `VITE_*` vars reach the browser; secret keys stay inside functions.

## Supabase setup (free)
1. Create a project at supabase.com (no card required).
2. SQL Editor → paste & run `supabase/schema.sql` (tables, RLS, storage buckets).
3. Authentication → Providers → enable **Email** and **Google** (US-030).
4. Copy the URL + anon key into `.env` (and the service-role key, server-side only).

## Make it hers
Almost everything personal lives in **`src/config/irene.js`**:
- her name, nickname, body type, signature aesthetics
- **poems** and **easter-egg messages** (incl. special-date surprises)
- **preloaded photos** — drop images in `public/her/` and list them
- the curated **Ghanaian / African designer** list fed to the AI

Themes live in `src/index.css` + `src/theme/ThemeProvider.jsx`
(Blush · Lavender · Accra · Sage · Noir — she can switch anytime).

## Pinterest & Instagram (how importing works)
Their public APIs are effectively closed (Instagram Basic Display retired Dec 2024;
Pinterest needs business approval + bans scraping). Instead, there's a
**paste-a-link importer**: the `import-image` Netlify function fetches the page
server-side and reads its Open Graph image, so she can add a Pinterest pin,
public Instagram post, blog image, or direct image URL into **My Fits** and
**Mood Boards**. Works reliably for Pinterest/blogs/direct images; Instagram is
hit-or-miss (login walls). Needs `netlify dev` locally so the function runs.

## Deploy
Connect the repo in Netlify (or `netlify deploy --build`). `netlify.toml` already
sets the build, publish dir, functions dir, and `/api/*` routing.

## Roadmap (from the backlog)
- [x] Project scaffold, theming, persona-aware AI functions
- [x] Mood board generation (EP-01 core) + outfit discovery (EP-02)
- [ ] Supabase auth + onboarding style profile (EP-05)
- [ ] Save/duplicate/share boards; uploads & URL importer (EP-01)
- [ ] Lookbook uploads, tags, favourites, filters (EP-03)
- [ ] Shoot plans + checklists + portfolio timeline (EP-04)

## Suggested MCPs for nicer UI (optional, in Claude Code)
- **shadcn/ui MCP** — polished Tailwind components
- **21st.dev Magic MCP** — AI-generated UI components
- **Pencil MCP** — visual design of `.pen` files
