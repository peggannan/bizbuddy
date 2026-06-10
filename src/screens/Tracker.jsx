import { useState, useEffect } from "react"
import { supabase } from "../supabase"

const DEFAULT_CATEGORIES = {
  income: ["Sales", "Service", "Other Income"],
  expense: ["Stock/Materials", "Transport", "Food", "Rent", "Utilities", "Other"]
}

const CATEGORY_ICONS = {
  "Sales": "🛒", "Service": "💼", "Other Income": "💰",
  "Stock/Materials": "📦", "Transport": "🚗", "Food": "🍲",
  "Rent": "🏠", "Utilities": "💡", "Other": "📌"
}

export default function Tracker({ user }) {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState("income")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem("bizbuddy_categories")
    return saved ? JSON.parse(saved) : { income: [], expense: [] }
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  const allCategories = {
    income: [...DEFAULT_CATEGORIES.income, ...customCategories.income],
    expense: [...DEFAULT_CATEGORIES.expense, ...customCategories.expense]
  }

  const inputClass = "w-full bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-[#2DD4BF] placeholder-gray-400 dark:placeholder-gray-600"

  useEffect(() => { loadTransactions() }, [])

  async function loadTransactions() {
    const { data } = await supabase.from("transactions").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setTransactions(data)
  }

  function addCustomCategory() {
    if (!newCategory.trim()) return
    const updated = {
      ...customCategories,
      [type]: [...customCategories[type], newCategory.trim()]
    }
    setCustomCategories(updated)
    localStorage.setItem("bizbuddy_categories", JSON.stringify(updated))
    setCategory(newCategory.trim())
    setNewCategory("")
    setShowAddCategory(false)
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
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
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
      <h1 className="text-2xl font-bold text-primary dark:text-[#2DD4BF] mb-1">Tracker</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Record your income and expenses</p>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
        {editingId && (
          <div className="bg-amber-50 dark:bg-[#2A2010] border border-amber-200 dark:border-[#D4A017]/30 rounded-xl px-3 py-2 text-sm text-amber-700 dark:text-yellow-400 mb-3 flex justify-between">
            <span>Editing transaction</span>
            <button onClick={() => { setEditingId(null); setAmount(""); setDescription(""); setCategory("") }} className="font-bold">✕ Cancel</button>
          </div>
        )}

        {/* Success animation */}
        {saveSuccess && (
          <div className="bg-teal-50 dark:bg-[#1A3A38] border border-teal-200 dark:border-[#2DD4BF]/30 rounded-xl px-3 py-2 text-sm text-teal-700 dark:text-[#2DD4BF] mb-3 flex items-center gap-2 animate-pulse">
            <span>✓</span> Transaction saved successfully!
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <button onClick={() => setType("income")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${type === "income" ? "bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E]" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>
            + Income
          </button>
          <button onClick={() => setType("expense")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${type === "expense" ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>
            - Expense
          </button>
        </div>

        <input type="number" placeholder="Amount (GHS)" value={amount} onChange={e => setAmount(e.target.value)} className={`${inputClass} mb-3`} />
        <input type="text" placeholder="Description (e.g. Sold 5 dresses)" value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} mb-3`} />

        {/* Category selector with add option */}
        <div className="mb-3">
          <div className="flex gap-2">
            <select value={category} onChange={e => setCategory(e.target.value)} className={`${inputClass} flex-1`}>
              <option value="">Select category</option>
              {allCategories[type].map(c => (
                <option key={c} value={c}>{CATEGORY_ICONS[c] || "📌"} {c}</option>
              ))}
            </select>
            <button onClick={() => setShowAddCategory(!showAddCategory)}
              className="px-3 py-2 bg-gray-100 dark:bg-[#1A3A38] text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#1A3A38]">
              + New
            </button>
          </div>
          {showAddCategory && (
            <div className="mt-2 flex gap-2">
              <input
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Category name..."
                className={`${inputClass} flex-1`}
                onKeyDown={e => e.key === "Enter" && addCustomCategory()}
              />
              <button onClick={addCustomCategory}
                className="px-3 py-2 bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl text-sm font-semibold">
                Add
              </button>
            </div>
          )}
        </div>

        <button onClick={saveTransaction} disabled={saving}
          className="w-full bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl py-3 font-semibold">
          {saving ? "Saving..." : editingId ? "Update Transaction" : "Save Transaction"}
        </button>
      </div>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
        <h2 className="font-bold text-gray-800 dark:text-white mb-3">All Transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-gray-400 text-sm">No transactions yet</p>
          </div>
        ) : (
          transactions.map(t => (
            <div key={t.id} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${t.type === "income" ? "bg-teal-50 dark:bg-[#1A3A38]" : "bg-red-50 dark:bg-[#2B1414]"}`}>
                  {CATEGORY_ICONS[t.category] || (t.type === "income" ? "💰" : "📤")}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.category} • {new Date(t.created_at).toLocaleDateString("en-GH")}</p>
                </div>
              </div>
              <p className={`mono-number font-bold text-sm mx-2 ${t.type === "income" ? "text-primary dark:text-[#2DD4BF]" : "text-red-400"}`}>
                {t.type === "income" ? "+" : "-"}GHS {Number(t.amount).toLocaleString()}
              </p>
              <div className="flex gap-1">
                <button onClick={() => startEdit(t)} className="text-xs bg-gray-100 dark:bg-[#1A3A38] text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">Edit</button>
                <button onClick={() => deleteTransaction(t.id)} className="text-xs bg-red-50 dark:bg-[#2B1414] text-red-500 px-2 py-1 rounded-lg">Del</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}