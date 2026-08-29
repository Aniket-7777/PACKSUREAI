/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        govt: {
          navy: "#0a192f",
          dark: "#0f2942",
          blue: "#1d4ed8",
          gold: "#c59b27",
          amber: "#d97706",
          red: "#dc2626",
          green: "#16a34a",
          surface: "#f0f9ff"
        }
      }
    },
  },
  plugins: [],
}
