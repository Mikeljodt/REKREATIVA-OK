/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(59,130,246,0.5)' },
          '100%': { boxShadow: '0 0 25px rgba(59,130,246,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
