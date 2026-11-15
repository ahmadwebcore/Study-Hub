/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#14B866',
          'primary-hover': '#109653',
          'primary-light': '#e8f8f0',
          'primary-subtle': '#f0faf5',
          deep: '#142D27',
          'deep-dark': '#0d1e1a',
          'deep-muted': '#1e4239',
          bg: '#F7F9F8',
          card: '#FFFFFF',
          text: '#263B35',
          'text-muted': '#557067',
          'text-light': '#7d9990',
          soft: '#E7EFEA',
          border: '#e1ede7',
          'border-light': '#edf4f0',
        }
      },
      fontFamily: {
        sans: ['"Open Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        display: ['"Libre Baskerville"', 'Georgia', 'serif'],
        body: ['"Open Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': 'none',
        'card': 'none',
        'card-hover': 'none',
        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
