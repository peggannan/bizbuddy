// Goals.jsx

import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function Goals({ user }) {
  const [goals, setGoals] = useState([])
  const [title, setTitle] = useState("")
  const [target, setTarget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [saving, setSaving] = useState(false)
  const [addAmount, setAddAmount] = useState({})

  const inputClass = "w-full bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setGoals(data)
  }

  async function save() {
    if (!title || !target) return
    setSaving(true)
    await supabase.from("goals").insert([{ user_id: user.id, title, target_amount: parseFloat(target), deadline: deadline || null }])
    setTitle(""); setTarget(""); setDeadline("")
    await load()
    setSaving(false)
  }

  async function addSavings(id, amount) {
    const goal = goals.find(g => g.id === id)
    const newAmount = Math.min(Number(goal.saved_amount) + parseFloat(amount), Number(goal.target_amount))
    await supabase.from("goals").update({ saved_amount: newAmount }).eq("id", id)
    setAddAmount({ ...addAmount, [id]: "" })
    await load()
  }

  async function deleteGoal(id) {
    if (!window.confirm("Delete this goal?")) return
    await supabase.from("goals").delete().eq("id", id)
    await load()
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#2DD4BF] mb-1">Goals & Savings</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Set targets and track your progress</p>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
        <p className="font-semibold text-gray-700 dark:text-white text-sm mb-3">New Goal</p>
        <input placeholder="Goal title (e.g. Buy new sewing machine)" value={title} onChange={e => setTitle(e.target.value)} className={`${inputClass} mb-3`} />
        <input type="number" placeholder="Target amount (GHS)" value={target} onChange={e => setTarget(e.target.value)} className={`${inputClass} mb-3`} />
        <div className="mb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Target Date (optional)</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputClass} />
        </div>
        <button onClick={save} disabled={saving} className="w-full bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl py-3 font-semibold">
          {saving ? "Saving..." : "Create Goal"}
        </button>
      </div>

      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-8 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-gray-400 text-sm">No goals yet. Set one to get started!</p>
          </div>
        ) : goals.map(g => {
          const pct = Math.min((Number(g.saved_amount) / Number(g.target_amount)) * 100, 100)
          const remaining = Number(g.target_amount) - Number(g.saved_amount)
          const done = pct >= 100
          return (
            <div key={g.id} className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold dark:text-white">{g.title}</p>
                  {g.deadline && <p className="text-xs text-gray-400 mt-0.5">Target: {new Date(g.deadline).toLocaleDateString("en-GH")}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {done && <span className="text-xs bg-green-100 dark:bg-[#1A3A38] text-green-600 dark:text-[#2DD4BF] px-2 py-0.5 rounded-full">✓ Done!</span>}
                  <button onClick={() => deleteGoal(g.id)} className="text-xs text-gray-400 hover:text-red-400">✕</button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>GHS {Number(g.saved_amount).toLocaleString()} saved</span>
                  <span>{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#1A3A38] rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${done ? "bg-green-500 dark:bg-[#2DD4BF]" : "bg-primary dark:bg-[#2DD4BF]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Target: GHS {Number(g.target_amount).toLocaleString()}</span>
                  {!done && <span className="text-primary dark:text-[#2DD4BF]">GHS {remaining.toLocaleString()} to go</span>}
                </div>
              </div>

              {!done && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Add savings..."
                    value={addAmount[g.id] || ""}
                    onChange={e => setAddAmount({ ...addAmount, [g.id]: e.target.value })}
                    className="flex-1 bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => addAmount[g.id] && addSavings(g.id, addAmount[g.id])}
                    className="px-4 py-2 bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}