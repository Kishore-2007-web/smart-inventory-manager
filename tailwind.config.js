/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F8F3',
        forest: {
          DEFAULT: '#183D2B',
          dark: '#183D2B',
          light: '#25543c',
        },
        'primary-green': '#367653',
        sage: '#CDE2D0',
        mint: '#EAF3E9',
        apricot: '#F0B779',
        'main-text': '#202923',
        'secondary-text': '#69736C',
        'subtle-border': '#E2E8E0',
        'error-red': '#B84238',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', '-apple-system', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(24, 61, 43, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 24px rgba(24, 61, 43, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
