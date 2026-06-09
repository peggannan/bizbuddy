export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1B5E37",
        gold: "#D4A017",
        dark: {
          bg: "#0D1F1A",
          card: "#132B24",
          nav: "#0F2420",
          accent: "#1DB954",
          border: "#1E3D32",
        }
      }
    }
  },
  plugins: []
}