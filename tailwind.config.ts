import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { green: '#1D6434', indigo: '#3B3A93', red: '#ED1C24', brown: '#5A3114', accent: '#F5A623' },
        ink: { DEFAULT: '#14202E', muted: '#5A6878' },
        line: '#D9DEE5',
        surface: { DEFAULT: '#FFFFFF', alt: '#F4F6F9' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'], serif: ['Georgia', 'Times New Roman', 'serif'] },
    },
  },
  plugins: [],
} satisfies Config;
