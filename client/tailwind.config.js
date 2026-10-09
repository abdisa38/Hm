/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          navy: '#0A2540',
          blue: '#0C4A60',
          teal: '#0D9488',
          cyan: '#028090',
          emerald: '#059669',
          surface: '#F8FAFC',
          border: '#E2E8F0',
          slate: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
