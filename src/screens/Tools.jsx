import { useState } from "react"

export default function Tools() {
  const [cost, setCost] = useState("")
  const [selling, setSelling] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [result, setResult] = useState(null)

  function checkProfit() {
    const c = parseFloat(cost)
    const s = parseFloat(selling)
    const q = parseFloat(quantity)
    if (!c || !s || !q) return
    const profit = (s - c) * q
    const margin = ((s - c) / s) * 100
    setResult({ profit, margin })
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-primary mb-1">Business Tools</h1>
      <p className="text-gray-500 text-sm mb-6">Calculators and AI advice for your business</p>

      {/* Profit Checker */}
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
        <div className="bg-primary p-4 flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2 text-xl">🧮</div>
          <div>
            <h2 className="text-white font-bold text-lg">Profit Checker</h2>
            <p className="text-white/80 text-sm">Calculate your actual margins</p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Cost Price (GHS)</label>
              <input
                type="number"
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Selling Price (GHS)</label>
              <input
                type="number"
                value={selling}
                onChange={e => setSelling(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-sm text-gray-600 mb-1 block">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="1"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={checkProfit}
            className="w-full bg-primary text-white rounded-xl py-3 font-semibold"
          >
            Check Profit
          </button>

          {result && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Profit</p>
                <p className={`text-lg font-bold ${result.profit >= 0 ? "text-primary" : "text-red-500"}`}>
                  GHS {result.profit.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Margin</p>
                <p className={`text-lg font-bold ${result.margin >= 0 ? "text-primary" : "text-red-500"}`}>
                  {result.margin.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BizBuddy Health Check */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gold p-4 flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2 text-xl">💡</div>
          <div>
            <h2 className="text-white font-bold text-lg">BizBuddy Health Check</h2>
            <p className="text-white/80 text-sm">Get AI advice based on your records</p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-sm text-center mb-4">
            I'll look at your recent income and expenses to give you personalised tips on how to grow and save money.
          </p>
          <button className="w-full bg-gold/20 text-gold font-semibold rounded-xl py-3">
            Coming soon — add records first!
          </button>
        </div>
      </div>
    </div>
  )
}