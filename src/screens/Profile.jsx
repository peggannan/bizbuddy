import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { supabase } from "../supabase"
import i18n from "../i18n"

export default function Profile({ user, setScreen }) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [bizType, setBizType] = useState("")
  const [language, setLanguage] = useState("english")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")

  const inputClass = "w-full bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-[#1DB954]"

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.name || "")
      setBizType(user.user_metadata.bizType || "")
      setLanguage(user.user_metadata.language || "english")
    }
  }, [user])

  async function save() {
    setSaving(true)
    const updates = { data: { name, bizType, language } }
    const { error } = await supabase.auth.updateUser(updates)
    if (error) {
      setSaving(false)
      return
    }
    i18n.changeLanguage(language)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setScreen("dashboard") }, 1000)
  }

  async function updatePassword() {
    setPasswordFeedback("")
    if (!password.trim()) {
      setPasswordFeedback("Enter a new password to change it.")
      return
    }
    if (password !== confirmPassword) {
      setPasswordFeedback("Passwords do not match.")
      return
    }

    setPasswordFeedback("Updating password...")
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setPasswordFeedback("Could not update password. Try again.")
      return
    }
    setPassword("")
    setConfirmPassword("")
    setPasswordFeedback("Password updated successfully.")
  }

  async function deleteAccount() {
    const confirmed = window.confirm("Delete your account permanently? This cannot be undone.")
    if (!confirmed) return

    setDeleteLoading(true)
    setDeleteMessage("")

    try {
      let error = null
      if (supabase.auth.admin?.deleteUser) {
        const result = await supabase.auth.admin.deleteUser(user.id)
        error = result.error
      } else if (supabase.auth.deleteUser) {
        const result = await supabase.auth.deleteUser()
        error = result.error
      } else {
        setDeleteMessage("Account deletion is not available from this client. Please contact support.")
        setDeleteLoading(false)
        return
      }

      if (error) {
        setDeleteMessage("Unable to delete account right now. Please try again later.")
      } else {
        setDeleteMessage("Account deleted successfully. Goodbye.")
      }
    } catch (err) {
      setDeleteMessage("Unable to delete account right now. Please try again later.")
    }
    setDeleteLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#1DB954] mb-1">{t("profile")}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Manage your business identity and account settings</p>

      <div className="bg-primary dark:bg-[#112221] rounded-2xl p-4 mb-4 flex items-center gap-4 border border-transparent dark:border-[#1A3A38]">
        <div className="w-12 h-12 bg-white/20 dark:bg-[#1A3A38] rounded-full flex items-center justify-center text-2xl">
          👤
        </div>
        <div>
          <p className="text-white font-bold">{name || "Your Name"}</p>
          <p className="text-white/70 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 space-y-4 mb-4">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Your Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ama Owusu" className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Business Type</label>
          <input value={bizType} onChange={e => setBizType(e.target.value)} placeholder="Market trader, food vendor, seamstress, etc." className={inputClass} />
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

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 space-y-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Change Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter a new password to update it immediately.</p>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
            </div>
            <button onClick={updatePassword} className="w-full bg-slate-800 dark:bg-[#15302B] text-white rounded-xl py-3 font-semibold">
              Update Password
            </button>
            {passwordFeedback && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{passwordFeedback}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 space-y-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Danger Zone</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Deleting your account removes your data and cannot be undone.</p>
        <button onClick={deleteAccount} disabled={deleteLoading}
          className="w-full bg-red-500 text-white rounded-xl py-3 font-semibold hover:bg-red-600 transition-colors">
          {deleteLoading ? "Deleting account..." : "Delete Account"}
        </button>
        {deleteMessage && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{deleteMessage}</p>
        )}
      </div>

      <button onClick={logout}
        className="w-full bg-red-50 dark:bg-[#2B1414] text-red-500 border border-red-100 dark:border-red-900/30 rounded-xl py-3 font-semibold">
        Log Out
      </button>
    </div>
  );
}
