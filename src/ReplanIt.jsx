import { useState, useEffect, useRef, useCallback } from "react";

// Place galaxy.png in your /public folder and update this path if needed
const GALAXY_IMG = "/galaxy.png";

const NUM_STARS_BG = 180;
const LEVELS = [
  { id: 1, name: "Sol Prime",    starColor: "#FFF4C2", glowColor: "#FFD700", type: "Sun-like",    difficulty: "Tutorial",  diffColor: "#4ade80", angle: 270 },
  { id: 2, name: "Emberveil",    starColor: "#FFB347", glowColor: "#FF6B35", type: "Red Dwarf",   difficulty: "Medium",    diffColor: "#facc15", angle: 342 },
  { id: 3, name: "Twin Hollow",  starColor: "#B8E0FF", glowColor: "#60A5FA", type: "Binary",      difficulty: "Hard",      diffColor: "#fb923c", angle: 54  },
  { id: 4, name: "Voltmere",     starColor: "#C4BFFF", glowColor: "#818CF8", type: "Blue Giant",  difficulty: "Very Hard", diffColor: "#f87171", angle: 126 },
  { id: 5, name: "The Remnant",  starColor: "#E0E0E0", glowColor: "#A0A0B0", type: "Neutron Star", difficulty: "Boss",     diffColor: "#e879f9", angle: 198 },
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const bgStars = (() => {
  const rand = seededRandom(42);
  return Array.from({ length: NUM_STARS_BG }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 100,
    r: rand() * 1.4 + 0.3,
    opacity: rand() * 0.6 + 0.2,
    twinkleDur: rand() * 3 + 2,
    twinkleDelay: rand() * 5,
  }));
})();

export default function ReplanIt() {
  const [phase, setPhase] = useState("landing"); // landing | zooming | levels | hoveredLevel
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const orbitAngles = useRef(LEVELS.map(l => (l.angle * Math.PI) / 180));
  const lastTime = useRef(null);

  // Canvas orbit animation
  const drawOrbits = useCallback((timestamp) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    if (lastTime.current !== null) {
      const dt = (timestamp - lastTime.current) / 1000;
      const speeds = [0.28, 0.19, 0.13, 0.09, 0.06];
      orbitAngles.current = orbitAngles.current.map((a, i) => a + speeds[i] * dt);
    }
    lastTime.current = timestamp;

    ctx.clearRect(0, 0, W, H);

    const orbitRadii = [90, 145, 200, 255, 310];

    // Draw orbit rings
    orbitRadii.forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Central galaxy glow
    const glowR = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
    glowR.addColorStop(0, "rgba(180,140,255,0.55)");
    glowR.addColorStop(0.4, "rgba(100,80,200,0.25)");
    glowR.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.fillStyle = glowR;
    ctx.fill();

    // Central galaxy core
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#e8d5ff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Level stars
    LEVELS.forEach((level, i) => {
      const angle = orbitAngles.current[i];
      const r = orbitRadii[i];
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;

      const isHovered = hoveredLevel === level.id;
      const starR = isHovered ? 13 : 9;

      // Glow
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, starR * 3.5);
      sg.addColorStop(0, level.glowColor + "99");
      sg.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(sx, sy, starR * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();

      // Star body
      ctx.beginPath();
      ctx.arc(sx, sy, starR, 0, Math.PI * 2);
      ctx.fillStyle = level.starColor;
      ctx.fill();

      if (isHovered) {
        ctx.beginPath();
        ctx.arc(sx, sy, starR + 3, 0, Math.PI * 2);
        ctx.strokeStyle = level.glowColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    animRef.current = requestAnimationFrame(drawOrbits);
  }, [hoveredLevel]);

  useEffect(() => {
    if (phase !== "levels") return;
    animRef.current = requestAnimationFrame(drawOrbits);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, drawOrbits]);

  // Canvas mouse interaction
  const handleCanvasClick = useCallback((e) => {
    if (phase !== "levels") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const orbitRadii = [90, 145, 200, 255, 310];

    for (let i = 0; i < LEVELS.length; i++) {
      const angle = orbitAngles.current[i];
      const r = orbitRadii[i];
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      const dist = Math.hypot(mx - sx, my - sy);
      if (dist < 22) {
        setSelectedLevel(LEVELS[i]);
        return;
      }
    }
  }, [phase]);

  const handleCanvasMove = useCallback((e) => {
    if (phase !== "levels") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const orbitRadii = [90, 145, 200, 255, 310];

    let found = null;
    for (let i = 0; i < LEVELS.length; i++) {
      const angle = orbitAngles.current[i];
      const r = orbitRadii[i];
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      if (Math.hypot(mx - sx, my - sy) < 22) { found = LEVELS[i].id; break; }
    }
    setHoveredLevel(found);
    canvas.style.cursor = found ? "pointer" : "default";
  }, [phase]);

  const handlePlay = () => {
    setPhase("zooming");
    setTimeout(() => setPhase("levels"), 1200);
  };

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#03020a",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", position: "relative", fontFamily: "'Georgia', serif",
    }}>
      {/* Background star field */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          {bgStars.map(s => (
            <style key={s.id}>{`
              @keyframes tw${s.id} {
                0%,100%{opacity:${s.opacity}}
                50%{opacity:${Math.max(0.05, s.opacity - 0.3)}}
              }
            `}</style>
          ))}
        </defs>
        {bgStars.map(s => (
          <circle
            key={s.id}
            cx={`${s.x}%`} cy={`${s.y}%`}
            r={s.r} fill="white"
            style={{ animation: `tw${s.id} ${s.twinkleDur}s ${s.twinkleDelay}s infinite` }}
          />
        ))}
      </svg>

      {/* Subtle nebula blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", left: "5%", top: "10%", background: "radial-gradient(circle, rgba(80,20,140,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", right: "8%", bottom: "5%", background: "radial-gradient(circle, rgba(20,60,120,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", left: "40%", top: "50%", background: "radial-gradient(circle, rgba(120,40,80,0.1) 0%, transparent 70%)" }} />
      </div>

      {/* ── LANDING PHASE ── */}
      {(phase === "landing" || phase === "zooming") && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          animation: phase === "zooming" ? "zoomIntoCore 1.3s cubic-bezier(0.4,0,1,1) forwards" : "none",
        }}>
          <style>{`
            @keyframes fadeInDown { from{opacity:0;transform:translateY(-28px)} to{opacity:1;transform:translateY(0)} }
            @keyframes fadeInUp   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
            @keyframes zoomIntoCore {
              0%   { transform: scale(1);    opacity: 1; }
              60%  { transform: scale(2.8);  opacity: 1; }
              100% { transform: scale(7);    opacity: 0; }
            }
            @keyframes coreBreath {
              0%,100% { transform: translate(-50%,-50%) scale(1);   opacity: 0.85; }
              50%      { transform: translate(-50%,-50%) scale(1.12); opacity: 1;    }
            }
            @keyframes playPulse {
              0%,100% { box-shadow: 0 0 0 0 rgba(255,220,150,0.0), 0 0 30px 6px rgba(255,200,100,0.35); }
              50%     { box-shadow: 0 0 0 18px rgba(255,220,150,0.0), 0 0 50px 16px rgba(255,200,100,0.55); }
            }
            @keyframes playRise {
              from { opacity:0; transform: translate(-50%,-50%) scale(0.5); }
              to   { opacity:1; transform: translate(-50%,-50%) scale(1); }
            }
            @keyframes orbitReveal  { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
            @keyframes levelFadeIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
            @keyframes subtitleBlink { 0%,100%{opacity:0.55} 50%{opacity:0.9} }
          `}</style>

          {/* Title — top of galaxy */}
          <div style={{
            position: "absolute",
            top: "clamp(32px, 8vh, 72px)",
            left: "50%", transform: "translateX(-50%)",
            textAlign: "center", zIndex: 20,
            animation: "fadeInDown 1.4s ease both",
            pointerEvents: "none",
          }}>
            <h1 style={{
              margin: 0,
              fontSize: "clamp(2.6rem, 7vw, 5.8rem)",
              fontWeight: 400,
              letterSpacing: "0.18em",
              color: "#fdf6e3",
              fontFamily: "'Georgia', serif",
              textShadow: `
                0 0 20px rgba(255,230,160,0.9),
                0 0 50px rgba(255,200,100,0.6),
                0 0 100px rgba(200,140,60,0.35)
              `,
            }}>
              RE-PLAN-IT
            </h1>
            <p style={{
              margin: "8px 0 0",
              fontSize: "clamp(0.75rem, 1.8vw, 1rem)",
              color: "rgba(255,230,180,0.55)",
              letterSpacing: "0.28em",
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              animation: "subtitleBlink 5s ease-in-out infinite",
            }}>
              find a new world. save your species.
            </p>
          </div>

          {/* Galaxy image — full screen, centered */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img
              src={GALAXY_IMG}
              alt="galaxy"
              style={{
                width: "min(100vw, 160vh)",
                height: "auto",
                objectFit: "contain",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Bright core overlay — pulses to make it feel alive */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: "clamp(60px,10vw,120px)",
            height: "clamp(60px,10vw,120px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,240,200,0.55) 0%, transparent 70%)",
            animation: "coreBreath 4s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 5,
          }} />

          {/* Play button — emerges from galaxy core */}
          {phase === "landing" && (
            <button
              onClick={handlePlay}
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 30,
                background: "rgba(8,4,20,0.65)",
                border: "1px solid rgba(255,220,140,0.6)",
                color: "#fdf0cc",
                width: "clamp(80px,12vw,110px)",
                height: "clamp(80px,12vw,110px)",
                borderRadius: "50%",
                fontSize: "clamp(0.7rem,1.4vw,0.88rem)",
                letterSpacing: "0.22em",
                cursor: "pointer",
                fontFamily: "'Georgia', serif",
                transition: "all 0.3s ease",
                animation: "playRise 1.6s 0.4s cubic-bezier(0.34,1.56,0.64,1) both, playPulse 3s 2s ease-in-out infinite",
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,200,80,0.18)";
                e.currentTarget.style.borderColor = "rgba(255,230,160,0.95)";
                e.currentTarget.style.boxShadow = "0 0 60px 20px rgba(255,200,80,0.5), inset 0 0 30px rgba(255,180,60,0.15)";
                e.currentTarget.style.transform = "translate(-50%,-50%) scale(1.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(8,4,20,0.65)";
                e.currentTarget.style.borderColor = "rgba(255,220,140,0.6)";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.transform = "translate(-50%,-50%) scale(1)";
              }}
            >
              PLAY
            </button>
          )}
        </div>
      )}

      {/* ── LEVELS PHASE ── */}
      {phase === "levels" && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          animation: "orbitReveal 0.8s ease both",
          position: "relative", zIndex: 10, width: "100%", maxWidth: 900,
          padding: "0 20px",
        }}>
          <style>{`
            @keyframes orbitReveal { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
          `}</style>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{
              margin: 0, fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 400,
              color: "#f0eaff", letterSpacing: "0.18em",
              textShadow: "0 0 30px rgba(180,140,255,0.4)",
              fontFamily: "'Georgia', serif",
            }}>
              CHOOSE YOUR STAR SYSTEM
            </h2>
            <p style={{
              margin: "8px 0 0", color: "rgba(200,185,230,0.5)",
              fontSize: "0.8rem", letterSpacing: "0.2em", fontStyle: "italic",
              fontFamily: "'Georgia', serif",
            }}>
              5 star systems await — find the habitable world
            </p>
          </div>

          {/* Canvas + level info row */}
          <div style={{ display: "flex", alignItems: "center", gap: 40, width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
            {/* Orbit canvas */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <canvas
                ref={canvasRef}
                width={680} height={680}
                style={{ width: "min(680px, 90vw)", height: "min(680px, 90vw)", display: "block" }}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMove}
                onMouseLeave={() => setHoveredLevel(null)}
              />
            </div>
          </div>

          {/* Level legend below */}
          <div style={{
            display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
            marginTop: 20,
          }}>
            {LEVELS.map((level, i) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level)}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{
                  background: hoveredLevel === level.id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${hoveredLevel === level.id ? level.glowColor + "80" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 6, padding: "10px 16px",
                  cursor: "pointer", transition: "all 0.25s ease",
                  display: "flex", alignItems: "center", gap: 10,
                  animation: `levelFadeIn 0.5s ${i * 0.1}s both`,
                  boxShadow: hoveredLevel === level.id ? `0 0 20px ${level.glowColor}30` : "none",
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: level.starColor,
                  boxShadow: `0 0 8px 2px ${level.glowColor}`,
                  flexShrink: 0,
                }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "#e8d8ff", fontSize: "0.8rem", letterSpacing: "0.1em", fontFamily: "'Georgia',serif" }}>
                    {level.name}
                  </div>
                  <div style={{ color: "rgba(200,185,230,0.45)", fontSize: "0.68rem", letterSpacing: "0.08em" }}>
                    {level.type}
                  </div>
                </div>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 600,
                  color: level.diffColor, letterSpacing: "0.08em",
                  marginLeft: 4, opacity: 0.9,
                }}>
                  {level.difficulty}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setPhase("landing")}
            style={{
              marginTop: 20, background: "transparent", border: "none",
              color: "rgba(200,180,240,0.35)", cursor: "pointer",
              fontSize: "0.75rem", letterSpacing: "0.2em",
              fontFamily: "'Georgia',serif", transition: "color 0.2s",
            }}
            onMouseEnter={e => e.target.style.color = "rgba(200,180,240,0.7)"}
            onMouseLeave={e => e.target.style.color = "rgba(200,180,240,0.35)"}
          >
            ← back to galaxy
          </button>
        </div>
      )}

      {/* ── LEVEL MODAL ── */}
      {selectedLevel && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 50,
            background: "rgba(2,1,14,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeInUp 0.3s ease both",
          }}
          onClick={() => setSelectedLevel(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(12,8,30,0.97)",
              border: `1px solid ${selectedLevel.glowColor}50`,
              borderRadius: 12, padding: "36px 44px",
              maxWidth: 420, width: "90%", textAlign: "center",
              boxShadow: `0 0 60px ${selectedLevel.glowColor}25`,
              animation: "fadeInUp 0.3s ease both",
            }}
          >
            {/* Star visual */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: `radial-gradient(circle, ${selectedLevel.starColor} 30%, ${selectedLevel.glowColor}66 70%, transparent 100%)`,
              margin: "0 auto 20px",
              boxShadow: `0 0 30px 10px ${selectedLevel.glowColor}55`,
            }} />
            <div style={{
              fontSize: "0.7rem", letterSpacing: "0.3em",
              color: selectedLevel.glowColor, marginBottom: 6, opacity: 0.8,
            }}>
              {selectedLevel.type.toUpperCase()}
            </div>
            <h3 style={{
              margin: "0 0 6px", fontSize: "1.8rem", fontWeight: 400,
              color: "#f0eaff", letterSpacing: "0.1em",
              fontFamily: "'Georgia',serif",
              textShadow: `0 0 20px ${selectedLevel.glowColor}80`,
            }}>
              {selectedLevel.name}
            </h3>
            <div style={{
              display: "inline-block", fontSize: "0.72rem",
              color: selectedLevel.diffColor, letterSpacing: "0.15em",
              border: `1px solid ${selectedLevel.diffColor}40`,
              padding: "3px 12px", borderRadius: 99, marginBottom: 24,
            }}>
              {selectedLevel.difficulty.toUpperCase()}
            </div>

            <div style={{
              color: "rgba(200,185,230,0.55)", fontSize: "0.88rem",
              lineHeight: 1.7, marginBottom: 32, fontStyle: "italic",
            }}>
              An alien species awaits relocation. Study the planets carefully —
              their needs are hidden in riddles, not requirements.
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                style={{
                  background: `linear-gradient(135deg, ${selectedLevel.glowColor}33, ${selectedLevel.glowColor}11)`,
                  border: `1px solid ${selectedLevel.glowColor}70`,
                  color: "#f0eaff", padding: "12px 36px",
                  fontSize: "0.85rem", letterSpacing: "0.2em",
                  cursor: "pointer", borderRadius: 4,
                  fontFamily: "'Georgia',serif",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={e => {
                  e.target.style.background = `linear-gradient(135deg, ${selectedLevel.glowColor}55, ${selectedLevel.glowColor}22)`;
                  e.target.style.boxShadow = `0 0 25px ${selectedLevel.glowColor}40`;
                }}
                onMouseLeave={e => {
                  e.target.style.background = `linear-gradient(135deg, ${selectedLevel.glowColor}33, ${selectedLevel.glowColor}11)`;
                  e.target.style.boxShadow = "none";
                }}
              >
                ENTER SYSTEM
              </button>
              <button
                onClick={() => setSelectedLevel(null)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(200,180,240,0.5)", padding: "12px 24px",
                  fontSize: "0.85rem", letterSpacing: "0.15em",
                  cursor: "pointer", borderRadius: 4,
                  fontFamily: "'Georgia',serif", transition: "all 0.2s",
                }}
                onMouseEnter={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
