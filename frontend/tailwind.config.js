/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#388130",
        "primary-dark": "#276718",
        yellow: "#fee505",
        "running-text-bg": "#E0E7EB",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'ticketing-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'ticketing-marquee': 'ticketing-marquee 35s linear infinite',
      },
    },
  },
  plugins: [],
};
