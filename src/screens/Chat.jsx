// Chat.jsx

import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMicrophone, faMicrophoneSlash, faPaperPlane, faGlobe } from "@fortawesome/free-solid-svg-icons"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

const languageLabels = {
  english: "English",
  twi: "Twi",
  ga: "Ga",
  ewe: "Ewe"
}

export default function Chat({ user, navigate }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Akwaaba! I'm BizBuddy 💼 How can I help your business today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [shortMode, setShortMode] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [chatLanguage, setChatLanguage] = useState(user?.user_metadata?.language || "english")
  const [languageLoading, setLanguageLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (user?.user_metadata?.language) setChatLanguage(user.user_metadata.language)
    loadAllData()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadAllData() {
    await Promise.all([loadTransactions(), loadOrders(), loadInventory()])
  }

  async function loadTransactions() {
    const { data } = await supabase.from("transactions").select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
    if (data) setTransactions(data)
  }

  async function loadOrders() {
    const { data } = await supabase.from("orders").select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
    if (data) setOrders(data)
  }

  async function loadInventory() {
    const { data } = await supabase.from("inventory").select("*")
      .eq("user_id", user.id)
      .order("name")
    if (data) setInventory(data)
  }

  function buildContext() {
    const transactionSummary = transactions.length > 0
      ? `Transactions: ${transactions.length} entries, Income GHS ${transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}, Expenses GHS ${transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}.`
      : "No transaction data available."

    const orderSummary = orders.length > 0
      ? `Orders: ${orders.length} recent orders, pending ${orders.filter(o => o.status !== "completed").length}.`
      : "No order data available."

    const inventorySummary = inventory.length > 0
      ? `Inventory: ${inventory.length} items, ${inventory.filter(i => Number(i.quantity) <= 5).length} low stock.`
      : "No inventory data available."

    return `\n\nBusiness context:\n- ${transactionSummary}\n- ${orderSummary}\n- ${inventorySummary}`
  }

  function buildSystemPrompt() {
    const brevity = shortMode
      ? "Be concise: reply in 1-3 short sentences or a 3-bullet list with clear, specific actions."
      : "Answer in a normal, helpful length with examples when useful."
    return `You are BizBuddy, a friendly business advisor for small Ghanaian businesses. Use the user's selected response language: ${languageLabels[chatLanguage]}. ${brevity} Answer with practical, simple advice, and leverage data from transactions, orders, and inventory where relevant. Keep responses clear and use GHS for currency.${buildContext()}`
  }

  async function switchChatLanguage(lang) {
    if (lang === chatLanguage) return
    setChatLanguage(lang)
    setLanguageLoading(true)
    setMessages(prev => [...prev, { role: "assistant", text: `Switching language to ${languageLabels[lang]}...` }])

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are BizBuddy, a friendly business advisor for small Ghanaian businesses. From now on, answer in ${languageLabels[lang]}. Start with a warm greeting and one quick business tip in that language.`
            },
            { role: "user", content: `Change the chat language to ${languageLabels[lang]}.` }
          ]
        })
      })
      const data = await response.json()
      const message = data?.choices?.[0]?.message?.content || `Language switched to ${languageLabels[lang]}.`
      setMessages(prev => [...prev, { role: "assistant", text: message }])
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Could not switch language right now. Try again later." }])
    }
    setLanguageLoading(false)
  }

  async function sendMessage(text) {
    const userMessage = text || input
    if (!userMessage.trim()) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userMessage }])
    setLoading(true)

    const conversationHistory = messages.slice(-6).map(m => ({ role: m.role, content: m.text }))

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: buildSystemPrompt() },
            ...conversationHistory,
            { role: "user", content: userMessage }
          ]
        })
      })
      const data = await response.json()
      const answer = data?.choices?.[0]?.message?.content || "I couldn't get a response. Try again."
      setMessages(prev => [...prev, { role: "assistant", text: answer }])
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, couldn't connect. Try again!" }])
    }
    setLoading(false)
  }

  async function sendQuickPrompt(prompt) {
    await sendMessage(prompt)
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice input not supported on this browser. Try Chrome!")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = "en-GH"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
    recognitionRef.current = recognition
  }

  function stopVoice() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-64px)]">
      <div className="bg-primary dark:bg-[#112221] border-b border-transparent dark:border-[#1A3A38] p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-white font-bold text-lg">BizBuddy AI</h1>
            <p className="text-white/70 text-xs">Access orders, inventory and pricing insight in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} className="text-white/80" />
            <select value={chatLanguage} onChange={e => switchChatLanguage(e.target.value)}
              className="bg-white/10 text-black rounded-xl px-3 py-2 text-sm outline-none border border-white/20">
              {Object.entries(languageLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button onClick={() => setShortMode(s => !s)}
              className="ml-2 bg-white/10 text-white/80 rounded-xl px-3 py-2 text-sm border border-white/10">
              {shortMode ? 'Short' : 'Verbose'}
            </button>
          </div>
        </div>
      </div>

      {/* Removed top quick navigation buttons per user request */}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 bg-primary dark:bg-[#2DD4BF] rounded-full flex items-center justify-center text-xs text-white dark:text-[#0B1F1E] mr-2 mt-1 shrink-0">💼</div>
            )}
            <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E]"
                : "bg-white dark:bg-[#112221] text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-[#1A3A38]"
            }`}>
              <div className="chat-markdown prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{m.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 bg-primary dark:bg-[#2DD4BF] rounded-full flex items-center justify-center text-xs mr-2 mt-1 shrink-0">💼</div>
            <div className="bg-white dark:bg-[#112221] border border-gray-100 dark:border-[#1A3A38] rounded-2xl px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-[#0D1A19] border-t border-gray-200 dark:border-[#1A3A38]">
        {languageLoading && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Updating language mode...</div>
        )}
        {listening && (
          <div className="text-center text-xs text-primary dark:text-[#2DD4BF] mb-2 animate-pulse">
            🎤 Listening... speak now
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { label: "Recommend stock levels", prompt: "Review my inventory and tell me which items need restocking first." },
              { label: "Optimize pricing", prompt: "Analyze my latest sales and recommend a better pricing strategy for higher margins." },
              { label: "Prioritize orders", prompt: "Help me prioritise pending orders based on profitability and due date." },
              { label: "Business decision", prompt: "What should I do next to improve cash flow and avoid stockouts?" }
            ].map(item => (
              <button key={item.label} onClick={() => sendQuickPrompt(item.prompt)}
                className="rounded-2xl border border-gray-200 dark:border-[#1A3A38] px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#112221]">
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={listening ? stopVoice : startVoice}
              className={`p-2.5 rounded-xl text-sm transition-all ${listening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 dark:bg-[#1A3A38] text-gray-500 dark:text-gray-400"}`}
            >
              <FontAwesomeIcon icon={listening ? faMicrophoneSlash : faMicrophone} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask BizBuddy anything..."
              className="flex-1 bg-gray-50 dark:bg-[#112221] border border-gray-200 dark:border-[#1A3A38] text-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary dark:focus:border-[#2DD4BF] placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button onClick={() => sendMessage()}
              className="bg-primary dark:bg-[#2DD4BF] text-white dark:text-[#0B1F1E] rounded-xl px-4 py-2 text-sm font-semibold">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
