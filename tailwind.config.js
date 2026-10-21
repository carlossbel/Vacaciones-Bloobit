/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Spectral', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Public Sans', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      colors: {
        // Todas las paletas apuntan a tokens CSS definidos en index.css,
        // así cambiar de light a dark solo cambia las variables.
        ink: {
          DEFAULT: 'var(--c-ink)',
          soft:    'var(--c-ink-soft)',
          faint:   'var(--c-ink-faint)',
        },
        paper: {
          DEFAULT: 'var(--c-paper)',
          dim:     'var(--c-paper-dim)',
          head:    'var(--c-paper-head)',
        },
        rule: {
          DEFAULT: 'var(--c-rule)',
          soft:    'var(--c-rule-soft)',
          strong:  'var(--c-rule-strong)',
        },
        accent: {
          DEFAULT: 'var(--c-accent)',
          tint:    'var(--c-accent-tint)',
          hover:   'var(--c-accent-hover)',
        },
        ok:   'var(--c-ok)',
        warn: 'var(--c-warn)',
        bad:  'var(--c-bad)',
      },
      maxWidth: {
        doc: '960px',
      },
    },
  },
  plugins: [],
};
