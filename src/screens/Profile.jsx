import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { supabase } from "../supabase"
import i18n from "../i18n"

export default function Profile({ user, setScreen }) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [bizType, setBizType] = useState("")
  const [language, setLanguage] = useState("english")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.name || "")
      setBizType(user.user_metadata.bizType || "")
      setLanguage(user.user_metadata.language || "english")
    }
  }, [user])

  async function save() {
    setSaving(true)
    await supabase.auth.updateUser({
      data: { name, bizType, language }
    })
    i18n.changeLanguage(language)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setScreen("dashboard") }, 1000)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-primary mb-1">{t("profile")}</h1>
      <p className="text-gray-500 text-sm mb-6">Manage your business profile</p>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4 mb-4">
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
          disabled={saving}
          className="w-full bg-primary text-white rounded-xl py-3 font-semibold"
        >
          {saved ? "Saved! ✓" : saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <button
        onClick={logout}
        className="w-full bg-red-50 text-red-500 rounded-xl py-3 font-semibold"
      >
        Log Out
      </button>
    </div>
  )
}