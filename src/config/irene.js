// ─────────────────────────────────────────────────────────────────────
//  Her Canvas — personalization config
//  This single file is what makes the app *hers*. Edit freely.
// ─────────────────────────────────────────────────────────────────────

export const profile = {
  fullName: 'Irene Obenewaa Boafo',
  firstName: 'Irene',
  nickname: 'Obenewaa', // shown in warm, personal moments
  greeting: 'Welcome back, Obenewaa',

  // Used to tailor styling advice everywhere in the app + AI prompts.
  bodyType: {
    label: 'Slim & tall',
    notes:
      'Slim and tall frame. Flattering directions: wide-leg & flared trousers, ' +
      'maxi and floor-length silhouettes she can carry effortlessly, belts and ' +
      'corsetry to define the waist, layering and volume to add dimension, ' +
      'horizontal lines and texture, bold prints, statement sleeves. She can ' +
      'wear high-fashion editorial proportions most people cannot.',
  },

  pursuit: 'Modeling & photography',
  initials: 'IOB',
  // The app affectionately alternates between her names on each visit.
  names: ['Irene', 'Afua', 'Obenewaa', 'Boafo'],
  // A sweet line shown where a location used to be. Make it yours.
  sweetLine: 'My muse',
  // Short tagline under the greeting on the home screen (kept brief for mobile).
  tagline: 'Your studio for moods, looks, and every fit worth keeping.',

  // Pre-seeded so the app feels made-for-her from the very first open.
  // (Adjust these to her real favourites.)
  signatureAesthetics: [
    'Soft glam',
    'Editorial',
    'Accra summer',
    'Afro-chic',
    'Minimalist with edge',
  ],
}

// A rotating name, advancing on each app load (Irene → Afua → Obenewaa → Boafo).
// Computed once per page load so it's consistent everywhere on screen.
export const displayedName = (() => {
  try {
    const i = (parseInt(localStorage.getItem('herCanvas.nameIdx') || '-1', 10) + 1) % profile.names.length
    localStorage.setItem('herCanvas.nameIdx', String(i))
    return profile.names[i]
  } catch {
    return profile.names[0]
  }
})()

// ── Imagery ─────────────────────────────────────────────────────────────
// Real photos make this feel custom. Drop files in /public/her/ and point
// these at e.g. '/her/cover.jpg'. The defaults are neutral placeholders —
// replace `signinHero` with a striking editorial portrait of Irene.
export const images = {
  signinHero: 'https://picsum.photos/seed/hercanvas-hero/1200/1600',
  // Optional photos for the lookbook covers. If set, the cover becomes her
  // photo with the title/monogram over it. Leave '' for the artsy default.
  bookCover: '/her/cover-front.jpg',     // front cover
  bookCoverBack: '/her/cover-back.jpg',  // back cover
}

// ── Sign-in ("the invitation") copy ─────────────────────────────────────
export const signin = {
  eyebrow: 'An invitation',
  heading: 'For Irene\nObenewaa Boafo',
  body: 'Your private studio for mood boards, looks, and every fit worth remembering.',
  quote: 'For you, and everything you’re becoming.',
  cta: 'Step inside',
  ctaEmail: 'Send my way in',
}

// ── Preloaded lookbook photos ──────────────────────────────────────────
// Drop her real photos into /public/her/ and list the filenames here, or
// use full URLs. They seed her lookbook so it feels alive on day one.
export const preloadedFits = [
  // Placeholder samples so the book works immediately — replace the `src`
  // with her real photos (drop them in /public/her/ and use '/her/file.jpg').
  {
    src: 'https://picsum.photos/seed/irene1/600/800',
    title: 'Golden hour',
    occasion: 'Shoot',
    aesthetic: 'Editorial',
    note: 'replace me with her real look',
  },
  {
    src: 'https://picsum.photos/seed/irene2/600/800',
    title: 'Date night',
    occasion: 'Date',
    aesthetic: 'Soft glam',
    note: '',
  },
  {
    src: 'https://picsum.photos/seed/irene3/600/800',
    title: 'Campus fit',
    occasion: 'Everyday',
    aesthetic: 'Casual chic',
    note: '',
  },
]

// ── Poems & love notes ─────────────────────────────────────────────────
// These rotate through quiet corners of the app. Write your own here.
export const poems = [
  {
    title: 'For Obenewaa',
    lines: [
      'You are the canvas and the colour both,',
      'every vibe you chase already lives in you.',
      '— write your own here —',
    ],
  },
]

// ── Easter eggs ────────────────────────────────────────────────────────
// `specialDates` shows a hidden message when the date matches (MM-DD).
export const easterEggs = {
  // e.g. anniversaries, her birthday. Format: 'MM-DD'
  specialDates: {
    // '02-14': 'Happy Valentine’s, my muse. Every board here is really about you.',
    // '07-04': 'Happy Birthday, Obenewaa. The whole app is the gift.',
  },
  // A note tucked into the menu, just for her.
  hiddenNote:
    'Built by someone who thinks you’re the most stylish person alive.',
}

// ── Real Ghanaian / African designers & brands ─────────────────────────
// Fed into the AI so "African designer picks" returns genuine names,
// never hallucinations. Add her favourites.
export const africanDesigners = [
  'Christie Brown (Ghana)',
  'Studio One Eighty Nine / Studio 189 (Ghana)',
  'Duaba Serwa (Ghana)',
  "Sika'a (Ghana)",
  'Pistis (Ghana)',
  'Selina Beb (Ghana)',
  'Aphia Sakyi (Ghana)',
  'Free The Youth (Ghana, streetwear)',
  'Chocolate Clothing (Ghana)',
  'Larry Jay (Ghana)',
  'Tongoro (Senegal)',
  'Orange Culture (Nigeria)',
  'Lisa Folawiyo (Nigeria)',
  'MaXhosa (South Africa)',
]
export const localFabrics = ['Kente', 'Woodin', 'GTP', 'Adinkra', 'Batik / tie-dye']

// ── Mood board preset categories (from the backlog, US-002) ────────────
export const presetCategories = [
  'Editorial',
  'Street style',
  'Luxury',
  'Casual chic',
  'Afrocentric',
  'Nature-inspired',
  'Minimalist',
  'Bold & vibrant',
]

export const occasions = ['Shoot', 'Date', 'Going out', 'Everyday', 'Event / formal']

// Combined aesthetic tags for onboarding + profile (her signatures first).
export const aestheticOptions = [
  ...new Set([...profile.signatureAesthetics, ...presetCategories]),
]
