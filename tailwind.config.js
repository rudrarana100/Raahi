/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0a2414',
          ink: '#0a2414',
        },
        parchment: {
          DEFAULT: '#f3fbe9',
          cream: '#f3fbe9',
        },
        card: {
          DEFAULT: '#f9f6f1',
          linen: '#f9f6f1',
        },
        sage: {
          DEFAULT: '#283a2e',
          charcoal: '#283a2e',
        },
        moss: {
          DEFAULT: '#607166',
          muted: '#607166',
        },
        vivid: {
          DEFAULT: '#1ad379',
          green: '#1ad379',
        },
        botanical: {
          DEFAULT: '#17b267',
          deep: '#17b267',
        },
        coral: {
          blush: '#ffbac3',
        },
        wine: {
          plum: '#360003',
        },
        alert: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        btn: '6px',
        card: '9px',
        md: '6px',
        lg: '9px',
      },
      letterSpacing: {
        tightest: '-0.02em',
        tight: '-0.01em',
        mono: '0.015em',
      }
    },
  },
  plugins: [],
}
