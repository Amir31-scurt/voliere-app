/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cage: {
          libre:   '#D1FAE5',
          'libre-border': '#10B981',
          pigeon:  '#FEE2E2',
          'pigeon-border': '#EF4444',
          couple:  '#FEF3C7',
          'couple-border': '#F59E0B',
        },
        primary:  '#3B82F6',
        danger:   '#EF4444',
        warning:  '#F59E0B',
        success:  '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
