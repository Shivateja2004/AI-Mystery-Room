/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#172033', parchment: '#f8f3e9', gold: '#ba8b32', wine: '#732b36' },
      fontFamily: { display: ['Georgia', 'serif'] }
    }
  },
  plugins: []
};
