import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function Customers({ user }) {
  const [customers, setCustomers] = useState([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [preferences, setPreferences] = useState("")
  const [birthday, setBirthday] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)

  const inputClass = "w-full bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from("customers").select("*").eq("user_id", user.id).order("name")
    if (data) setCustomers(data)
  }

  async function save() {
    if (!name) return
    setSaving(true)
    await supabase.from("customers").insert([{ user_id: user.id, name, phone, preferences, birthday: birthday || null, notes }])
    setName(""); setPhone(""); setPreferences(""); setBirthday(""); setNotes("")
    await load()
    setSaving(false)
  }

  async function deleteCustomer(id) {
    if (!window.confirm("Delete this customer?")) return
    await supabase.from("customers").delete().eq("id", id)
    await load()
  }

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  const todayBirthdays = customers.filter(c => {
    if (!c.birthday) return false
    const b = new Date(c.birthday)
    const today = new Date()
    return b.getDate() === today.getDate() && b.getMonth() === today.getMonth()
  })

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#2DD4BF] mb-1">Customer Book</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Build real relationships with your customers</p>

      {todayBirthdays.length > 0 && (
        <div className="bg-yellow-50 dark:bg-[#2A2010] border border-yellow-200 dark:border-yellow-600/30 rounded-2xl p-4 mb-4">
          <p className="text-yellow-700 dark:text-yellow-400 font-semibold text-sm">🎂 Birthday today!</p>
          {todayBirthdays.map(c => <p key={c.id} className="text-yellow-600 dark:text-yellow-500 text-xs mt-1">{c.name} — {c.phone && `call them at ${c.phone}`}</p>)}
        </div>
      )}

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
        <p className="font-semibold text-gray-700 dark:text-white text-sm mb-3">Add Customer</p>
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className={`${inputClass} mb-3`} />
        <input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} className={`${inputClass} mb-3`} />
        <input placeholder="Preferences (e.g. likes bold colours)" value={preferences} onChange={e => setPreferences(e.target.value)} className={`${inputClass} mb-3`} />
        <div className="mb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Birthday (optional)</label>
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={inputClass} />
        </div>
        <textarea placeholder="Notes about this customer..." value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          className={`${inputClass} mb-3 resize-none`} />
        <button onClick={save} disabled={saving} className="w-full bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl py-3 font-semibold">
          {saving ? "Saving..." : "Add Customer"}
        </button>
      </div>

      <input placeholder="🔍 Search customers..." value={search} onChange={e => setSearch(e.target.value)}
        className={`${inputClass} mb-3`} />

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
        <p className="font-semibold text-gray-700 dark:text-white text-sm mb-3">{customers.length} Customers</p>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-gray-400 text-sm">No customers yet</p>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} className="py-3 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
            <div className="flex justify-between items-start">
              <button onClick={() => setSelected(selected?.id === c.id ? null : c)} className="flex-1 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 dark:bg-[#1A3A38] rounded-full flex items-center justify-center text-sm font-bold text-primary dark:text-[#2DD4BF]">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone || "No phone"}</p>
                  </div>
                </div>
              </button>
              <div className="flex gap-1">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-xs bg-green-50 dark:bg-[#1A3A38] text-green-600 dark:text-[#2DD4BF] px-2 py-1 rounded-lg">📞</a>
                )}
                {c.phone && (
                  <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                    className="text-xs bg-green-50 dark:bg-[#1A3A38] text-green-600 dark:text-[#2DD4BF] px-2 py-1 rounded-lg">💬</a>
                )}
                <button onClick={() => deleteCustomer(c.id)} className="text-xs bg-red-50 dark:bg-[#2B1414] text-red-500 px-2 py-1 rounded-lg">✕</button>
              </div>
            </div>
            {selected?.id === c.id && (
              <div className="mt-3 ml-12 bg-gray-50 dark:bg-[#1A3A38] rounded-xl p-3 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                {c.preferences && <p>❤️ Likes: {c.preferences}</p>}
                {c.birthday && <p>🎂 Birthday: {new Date(c.birthday).toLocaleDateString("en-GH", { day: "numeric", month: "long" })}</p>}
                {c.notes && <p>📝 {c.notes}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}