import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "./i18n"
import App from "./App.jsx"
import i18n from "./i18n"

// Load saved language on startup
const saved = localStorage.getItem("bizbuddy_profile")
if (saved) {
  const profile = JSON.parse(saved)
  if (profile.language) {
    i18n.changeLanguage(profile.language)
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)