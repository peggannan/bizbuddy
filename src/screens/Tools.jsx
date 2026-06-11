// Tools.jsx
import { useState } from "react"
import { supabase } from "../supabase"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

export default function Tools({ user }) {
  const [cost, setCost] = useState("")
  const [selling, setSelling] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [result, setResult] = useState(null)
  const [pricingAdvice, setPricingAdvice] = useState("")
  const [pricingLoading, setPricingLoading] = useState(false)
  const [healthResult, setHealthResult] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [shortMode, setShortMode] = useState(true)

  const inputClass = "w-full bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary dark:focus:border-[#1DB954] placeholder-gray-400 dark:placeholder-gray-600"

  function checkProfit() {
    const c = parseFloat(cost)
    const s = parseFloat(selling)
    const q = parseFloat(quantity)
    if (!c || !s || !q) return
    const profit = (s - c) * q
    const margin = ((s - c) / s) * 100
    setResult({ profit, margin })
  }

  async function runPricingAdvisor() {
    const c = parseFloat(cost)
    const s = parseFloat(selling)
    const q = parseFloat(quantity)
    if (!c || !s || !q) return

    setPricingLoading(true)
    setPricingAdvice("")

    const prompt = `You are BizBuddy, a smart sales advisor for small Ghanaian businesses.
The product cost is GHS ${c.toFixed(2)}, selling price is GHS ${s.toFixed(2)}, and quantity is ${q}.
The current margin is ${(((s - c) / s) * 100).toFixed(1)}%.
Provide:
1. A recommended selling price range that keeps the business competitive in Ghana.
2. One pricing strategy to improve profit without losing customers.
3. One quick action the owner can take today.`
    const brevity = shortMode ? "\n\nKeep the response short: 3 concise bullet points or up to 3 short sentences." : ""
    const finalPrompt = prompt + brevity

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}` },
            body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are BizBuddy, a supportive and practical business advisor for Ghanaian small businesses." },
            { role: "user", content: finalPrompt }
          ]
        })
      })
      const data = await response.json()
      setPricingAdvice(data?.choices?.[0]?.message?.content || "Could not get pricing advice right now.")
    } catch (e) {
      setPricingAdvice("Couldn't connect to pricing advice. Please try again.")
    }
    setPricingLoading(false)
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
    const categoryList = Object.entries(categories).map(([cat, amt]) => `${cat}: GHS ${amt.toFixed(2)}`).join(", ")

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
    const brevity = shortMode ? "\n\nKeep the response short: 3 concise bullet points, each one sentence." : ""
    const finalPrompt = prompt + brevity

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}` },
        body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: finalPrompt }] })
      })
      const data = await response.json()
      setHealthResult(data?.choices?.[0]?.message?.content || "Couldn't get health advice right now.")
    } catch (e) {
      setHealthResult("Couldn't connect. Please try again.")
    }
    setHealthLoading(false)
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#1DB954] mb-1">Business Tools</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Calculators and AI advice for your business</p>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] overflow-hidden">
            <div className="bg-primary dark:bg-[#1A3A38] p-4 flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2 text-xl">🧮</div>
              <div>
                <h2 className="text-white font-bold text-lg">Profit Checker</h2>
                <p className="text-white/70 text-sm">Calculate margins and profit quickly</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex gap-3 mb-3 flex-col lg:flex-row">
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
              <div className="grid gap-3 md:grid-cols-2">
                <button onClick={checkProfit} className="w-full bg-primary dark:bg-[#1DB954] text-white dark:text-[#0D1F1A] rounded-xl py-3 font-semibold">
                  Check Profit
                </button>
                <button onClick={runPricingAdvisor} className="w-full bg-slate-800 dark:bg-[#15302B] text-white rounded-xl py-3 font-semibold">
                  {pricingLoading ? "Getting pricing advice..." : "AI Pricing Advisor"}
                </button>
              </div>
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
              {pricingAdvice && (
                <div className="mt-4 bg-slate-50 dark:bg-[#1E3D32] rounded-xl p-4">
                  <div className="chat-markdown text-sm text-gray-700 dark:text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{pricingAdvice}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] overflow-hidden">
            <div className="bg-gold dark:bg-[#2A2010] p-4 flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2 text-xl">💡</div>
              <div>
                <h2 className="text-white dark:text-gold font-bold text-lg">BizBuddy Health Check</h2>
                <p className="text-white/70 dark:text-gold/70 text-sm">Get AI advice based on your recent records</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-4">
                I’ll review your last 30 days of income and expenses to give you a quick business health summary.
              </p>
              <button onClick={runHealthCheck} disabled={healthLoading}
                className="w-full bg-gold dark:bg-[#D4A017] text-white dark:text-[#0D1F1A] font-semibold rounded-xl py-3">
                {healthLoading ? "Analyzing records..." : "Run Health Check"}
              </button>
              {healthResult && (
                <div className="mt-4 bg-amber-50 dark:bg-[#1E3D32] rounded-xl p-4">
                  <div className="chat-markdown text-sm text-gray-700 dark:text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{healthResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">AI Pricing Strategy</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Ask BizBuddy for a smarter price point and strategy to grow profit without losing customers.
            </p>
            <div className="rounded-2xl bg-green-50 dark:bg-[#0E2F26] p-4 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
              <p className="font-semibold mb-2">Tip</p>
              <p>If your margin is below 20%, try raising price slightly or bundling products with a small value add.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Quick actions</h2>
            <button onClick={runPricingAdvisor}
              className="w-full bg-primary dark:bg-[#1DB954] text-white dark:text-[#0D1F1A] rounded-xl py-3 font-semibold mb-3">
              Ask AI for a pricing update
            </button>
            <button onClick={runHealthCheck}
              className="w-full bg-slate-800 dark:bg-[#15302B] text-white rounded-xl py-3 font-semibold">
              Ask AI for business health advice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
