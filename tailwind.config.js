/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // These map to CSS variables defined in src/index.css so the whole
      // palette can be swapped at runtime by the theme switcher.
      colors: {
        canvas: 'var(--c-canvas)',
        surface: 'var(--c-surface)',
        ink: 'var(--c-ink)',
        muted: 'var(--c-muted)',
        primary: 'var(--c-primary)',
        'primary-soft': 'var(--c-primary-soft)',
        accent: 'var(--c-accent)',
        line: 'var(--c-line)',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
