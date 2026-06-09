import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function Tracker() {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState("income")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)

  const categories = {
    income: ["Sales", "Service", "Other Income"],
    expense: ["Stock/Materials", "Transport", "Food", "Rent", "Utilities", "Other"]
  }

  useEffect(() => { loadTransactions() }, [])

  async function loadTransactions() {
    const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false })
    if (data) setTransactions(data)
  }

  async function addTransaction() {
    if (!amount || !description) return
    setSaving(true)
    await supabase.from("transactions").insert([{ type, amount: parseFloat(amount), description, category }])
    setAmount("")
    setDescription("")
    setCategory("")
    await loadTransactions()
    setSaving(false)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-primary mb-1">Tracker</h1>
      <p className="text-gray-500 text-sm mb-4">Record your income and expenses</p>

      {/* Add transaction form */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setType("income")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${type === "income" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}
          >
            + Income
          </button>
          <button
            onClick={() => setType("expense")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${type === "expense" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"}`}
          >
            - Expense
          </button>
        </div>

        <input
          type="number"
          placeholder="Amount (GHS)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Description (e.g. Sold 5 dresses)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary"
        >
          <option value="">Select category</option>
          {categories[type].map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          onClick={addTransaction}
          disabled={saving}
          className="w-full bg-primary text-white rounded-xl py-3 font-semibold"
        >
          {saving ? "Saving..." : "Save Transaction"}
        </button>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-bold text-primary mb-3">All Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>
        ) : (
          transactions.map(t => (
            <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium">{t.description}</p>
                <p className="text-xs text-gray-400">{t.category} • {new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <p className={`font-bold text-sm ${t.type === "income" ? "text-primary" : "text-red-500"}`}>
                {t.type === "income" ? "+" : "-"}GHS {t.amount}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}