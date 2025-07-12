/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#1a1a1a',
        'game-ui': '#2d2d2d',
        'eco-green': '#4ade80',
        'pollution-red': '#ef4444',
        'warning-yellow': '#fbbf24',
      },
      fontFamily: {
        'pixel': ['monospace'],
      },
    },
  },
  plugins: [],
}