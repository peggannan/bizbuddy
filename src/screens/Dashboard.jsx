import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
      if (data) setTransactions(data)
    }
    load()
  }, [])

  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)
  const net = income - expenses

  return (
    <div className="p-4 md:p-6">
      {/* Hero balance card */}
      <div className="bg-primary dark:bg-[#132B24] rounded-2xl p-5 mb-5 border border-transparent dark:border-[#1E3D32]">
        <p className="text-white/70 dark:text-[#1DB954]/70 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
        <p className="text-white text-4xl font-bold mb-1">GHS {net.toFixed(2)}</p>
        <p className={`text-sm ${net >= 0 ? "text-white/60 dark:text-[#1DB954]/60" : "text-red-300"}`}>
          {net >= 0 ? `+GHS ${income.toFixed(2)} income this period` : "Expenses exceed income"}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white dark:bg-[#132B24] rounded-2xl p-4 border border-gray-100 dark:border-[#1E3D32]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-[#1E3D32] rounded-lg flex items-center justify-center">
              <span className="text-sm">💰</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Income</p>
          </div>
          <p className="text-primary dark:text-[#1DB954] font-bold text-xl">GHS {income.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">This period</p>
        </div>
        <div className="bg-white dark:bg-[#132B24] rounded-2xl p-4 border border-gray-100 dark:border-[#1E3D32]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-[#2B1414] rounded-lg flex items-center justify-center">
              <span className="text-sm">📤</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Expenses</p>
          </div>
          <p className="text-red-500 font-bold text-xl">GHS {expenses.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">This period</p>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white dark:bg-[#132B24] rounded-2xl p-4 border border-gray-100 dark:border-[#1E3D32]">
        <h2 className="font-bold text-gray-800 dark:text-white mb-3">Recent Activity</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No transactions yet. Add one in Tracker!</p>
        ) : (
          transactions.map(t => (
            <div key={t.id} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-[#1E3D32] last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${t.type === "income" ? "bg-green-100 dark:bg-[#1E3D32]" : "bg-red-100 dark:bg-[#2B1414]"}`}>
                  {t.type === "income" ? "↑" : "↓"}
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.category}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${t.type === "income" ? "text-primary dark:text-[#1DB954]" : "text-red-500"}`}>
                {t.type === "income" ? "+" : "-"}GHS {t.amount}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}