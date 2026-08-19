/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1e1b4b',
          light: '#312e81',
          accent: '#4338ca',
        },
        alert: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          glow: 'rgba(220, 38, 38, 0.2)',
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f8fafc',
          border: '#e2e8f0',
          dark: '#0f172a',
          darkCard: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
