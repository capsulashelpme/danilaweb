/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:    '#0C0C0C',
          bg1:   '#111111',
          bg2:   '#161616',
          bg3:   '#1E1E1E',
          bg4:   '#262626',
          fg0:   '#FFFFFF',
          fg1:   '#E6E6E6',
          fg2:   '#B8B8B8',
          fg3:   '#6F6F6F',
          fg4:   '#4A4A4A',
          o0:    '#FF6A00',
          o1:    '#FF5A1F',
          o2:    '#E54A12',
          o3:    '#C93A12',
          // legacy aliases kept for components not yet migrated
          surface:    '#111111',
          card:       '#161616',
          border:     '#1F1F1F',
          orange:     '#FF5A1F',
          'orange-lt':'#FF7A45',
          'orange-dk':'#C93A12',
          text:       '#E6E6E6',
          muted:      '#B8B8B8',
          dim:        '#6F6F6F',
        },
      },
      fontFamily: {
        display: ['Archivo', '"Helvetica Neue"', 'sans-serif'],
        body:    ['Manrope', '"Helvetica Neue"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        serif:   ['"Instrument Serif"', '"Times New Roman"', 'serif'],
        sans:    ['Manrope', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        pill:  '999px',
      },
      animation: {
        'pulse-dot':    'pulse-dot 2s ease-in-out infinite',
        'marquee':      'marquee 42s linear infinite',
        'sp-marquee':   'sp-marquee 38s linear infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { boxShadow: '0 0 0 4px rgba(46,204,113,0.15)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(46,204,113,0.05)' },
        },
        'marquee': {
          from: { transform: 'translate3d(0,0,0)' },
          to:   { transform: 'translate3d(-50%,0,0)' },
        },
        'sp-marquee': {
          from: { transform: 'translate3d(0,0,0)' },
          to:   { transform: 'translate3d(-50%,0,0)' },
        },
      },
    },
  },
  plugins: [],
}
