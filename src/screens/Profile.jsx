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

  const inputClass = "w-full bg-gray-50 dark:bg-[#1E3D32] border border-gray-200 dark:border-[#2A5040] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-[#1DB954]"

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.name || "")
      setBizType(user.user_metadata.bizType || "")
      setLanguage(user.user_metadata.language || "english")
    }
  }, [user])

  async function save() {
    setSaving(true)
    await supabase.auth.updateUser({ data: { name, bizType, language } })
    i18n.changeLanguage(language)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setScreen("dashboard") }, 1000)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#1DB954] mb-1">{t("profile")}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Manage your business profile</p>

      {/* User info card */}
      <div className="bg-primary dark:bg-[#132B24] rounded-2xl p-4 mb-4 flex items-center gap-4 border border-transparent dark:border-[#1E3D32]">
        <div className="w-12 h-12 bg-white/20 dark:bg-[#1E3D32] rounded-full flex items-center justify-center text-2xl">
          👤
        </div>
        <div>
          <p className="text-white font-bold">{name || "Your Name"}</p>
          <p className="text-white/70 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#132B24] rounded-2xl border border-gray-100 dark:border-[#1E3D32] p-4 space-y-4 mb-4">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Your Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ama Owusu" className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Business Type</label>
          <select value={bizType} onChange={e => setBizType(e.target.value)} className={inputClass}>
            <option value="">Select type</option>
            <option value="trader">Market Trader</option>
            <option value="food">Food Vendor</option>
            <option value="seamstress">Seamstress</option>
            <option value="beauty">Beauty Professional</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Preferred Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className={inputClass}>
            <option value="english">English</option>
            <option value="twi">Twi</option>
            <option value="ga">Ga</option>
            <option value="ewe">Ewe</option>
          </select>
        </div>
        <button onClick={save} disabled={saving}
          className="w-full bg-primary dark:bg-[#1DB954] text-white dark:text-[#0D1F1A] rounded-xl py-3 font-semibold">
          {saved ? "Saved! ✓" : saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <button onClick={logout}
        className="w-full bg-red-50 dark:bg-[#2B1414] text-red-500 border border-red-100 dark:border-red-900/30 rounded-xl py-3 font-semibold">
        Log Out
      </button>
    </div>
  )
}