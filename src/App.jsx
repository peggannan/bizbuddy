import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChartPie, faMoneyBillWave, faWrench, faUser, faComments, faMoon, faSun } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"
import { supabase } from "./supabase"
import { useTheme } from "./ThemeContext"
import Dashboard from "./screens/Dashboard"
import Tracker from "./screens/Tracker"
import Tools from "./screens/Tools"
import Profile from "./screens/Profile"
import Chat from "./screens/Chat"
import Auth from "./screens/Auth"

export default function App() {
  const [screen, setScreen] = useState("dashboard")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  const { dark, setDark } = useTheme()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] dark:bg-[#1a1a1a]">
      <div className="text-center">
        <div className="text-5xl mb-3">💼</div>
        <p className="text-primary font-bold text-xl">BizBuddy</p>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )

  if (!user) return <Auth onLogin={setUser} />

  const tabs = [
    { id: "dashboard", icon: faChartPie, label: t("dashboard") },
    { id: "tracker", icon: faMoneyBillWave, label: t("tracker") },
    { id: "tools", icon: faWrench, label: t("tools") },
    { id: "chat", icon: faComments, label: t("chat") },
    { id: "profile", icon: faUser, label: t("profile") },
  ]

  const screens = {
    dashboard: <Dashboard user={user} />,
    tracker: <Tracker user={user} />,
    tools: <Tools user={user} />,
    chat: <Chat user={user} />,
    profile: <Profile user={user} setScreen={setScreen} />,
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#1a1a1a]">
      {/* Desktop sidebar + mobile bottom nav layout */}
      <div className="flex min-h-screen max-w-6xl mx-auto">

        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:flex flex-col w-56 bg-white dark:bg-[#242424] border-r border-gray-100 dark:border-gray-800 fixed h-full py-6 px-4">
          <div className="mb-8 px-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <span className="text-xl font-bold text-primary">BizBuddy</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setScreen(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  screen === tab.id
                    ? "bg-primary text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                {tab.label}
              </button>
            ))}
          </nav>
          {/* Theme toggle on sidebar */}
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FontAwesomeIcon icon={dark ? faSun : faMoon} />
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-56 pb-20 md:pb-6">
          {/* Top bar — desktop only */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white dark:bg-[#242424] border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{screen}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {user?.user_metadata?.name || user?.email}
              </span>
            </div>
          </div>

          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#242424] border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">💼</span>
              <span className="font-bold text-primary">BizBuddy</span>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FontAwesomeIcon icon={dark ? faSun : faMoon} />
            </button>
          </div>

          <div className="p-0 md:p-2">
            {screens[screen]}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#242424] border-t border-gray-200 dark:border-gray-800 flex justify-around py-2 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            className={`flex flex-col items-center text-xs px-3 py-1 rounded-lg transition-colors ${
              screen === tab.id ? "text-primary font-bold" : "text-gray-400"
            }`}
          >
            <FontAwesomeIcon icon={tab.icon} className="text-lg mb-1" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}