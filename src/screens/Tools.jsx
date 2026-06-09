import { useState } from "react"
import { supabase } from "../supabase"

export default function Tools({ user }) {
  const [cost, setCost] = useState("")
  const [selling, setSelling] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [result, setResult] = useState(null)
  const [healthResult, setHealthResult] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const inputClass = "w-full bg-gray-50 dark:bg-[#1E3D32] border border-gray-200 dark:border-[#2A5040] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-[#1DB954] placeholder-gray-400 dark:placeholder-gray-600"

  function checkProfit() {
    const c = parseFloat(cost)
    const s = parseFloat(selling)
    const q = parseFloat(quantity)
    if (!c || !s || !q) return
    const profit = (s - c) * q
    const margin = ((s - c) / s) * 100
    setResult({ profit, margin })
  }

  async function runHealthCheck() {
    setHealthLoading(true)
    setHealthResult(null)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: transactions } = await supabase
      .from("transactions").select("*")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())

    if (!transactions || transactions.length === 0) {
      setHealthResult("No transactions found in the last 30 days. Start recording your income and expenses in the Tracker first!")
      setHealthLoading(false)
      return
    }

    const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
    const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
    const net = income - expenses
    const incomeCount = transactions.filter(t => t.type === "income").length
    const expenseCount = transactions.filter(t => t.type === "expense").length
    const categories = {}
    transactions.forEach(t => {
      if (!categories[t.category]) categories[t.category] = 0
      categories[t.category] += Number(t.amount)
    })
    const categoryList = Object.entries(categories).map(([cat, amt]) => `${cat}: GHS ${amt}`).join(", ")

    const prompt = `You are BizBuddy, a friendly business health advisor for small Ghanaian businesses.
Here is a summary of this business's last 30 days:
- Total Income: GHS ${income.toFixed(2)} (${incomeCount} transactions)
- Total Expenses: GHS ${expenses.toFixed(2)} (${expenseCount} transactions)
- Net Profit: GHS ${net.toFixed(2)}
- Categories: ${categoryList}
Give a friendly, encouraging business health check in 3 short points:
1. How healthy is the business right now
2. One thing they are doing well
3. One practical tip to improve profit
Keep it simple, warm and relevant to a Ghanaian small business owner. Use GHS for currency.`

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}` },
        body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }] })
      })
      const data = await response.json()
      setHealthResult(data.choices[0].message.content)
    } catch (e) {
      setHealthResult("Couldn't connect. Please try again.")
    }
    setHealthLoading(false)
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#1DB954] mb-1">Business Tools</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Calculators and AI advice for your business</p>

      {/* Profit Checker */}
      <div className="bg-white dark:bg-[#132B24] rounded-2xl border border-gray-100 dark:border-[#1E3D32] mb-4 overflow-hidden">
        <div className="bg-primary dark:bg-[#1E3D32] p-4 flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2 text-xl">🧮</div>
          <div>
            <h2 className="text-white font-bold text-lg">Profit Checker</h2>
            <p className="text-white/70 text-sm">Calculate your actual margins</p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Cost Price (GHS)</label>
              <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Selling Price (GHS)</label>
              <input type="number" value={selling} onChange={e => setSelling(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Quantity</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="1" className={inputClass} />
          </div>
          <button onClick={checkProfit} className="w-full bg-primary dark:bg-[#1DB954] text-white dark:text-[#0D1F1A] rounded-xl py-3 font-semibold">
            Check Profit
          </button>
          {result && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-[#1E3D32] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Profit</p>
                <p className={`text-lg font-bold ${result.profit >= 0 ? "text-primary dark:text-[#1DB954]" : "text-red-500"}`}>
                  GHS {result.profit.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-[#1E3D32] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Margin</p>
                <p className={`text-lg font-bold ${result.margin >= 0 ? "text-primary dark:text-[#1DB954]" : "text-red-500"}`}>
                  {result.margin.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Check */}
      <div className="bg-white dark:bg-[#132B24] rounded-2xl border border-gray-100 dark:border-[#1E3D32] overflow-hidden">
        <div className="bg-gold dark:bg-[#2A2010] p-4 flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2 text-xl">💡</div>
          <div>
            <h2 className="text-white dark:text-gold font-bold text-lg">BizBuddy Health Check</h2>
            <p className="text-white/70 dark:text-gold/70 text-sm">Get AI advice based on your records</p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-4">
            I'll look at your recent income and expenses to give you personalised tips on how to grow and save money.
          </p>
          <button onClick={runHealthCheck} disabled={healthLoading}
            className="w-full bg-gold dark:bg-[#D4A017] text-white dark:text-[#0D1F1A] font-semibold rounded-xl py-3">
            {healthLoading ? "Analyzing records..." : "Run Health Check"}
          </button>
          {healthResult && (
            <div className="mt-4 bg-amber-50 dark:bg-[#1E3D32] rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{healthResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}