import { useState, useEffect, useRef, useCallback } from "react";

const GALAXY_IMG = "src/pages/home/galaxy.jpeg";

const NUM_STARS_BG = 180;
const LEVELS = [
  {
    id: 1, name: "Sol Prime",   starColor: "#FFF4C2", glowColor: "#FFD700",
    type: "Sun-like",     difficulty: "Tutorial",  diffColor: "#4ade80", angle: 270,
    desc: "A warm, stable yellow star — perfect for beginners. Life here is comfortable, almost too comfortable. Find the planet before complacency sets in.",
  },
  {
    id: 2, name: "Emberveil",   starColor: "#FFB347", glowColor: "#FF6B35",
    type: "Red Dwarf",    difficulty: "Medium",    diffColor: "#facc15", angle: 342,
    desc: "A dim crimson ember that burns slow and long. Its planets are tidally locked — one side scorched, one frozen. Survival is a matter of finding the edge.",
  },
  {
    id: 3, name: "Twin Hollow", starColor: "#B8E0FF", glowColor: "#60A5FA",
    type: "Binary",       difficulty: "Hard",      diffColor: "#fb923c", angle: 54,
    desc: "Two stars locked in a gravitational dance. Orbits here are chaotic, seasons are violent. Only the most adaptable species will endure.",
  },
  {
    id: 4, name: "Voltmere",    starColor: "#C4BFFF", glowColor: "#818CF8",
    type: "Blue Giant",   difficulty: "Very Hard", diffColor: "#f87171", angle: 126,
    desc: "A colossal blue giant blazing with furious radiation. Its planets exist in a knife-edge habitable zone that shifts without warning.",
  },
  {
    id: 5, name: "The Remnant", starColor: "#E0E0E0", glowColor: "#A0A0B0",
    type: "Neutron Star",  difficulty: "Boss",      diffColor: "#e879f9", angle: 198,
    desc: "The corpse of a once-great star. Dense, silent, deadly. Whatever orbits here defies all logic — and all hope. Only legends dare attempt this system.",
  },
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

export default function Home() {
  const [phase, setPhase] = useState("landing");
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { level, x, y }
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const orbitAngles = useRef(LEVELS.map(l => (l.angle * Math.PI) / 180));
  const lastTime = useRef(null);
  // Store live star positions for tooltip placement
  const starPositions = useRef([]);

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

    // Orbit rings
    orbitRadii.forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Central galaxy glow
    const glowR = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    glowR.addColorStop(0, "rgba(255,220,140,0.7)");
    glowR.addColorStop(0.3, "rgba(180,140,255,0.35)");
    glowR.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fillStyle = glowR;
    ctx.fill();

    // Central core dot
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#fff8e7";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Stars + number labels
    const positions = [];
    LEVELS.forEach((level, i) => {
      const angle = orbitAngles.current[i];
      const r = orbitRadii[i];
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      const isHovered = hoveredLevel === level.id;
      const starR = isHovered ? 15 : 10;

      positions.push({ sx, sy, level });

      // Outer glow
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, starR * 4);
      sg.addColorStop(0, level.glowColor + (isHovered ? "cc" : "88"));
      sg.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(sx, sy, starR * 4, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();

      // Star body
      ctx.beginPath();
      ctx.arc(sx, sy, starR, 0, Math.PI * 2);
      ctx.fillStyle = level.starColor;
      ctx.fill();

      // Hover ring
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(sx, sy, starR + 4, 0, Math.PI * 2);
        ctx.strokeStyle = level.glowColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Number badge above star
      const numX = sx;
      const numY = sy - starR - 14;
      ctx.font = `bold ${isHovered ? 13 : 11}px 'Georgia', serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Badge background
      ctx.beginPath();
      ctx.arc(numX, numY, isHovered ? 10 : 8, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? level.glowColor + "cc" : "rgba(10,5,30,0.85)";
      ctx.fill();
      ctx.strokeStyle = level.glowColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      // Number text
      ctx.fillStyle = isHovered ? "#fff" : level.starColor;
      ctx.fillText(String(level.id), numX, numY);
    });

    starPositions.current = positions;
    animRef.current = requestAnimationFrame(drawOrbits);
  }, [hoveredLevel]);

  useEffect(() => {
    if (phase !== "levels") return;
    animRef.current = requestAnimationFrame(drawOrbits);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, drawOrbits]);

  const getStarAtMouse = useCallback((e) => {
    if (phase !== "levels" || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const orbitRadii = [90, 145, 200, 255, 310];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < LEVELS.length; i++) {
      const angle = orbitAngles.current[i];
      const r = orbitRadii[i];
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      if (Math.hypot(mx - sx, my - sy) < 26) return { level: LEVELS[i], canvasX: sx, canvasY: sy };
    }
    return null;
  }, [phase]);

  const handleCanvasClick = useCallback((e) => {
    const hit = getStarAtMouse(e);
    if (hit) setSelectedLevel(hit.level);
  }, [getStarAtMouse]);

  const handleCanvasMove = useCallback((e) => {
    const hit = getStarAtMouse(e);
    if (hit) {
      setHoveredLevel(hit.level.id);
      canvasRef.current.style.cursor = "pointer";
      // Convert canvas coords to screen coords for tooltip
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      setTooltip({
        level: hit.level,
        x: rect.left + hit.canvasX * scaleX,
        y: rect.top + hit.canvasY * scaleY,
      });
    } else {
      setHoveredLevel(null);
      setTooltip(null);
      if (canvasRef.current) canvasRef.current.style.cursor = "default";
    }
  }, [getStarAtMouse]);

  const handlePlay = () => {
    setPhase("zooming");
    setTimeout(() => setPhase("levels"), 1400);
  };

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#03020a",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", position: "relative", fontFamily: "'Georgia', serif",
    }}>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes fadeInDown  { from{opacity:0;transform:translateY(-24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp    { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes galaxyZoom  {
          0%   { transform:translate(-50%,-50%) scale(1);    opacity:1; }
          55%  { transform:translate(-50%,-50%) scale(4);    opacity:1; }
          100% { transform:translate(-50%,-50%) scale(12);   opacity:0; }
        }
        @keyframes galaxySpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes galaxyBreath {
          0%,100% { transform:scale(1);   filter:brightness(1); }
          50%      { transform:scale(1.04); filter:brightness(1.15); }
        }
        @keyframes playPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(255,220,150,0), 0 0 40px 8px rgba(255,200,100,0.3); }
          50%     { box-shadow:0 0 0 24px rgba(255,220,150,0), 0 0 70px 20px rgba(255,200,100,0.5); }
        }
        @keyframes playRise {
          from { opacity:0; transform:translate(-50%,-50%) scale(0.4); }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }
        @keyframes orbitReveal { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes levelFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes subtitleBlink { 0%,100%{opacity:0.5} 50%{opacity:0.9} }
        @keyframes tooltipIn { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes bgLanding {
          0%   { opacity:0; }
          100% { opacity:1; }
        }
      `}</style>

      {/* ── Background stars ── */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
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
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white"
            style={{ animation:`tw${s.id} ${s.twinkleDur}s ${s.twinkleDelay}s infinite` }}
          />
        ))}
      </svg>

      {/* ── Nebula blobs ── */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", left:"5%",  top:"5%",   background:"radial-gradient(circle, rgba(80,20,140,0.2) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", right:"5%", bottom:"5%",background:"radial-gradient(circle, rgba(20,60,130,0.18) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", left:"38%", top:"45%",  background:"radial-gradient(circle, rgba(110,30,70,0.12) 0%, transparent 70%)" }} />
      </div>

      {/* ══════════════════════════════════════════
          LANDING / ZOOMING PHASE
      ══════════════════════════════════════════ */}
      {(phase === "landing" || phase === "zooming") && (
        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
        }}>
          {/* Centered title block */}
          <div style={{
            position:"absolute",
            top:"clamp(28px,7vh,64px)",
            left:0, right:0,
            display:"flex", flexDirection:"column", alignItems:"center",
            textAlign:"center", zIndex:20, pointerEvents:"none",
            animation:"fadeInDown 1.4s ease both",
          }}>
            <h1 style={{
              margin:0,
              fontSize:"clamp(2.8rem,7vw,5.6rem)",
              fontWeight:400, letterSpacing:"0.2em",
              color:"#fdf6e3", fontFamily:"'Georgia',serif",
              textShadow:`
                0 0 20px rgba(255,230,160,0.95),
                0 0 55px rgba(255,200,100,0.65),
                0 0 110px rgba(200,140,60,0.35)
              `,
            }}>
              RE-PLAN-IT
            </h1>
            <p style={{
              margin:"10px 0 0",
              fontSize:"clamp(0.75rem,1.8vw,1rem)",
              color:"rgba(255,230,180,0.55)", letterSpacing:"0.3em",
              fontFamily:"'Georgia',serif", fontStyle:"italic",
              animation:"subtitleBlink 5s ease-in-out infinite",
            }}>
              find a new world. save your species.
            </p>
          </div>

          {/* ── Galaxy image — the play button ── */}
          <div
            onClick={phase === "landing" ? handlePlay : undefined}
            style={{
              position:"absolute",
              top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:"clamp(220px,38vw,480px)",
              height:"clamp(220px,38vw,480px)",
              cursor: phase === "landing" ? "pointer" : "default",
              zIndex:10,
              animation: phase === "zooming"
                ? "galaxyZoom 1.4s cubic-bezier(0.4,0,1,1) forwards"
                : "playRise 1.6s 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {/* Breathing glow ring behind image */}
            <div style={{
              position:"absolute", inset:"-12%",
              borderRadius:"50%",
              background:"radial-gradient(circle, rgba(255,210,100,0.25) 0%, rgba(180,120,255,0.12) 50%, transparent 75%)",
              animation: phase === "landing" ? "galaxyBreath 4s ease-in-out infinite" : "none",
              pointerEvents:"none",
            }} />

            {/* The galaxy image itself */}
            <img
              src={GALAXY_IMG}
              alt="galaxy — click to play"
              draggable={false}
              style={{
                width:"100%", height:"100%",
                objectFit:"contain",
                borderRadius:"50%",
                display:"block",
                userSelect:"none",
                animation: phase === "landing"
                  ? "galaxyBreath 4s ease-in-out infinite, playPulse 3s 2s ease-in-out infinite"
                  : "none",
                filter:"brightness(1.05) contrast(1.05)",
              }}
            />

            {/* PLAY label in the centre of the galaxy */}
            {phase === "landing" && (
              <div style={{
                position:"absolute", top:"50%", left:"50%",
                transform:"translate(-50%,-50%)",
                color:"#fdf0cc",
                fontSize:"clamp(0.7rem,1.5vw,1rem)",
                letterSpacing:"0.3em",
                fontFamily:"'Georgia',serif",
                textShadow:"0 0 12px rgba(255,210,100,0.9), 0 0 30px rgba(255,170,60,0.6)",
                pointerEvents:"none",
                userSelect:"none",
              }}>
                PLAY
              </div>
            )}
          </div>

          {/* Bottom hint */}
          {phase === "landing" && (
            <p style={{
              position:"absolute",
              bottom:"clamp(20px,5vh,48px)",
              left:0, right:0,
              textAlign:"center",
              margin:0,
              color:"rgba(255,220,160,0.3)",
              fontSize:"0.7rem", letterSpacing:"0.25em",
              fontFamily:"'Georgia',serif",
              animation:"subtitleBlink 3s ease-in-out infinite",
              pointerEvents:"none",
            }}>
              click the galaxy to begin
            </p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          LEVELS PHASE
      ══════════════════════════════════════════ */}
      {phase === "levels" && (
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center",
          animation:"orbitReveal 0.9s cubic-bezier(0.34,1.2,0.64,1) both",
          position:"relative", zIndex:10,
          width:"100%", maxWidth:960,
          padding:"16px 20px 8px",
        }}>
          {/* Header — centered */}
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <h2 style={{
              margin:0, fontSize:"clamp(1.4rem,3.5vw,2.2rem)", fontWeight:400,
              color:"#f0eaff", letterSpacing:"0.2em",
              textShadow:"0 0 30px rgba(180,140,255,0.45)", fontFamily:"'Georgia',serif",
            }}>
              CHOOSE YOUR STAR SYSTEM
            </h2>
            <p style={{
              margin:"6px 0 0", color:"rgba(200,185,230,0.5)",
              fontSize:"0.78rem", letterSpacing:"0.22em",
              fontStyle:"italic", fontFamily:"'Georgia',serif",
            }}>
              5 star systems await — find the habitable world
            </p>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={680} height={680}
            style={{ width:"min(660px,88vw)", height:"min(660px,88vw)", display:"block" }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => { setHoveredLevel(null); setTooltip(null); }}
          />

          {/* ── Numbered legend ── */}
          <div style={{
            display:"flex", gap:10, flexWrap:"wrap",
            justifyContent:"center", marginTop:18,
          }}>
            {LEVELS.map((level, i) => {
              const active = hoveredLevel === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level)}
                  onMouseEnter={() => setHoveredLevel(level.id)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  style={{
                    background: active ? `rgba(255,255,255,0.07)` : "rgba(255,255,255,0.03)",
                    border:`1.5px solid ${active ? level.glowColor + "aa" : "rgba(255,255,255,0.14)"}`,
                    borderRadius:8, padding:"9px 16px",
                    cursor:"pointer", transition:"all 0.22s ease",
                    display:"flex", alignItems:"center", gap:10,
                    animation:`levelFadeIn 0.45s ${i * 0.08}s both`,
                    boxShadow: active ? `0 0 22px ${level.glowColor}35` : "none",
                  }}
                >
                  {/* Number badge */}
                  <div style={{
                    width:22, height:22, borderRadius:"50%", flexShrink:0,
                    background: active ? level.glowColor : "rgba(10,5,30,0.9)",
                    border:`1.5px solid ${level.glowColor}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow: active ? `0 0 10px ${level.glowColor}88` : "none",
                    transition:"all 0.22s ease",
                  }}>
                    <span style={{
                      color: active ? "#000" : level.starColor,
                      fontSize:"0.7rem", fontWeight:700,
                      fontFamily:"'Georgia',serif",
                    }}>{level.id}</span>
                  </div>

                  {/* Star dot */}
                  <div style={{
                    width:9, height:9, borderRadius:"50%", flexShrink:0,
                    background:level.starColor,
                    boxShadow:`0 0 8px 2px ${level.glowColor}`,
                  }} />

                  {/* Name + type */}
                  <div style={{ textAlign:"left" }}>
                    <div style={{
                      color: active ? "#fff" : "#ddd0ff",
                      fontSize:"0.82rem", letterSpacing:"0.1em",
                      fontFamily:"'Georgia',serif", fontWeight: active ? 600 : 400,
                      transition:"color 0.2s",
                    }}>
                      {level.name}
                    </div>
                    <div style={{ color:"rgba(200,185,230,0.45)", fontSize:"0.67rem", letterSpacing:"0.08em" }}>
                      {level.type}
                    </div>
                  </div>

                  {/* Difficulty badge */}
                  <span style={{
                    fontSize:"0.63rem", fontWeight:700,
                    color: level.diffColor, letterSpacing:"0.08em",
                    marginLeft:2, opacity: active ? 1 : 0.75,
                    background:`${level.diffColor}18`,
                    border:`1px solid ${level.diffColor}44`,
                    padding:"2px 7px", borderRadius:99,
                    transition:"opacity 0.2s",
                  }}>
                    {level.difficulty.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Back link */}
          <button
            onClick={() => { setPhase("landing"); setTooltip(null); setHoveredLevel(null); }}
            style={{
              marginTop:16, background:"transparent", border:"none",
              color:"rgba(200,180,240,0.3)", cursor:"pointer",
              fontSize:"0.72rem", letterSpacing:"0.22em",
              fontFamily:"'Georgia',serif", transition:"color 0.2s",
            }}
            onMouseEnter={e => e.target.style.color = "rgba(200,180,240,0.7)"}
            onMouseLeave={e => e.target.style.color = "rgba(200,180,240,0.3)"}
          >
            ← back to galaxy
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CANVAS HOVER TOOLTIP
      ══════════════════════════════════════════ */}
      {tooltip && phase === "levels" && (
        <div style={{
          position:"fixed",
          left: tooltip.x,
          top: tooltip.y - 16,
          transform:"translateX(-50%) translateY(-100%)",
          zIndex:100, pointerEvents:"none",
          animation:"tooltipIn 0.2s ease both",
          maxWidth:240,
        }}>
          <div style={{
            background:"rgba(8,4,24,0.97)",
            border:`1px solid ${tooltip.level.glowColor}60`,
            borderRadius:10, padding:"14px 18px",
            boxShadow:`0 0 30px ${tooltip.level.glowColor}30, 0 8px 32px rgba(0,0,0,0.6)`,
            textAlign:"center",
          }}>
            {/* Star glow dot */}
            <div style={{
              width:28, height:28, borderRadius:"50%", margin:"0 auto 10px",
              background:`radial-gradient(circle, ${tooltip.level.starColor} 25%, ${tooltip.level.glowColor}66 70%, transparent 100%)`,
              boxShadow:`0 0 14px 4px ${tooltip.level.glowColor}66`,
            }} />
            {/* Number + name */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginBottom:4 }}>
              <span style={{
                width:18, height:18, borderRadius:"50%",
                background:tooltip.level.glowColor,
                color:"#000", fontSize:"0.62rem", fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Georgia',serif", flexShrink:0,
              }}>{tooltip.level.id}</span>
              <span style={{
                color:"#f0eaff", fontSize:"0.9rem", fontWeight:400,
                letterSpacing:"0.12em", fontFamily:"'Georgia',serif",
                textShadow:`0 0 12px ${tooltip.level.glowColor}80`,
              }}>{tooltip.level.name}</span>
            </div>
            {/* Type pill */}
            <div style={{
              color:tooltip.level.glowColor, fontSize:"0.62rem",
              letterSpacing:"0.2em", marginBottom:8, opacity:0.8,
            }}>
              {tooltip.level.type.toUpperCase()}
            </div>
            {/* Difficulty */}
            <span style={{
              display:"inline-block",
              fontSize:"0.6rem", fontWeight:700,
              color:tooltip.level.diffColor, letterSpacing:"0.12em",
              border:`1px solid ${tooltip.level.diffColor}44`,
              padding:"2px 9px", borderRadius:99, marginBottom:10,
              background:`${tooltip.level.diffColor}12`,
            }}>
              {tooltip.level.difficulty.toUpperCase()}
            </span>
            {/* Description */}
            <p style={{
              margin:0, color:"rgba(200,185,230,0.65)",
              fontSize:"0.75rem", lineHeight:1.65,
              fontStyle:"italic", fontFamily:"'Georgia',serif",
            }}>
              {tooltip.level.desc}
            </p>
            {/* Click hint */}
            <p style={{
              margin:"10px 0 0", color:"rgba(200,180,240,0.35)",
              fontSize:"0.62rem", letterSpacing:"0.18em",
            }}>
              click to enter
            </p>
          </div>
          {/* Tooltip arrow */}
          <div style={{
            width:0, height:0,
            borderLeft:"8px solid transparent",
            borderRight:"8px solid transparent",
            borderTop:`8px solid ${tooltip.level.glowColor}60`,
            margin:"0 auto",
          }} />
        </div>
      )}

      {/* ══════════════════════════════════════════
          LEVEL MODAL
      ══════════════════════════════════════════ */}
      {selectedLevel && (
        <div
          style={{
            position:"absolute", inset:0, zIndex:50,
            background:"rgba(2,1,14,0.88)",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"fadeInUp 0.3s ease both",
          }}
          onClick={() => setSelectedLevel(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:"rgba(10,6,28,0.98)",
              border:`1px solid ${selectedLevel.glowColor}55`,
              borderRadius:14, padding:"40px 48px",
              maxWidth:440, width:"90%", textAlign:"center",
              boxShadow:`0 0 70px ${selectedLevel.glowColor}22, 0 20px 60px rgba(0,0,0,0.7)`,
              animation:"fadeInUp 0.3s ease both",
            }}
          >
            {/* Star visual */}
            <div style={{
              width:70, height:70, borderRadius:"50%",
              background:`radial-gradient(circle, ${selectedLevel.starColor} 28%, ${selectedLevel.glowColor}66 68%, transparent 100%)`,
              margin:"0 auto 22px",
              boxShadow:`0 0 35px 12px ${selectedLevel.glowColor}55`,
            }} />

            {/* Number + type */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:6 }}>
              <div style={{
                width:24, height:24, borderRadius:"50%",
                background:selectedLevel.glowColor,
                color:"#000", fontSize:"0.75rem", fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Georgia',serif",
              }}>{selectedLevel.id}</div>
              <div style={{ fontSize:"0.72rem", letterSpacing:"0.28em", color:selectedLevel.glowColor, opacity:0.85 }}>
                {selectedLevel.type.toUpperCase()}
              </div>
            </div>

            <h3 style={{
              margin:"0 0 8px", fontSize:"2rem", fontWeight:400,
              color:"#f0eaff", letterSpacing:"0.12em", fontFamily:"'Georgia',serif",
              textShadow:`0 0 24px ${selectedLevel.glowColor}88`,
            }}>
              {selectedLevel.name}
            </h3>

            <div style={{
              display:"inline-block", fontSize:"0.72rem",
              color:selectedLevel.diffColor, letterSpacing:"0.15em",
              border:`1px solid ${selectedLevel.diffColor}44`,
              padding:"3px 14px", borderRadius:99, marginBottom:20,
              background:`${selectedLevel.diffColor}10`,
            }}>
              {selectedLevel.difficulty.toUpperCase()}
            </div>

            <p style={{
              color:"rgba(200,185,230,0.6)", fontSize:"0.88rem",
              lineHeight:1.75, marginBottom:32, fontStyle:"italic",
              margin:"0 0 32px",
            }}>
              {selectedLevel.desc}
            </p>

            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button
                style={{
                  background:`linear-gradient(135deg, ${selectedLevel.glowColor}33, ${selectedLevel.glowColor}11)`,
                  border:`1px solid ${selectedLevel.glowColor}77`,
                  color:"#f0eaff", padding:"12px 38px",
                  fontSize:"0.85rem", letterSpacing:"0.2em",
                  cursor:"pointer", borderRadius:5, fontFamily:"'Georgia',serif",
                  transition:"all 0.25s ease",
                }}
                onMouseEnter={e => {
                  e.target.style.background = `linear-gradient(135deg, ${selectedLevel.glowColor}55, ${selectedLevel.glowColor}22)`;
                  e.target.style.boxShadow = `0 0 28px ${selectedLevel.glowColor}44`;
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
                  background:"transparent",
                  border:"1px solid rgba(255,255,255,0.13)",
                  color:"rgba(200,180,240,0.5)", padding:"12px 24px",
                  fontSize:"0.85rem", letterSpacing:"0.15em",
                  cursor:"pointer", borderRadius:5, fontFamily:"'Georgia',serif",
                  transition:"all 0.2s",
                }}
                onMouseEnter={e => e.target.style.borderColor = "rgba(255,255,255,0.32)"}
                onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.13)"}
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
