/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#10b981',
      },
      animation: {
        slideInUp: 'slideInUp 0.5s ease-in-out',
        slideInDown: 'slideInDown 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}
