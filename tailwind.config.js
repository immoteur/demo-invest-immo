import { heroui } from '@heroui/theme';

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  plugins: [heroui()],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 40px -24px rgba(17, 24, 39, 0.55)',
      },
    },
  },
};

export default config;
