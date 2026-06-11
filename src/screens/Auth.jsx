// Auth.jsx


import { useState } from "react"
import { supabase } from "../supabase"
import logo from "../assets/hero.png"

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [bizType, setBizType] = useState("")
  const [customBizType, setCustomBizType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit() {
    setLoading(true)
    setError("")
    setMessage("")

    if (mode === "signup") {
      const businessType = customBizType.trim() || bizType
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, bizType: businessType } }
      })
      if (error) setError(error.message)
      else setMessage("Account created! You can now log in.")
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onLogin(data.user)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f5f5f0]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="./logo-2.png" alt="BizBuddy logo" className="mx-auto h-12 w-40" />
          <p className="text-gray-500 text-sm mt-1">Your Ghanaian business companion</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {mode === "login" ? "Welcome back!" : "Create account"}
          </h2>

          {mode === "signup" && (
            <>
              <div className="mb-3">
                <label className="text-sm text-gray-600 mb-1 block">Your Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ama Owusu"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="mb-3">
                <label className="text-sm text-gray-600 mb-1 block">Business Type</label>
                <select
                  value={bizType}
                  onChange={e => { setBizType(e.target.value); setCustomBizType("") }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-primary"
                >
                  <option value="">Select type</option>
                  <option value="Market Trader">Market Trader</option>
                  <option value="Food Vendor">Food Vendor</option>
                  <option value="Seamstress">Seamstress</option>
                  <option value="Beauty Professional">Beauty Professional</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="text-sm text-gray-600 mb-1 block">Or type your own business type</label>
                <input
                  value={customBizType}
                  onChange={e => setCustomBizType(e.target.value)}
                  placeholder="e.g. Shoe maker, event planner"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-3 font-semibold mb-3"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-500">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage("") }}
              className="text-primary font-semibold"
            >
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

