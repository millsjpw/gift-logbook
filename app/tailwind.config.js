/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      fontSize: {
        tiny: '0.625rem', // 10px
      },
    },
  },
  plugins: [],
}