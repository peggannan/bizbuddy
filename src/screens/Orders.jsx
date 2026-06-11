import { useState, useEffect } from "react"
import { supabase } from "../supabase"

const STATUS_COLORS = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  completed: "bg-green-100 dark:bg-[#1A3A38] text-green-700 dark:text-[#2DD4BF]",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
}

export default function Orders({ user }) {
  const [orders, setOrders] = useState([])
  const [customerName, setCustomerName] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [deposit, setDeposit] = useState("")
  const [deadline, setDeadline] = useState("")
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState("all")

  const inputClass = "w-full bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setOrders(data)
  }

  async function save() {
    if (!customerName || !description || !amount) return
    setSaving(true)
    await supabase.from("orders").insert([{ user_id: user.id, customer_name: customerName, description, amount: parseFloat(amount), deposit_paid: parseFloat(deposit) || 0, deadline: deadline || null }])
    setCustomerName(""); setDescription(""); setAmount(""); setDeposit(""); setDeadline("")
    await load()
    setSaving(false)
  }

  async function updateStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id)
    await load()
  }

  async function deleteOrder(id) {
    if (!window.confirm("Delete this order?")) return
    await supabase.from("orders").delete().eq("id", id)
    await load()
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter)
  const pending = orders.filter(o => o.status === "pending").length
  const totalValue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.amount), 0)
  const totalDeposits = orders.reduce((s, o) => s + Number(o.deposit_paid), 0)

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#2DD4BF] mb-1">Order Manager</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Track customer orders and deadlines</p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-[#112221] rounded-2xl p-3 border border-gray-100 dark:border-[#1A3A38] text-center">
          <p className="text-xs text-gray-400 mb-1">Pending</p>
          <p className="font-bold text-yellow-500 text-lg">{pending}</p>
        </div>
        <div className="bg-white dark:bg-[#112221] rounded-2xl p-3 border border-gray-100 dark:border-[#1A3A38] text-center">
          <p className="text-xs text-gray-400 mb-1">Total Value</p>
          <p className="font-bold text-primary dark:text-[#2DD4BF] text-sm">GHS {totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#112221] rounded-2xl p-3 border border-gray-100 dark:border-[#1A3A38] text-center">
          <p className="text-xs text-gray-400 mb-1">Deposits</p>
          <p className="font-bold text-primary dark:text-[#2DD4BF] text-sm">GHS {totalDeposits.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
        <p className="font-semibold text-gray-700 dark:text-white text-sm mb-3">New Order</p>
        <input placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`${inputClass} mb-3`} />
        <input placeholder="Order description" value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} mb-3`} />
        <div className="flex gap-2 mb-3">
          <input type="number" placeholder="Total amount" value={amount} onChange={e => setAmount(e.target.value)} className={`${inputClass} flex-1`} />
          <input type="number" placeholder="Deposit paid" value={deposit} onChange={e => setDeposit(e.target.value)} className={`${inputClass} flex-1`} />
        </div>
        <div className="mb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Deadline</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputClass} />
        </div>
        <button onClick={save} disabled={saving} className="w-full bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl py-3 font-semibold">
          {saving ? "Saving..." : "Add Order"}
        </button>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {["all","pending","in_progress","completed","cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${filter === s ? "bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E]" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>
            {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-gray-400 text-sm">No orders yet</p>
          </div>
        ) : filtered.map(o => (
          <div key={o.id} className="py-3 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium dark:text-white">{o.customer_name}</p>
                <p className="text-xs text-gray-400">{o.description}</p>
                {o.deadline && (
                  <p className={`text-xs mt-0.5 ${new Date(o.deadline) < new Date() && o.status === "pending" ? "text-red-400" : "text-gray-400"}`}>
                    📅 {new Date(o.deadline).toLocaleDateString("en-GH")}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${STATUS_COLORS[o.status]}`}>
                {o.status === "in_progress" ? "In Progress" : o.status.charAt(0).toUpperCase() + o.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400">Total: <span className="text-primary dark:text-[#2DD4BF] font-semibold">GHS {Number(o.amount).toLocaleString()}</span></p>
                <p className="text-xs text-gray-400">Deposit: GHS {Number(o.deposit_paid).toLocaleString()} • Balance: GHS {(Number(o.amount) - Number(o.deposit_paid)).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                  className="text-xs bg-gray-100 dark:bg-[#1A3A38] text-gray-600 dark:text-gray-300 rounded-lg px-2 py-1 border-0 focus:outline-none">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={() => deleteOrder(o.id)} className="text-xs bg-red-50 dark:bg-[#2B1414] text-red-500 px-2 py-1 rounded-lg">✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}