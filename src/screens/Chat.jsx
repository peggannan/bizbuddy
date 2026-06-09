import { useState } from "react"

export default function Chat({ user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Akwaaba! I'm BizBuddy, your business assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim()) return
    const userMessage = input
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userMessage }])
    setLoading(true)

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are BizBuddy, a friendly business advisor for small Ghanaian businesses like market traders, food vendors, seamstresses and beauty professionals. Give practical, simple advice. Keep responses short and friendly. Always use GHS for currency." },
            { role: "user", content: userMessage }
          ]
        })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", text: data.choices[0].message.content }])
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "Error: " + e.message }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="bg-primary dark:bg-[#132B24] border-b border-transparent dark:border-[#1E3D32] p-4">
        <h1 className="text-white font-bold text-lg">BizBuddy AI</h1>
        <p className="text-white/70 text-xs">Your personal business advisor</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 bg-primary dark:bg-[#1DB954] rounded-full flex items-center justify-center text-xs text-white dark:text-[#0D1F1A] mr-2 mt-1 shrink-0">
                💼
              </div>
            )}
            <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-primary dark:bg-[#1DB954] text-white dark:text-[#0D1F1A]"
                : "bg-white dark:bg-[#132B24] text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-[#1E3D32]"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 bg-primary dark:bg-[#1DB954] rounded-full flex items-center justify-center text-xs mr-2 mt-1 shrink-0">💼</div>
            <div className="bg-white dark:bg-[#132B24] border border-gray-100 dark:border-[#1E3D32] rounded-2xl px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white dark:bg-[#0F2420] border-t border-gray-200 dark:border-[#1E3D32]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask BizBuddy anything..."
            className="flex-1 bg-gray-50 dark:bg-[#132B24] border border-gray-200 dark:border-[#1E3D32] text-gray-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary dark:focus:border-[#1DB954] placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button onClick={sendMessage}
            className="bg-primary dark:bg-[#1DB954] text-white dark:text-[#0D1F1A] rounded-xl px-4 py-2 text-sm font-semibold">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}