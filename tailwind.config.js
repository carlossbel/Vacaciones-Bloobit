/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Spectral', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Public Sans', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f1620',
          soft: '#3b4454',
          faint: '#6a7484',
        },
        paper: {
          DEFAULT: '#ffffff',
          dim: '#f4f5f7',
          head: '#f8f9fb',
        },
        rule: {
          DEFAULT: '#c7cdd5',
          soft: '#e3e6ec',
          strong: '#2c3340',
        },
        accent: {
          DEFAULT: '#1b3a5c',
          tint: '#e6edf4',
          hover: '#152e4a',
        },
        ok: '#276230',
        warn: '#96530e',
        bad: '#a52424',
      },
      maxWidth: {
        doc: '960px',
      },
    },
  },
  plugins: [],
};
