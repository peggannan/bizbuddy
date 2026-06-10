import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMicrophone, faMicrophoneSlash, faPaperPlane } from "@fortawesome/free-solid-svg-icons"

export default function Chat({ user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Akwaaba! I'm BizBuddy 💼 How can I help your business today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [transactions, setTransactions] = useState([])
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    loadTransactions()
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadTransactions() {
    const { data } = await supabase.from("transactions").select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
    if (data) setTransactions(data)
  }

  function buildContext() {
    if (transactions.length === 0) return ""
    const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
    const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
    const recent = transactions.slice(0, 5).map(t =>
      `${t.type === "income" ? "+" : "-"}GHS ${t.amount} (${t.description}, ${t.category})`
    ).join(", ")
    return `\n\nUser's business data: Total income: GHS ${income}, Total expenses: GHS ${expenses}, Net: GHS ${income - expenses}. Recent transactions: ${recent}.`
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

  async function sendMessage(text) {
    const userMessage = text || input
    if (!userMessage.trim()) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userMessage }])
    setLoading(true)

    const context = buildContext()
    const conversationHistory = messages.slice(-6).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text
    }))

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are BizBuddy, a friendly business advisor for small Ghanaian businesses. Give practical, simple advice. Keep responses short and friendly. Always use GHS for currency.${context}`
            },
            ...conversationHistory,
            { role: "user", content: userMessage }
          ]
        })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", text: data.choices[0].message.content }])
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, couldn't connect. Try again!" }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-64px)]">
      <div className="bg-primary dark:bg-[#112221] border-b border-transparent dark:border-[#1A3A38] p-4">
        <h1 className="text-white font-bold text-lg">BizBuddy AI</h1>
        <p className="text-white/70 text-xs">Knows your recent transactions • Voice enabled</p>
      </div>

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
              {m.text}
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
        {listening && (
          <div className="text-center text-xs text-primary dark:text-[#2DD4BF] mb-2 animate-pulse">
            🎤 Listening... speak now
          </div>
        )}
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
  )
}