import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts"

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (data) setTransactions(data)
    }
    load()
  }, [])

  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function loadOrders() {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("deadline", { ascending: true })
        .limit(3)
      if (data) setOrders(data)
    }
    loadOrders()
  }, [])

  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)
  const net = income - expenses

  // This month's income
  const now = new Date()
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthIncome = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)

  // Weekly spending data for chart (last 7 days)
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayStr = d.toLocaleDateString("en-GB", { weekday: "short" })
    const total = transactions
      .filter(t => {
        const td = new Date(t.created_at)
        return td.toDateString() === d.toDateString() && t.type === "expense"
      })
      .reduce((s, t) => s + Number(t.amount), 0)
    return { day: dayStr, amount: total }
  })

  const weekTotal = weekData.reduce((s, d) => s + d.amount, 0)
  const recent = transactions.slice(0, 5)

  const categoryIcons = {
    "Sales": "🛒", "Service": "💼", "Other Income": "💰",
    "Stock/Materials": "📦", "Transport": "🚗", "Food": "🍲",
    "Rent": "🏠", "Utilities": "💡", "Other": "📌"
  }

  return (
    <div className="p-4 md:p-6 space-y-4">

      {/* Balance card */}
      <div className="bg-white dark:bg-[#112221] rounded-2xl p-5 border border-gray-100 dark:border-[#1A3A38]">
        <p className="text-xs font-semibold text-primary dark:text-[#2DD4BF] uppercase tracking-widest mb-2">Total Balance</p>
        <p className="mono-number text-4xl font-bold text-gray-800 dark:text-white mb-2">
          GHS {net.toLocaleString("en-GH", { minimumFractionDigits: 2 })}
        </p>
        <div className="inline-flex items-center bg-gray-100 dark:bg-[#1A3A38] rounded-full px-3 py-1 mb-4">
          <span className="text-xs text-primary dark:text-[#2DD4BF] font-medium">
            +GHS {monthIncome.toLocaleString("en-GH", { minimumFractionDigits: 2 })} this month
          </span>
        </div>
      </div>

      {/* Income / Expense cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#112221] rounded-2xl p-4 border border-gray-100 dark:border-[#1A3A38]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💰</span>
            <p className="text-xs font-semibold text-primary dark:text-[#2DD4BF] uppercase tracking-wider">Income</p>
          </div>
          <p className="mono-number text-xl font-bold text-gray-800 dark:text-white">
            GHS {income.toLocaleString("en-GH", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        <div className="bg-white dark:bg-[#112221] rounded-2xl p-4 border border-gray-100 dark:border-[#1A3A38]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📤</span>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Expenses</p>
          </div>
          <p className="mono-number text-xl font-bold text-gray-800 dark:text-white">
            GHS {expenses.toLocaleString("en-GH", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
      </div>

      {/* Weekly spending chart */}
      <div className="bg-white dark:bg-[#112221] rounded-2xl p-4 border border-gray-100 dark:border-[#1A3A38]">
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold text-gray-800 dark:text-white text-sm">Weekly Spending</p>
          <span className="bg-primary/10 dark:bg-[#1A3A38] text-primary dark:text-[#2DD4BF] text-xs px-3 py-1 rounded-full font-medium">
            GHS {weekTotal.toLocaleString("en-GH", { minimumFractionDigits: 2 })} total
          </span>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={weekData} barSize={24}>
            <Bar dataKey="amount" fill="#2DD4BF" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Tooltip
              contentStyle={{ background: "#112221", border: "1px solid #1A3A38", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#2DD4BF" }}
              itemStyle={{ color: "#fff" }}
              formatter={(v) => [`GHS ${v}`, "Spent"]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-1">
          {weekData.map((d, i) => (
            <span key={i} className="text-xs text-gray-400 w-8 text-center">{d.day}</span>
          ))}
        </div>
      </div>

      {/* Pending Orders */}
      {orders.length > 0 && (
        <div className="bg-white dark:bg-[#112221] rounded-2xl p-4 border border-gray-100 dark:border-[#1A3A38]">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-gray-800 dark:text-white text-sm">Pending Orders 📋</p>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">{orders.length} pending</span>
          </div>
          {orders.map(o => (
            <div key={o.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
              <div>
                <p className="text-sm font-medium dark:text-white">{o.customer_name}</p>
                <p className="text-xs text-gray-400">{o.description}</p>
                {o.deadline && (
                  <p className={`text-xs mt-0.5 ${new Date(o.deadline) < new Date() ? "text-red-400" : "text-gray-400"}`}>
                    📅 {new Date(o.deadline).toLocaleDateString("en-GH")}
                  </p>
                )}
              </div>
              <p className="text-sm font-bold text-primary dark:text-[#2DD4BF]">GHS {Number(o.amount).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white dark:bg-[#112221] rounded-2xl p-4 border border-gray-100 dark:border-[#1A3A38]">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-gray-800 dark:text-white text-sm">Recent Activity</p>
          <span className="text-xs text-primary dark:text-[#2DD4BF] font-medium">See All</span>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-gray-400 text-sm">No transactions yet</p>
            <p className="text-gray-400 text-xs">Add one in Tracker to get started!</p>
          </div>
        ) : (
          recent.map(t => (
            <div key={t.id} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                  t.type === "income" ? "bg-teal-50 dark:bg-[#1A3A38]" : "bg-red-50 dark:bg-[#2B1414]"
                }`}>
                  {categoryIcons[t.category] || (t.type === "income" ? "💰" : "📤")}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.category} • {new Date(t.created_at).toLocaleDateString("en-GH")}</p>
                </div>
              </div>
              <p className={`mono-number font-bold text-sm ${t.type === "income" ? "text-primary dark:text-[#2DD4BF]" : "text-red-400"}`}>
                {t.type === "income" ? "+" : "-"}GHS {Number(t.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}