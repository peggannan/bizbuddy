import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChartPie, faMoneyBillWave, faWrench, faComments,
  faMoon, faSun, faBars, faTimes, faUser, faFileAlt,
  faBook, faBoxes, faClipboardList, faUsers, faBullseye,
  faChartLine, faFileInvoice, faCalculator
} from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "react-i18next"
import { supabase } from "./supabase"
import { useTheme } from "./ThemeContext"
import Dashboard from "./screens/Dashboard"
import Tracker from "./screens/Tracker"
import Tools from "./screens/Tools"
import Chat from "./screens/Chat"
import Profile from "./screens/Profile"
import Auth from "./screens/Auth"
import Onboarding from "./screens/Onboarding"
import Reports from "./screens/Reports"
import DebtBook from "./screens/DebtBook"
import Inventory from "./screens/Inventory"
import Orders from "./screens/Orders"
import Customers from "./screens/Customers"
import Goals from "./screens/Goals"
import Trends from "./screens/Trends"
import Invoice from "./screens/Invoice"
import TaxHelper from "./screens/TaxHelper"

export default function App() {
  const [screen, setScreen] = useState("dashboard")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("bizbuddy_onboarded"))
  const { t } = useTranslation()
  const { dark, setDark } = useTheme()
  const menuRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  function navigate(s) {
    setScreen(s)
    setMenuOpen(false)
  }

 if (loading) return (
  <div className="min-h-screen flex items-center justify-center bg-[#0B1F1E]">
    <div className="text-center">
      <img src="/logo-2.png" alt="BizBuddy" className="h-16 w-auto mx-auto mb-6 animate-pulse" />
      <div className="flex justify-center gap-1 mt-4">
        <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-bounce" style={{animationDelay:"0ms"}}></div>
        <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-bounce" style={{animationDelay:"150ms"}}></div>
        <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-bounce" style={{animationDelay:"300ms"}}></div>
      </div>
    </div>
  </div>
)

  if (showOnboarding) return <Onboarding onDone={() => { localStorage.setItem("bizbuddy_onboarded","true"); setShowOnboarding(false) }} />
  if (!user) return <Auth onLogin={setUser} />

  const mainTabs = [
    { id: "dashboard", icon: faChartPie, label: "Dashboard" },
    { id: "tracker", icon: faMoneyBillWave, label: "Tracker" },
    { id: "tools", icon: faWrench, label: "Tools" },
    { id: "chat", icon: faComments, label: "Chat" },
  ]

  const menuItems = [
    { id: "profile", icon: faUser, label: "Profile" },
    { id: "orders", icon: faClipboardList, label: "Order Manager" },
    { id: "inventory", icon: faBoxes, label: "Inventory" },
    { id: "debtbook", icon: faBook, label: "Debt & Credit" },
    { id: "customers", icon: faUsers, label: "Customer Book" },
    { id: "goals", icon: faBullseye, label: "Goals & Savings" },
    { id: "trends", icon: faChartLine, label: "Trends & Insights" },
    { id: "invoice", icon: faFileInvoice, label: "Invoice & Receipt" },
    { id: "reports", icon: faFileAlt, label: "Reports" },
    { id: "tax", icon: faCalculator, label: "Tax & Compliance" },
    
  ]

  const screens = {
    dashboard: <Dashboard user={user} />,
    tracker: <Tracker user={user} />,
    tools: <Tools user={user} />,
    chat: <Chat user={user} />,
    orders: <Orders user={user} />,
    inventory: <Inventory user={user} />,
    debtbook: <DebtBook user={user} />,
    customers: <Customers user={user} />,
    goals: <Goals user={user} />,
    trends: <Trends user={user} />,
    invoice: <Invoice user={user} />,
    reports: <Reports user={user} />,
    tax: <TaxHelper user={user} />,
    profile: <Profile user={user} setScreen={setScreen} />,
  }

  const allNav = [...mainTabs, ...menuItems]

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#0B1F1E]">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 text-xs text-center py-1.5 font-medium">
          📡 You're offline — viewing cached data
        </div>
      )}

      <div className="flex min-h-screen max-w-6xl mx-auto">

        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col w-60 bg-white dark:bg-[#0D1A19] border-r border-gray-100 dark:border-[#1A3A38] fixed h-full py-6 px-4 overflow-y-auto">
          
          {/* Logo */}
          <div className="mb-6 px-2 flex items-center gap-2">
            <img src="/logo-2.png" alt="BizBuddy" className="h-8 w-auto" />
          </div>

          {/* Profile at top */}
          <button onClick={() => navigate("profile")}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gray-50 dark:bg-[#112221] border border-gray-100 dark:border-[#1A3A38] mb-6 hover:bg-gray-100 dark:hover:bg-[#1A3A38] transition-all">
            <div className="w-10 h-10 bg-primary dark:bg-[#2DD4BF] rounded-full flex items-center justify-center text-white dark:text-[#0B1F1E] font-bold text-lg">
              {(user?.user_metadata?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {user?.user_metadata?.name || "My Profile"}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </button>

          <p className="text-xs text-gray-400 uppercase tracking-widest px-2 mb-2">Main</p>
          {mainTabs.map(tab => (
            <button key={tab.id} onClick={() => navigate(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${screen === tab.id ? "bg-primary dark:bg-[#1A3A38] text-white dark:text-[#2DD4BF]" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#112221]"}`}>
              <FontAwesomeIcon icon={tab.icon} className="w-4" />
              {tab.label}
            </button>
          ))}

          <p className="text-xs text-gray-400 uppercase tracking-widest px-2 mb-2 mt-4">Tools & Features</p>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${screen === item.id ? "bg-primary dark:bg-[#1A3A38] text-white dark:text-[#2DD4BF]" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#112221]"}`}>
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              {item.label}
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-[#1A3A38]">
            <button onClick={() => setDark(!dark)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#112221]">
              <FontAwesomeIcon icon={dark ? faSun : faMoon} className="w-4" />
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-60 pb-20 md:pb-6">

          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0D1A19] border-b border-gray-100 dark:border-[#1A3A38] sticky top-0 z-40">
            <img src="/logo-2.png" alt="BizBuddy" className="h-7 w-auto" />
            <div className="flex items-center gap-2">
              <button onClick={() => setDark(!dark)} className="p-2 rounded-xl text-gray-500 dark:text-[#2DD4BF]">
                <FontAwesomeIcon icon={dark ? faSun : faMoon} />
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl text-gray-500 dark:text-[#2DD4BF]">
                <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
              </button>
            </div>
          </div>

          {/* Mobile hamburger menu */}
          {menuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMenuOpen(false)}>
              <div className="absolute z-50 right-0 top-0 h-full w-72 bg-white dark:bg-[#0D1A19] border-l border-gray-100 dark:border-[#1A3A38] p-4 overflow-y-auto"
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <p className="font-bold text-primary dark:text-[#2DD4BF]">Menu</p>
                  <button onClick={() => setMenuOpen(false)} className="text-gray-400">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <button onClick={() => navigate("profile")}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gray-50 dark:bg-[#112221] border border-gray-100 dark:border-[#1A3A38] mb-6 hover:bg-gray-100 dark:hover:bg-[#1A3A38] transition-all">
                  <div className="w-10 h-10 bg-primary dark:bg-[#2DD4BF] rounded-full flex items-center justify-center text-white dark:text-[#0B1F1E] font-bold text-lg">
                    {(user?.user_metadata?.name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                      {user?.user_metadata?.name || "My Profile"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </button>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Features</p>
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 ${screen === item.id ? "bg-primary dark:bg-[#1A3A38] text-white dark:text-[#2DD4BF]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#112221]"}`}>
                    <FontAwesomeIcon icon={item.icon} className="w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop top bar */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0D1A19] border-b border-gray-100 dark:border-[#1A3A38]">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              {allNav.find(n => n.id === screen)?.label || "Dashboard"}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              👋 {user?.user_metadata?.name || user?.email}
            </span>
          </div>

          {screens[screen]}
        </div>
      </div>

      {/* Mobile bottom nav — 4 main tabs only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0D1A19] border-t border-gray-200 dark:border-[#1A3A38] flex justify-around py-2 z-40">
        {mainTabs.map(tab => (
          <button key={tab.id} onClick={() => navigate(tab.id)}
            className={`flex flex-col items-center text-xs px-3 py-1 rounded-lg transition-colors ${screen === tab.id ? "text-primary dark:text-[#2DD4BF] font-bold" : "text-gray-400 dark:text-gray-600"}`}>
            <FontAwesomeIcon icon={tab.icon} className="text-lg mb-1" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}