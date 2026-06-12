// Onboarding.jsx

import { useState } from "react"
import onboard1 from "../assets/onboard-chat.svg"
import onboard2 from "../assets/onboard-target.svg"
import onboard3 from "../assets/onboard-world.svg"

const slides = [
  {
    image: onboard3,
    title: "Grow Your\nBusiness",
    subtitle: "BizBuddy helps market traders, food vendors, seamstresses and beauty professionals track and grow their money",
    bg: "#0B1F1E",
  },
  {
    image: onboard2,
    title: "Set Goals,\nHit Targets",
    subtitle: "Create savings goals for anything — new equipment, emergencies, expansion — and track your progress daily",
    bg: "#0D1F1C",
  },
  {
    image: onboard1,
    title: "AI Business\nAdvisor",
    subtitle: "Ask BizBuddy anything in English, Twi, Ga or Ewe. Get personalised advice based on your real business data",
    bg: "#0B1E1D",
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
    <div className="min-h-screen flex flex-col items-center justify-between p-8 transition-all duration-500"
      style={{ backgroundColor: slide.bg }}>
      
      {/* Skip */}
      <div className="w-full flex justify-end">
        <button onClick={onDone} className="text-white/50 text-sm font-medium">Skip</button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs w-full">
        {/* Icon circle */}
        <div className="w-56 h-56 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-10">
          <img src={slide.image} alt="" className="w-40 h-40 object-contain" />
        </div>
                
        <h1 className="text-4xl font-bold text-white mb-5 leading-tight whitespace-pre-line">
          {slide.title}
        </h1>
        <p className="text-white/60 text-base leading-relaxed">
          {slide.subtitle}
        </p>
      </div>

      {/* Bottom */}
      <div className="w-full max-w-xs">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${i === current ? "w-8 bg-[#2DD4BF]" : "w-2 bg-white/30"}`} />
          ))}
        </div>

        <button onClick={next}
          className="w-full border border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-2xl py-4 font-semibold text-lg hover:bg-white/20 transition-all">
          {current === slides.length - 1 ? "Create My Account" : "Next"}
        </button>
      </div>
    </div>
  )
}