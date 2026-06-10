import { useState } from "react"

const slides = [
  {
    emoji: "💼",
    title: "Grow Your Business",
    subtitle: "BizBuddy helps market traders, food vendors, seamstresses and beauty professionals track and grow their money",
    bg: "from-[#0B1F1E] to-[#112221]"
  },
  {
    emoji: "📊",
    title: "Track Every Cedi",
    subtitle: "Record your income and expenses easily. See exactly where your money is going and how much profit you're making",
    bg: "from-[#112221] to-[#0D1A19]"
  },
  {
    emoji: "🤖",
    title: "AI Business Advisor",
    subtitle: "Get personalised advice from BizBuddy AI. Ask questions in English, Twi, Ga or Ewe — anytime, for free",
    bg: "from-[#0D1A19] to-[#0B1F1E]"
  }
]

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0)

  function next() {
    if (current < slides.length - 1) setCurrent(current + 1)
    else onDone()
  }

  const slide = slides[current]

  return (
    <div className={`min-h-screen bg-gradient-to-b ${slide.bg} flex flex-col items-center justify-between p-8 transition-all duration-500`}>
      <button onClick={onDone} className="self-end text-white/50 text-sm">Skip</button>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm">
        <div className="w-28 h-28 bg-white/10 rounded-3xl flex items-center justify-center text-6xl mb-8 border border-white/20">
          {slide.emoji}
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{slide.title}</h1>
        <p className="text-white/60 text-base leading-relaxed">{slide.subtitle}</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-[#2DD4BF]" : "w-2 bg-white/30"}`} />
          ))}
        </div>
        <button onClick={next}
          className="w-full bg-[#2DD4BF] text-[#0B1F1E] rounded-2xl py-4 font-bold text-lg">
          {current === slides.length - 1 ? "Create My Account" : "Next"}
        </button>
      </div>
    </div>
  )
}