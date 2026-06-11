// Auth.jsx


import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import logo from "../assets/hero.png"

export default function Auth({ onLogin, authMode = "login" }) {
  const [mode, setMode] = useState(authMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState("")
  const [bizType, setBizType] = useState("")
  const [customBizType, setCustomBizType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  function isPasswordValid(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
  }

  useEffect(() => {
    setMode(authMode)
  }, [authMode])

  async function handleSubmit() {
    setLoading(true)
    setError("")
    setMessage("")

    if (mode === "signup") {
      if (!isPasswordValid(password)) {
        setError("Password must be at least 8 characters and include uppercase, lowercase, and a special character.")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        setLoading(false)
        return
      }

      const businessType = customBizType.trim() || bizType
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, bizType: businessType } }
      })
      if (error) {
        setError(error.message)
      } else {
        const verifyMessage = "An email has been sent to you. Please verify your email address and return to the app to login. "
        setMessage(verifyMessage)
        window.alert(verifyMessage)
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onLogin(data.user)
    }
    setLoading(false)
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center p-2 bg-[#f5f5f0]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-4">
          <img src="./logo-2.png" alt="BizBuddy logo" className="mx-auto h-10 w-36" />
          <p className="text-gray-500 text-sm mt-1">Your Ghanaian business companion</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 max-h-[calc(100vh-1.5rem)] overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            {mode === "login" ? "Welcome back!" : "Create account"}
          </h2>

          {mode === "signup" && (
            <>
              <div className="mb-2">
                <label className="text-sm text-gray-600 mb-1 block">Your Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ama Owusu"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="mb-2">
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
              <div className="mb-2">
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

          <div className="mb-2">
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mb-2">
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-800"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M1 1l22 22" />
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7 1.01-2.16 2.7-3.99 4.74-5.13" />
                      <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {mode === "signup" && (
              <p className="text-xs text-gray-500 mt-2">
                Password must be at least 8 characters and include uppercase, lowercase, and a special character.
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div className="mb-2">
              <label className="text-sm text-gray-600 mb-1 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-800"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showConfirmPassword ? (
                      <>
                        <path d="M1 1l22 22" />
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7 1.01-2.16 2.7-3.99 4.74-5.13" />
                        <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          )}

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

