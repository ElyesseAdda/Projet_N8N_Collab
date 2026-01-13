/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Outfit', 'sans-serif'], // Optionnel, mais recommandé pour correspondre au design
        },
      },
    },
    plugins: [],
  }