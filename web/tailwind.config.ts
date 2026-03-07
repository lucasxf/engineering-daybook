import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)'],
        heading: ['var(--font-sora)'],
        wordmark: ['var(--font-bricolage)'],
      },
      colors: {
        /* Library at Dusk palette */
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
          border: 'rgb(var(--card-border) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        input: {
          DEFAULT: 'rgb(var(--input) / <alpha-value>)',
          border: 'rgb(var(--input-border) / <alpha-value>)',
          placeholder: 'rgb(var(--input-placeholder) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          background: 'rgb(var(--destructive-background) / <alpha-value>)',
          border: 'rgb(var(--destructive-border) / <alpha-value>)',
        },
        ring: 'rgb(var(--ring) / <alpha-value>)',
        /* Brand accents */
        'deep-navy': '#0F1B2D',
        'primary-blue': '#1A365D',
        'mid-blue': '#2B4A78',
        'branch-brown': '#8B5E3C',
        'dark-leather': '#6B4226',
        'ember-cta': '#D4854A',
        parchment: '#F5F0E8',
        ink: '#1A1A2E',
        /* Disabled button colors */
        'btn-disabled': {
          DEFAULT: '#E0D8D0',
          dark: '#3A4A5A',
        },
        'btn-disabled-text': {
          DEFAULT: '#999999',
          dark: '#6A7A8A',
        },
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 150ms ease-out',
        slideUp: 'slideUp 200ms ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
