// Trends.jsx

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts"

export default function Trends({ user }) {
  const [transactions, setTransactions] = useState([])
  const [view, setView] = useState("weekly")

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from("transactions").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: true })
    if (data) setTransactions(data)
  }

  // Weekly data — last 8 weeks
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (7 * (7 - i)))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekTx = transactions.filter(t => {
      const d = new Date(t.created_at)
      return d >= weekStart && d < weekEnd
    })
    return {
      week: `W${i + 1}`,
      income: weekTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
      expenses: weekTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
    }
  })

  // Monthly data — last 6 months
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const month = d.getMonth()
    const year = d.getFullYear()
    const monthTx = transactions.filter(t => {
      const td = new Date(t.created_at)
      return td.getMonth() === month && td.getFullYear() === year
    })
    return {
      month: months[month],
      income: monthTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
      expenses: monthTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
    }
  })

  // Best days of week
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  const dayData = dayNames.map((day, i) => ({
    day,
    income: transactions.filter(t => new Date(t.created_at).getDay() === i && t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0)
  }))
  const bestDay = dayData.reduce((a, b) => a.income > b.income ? a : b, { day: "-", income: 0 })

  // Top categories
  const catData = {}
  transactions.filter(t => t.type === "income").forEach(t => {
    if (!catData[t.category]) catData[t.category] = 0
    catData[t.category] += Number(t.amount)
  })
  const topCategories = Object.entries(catData).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const chartData = view === "weekly" ? weeklyData : monthlyData
  const xKey = view === "weekly" ? "week" : "month"

  const tooltipStyle = { background: "#112221", border: "1px solid #1A3A38", borderRadius: 8, fontSize: 12 }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#2DD4BF] mb-1">Trends & Insights</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Understand your best days and seasons</p>

      {/* Best day callout */}
      {bestDay.income > 0 && (
        <div className="bg-primary dark:bg-[#112221] border border-transparent dark:border-[#1A3A38] rounded-2xl p-4 mb-4">
          <p className="text-white/70 dark:text-gray-400 text-xs mb-1">Your best sales day</p>
          <p className="text-white text-2xl font-bold">{bestDay.day}s 🏆</p>
          <p className="text-white/70 dark:text-[#2DD4BF] text-sm">GHS {bestDay.income.toLocaleString()} avg income</p>
        </div>
      )}

      {/* Income vs Expenses chart */}
      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold text-gray-800 dark:text-white text-sm">Income vs Expenses</p>
          <div className="flex gap-1">
            <button onClick={() => setView("weekly")} className={`px-3 py-1 rounded-lg text-xs font-medium ${view === "weekly" ? "bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E]" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>Weekly</button>
            <button onClick={() => setView("monthly")} className={`px-3 py-1 rounded-lg text-xs font-medium ${view === "monthly" ? "bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E]" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}>Monthly</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barSize={16} barGap={4}>
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#2DD4BF" }} itemStyle={{ color: "#fff" }} formatter={v => [`GHS ${v}`, ""]} />
            <Bar dataKey="income" fill="#2DD4BF" radius={[4,4,0,0]} opacity={0.9} name="Income" />
            <Bar dataKey="expenses" fill="#EF4444" radius={[4,4,0,0]} opacity={0.7} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#2DD4BF] rounded-sm"></div><span className="text-xs text-gray-400">Income</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm"></div><span className="text-xs text-gray-400">Expenses</span></div>
        </div>
      </div>

      {/* Best days of week */}
      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
        <p className="font-semibold text-gray-800 dark:text-white text-sm mb-4">Sales by Day of Week</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={dayData} barSize={28}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#2DD4BF" }} itemStyle={{ color: "#fff" }} formatter={v => [`GHS ${v}`, "Income"]} />
            <Bar dataKey="income" fill="#2DD4BF" radius={[4,4,0,0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top income categories */}
      {topCategories.length > 0 && (
        <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
          <p className="font-semibold text-gray-800 dark:text-white text-sm mb-3">Top Income Sources</p>
          {topCategories.map(([cat, amt], i) => {
            const maxAmt = topCategories[0][1]
            return (
              <div key={cat} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-300">{i + 1}. {cat || "Uncategorised"}</span>
                  <span className="text-primary dark:text-[#2DD4BF] font-semibold">GHS {amt.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#1A3A38] rounded-full h-2">
                  <div className="h-2 rounded-full bg-primary dark:bg-[#2DD4BF]" style={{ width: `${(amt / maxAmt) * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}