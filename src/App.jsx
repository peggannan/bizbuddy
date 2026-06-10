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
import Onboarding from "./screens/Onboarding"
import Reports from "./screens/Reports"
import { faChartPie, faMoneyBillWave, faWrench, faUser, faComments, faMoon, faSun, faFileAlt } from "@fortawesome/free-solid-svg-icons"

export default function App() {
  const [screen, setScreen] = useState("dashboard")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  const { dark, setDark } = useTheme()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const [showOnboarding, setShowOnboarding] = useState(() => {
  return !localStorage.getItem("bizbuddy_onboarded")
  })

  function completeOnboarding() {
  localStorage.setItem("bizbuddy_onboarded", "true")
  setShowOnboarding(false)
  }

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
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F1E]">
      <div className="text-center animate-pulse">
        <div className="w-20 h-20 bg-[#112221] border-2 border-[#2DD4BF]/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">💼</span>
        </div>
        <p className="text-[#2DD4BF] font-bold text-2xl tracking-wide">BizBuddy</p>
        <p className="text-white/40 text-sm mt-2">Your business companion</p>
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
          <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
          <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
        </div>
      </div>
    </div>
  )

  if (showOnboarding) return <Onboarding onDone={completeOnboarding} />

  if (!user) return <Auth onLogin={setUser} />

  const tabs = [
    { id: "dashboard", icon: faChartPie, label: t("dashboard") },
    { id: "tracker", icon: faMoneyBillWave, label: t("tracker") },
    { id: "tools", icon: faWrench, label: t("tools") },
    { id: "reports", icon: faFileAlt, label: "Reports" },
    { id: "chat", icon: faComments, label: t("chat") },
    { id: "profile", icon: faUser, label: t("profile") },
  ]

  const screens = {
    dashboard: <Dashboard user={user} />,
    tracker: <Tracker user={user} />,
    tools: <Tools user={user} />,
    reports: <Reports user={user} />,
    chat: <Chat user={user} />,
    profile: <Profile user={user} setScreen={setScreen} />,
  }

  return (
    
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0D1F1A]">
      <div className="flex min-h-screen max-w-6xl mx-auto">

        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col w-60 bg-white dark:bg-[#0F2420] border-r border-gray-100 dark:border-[#1E3D32] fixed h-full py-6 px-4">
          <div className="mb-8 px-2 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-lg">💼</span>
            </div>
            <span className="text-xl font-bold text-primary dark:text-[#1DB954]">BizBuddy</span>
          </div>

          <nav className="flex-1 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setScreen(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  screen === tab.id
                    ? "bg-primary dark:bg-[#1E3D32] text-white dark:text-[#1DB954]"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#132B24]"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#132B24] transition-all"
          >
            <FontAwesomeIcon icon={dark ? faSun : faMoon} />
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-60 pb-20 md:pb-0">

          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0F2420] border-b border-gray-100 dark:border-[#1E3D32]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-sm">💼</span>
              </div>
              <span className="font-bold text-primary dark:text-[#1DB954]">BizBuddy</span>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-xl text-gray-500 dark:text-[#1DB954] hover:bg-gray-100 dark:hover:bg-[#132B24]"
            >
              <FontAwesomeIcon icon={dark ? faSun : faMoon} />
            </button>
          </div>

          {/* Desktop top bar */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0F2420] border-b border-gray-100 dark:border-[#1E3D32]">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{screen}</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              👋 {user?.user_metadata?.name || user?.email}
            </span>
          </div>

          {screens[screen]}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F2420] border-t border-gray-200 dark:border-[#1E3D32] flex justify-around py-2 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            className={`flex flex-col items-center text-xs px-3 py-1 rounded-lg transition-colors ${
              screen === tab.id
                ? "text-primary dark:text-[#1DB954] font-bold"
                : "text-gray-400 dark:text-gray-600"
            }`}
          >
            <FontAwesomeIcon icon={tab.icon} className="text-lg mb-1" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
    
  )
  {!isOnline && (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 text-xs text-center py-1.5 font-medium">
      📡 You're offline — viewing cached data
    </div>
  )}
}