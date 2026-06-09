import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(5)
      if (data) setTransactions(data)
    }
    load()
  }, [])

  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const net = income - expenses

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Good morning! 👋</h1>
        <p className="text-gray-500 text-sm">Here's your business overview</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">Income</p>
          <p className="text-primary font-bold text-sm">GHS {income.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">Expenses</p>
          <p className="text-red-500 font-bold text-sm">GHS {expenses.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">Net</p>
          <p className={`font-bold text-sm ${net >= 0 ? "text-primary" : "text-red-500"}`}>GHS {net.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-bold text-primary mb-3">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No transactions yet. Add one in Tracker!</p>
        ) : (
          transactions.map(t => (
            <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium">{t.description}</p>
                <p className="text-xs text-gray-400">{t.category}</p>
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