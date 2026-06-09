import { useState } from "react"
import Dashboard from "./screens/Dashboard"
import Tracker from "./screens/Tracker"
import Tools from "./screens/Tools"
import Profile from "./screens/Profile"
import Chat from "./screens/Chat"

export default function App() {
  const [screen, setScreen] = useState("dashboard")

  const screens = {
    dashboard: <Dashboard />,
    tracker: <Tracker />,
    tools: <Tools />,
    chat: <Chat />,
    profile: <Profile />,
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <div className="flex-1 pb-20">
        {screens[screen]}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-2">
        {[
          { id: "chat", icon: "💬", label: "Chat" },
          { id: "tracker", icon: "📊", label: "Tracker" },
          { id: "tools", icon: "🧮", label: "Tools" },
          { id: "profile", icon: "👤", label: "Profile" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            className={`flex flex-col items-center text-xs px-4 py-1 rounded-lg ${
              screen === tab.id ? "text-primary font-bold" : "text-gray-400"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}