import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChartPie, faMoneyBillWave, faWrench, faUser, faComments } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"
import { supabase } from "./supabase"
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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
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
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div className="flex-1 pb-20">
        {screens[screen]}
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-2">
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