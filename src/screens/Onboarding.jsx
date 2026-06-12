export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0)

  function next() {
    if (current < slides.length - 1) setCurrent(current + 1)
    else onDone()
  }

  const slide = slides[current]

  return (
    <div
      className="min-h-screen flex flex-col items-center p-8 transition-all duration-500"
      style={{ backgroundColor: slide.bg }}
    >
      {/* Skip */}
      <div className="w-full flex justify-end pt-2 pb-6">
        <button onClick={onDone} className="text-white/50 text-sm font-medium">
          Skip
        </button>
      </div>

      {/* Illustration */}
      <div className="w-48 h-48 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mt-8 mb-10">
        <img src={slide.image} alt="" className="w-32 h-32 object-contain" />
      </div>

      {/* Text */}
      <div className="flex-1 flex flex-col items-center text-center max-w-xs w-full">
        <h1 className="text-4xl font-bold text-white mb-4 leading-tight whitespace-pre-line">
          {slide.title}
        </h1>
        <p className="text-white/60 text-base leading-relaxed">
          {slide.subtitle}
        </p>
      </div>

      {/* Bottom */}
      <div className="w-full max-w-xs pb-4">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === current ? "w-8 bg-[#2DD4BF]" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full bg-[#2DD4BF] text-[#0B1F1E] rounded-2xl py-4 font-bold text-lg hover:bg-[#26bfab] transition-all"
        >
          {current === slides.length - 1 ? "Create My Account" : "Next"}
        </button>
      </div>
    </div>
  )
}