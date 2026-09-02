import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0B0F19',
          900: '#0F172A',
          850: '#151D2E',
          800: '#1E293B',
          700: '#334155',
        },
        koda: {
          orange: '#F97316',
          amber: '#F59E0B',
          emerald: '#10B981',
          indigo: '#6366F1',
          coral: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
