/**** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          red: '#990000'
        },
        lasalle: {
          blue: '#003057',
          gold: '#FDB515'
        },
        upenn: {
          blue: '#011F5B',
          red: '#990000'
        },
        drexel: {
          navy: '#07294D',
          yellow: '#FFC600'
        },
        cccp: {
          green: '#2E8B57'
        }
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
