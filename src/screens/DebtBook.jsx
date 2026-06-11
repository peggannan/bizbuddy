import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function DebtBook({ user }) {
  const [debts, setDebts] = useState([])
  const [type, setType] = useState("owed_to_me")
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState("owed_to_me")

  const inputClass = "w-full bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from("debts").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setDebts(data)
  }

  async function save() {
    if (!name || !amount) return
    setSaving(true)
    await supabase.from("debts").insert([{ user_id: user.id, name, type, amount: parseFloat(amount), description, due_date: dueDate || null }])
    setName(""); setAmount(""); setDescription(""); setDueDate("")
    await load()
    setSaving(false)
  }

  async function markPaid(id) {
    await supabase.from("debts").update({ status: "paid" }).eq("id", id)
    await load()
  }

  async function deleteDebt(id) {
    if (!window.confirm("Delete this record?")) return
    await supabase.from("debts").delete().eq("id", id)
    await load()
  }

  const filtered = debts.filter(d => d.type === tab)
  const totalOwedToMe = debts.filter(d => d.type === "owed_to_me" && d.status === "pending").reduce((s, d) => s + Number(d.amount), 0)
  const totalIOwe = debts.filter(d => d.type === "i_owe" && d.status === "pending").reduce((s, d) => s + Number(d.amount), 0)

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#2DD4BF] mb-1">Debt & Credit Book</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Track who owes you and who you owe</p>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-[#112221] rounded-2xl p-4 border border-gray-100 dark:border-[#1A3A38]">
          <p className="text-xs text-gray-400 mb-1">Owed to Me</p>
          <p className="text-primary dark:text-[#2DD4BF] font-bold text-lg">GHS {totalOwedToMe.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#112221] rounded-2xl p-4 border border-gray-100 dark:border-[#1A3A38]">
          <p className="text-xs text-gray-400 mb-1">I Owe</p>
          <p className="text-red-400 font-bold text-lg">GHS {totalIOwe.toLocaleString()}</p>
        </div>
      </div>

      {/* Add form */}
      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setType("owed_to_me")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${type === "owed_to_me" ? "bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E]" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>
            They Owe Me
          </button>
          <button onClick={() => setType("i_owe")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${type === "i_owe" ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>
            I Owe Them
          </button>
        </div>
        <input placeholder="Person's name" value={name} onChange={e => setName(e.target.value)} className={`${inputClass} mb-3`} />
        <input type="number" placeholder="Amount (GHS)" value={amount} onChange={e => setAmount(e.target.value)} className={`${inputClass} mb-3`} />
        <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} mb-3`} />
        <div className="mb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Due Date (optional)</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
        </div>
        <button onClick={save} disabled={saving} className="w-full bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl py-3 font-semibold">
          {saving ? "Saving..." : "Save Record"}
        </button>
      </div>

      {/* List */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => setTab("owed_to_me")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === "owed_to_me" ? "bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E]" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>
          Owed to Me ({debts.filter(d => d.type === "owed_to_me" && d.status === "pending").length})
        </button>
        <button onClick={() => setTab("i_owe")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === "i_owe" ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>
          I Owe ({debts.filter(d => d.type === "i_owe" && d.status === "pending").length})
        </button>
      </div>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📒</p>
            <p className="text-gray-400 text-sm">No records yet</p>
          </div>
        ) : filtered.map(d => (
          <div key={d.id} className="flex justify-between items-start py-3 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium dark:text-white">{d.name}</p>
                {d.status === "paid" && <span className="text-xs bg-green-100 dark:bg-[#1A3A38] text-green-600 dark:text-[#2DD4BF] px-2 py-0.5 rounded-full">Paid</span>}
              </div>
              <p className="text-xs text-gray-400">{d.description}</p>
              {d.due_date && <p className="text-xs text-yellow-500 mt-0.5">Due: {new Date(d.due_date).toLocaleDateString("en-GH")}</p>}
            </div>
            <div className="flex items-center gap-2">
              <p className={`font-bold text-sm ${d.type === "owed_to_me" ? "text-primary dark:text-[#2DD4BF]" : "text-red-400"}`}>
                GHS {Number(d.amount).toLocaleString()}
              </p>
              {d.status === "pending" && (
                <button onClick={() => markPaid(d.id)} className="text-xs bg-green-50 dark:bg-[#1A3A38] text-green-600 dark:text-[#2DD4BF] px-2 py-1 rounded-lg">✓</button>
              )}
              <button onClick={() => deleteDebt(d.id)} className="text-xs bg-red-50 dark:bg-[#2B1414] text-red-500 px-2 py-1 rounded-lg">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}