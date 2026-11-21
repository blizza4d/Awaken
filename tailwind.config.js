/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Manrope', 'Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        obsidian: '#000000',
        spatial: {
          glass: 'rgba(12, 14, 22, 0.34)',
          border: 'rgba(255, 255, 255, 0.14)',
        },
      },
    },
  },
  plugins: [],
};
