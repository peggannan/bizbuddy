export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0D9488",
        gold: "#D4A017",
        dark: {
          bg: "#0B1F1E",
          card: "#112221",
          nav: "#0D1A19",
          accent: "#2DD4BF",
          border: "#1A3A38",
        }
      },
      fontFamily: {
        mono: ["'Courier New'", "monospace"],
      }
    }
  },
  plugins: []
}