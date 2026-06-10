/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        google: {
          blue: "#1a73e8",
          blueHover: "#1967d2",
          blueLight: "#e8f0fe",
          red: "#d93025",
          redLight: "#fce8e6",
          green: "#1e8e3e",
          greenLight: "#e6f4ea",
          yellow: "#f9ab00",
          yellowLight: "#fef7e0",
          gray50: "#f8f9fa",
          gray100: "#f1f3f4",
          gray200: "#e8eaed",
          gray300: "#dadce0",
          gray500: "#9aa0a6",
          gray600: "#5f6368",
          gray700: "#3c4043",
          gray800: "#202124",
        },
      },
      fontFamily: {
        sans: ["Roboto", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        google: "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
        card: "0 1px 2px 0 rgba(60,64,67,0.1), 0 2px 6px 2px rgba(60,64,67,0.15)",
      },
    },
  },
  plugins: [],
};
