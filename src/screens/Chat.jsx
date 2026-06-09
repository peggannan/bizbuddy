import { useState } from "react"

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm BizBuddy, your business assistant. How can I help you today?" }
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
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are BizBuddy, a friendly business advisor for small Ghanaian businesses like market traders, food vendors, seamstresses and beauty professionals. Give practical, simple advice in short friendly responses. Always use GHS for currency."
          },
          { role: "user", content: userMessage }
        ]
      })
    })

    const data = await response.json()
    console.log("Groq response:", JSON.stringify(data))

    if (data.error) {
      setMessages(prev => [...prev, { role: "assistant", text: "Error: " + data.error.message }])
      setLoading(false)
      return
    }

    const reply = data.choices[0].message.content
    setMessages(prev => [...prev, { role: "assistant", text: reply }])

  } catch (e) {
    setMessages(prev => [...prev, { role: "assistant", text: "Error: " + e.message }])
  }

  setLoading(false)
}
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary p-4">
        <h1 className="text-white font-bold text-lg">BizBuddy AI</h1>
        <p className="text-white/70 text-xs">Your personal business advisor</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-white" : "bg-white text-gray-700 shadow-sm"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-2 text-sm text-gray-400 shadow-sm">Thinking...</div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask BizBuddy anything..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button onClick={sendMessage} className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-semibold">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}