import { useState, useEffect, useRef } from "react"

// Positions around a circle (in degrees), converted to % x/y within the starsField
const ORBIT_RADIUS = 32 // % of container
const CENTER = 50
const toXY = (deg) => ({
  x: CENTER + ORBIT_RADIUS * Math.cos((deg * Math.PI) / 180),
  y: CENTER + ORBIT_RADIUS * Math.sin((deg * Math.PI) / 180),
})

const STARS_DATA = [
  { id: 1, deg: -90, size: 38, color: "#fff7d6", glow: "#ffcc44", label: "Sol Prime", delay: 0   },
  { id: 2, deg: -18, size: 28, color: "#ffd0d0", glow: "#ff6644", label: "Ember",     delay: 80  },
  { id: 3, deg:  54, size: 34, color: "#d0e8ff", glow: "#44aaff", label: "Glacius",   delay: 160 },
  { id: 4, deg: 126, size: 24, color: "#ffe8b0", glow: "#ffaa22", label: "Dwarf-7",   delay: 240 },
  { id: 5, deg: 198, size: 30, color: "#e8d0ff", glow: "#aa44ff", label: "Nebulor",   delay: 320 },
].map(s => ({ ...s, ...toXY(s.deg) }))

export default function Landing({ onSelectStar }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState("idle") // idle | zooming | revealed
  const [hoveredStar, setHoveredStar] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)
    const bg = Array.from({ length: 380 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      o: Math.random(), d: (Math.random() - 0.5) * 0.007,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      bg.forEach(s => {
        s.o = Math.max(0.05, Math.min(1, s.o + s.d))
        if (s.o <= 0.05 || s.o >= 1) s.d *= -1
        ctx.beginPath()
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.o})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  const handleSunClick = () => {
    if (phase !== "idle") return
    setPhase("zooming")
    setTimeout(() => setPhase("revealed"), 1500)
  }

  const zooming  = phase === "zooming"
  const revealed = phase === "revealed"

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />

      {/* ── IDLE / ZOOMING: title + big clickable sun ── */}
      {!revealed && (
        <div style={{
          ...s.scene,
          transform:  zooming ? "scale(0.08)" : "scale(1)",
          opacity:    zooming ? 0 : 1,
          transition: "transform 1.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease 1s",
        }}>
          <h1 style={s.title}>Re-Plan-It</h1>
          <button onClick={handleSunClick} style={s.sunBtn} aria-label="Start Journey">
            <div style={s.corona3} />
            <div style={s.corona2} />
            <div style={s.corona1} />
            <div style={s.sunCore}>
              <span style={s.sunLabel}>{"Start\nJourney"}</span>
            </div>
          </button>
          <p style={s.hint}>click the sun to begin</p>
        </div>
      )}

      {/* ── REVEALED: sun in center (non-clickable) + 5 orbiting stars ── */}
      {revealed && (
        <div style={s.systemWrap}>

          {/* orbit ring guide */}
          <div style={s.orbitGuide} />

          {/* central sun — decorative only */}
          <div style={s.centerSun}>
            <div style={s.corona3r} />
            <div style={s.corona2r} />
            <div style={s.corona1r} />
            <div style={s.sunCoreRevealed} />
          </div>

          {/* 5 stars around it */}
          {STARS_DATA.map(star => (
            <StarNode
              key={star.id}
              star={star}
              hovered={hoveredStar === star.id}
              onHover={setHoveredStar}
              onClick={() => onSelectStar?.(star)}
            />
          ))}

          <p style={s.pickHint}>Select a star system to explore</p>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@300;400&display=swap');
        @keyframes titleGlow {
          0%,100%{ text-shadow:0 0 30px rgba(255,160,50,.45),0 0 70px rgba(255,100,20,.2); }
          50%    { text-shadow:0 0 55px rgba(255,190,80,.8),0 0 110px rgba(255,120,30,.4); }
        }
        @keyframes coronaPulse  { 0%,100%{transform:scale(1);opacity:.5}  50%{transform:scale(1.12);opacity:.8}  }
        @keyframes coronaPulse2 { 0%,100%{transform:scale(1);opacity:.3}  50%{transform:scale(1.08);opacity:.55} }
        @keyframes coronaPulse3 { 0%,100%{transform:scale(1);opacity:.15} 50%{transform:scale(1.06);opacity:.3}  }
        @keyframes sunRotate    { from{filter:hue-rotate(0deg) brightness(1.1)} to{filter:hue-rotate(20deg) brightness(1.3)} }
        @keyframes hintFloat    { 0%,100%{opacity:.3;transform:translateX(-50%) translateY(0)} 50%{opacity:.6;transform:translateX(-50%) translateY(-4px)} }
        @keyframes starAppear   {
          from{ opacity:0; transform:translate(-50%,-50%) scale(0.1); }
          to  { opacity:1; transform:translate(-50%,-50%) scale(1);   }
        }
        @keyframes orbPulse     { 0%,100%{opacity:.2} 50%{opacity:.45} }
      `}</style>
    </div>
  )
}

function StarNode({ star, hovered, onHover, onClick }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover(star.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: "absolute",
        left: `${star.x}%`, top: `${star.y}%`,
        transform: "translate(-50%,-50%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8,
        cursor: "pointer",
        animation: `starAppear 0.6s ease ${star.delay}ms both`,
        zIndex: 2,
      }}
    >
      {/* glow ring */}
      <div style={{
        position: "absolute",
        width: star.size + 32, height: star.size + 32,
        borderRadius: "50%",
        border: `1px solid ${star.glow}66`,
        opacity: hovered ? 0.9 : 0.4,
        transition: "opacity 0.3s",
      }} />
      {/* body */}
      <div style={{
        width: star.size, height: star.size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 38% 35%, #ffffff 0%, ${star.color} 30%, ${star.glow} 65%, #110022 100%)`,
        boxShadow: `0 0 ${hovered?44:18}px ${hovered?14:7}px ${star.glow}99, 0 0 ${hovered?80:36}px ${hovered?24:12}px ${star.glow}44`,
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
        transform: hovered ? "scale(1.22)" : "scale(1)",
        position: "relative", zIndex: 1,
      }} />
      {/* label */}
      <span style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 10, fontWeight: 700,
        letterSpacing: "0.18em",
        color: hovered ? star.color : "rgba(255,255,255,0.45)",
        textTransform: "uppercase",
        transition: "color 0.3s ease",
        whiteSpace: "nowrap", position: "relative", zIndex: 1,
      }}>
        {star.label}
      </span>
    </div>
  )
}

const s = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at 50% 55%, #0a0420 0%, #000008 75%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden",
    fontFamily: "'Exo 2', sans-serif",
  },
  canvas: { position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" },

  // idle scene
  scene: {
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 40,
    transformOrigin: "center center",
  },
  title: {
    fontFamily: "'Orbitron', sans-serif", fontWeight: 900,
    fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
    color: "#fff", margin: 0, letterSpacing: "0.14em",
    animation: "titleGlow 4s ease-in-out infinite", userSelect: "none",
  },
  sunBtn: {
    background: "none", border: "none", cursor: "pointer",
    position: "relative", width: 200, height: 200,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  sunCore: {
    position: "relative", zIndex: 4,
    width: 140, height: 140, borderRadius: "50%",
    background: "radial-gradient(circle at 38% 35%, #fff7d6 0%, #ffcc44 25%, #ff8800 55%, #cc3300 85%, #7a1500 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "sunRotate 6s ease-in-out infinite alternate",
    boxShadow: "0 0 40px 10px rgba(255,140,0,.6), 0 0 80px 20px rgba(255,80,0,.3)",
  },
  sunLabel: {
    color: "rgba(255,255,255,0.9)", fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700, fontSize: 11, letterSpacing: "0.15em",
    textTransform: "uppercase", textShadow: "0 1px 4px rgba(0,0,0,0.8)",
    textAlign: "center", lineHeight: 1.6, whiteSpace: "pre",
  },
  corona1: { position:"absolute", inset:-18, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,150,30,.45) 60%, transparent 100%)", animation:"coronaPulse 3s ease-in-out infinite", zIndex:3 },
  corona2: { position:"absolute", inset:-40, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,100,10,.25) 55%, transparent 100%)", animation:"coronaPulse2 4s ease-in-out infinite", zIndex:2 },
  corona3: { position:"absolute", inset:-65, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,60,0,.12) 50%, transparent 100%)", animation:"coronaPulse3 5s ease-in-out infinite", zIndex:1 },
  hint: { color:"rgba(255,255,255,0.3)", fontFamily:"'Exo 2', sans-serif", fontWeight:300, fontSize:12, letterSpacing:"0.25em", textTransform:"uppercase", margin:0, animation:"hintFloat 3s ease-in-out infinite" },

  // revealed system
  systemWrap: {
    position: "absolute", inset: 0, zIndex: 1,
  },
  orbitGuide: {
    position: "absolute",
    left: "50%", top: "50%",
    width:  `${ORBIT_RADIUS * 2 * 1.18}vmin`,
    height: `${ORBIT_RADIUS * 2 * 1.18}vmin`,
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    border: "1px dashed rgba(255,180,80,0.12)",
    animation: "orbPulse 4s ease-in-out infinite",
    pointerEvents: "none",
  },
  centerSun: {
    position: "absolute", left: "50%", top: "50%",
    transform: "translate(-50%, -50%)",
    width: 100, height: 100,
    display: "flex", alignItems: "center", justifyContent: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  sunCoreRevealed: {
    width: 72, height: 72, borderRadius: "50%",
    background: "radial-gradient(circle at 38% 35%, #fff7d6 0%, #ffcc44 25%, #ff8800 55%, #cc3300 85%, #7a1500 100%)",
    animation: "sunRotate 6s ease-in-out infinite alternate",
    boxShadow: "0 0 28px 8px rgba(255,140,0,.55), 0 0 60px 16px rgba(255,80,0,.25)",
    position: "relative", zIndex: 4,
  },
  corona1r: { position:"absolute", inset:-12, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,150,30,.35) 60%, transparent 100%)", animation:"coronaPulse 3s ease-in-out infinite", zIndex:3 },
  corona2r: { position:"absolute", inset:-26, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,100,10,.2) 55%, transparent 100%)",  animation:"coronaPulse2 4s ease-in-out infinite", zIndex:2 },
  corona3r: { position:"absolute", inset:-42, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,60,0,.1) 50%, transparent 100%)",   animation:"coronaPulse3 5s ease-in-out infinite", zIndex:1 },
  pickHint: {
    position: "absolute", bottom: 36, left: "50%",
    fontFamily: "'Exo 2', sans-serif", fontWeight: 300, fontSize: 12,
    letterSpacing: "0.22em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.3)", margin: 0,
    animation: "hintFloat 3s ease-in-out infinite", whiteSpace: "nowrap",
  },
}
