import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function Inventory({ user }) {
  const [items, setItems] = useState([])
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("units")
  const [lowAlert, setLowAlert] = useState("5")
  const [costPrice, setCostPrice] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const inputClass = "w-full bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from("inventory").select("*").eq("user_id", user.id).order("name")
    if (data) setItems(data)
  }

  async function save() {
    if (!name || !quantity) return
    setSaving(true)
    const payload = { user_id: user.id, name, category, quantity: parseFloat(quantity), unit, low_stock_alert: parseFloat(lowAlert), cost_price: parseFloat(costPrice) || 0, selling_price: parseFloat(sellingPrice) || 0 }
    if (editingId) {
      await supabase.from("inventory").update(payload).eq("id", editingId)
      setEditingId(null)
    } else {
      await supabase.from("inventory").insert([payload])
    }
    setName(""); setCategory(""); setQuantity(""); setUnit("units"); setLowAlert("5"); setCostPrice(""); setSellingPrice("")
    await load()
    setSaving(false)
  }

  async function updateQty(id, delta) {
    const item = items.find(i => i.id === id)
    const newQty = Math.max(0, Number(item.quantity) + delta)
    await supabase.from("inventory").update({ quantity: newQty }).eq("id", id)
    await load()
  }

  async function deleteItem(id) {
    if (!window.confirm("Delete this item?")) return
    await supabase.from("inventory").delete().eq("id", id)
    await load()
  }

  const lowStockItems = items.filter(i => Number(i.quantity) <= Number(i.low_stock_alert))

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-[#2DD4BF] mb-1">Inventory</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Track your stock and materials</p>

      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 dark:bg-[#2A2010] border border-yellow-200 dark:border-yellow-600/30 rounded-2xl p-4 mb-4">
          <p className="text-yellow-700 dark:text-yellow-400 font-semibold text-sm mb-2">⚠️ Low Stock Alert</p>
          {lowStockItems.map(i => (
            <p key={i.id} className="text-yellow-600 dark:text-yellow-500 text-xs">{i.name} — only {i.quantity} {i.unit} left</p>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4 mb-4">
        <p className="font-semibold text-gray-700 dark:text-white text-sm mb-3">{editingId ? "Edit Item" : "Add New Item"}</p>
        <input placeholder="Item name" value={name} onChange={e => setName(e.target.value)} className={`${inputClass} mb-3`} />
        <input placeholder="Category (e.g. Fabric, Ingredients)" value={category} onChange={e => setCategory(e.target.value)} className={`${inputClass} mb-3`} />
        <div className="flex gap-2 mb-3">
          <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} className={`${inputClass} flex-1`} />
          <select value={unit} onChange={e => setUnit(e.target.value)} className="w-28 bg-gray-50 dark:bg-[#1A3A38] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            {["units","kg","g","litres","ml","yards","metres","pieces","bags","boxes"].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mb-3">
          <input type="number" placeholder="Cost price" value={costPrice} onChange={e => setCostPrice(e.target.value)} className={`${inputClass} flex-1`} />
          <input type="number" placeholder="Selling price" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className={`${inputClass} flex-1`} />
        </div>
        <input type="number" placeholder="Low stock alert at" value={lowAlert} onChange={e => setLowAlert(e.target.value)} className={`${inputClass} mb-3`} />
        <button onClick={save} disabled={saving} className="w-full bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl py-3 font-semibold">
          {saving ? "Saving..." : editingId ? "Update Item" : "Add to Inventory"}
        </button>
      </div>

      <div className="bg-white dark:bg-[#112221] rounded-2xl border border-gray-100 dark:border-[#1A3A38] p-4">
        <p className="font-semibold text-gray-700 dark:text-white text-sm mb-3">Stock ({items.length} items)</p>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-gray-400 text-sm">No items yet</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="py-3 border-b border-gray-100 dark:border-[#1A3A38] last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-400">{item.category}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingId(item.id); setName(item.name); setCategory(item.category || ""); setQuantity(String(item.quantity)); setUnit(item.unit); setLowAlert(String(item.low_stock_alert)); setCostPrice(String(item.cost_price)); setSellingPrice(String(item.selling_price)); window.scrollTo(0,0) }}
                  className="text-xs bg-gray-100 dark:bg-[#1A3A38] text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">Edit</button>
                <button onClick={() => deleteItem(item.id)} className="text-xs bg-red-50 dark:bg-[#2B1414] text-red-500 px-2 py-1 rounded-lg">Del</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-gray-100 dark:bg-[#1A3A38] rounded-lg text-sm font-bold dark:text-white">-</button>
                <span className={`text-sm font-bold ${Number(item.quantity) <= Number(item.low_stock_alert) ? "text-yellow-500" : "text-primary dark:text-[#2DD4BF]"}`}>
                  {item.quantity} {item.unit}
                </span>
                <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-gray-100 dark:bg-[#1A3A38] rounded-lg text-sm font-bold dark:text-white">+</button>
              </div>
              {item.selling_price > 0 && (
                <p className="text-xs text-gray-400">GHS {item.selling_price} / {item.unit}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}