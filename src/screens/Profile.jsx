import { useState } from "react"
import { useTranslation } from "react-i18next"
import i18n from "../i18n"

export default function Profile({ setScreen }) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [bizType, setBizType] = useState("")
  const [language, setLanguage] = useState("english")
  const [saved, setSaved] = useState(false)

  function save() {
    localStorage.setItem("bizbuddy_profile", JSON.stringify({ name, bizType, language }))
    i18n.changeLanguage(language)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setScreen("dashboard")
    }, 1000)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-primary mb-1">{t("profile")}</h1>
      <p className="text-gray-500 text-sm mb-6">Tell us about your business</p>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Your Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Ama Owusu"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Business Type</label>
          <select
            value={bizType}
            onChange={e => setBizType(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Select type</option>
            <option value="trader">Market Trader</option>
            <option value="food">Food Vendor</option>
            <option value="seamstress">Seamstress</option>
            <option value="beauty">Beauty Professional</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Preferred Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="english">English</option>
            <option value="twi">Twi</option>
            <option value="ga">Ga</option>
            <option value="ewe">Ewe</option>
          </select>
        </div>

        <button
          onClick={save}
          className="w-full bg-primary text-white rounded-xl py-3 font-semibold"
        >
          {saved ? "Saved! ✓" : "Save Profile"}
        </button>
      </div>
    </div>
  )
}