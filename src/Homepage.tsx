import { useState, useEffect, useRef } from "react"

// --- Types ---
interface Star {
  id: number
  size: number
  color: string
  glow: string
  label: string
  distance: number 
  orbitSpeed: number 
  startAngle: number 
}

interface StarNodeProps {
  star: Star
  hovered: boolean
  isOrbiting: boolean
  onHover: (id: number | null) => void
  onToggleOrbit: () => void
}

interface LandingProps {
  onSelectStar?: (star: Star) => void
}

// --- Constants ---
const SUN_SIZE_REVEALED = 85
const ORBIT_SPACING = 8 
const INNER_MARGIN = 20  

const STARS_DATA: Star[] = [
  { id: 1, size: 22, color: "#ffd0d0", glow: "#ff6644", label: "Ember",     distance: INNER_MARGIN + (0 * ORBIT_SPACING), orbitSpeed: 20, startAngle: 0 },
  { id: 2, size: 30, color: "#d0e8ff", glow: "#44aaff", label: "Glacius",   distance: INNER_MARGIN + (1 * ORBIT_SPACING), orbitSpeed: 35, startAngle: 60 },
  { id: 3, size: 20, color: "#ffe8b0", glow: "#ffaa22", label: "Dwarf-7",   distance: INNER_MARGIN + (2 * ORBIT_SPACING), orbitSpeed: 50, startAngle: 120 },
  { id: 4, size: 28, color: "#e8d0ff", glow: "#aa44ff", label: "Nebulor",   distance: INNER_MARGIN + (3 * ORBIT_SPACING), orbitSpeed: 70, startAngle: 180 },
  { id: 5, size: 34, color: "#fff7d6", glow: "#ffcc44", label: "Sol Prime", distance: INNER_MARGIN + (4 * ORBIT_SPACING), orbitSpeed: 90, startAngle: 240 },
]

export default function Landing({ onSelectStar }: LandingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<"idle" | "zooming" | "revealed">("idle")
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [isOrbiting, setIsOrbiting] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const bg = Array.from({ length: 400 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      o: Math.random(),
      d: (Math.random() - 0.5) * 0.005,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of bg) {
        s.o = Math.max(0.1, Math.min(1, s.o + s.d))
        if (s.o <= 0.1 || s.o >= 1) s.d *= -1
        ctx.beginPath()
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.o})`
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  const handleSunClick = () => {
    if (phase !== "idle") return
    setPhase("zooming")
    setTimeout(() => setPhase("revealed"), 2500) 
  }

  const toggleOrbit = () => setIsOrbiting(!isOrbiting)

  const revealed = phase === "revealed"
  const zooming = phase === "zooming"

  return (
    <div style={styles.page}>
      <canvas ref={canvasRef} style={styles.canvas} />

      {!revealed && (
        <div style={{
          ...styles.scene,
          transform: zooming ? "scale(0.55)" : "scale(1)", 
          opacity: zooming ? 0.8 : 1,
          transition: "transform 2.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 2.5s ease",
        }}>
          <h1 style={{...styles.title, opacity: zooming ? 0 : 1, transition: '0.8s ease'}}>RE-PLAN-IT</h1>
          <button onClick={handleSunClick} style={styles.sunBtn}>
            <div style={styles.corona3} />
            <div style={styles.corona2} />
            <div style={styles.corona1} />
            <div style={styles.sunCore}>
              <span style={{...styles.sunLabel, opacity: zooming ? 0 : 1}}>{"START\nJOURNEY"}</span>
            </div>
          </button>
          <p style={{...styles.hint, opacity: zooming ? 0 : 1}}>click the sun to begin</p>
        </div>
      )}

      {revealed && (
        <div style={styles.systemWrap}>
          <div style={styles.centerSun}>
            <div style={styles.corona3r} />
            <div style={styles.corona2r} />
            <div style={styles.corona1r} />
            <div style={styles.sunCoreRevealed} />
          </div>

          {STARS_DATA.map(star => (
            <div 
              key={`ring-${star.id}`} 
              style={{
                ...styles.orbitalRing,
                width: `${star.distance * 2}vmin`,
                height: `${star.distance * 2}vmin`,
                animationDuration: `${star.orbitSpeed}s`,
                animationDelay: `-${(star.startAngle / 360) * star.orbitSpeed}s`,
                animationPlayState: isOrbiting ? "running" : "paused"
              }}
            >
              <StarNode
                star={star}
                hovered={hoveredStar === star.id}
                isOrbiting={isOrbiting}
                onHover={setHoveredStar}
                onToggleOrbit={toggleOrbit}
              />
            </div>
          ))}

          <p style={styles.pickHint}>
            {isOrbiting ? "Click a planet to halt" : "Click again to resume"}
          </p>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@300;400&display=swap');
        
        @keyframes orbitRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes counterRotate {
          from { transform: translateX(-50%) rotate(0deg); }
          to   { transform: translateX(-50%) rotate(-360deg); }
        }

        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 30px rgba(255,255,255,0.3); transform: scale(1); }
          50% { text-shadow: 0 0 50px rgba(255,255,255,0.6); transform: scale(1.02); }
        }
        
        @keyframes coronaPulse { 
          0%,100% { transform: scale(1); opacity: 0.4; } 
          50%     { transform: scale(1.15); opacity: 0.8; } 
        }

        @keyframes sunRotate { 
          from { filter: hue-rotate(0deg); } 
          to   { filter: hue-rotate(15deg); } 
        }
      `}</style>
    </div>
  )
}

function StarNode({ star, hovered, isOrbiting, onHover, onToggleOrbit }: StarNodeProps) {
  return (
    <div
      onClick={(e) => {
        // Stop bubbling so the parent components don't misinterpret the click
        e.stopPropagation();
        onToggleOrbit();
      }}
      onMouseEnter={() => onHover(star.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: "absolute",
        top: 0, 
        left: "50%",
        cursor: "pointer",
        zIndex: 100, // Ensure it's above the ring
        pointerEvents: "auto", // CRITICAL: This allows clicking despite parent pointerEvents: none
        animation: `counterRotate ${star.orbitSpeed}s linear infinite`,
        animationDelay: "inherit",
        animationPlayState: isOrbiting ? "running" : "paused"
      }}
    >
      <div style={{
        width: star.size, 
        height: star.size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, #fff 0%, ${star.color} 40%, ${star.glow} 85%)`,
        boxShadow: `0 0 ${hovered ? 45 : 15}px ${star.glow}aa`,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        transform: hovered ? "scale(1.3) translateX(-50%)" : "scale(1) translateX(-50%)",
      }} />
      
      <span style={{
        position: "absolute", 
        top: star.size + 12, 
        left: "0%", 
        transform: "translateX(-50%)",
        fontFamily: "'Orbitron', sans-serif", 
        fontSize: 10, 
        fontWeight: 700,
        color: hovered ? star.color : "rgba(255,255,255,0.45)",
        letterSpacing: "2.5px", 
        textTransform: "uppercase", 
        whiteSpace: "nowrap",
      }}>
        {star.label}
      </span>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at center, #0a0420 0%, #000 85%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden",
    fontFamily: "'Exo 2', sans-serif",
  } as const,
  canvas: { position:"absolute", inset:0, pointerEvents:"none" } as const,
  scene: {
    position: "relative", zIndex: 20,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 50,
  } as const,
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "clamp(2.5rem, 10vw, 7rem)", 
    color: "#fff",
    letterSpacing: "0.25em",
    animation: "titleGlow 5s ease-in-out infinite",
  } as const,
  sunBtn: {
    background: "none", border: "none", cursor: "pointer",
    position: "relative", width: 280, height: 280,
    display: "flex", alignItems: "center", justifyContent: "center",
  } as const,
  sunCore: {
    width: 170, height: 170, borderRadius: "50%",
    background: "radial-gradient(circle at 38% 35%, #fff7d6, #ffcc44, #ff8800, #cc3300)",
    animation: "sunRotate 6s infinite alternate",
    boxShadow: "0 0 60px rgba(255, 140, 0, 0.6), 0 0 120px rgba(255, 80, 0, 0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 4,
  } as const,
  sunLabel: {
    color: "#fff", fontFamily: "'Orbitron'", fontSize: 16, fontWeight: 900,
    letterSpacing: "4px", textAlign: "center", whiteSpace: "pre",
    textShadow: "0 0 15px rgba(0,0,0,0.8)",
  } as const,
  systemWrap: { position: "absolute", inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const,
  orbitalRing: {
    position: "absolute", left: "50%", top: "50%",
    borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
    pointerEvents: "none", // Empty space is clickable through to the sun
    animation: "orbitRotate linear infinite",
  } as const,
  centerSun: { position: "absolute", width: SUN_SIZE_REVEALED, height: SUN_SIZE_REVEALED, zIndex: 1 } as const,
  sunCoreRevealed: {
    width: SUN_SIZE_REVEALED, height: SUN_SIZE_REVEALED, borderRadius: "50%",
    background: "radial-gradient(circle at 38% 35%, #fff7d6, #ffcc44, #ff8800, #cc3300)",
    boxShadow: "0 0 50px rgba(255,120,0,.7)",
    position: "absolute", left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
    zIndex: 5
  } as const,
  corona1: { position: "absolute", inset: -25, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,150,30,.45) 60%, transparent 100%)", animation: "coronaPulse 3s infinite" } as const,
  corona2: { position: "absolute", inset: -60, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,100,10,.25) 55%, transparent 100%)", animation: "coronaPulse 4s infinite" } as const,
  corona3: { position: "absolute", inset: -100, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,60,0,.15) 50%, transparent 100%)", animation: "coronaPulse 5s infinite" } as const,
  corona1r: { position: "absolute", inset: -15, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,150,30,.35) 60%, transparent 100%)", animation: "coronaPulse 3s infinite" } as const,
  corona2r: { position: "absolute", inset: -35, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,100,10,.2) 55%, transparent 100%)", animation: "coronaPulse 4s infinite" } as const,
  corona3r: { position: "absolute", inset: -65, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,60,0,.1) 50%, transparent 100%)", animation: "coronaPulse 5s infinite" } as const,
  hint: { color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: "5px", textTransform: "uppercase" } as const,
  pickHint: { position: "absolute", bottom: 50, color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "6px", textTransform: "uppercase" } as const,
}