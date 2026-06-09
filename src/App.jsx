import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChartPie, faMoneyBillWave, faWrench, faUser, faComments } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"
import Dashboard from "./screens/Dashboard"
import Tracker from "./screens/Tracker"
import Tools from "./screens/Tools"
import Profile from "./screens/Profile"
import Chat from "./screens/Chat"

export default function App() {
  const [screen, setScreen] = useState("dashboard")
  const { t } = useTranslation()

  const screens = {
    dashboard: <Dashboard />,
    tracker: <Tracker />,
    tools: <Tools />,
    chat: <Chat />,
    profile: <Profile setScreen={setScreen} />,
  }

  const tabs = [
    { id: "dashboard", icon: faChartPie, label: t("dashboard") },
    { id: "tracker", icon: faMoneyBillWave, label: t("tracker") },
    { id: "tools", icon: faWrench, label: t("tools") },
    { id: "chat", icon: faComments, label: t("chat") },
    { id: "profile", icon: faUser, label: t("profile") },
  ]

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