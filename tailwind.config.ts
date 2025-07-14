/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',   // for app router
      './components/**/*.{js,ts,jsx,tsx}', 
      './pages/**/*.{js,ts,jsx,tsx}', // if using pages dir
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  