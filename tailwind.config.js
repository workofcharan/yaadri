/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EE',
        sage: '#8FA98D',
        sageDark: '#5E7A5C',
        ink: '#2B2620',
      },
    },
  },
  plugins: [],
}
