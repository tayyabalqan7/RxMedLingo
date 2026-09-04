/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "serif"],
      },
      colors: {
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
      },
    },
  },
  plugins: [],
};
