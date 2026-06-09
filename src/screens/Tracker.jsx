import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function Tracker({ user }) {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState("income")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const inputClass = "w-full bg-gray-50 dark:bg-[#1E3D32] border border-gray-200 dark:border-[#2A5040] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-[#1DB954] placeholder-gray-400 dark:placeholder-gray-600"

  const categories = {
    income: ["Sales", "Service", "Other Income"],
    expense: ["Stock/Materials", "Transport", "Food", "Rent", "Utilities", "Other"]
  }

  useEffect(() => { loadTransactions() }, [])

  async function loadTransactions() {
    const { data } = await supabase.from("transactions").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setTransactions(data)
  }

  async function saveTransaction() {
    if (!amount || !description) return
    setSaving(true)
    if (editingId) {
      await supabase.from("transactions").update({ type, amount: parseFloat(amount), description, category }).eq("id", editingId)
      setEditingId(null)
    } else {
      await supabase.from("transactions").insert([{ type, amount: parseFloat(amount), description, category, user_id: user.id }])
    }
    setAmount(""); setDescription(""); setCategory("")
    await loadTransactions()
    setSaving(false)
  }

  function startEdit(t) {
    setEditingId(t.id); setType(t.type); setAmount(String(t.amount))
    setDescription(t.description); setCategory(t.category)
    window.scrollTo(0, 0)
  }

  async function deleteTransaction(id) {
    if (!window.confirm("Delete this transaction?")) return
    await supabase.from("transactions").delete().eq("id", id)
    await loadTransactions()
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#1DB954] mb-1">Tracker</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Record your income and expenses</p>

      <div className="bg-white dark:bg-[#132B24] rounded-2xl border border-gray-100 dark:border-[#1E3D32] p-4 mb-4">
        {editingId && (
          <div className="bg-amber-50 dark:bg-[#2A2010] border border-amber-200 dark:border-[#D4A017]/30 rounded-xl px-3 py-2 text-sm text-amber-700 dark:text-gold mb-3 flex justify-between">
            <span>Editing transaction</span>
            <button onClick={() => { setEditingId(null); setAmount(""); setDescription(""); setCategory("") }} className="font-bold">✕ Cancel</button>
          </div>
        )}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setType("income")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${type === "income" ? "bg-primary dark:bg-[#1DB954] text-white dark:text-[#0D1F1A]" : "bg-gray-100 dark:bg-[#1E3D32] text-gray-500 dark:text-gray-400"}`}>
            + Income
          </button>
          <button onClick={() => setType("expense")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${type === "expense" ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-[#1E3D32] text-gray-500 dark:text-gray-400"}`}>
            - Expense
          </button>
        </div>
        <input type="number" placeholder="Amount (GHS)" value={amount} onChange={e => setAmount(e.target.value)} className={`${inputClass} mb-3`} />
        <input type="text" placeholder="Description (e.g. Sold 5 dresses)" value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} mb-3`} />
        <select value={category} onChange={e => setCategory(e.target.value)} className={`${inputClass} mb-3`}>
          <option value="">Select category</option>
          {categories[type].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={saveTransaction} disabled={saving}
          className="w-full bg-primary dark:bg-[#1DB954] text-white dark:text-[#0D1F1A] rounded-xl py-3 font-semibold">
          {saving ? "Saving..." : editingId ? "Update Transaction" : "Save Transaction"}
        </button>
      </div>

      <div className="bg-white dark:bg-[#132B24] rounded-2xl border border-gray-100 dark:border-[#1E3D32] p-4">
        <h2 className="font-bold text-gray-800 dark:text-white mb-3">All Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>
        ) : (
          transactions.map(t => (
            <div key={t.id} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-[#1E3D32] last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${t.type === "income" ? "bg-green-100 dark:bg-[#1E3D32]" : "bg-red-100 dark:bg-[#2B1414]"}`}>
                  {t.type === "income" ? "↑" : "↓"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.category} • {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <p className={`font-bold text-sm mx-3 ${t.type === "income" ? "text-primary dark:text-[#1DB954]" : "text-red-500"}`}>
                {t.type === "income" ? "+" : "-"}GHS {t.amount}
              </p>
              <div className="flex gap-1">
                <button onClick={() => startEdit(t)} className="text-xs bg-gray-100 dark:bg-[#1E3D32] text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">Edit</button>
                <button onClick={() => deleteTransaction(t.id)} className="text-xs bg-red-50 dark:bg-[#2B1414] text-red-500 px-2 py-1 rounded-lg">Del</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}