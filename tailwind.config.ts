import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FFFFFF',
          warm: '#F7F6F3',
          bone: '#FBFBFA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          warm: '#F9F9F8',
        },
        border: '#EAEAEA',
        text: {
          primary: '#111111',
          secondary: '#2F3437',
          muted: '#787774',
        },
        accent: {
          red: {
            bg: '#FDEBEC',
            text: '#9F2F2D',
          },
          blue: {
            bg: '#E1F3FE',
            text: '#1F6C9F',
          },
          green: {
            bg: '#EDF3EC',
            text: '#346538',
          },
          yellow: {
            bg: '#FBF3DB',
            text: '#956400',
          },
        },
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'sans-serif',
        ],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
        sm: ['0.875rem', { lineHeight: '1.6' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(0,0,0,0.04)',
        card: '0 1px 3px rgba(0,0,0,0.04)',
        hover: '0 4px 12px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        'ambient': 'ambient 20s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ambient: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
