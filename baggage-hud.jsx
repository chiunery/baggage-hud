import { useState, useEffect, useRef } from "react";

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');`;

// ─── Bag Counter Feature ────────────────────────────────────────────────
function BagCounter() {
  const [count, setCount] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [scanLine, setScanLine] = useState(0);
  const target = 107;

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setScanLine((p) => (p + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, [scanning]);

  useEffect(() => {
    if (count >= target) { setScanning(false); return; }
    const t = setTimeout(() => setCount((c) => Math.min(c + Math.floor(Math.random() * 4) + 1, target)), 60);
    return () => clearTimeout(t);
  }, [count]);

  const bags = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 12 + (i % 5) * 18,
    y: 18 + Math.floor(i / 5) * 22,
    scanned: i < Math.floor((count / target) * 20),
    size: 0.7 + Math.random() * 0.6,
  }));

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Scan overlay */}
      {scanning && (
        <div style={{
          position: "absolute", left: "5%", top: "5%", width: "90%", height: "65%",
          border: "1px solid rgba(0,255,200,0.4)", borderRadius: 4,
          overflow: "hidden", pointerEvents: "none", zIndex: 5,
        }}>
          <div style={{
            position: "absolute", left: 0, width: "100%", height: 2,
            background: "linear-gradient(90deg, transparent, #00ffc8, transparent)",
            top: `${scanLine}%`, transition: "top 0.03s linear",
            boxShadow: "0 0 12px #00ffc8",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,200,0.03) 3px, rgba(0,255,200,0.03) 4px)",
          }} />
        </div>
      )}

      {/* Cargo hold visualization */}
      <div style={{
        position: "absolute", left: "5%", top: "5%", width: "90%", height: "65%",
        border: `1px solid ${scanning ? "rgba(0,255,200,0.3)" : "rgba(0,255,200,0.6)"}`,
        borderRadius: 4, background: "rgba(0,20,30,0.7)",
      }}>
        <div style={{
          position: "absolute", top: 4, left: 8, fontSize: 9, color: "rgba(0,255,200,0.5)",
          fontFamily: "'Share Tech Mono', monospace", letterSpacing: 2,
        }}>CARGO HOLD — LOWER DECK</div>
        {/* Corner brackets */}
        {[["0%","0%"], ["0%","100%"], ["100%","0%"], ["100%","100%"]].map(([t,l],i)=>(
          <div key={i} style={{
            position:"absolute", top:t, left:l,
            width:12, height:12,
            borderTop: i<2 ? "2px solid #00ffc8" : "none",
            borderBottom: i>=2 ? "2px solid #00ffc8" : "none",
            borderLeft: i%2===0 ? "2px solid #00ffc8" : "none",
            borderRight: i%2===1 ? "2px solid #00ffc8" : "none",
            transform: i===1 ? "translateY(-100%)" : i===2 ? "translateX(-100%)" : i===3 ? "translate(-100%,-100%)" : "none",
          }}/>
        ))}
        {/* Bags */}
        <svg width="100%" height="100%" style={{position:"absolute",inset:0}}>
          {bags.map(b => (
            <g key={b.id} transform={`translate(${b.x}%,${b.y}%) scale(${b.size})`}>
              <rect x="-7" y="-6" width="14" height="12" rx="2"
                fill={b.scanned ? "rgba(0,255,200,0.15)" : "rgba(255,255,255,0.05)"}
                stroke={b.scanned ? "#00ffc8" : "rgba(255,255,255,0.2)"} strokeWidth="0.8"/>
              {b.scanned && <text x="0" y="4" textAnchor="middle" fontSize="5" fill="#00ffc8" fontFamily="'Share Tech Mono',monospace">✓</text>}
              {!b.scanned && <rect x="-3" y="-2" width="6" height="4" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>}
            </g>
          ))}
        </svg>
      </div>

      {/* Count display */}
      <div style={{
        position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 11, color: "rgba(0,255,200,0.6)", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 3, marginBottom: 4 }}>
          BAG COUNT
        </div>
        <div style={{
          fontSize: 64, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700,
          color: scanning ? "#00ffc8" : "#00ff88",
          textShadow: `0 0 20px ${scanning ? "#00ffc8" : "#00ff88"}, 0 0 40px ${scanning ? "#00ffc866" : "#00ff8866"}`,
          lineHeight: 1, letterSpacing: 4,
        }}>{String(count).padStart(3,"0")}</div>
        <div style={{
          fontSize: 10, color: scanning ? "rgba(255,200,0,0.8)" : "rgba(0,255,136,0.8)",
          fontFamily:"'Share Tech Mono',monospace", letterSpacing:2, marginTop:4
        }}>
          {scanning ? "● SCANNING..." : "● SCAN COMPLETE"}
        </div>
        <div style={{ fontSize: 10, color:"rgba(0,255,200,0.4)", fontFamily:"'Share Tech Mono',monospace", marginTop:2 }}>
          NO HANDHELD · NO LOST BAGGAGE
        </div>
      </div>
    </div>
  );
}

// ─── Zoom Tag / Barcode Scanner ─────────────────────────────────────────
function ZoomTag() {
  const [phase, setPhase] = useState("searching"); // searching → locking → locked
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("locking"), 1800);
    const t2 = setTimeout(() => { setPhase("locked"); setZoom(2.8); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const tagInfo = { dest: "TPE", flight: "CI 105", transit: "Transit Taipei", gate: "B12", weight: "23.4 kg" };

  return (
    <div style={{width:"100%",height:"100%",position:"relative"}}>
      {/* Background bag silhouette */}
      <div style={{
        position:"absolute", left:"50%", top:"35%", transform:`translate(-50%,-50%) scale(${zoom})`,
        transition:"transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
        width:120, height:90,
      }}>
        <svg width="120" height="90" viewBox="0 0 120 90">
          <rect x="10" y="20" width="100" height="65" rx="8" fill="rgba(40,60,80,0.8)" stroke="rgba(0,200,255,0.3)" strokeWidth="1.5"/>
          <rect x="40" y="12" width="40" height="16" rx="4" fill="rgba(40,60,80,0.8)" stroke="rgba(0,200,255,0.3)" strokeWidth="1.5"/>
          {/* Barcode on bag */}
          <rect x="30" y="38" width="60" height="30" rx="3" fill="rgba(0,0,0,0.6)" stroke="rgba(0,200,255,0.4)" strokeWidth="1"/>
          {[0,3,5,7,9,11,14,17,19,21,24,26,29,31,33,36,39,41,44,46,49,51,54].map((x,i)=>(
            <rect key={i} x={33+x} y="41" width={i%3===0?2:1} height="18" fill="rgba(255,255,255,0.9)"/>
          ))}
          <text x="60" y="78" textAnchor="middle" fontSize="6" fill="rgba(0,200,255,0.8)" fontFamily="'Share Tech Mono',monospace">TPE B12 CI105</text>
        </svg>
      </div>

      {/* Targeting reticle */}
      <div style={{
        position:"absolute", left:"50%", top:"35%",
        transform:"translate(-50%,-50%)",
        width: phase==="locked" ? 180 : 220,
        height: phase==="locked" ? 120 : 150,
        transition:"all 0.6s ease",
      }}>
        {/* Animated corners */}
        {["tl","tr","bl","br"].map(c => (
          <div key={c} style={{
            position:"absolute",
            top: c.startsWith("t") ? 0 : "auto", bottom: c.startsWith("b") ? 0 : "auto",
            left: c.endsWith("l") ? 0 : "auto", right: c.endsWith("r") ? 0 : "auto",
            width:20, height:20,
            borderTop: c.startsWith("t") ? `2px solid ${phase==="locked"?"#00ff88":"#00c8ff"}` : "none",
            borderBottom: c.startsWith("b") ? `2px solid ${phase==="locked"?"#00ff88":"#00c8ff"}` : "none",
            borderLeft: c.endsWith("l") ? `2px solid ${phase==="locked"?"#00ff88":"#00c8ff"}` : "none",
            borderRight: c.endsWith("r") ? `2px solid ${phase==="locked"?"#00ff88":"#00c8ff"}` : "none",
          }}/>
        ))}
        {/* Scan line */}
        {phase !== "locked" && (
          <div style={{
            position:"absolute", left:0, width:"100%", height:1,
            background:"linear-gradient(90deg,transparent,#00c8ff,transparent)",
            animation:"scanDown 1.2s linear infinite",
          }}/>
        )}
      </div>

      {/* Status badge */}
      <div style={{
        position:"absolute", top:"8%", left:"50%", transform:"translateX(-50%)",
        background:"rgba(0,10,20,0.8)", border:"1px solid rgba(0,200,255,0.3)",
        padding:"4px 16px", borderRadius:2,
        fontSize:10, fontFamily:"'Share Tech Mono',monospace",
        color: phase==="locked" ? "#00ff88" : "#00c8ff",
        letterSpacing:3,
      }}>
        {phase==="searching" && "◌ SEARCHING..."}
        {phase==="locking" && "◎ LOCKING ON..."}
        {phase==="locked" && "● TAG ACQUIRED"}
      </div>

      {/* Info panel — appears when locked */}
      {phase==="locked" && (
        <div style={{
          position:"absolute", right:"3%", top:"50%", transform:"translateY(-50%)",
          background:"rgba(0,8,16,0.92)", border:"1px solid rgba(0,255,136,0.4)",
          padding:"12px 16px", minWidth:140, borderRadius:3,
          animation:"fadeSlideIn 0.4s ease",
        }}>
          <div style={{fontSize:8,color:"rgba(0,255,136,0.5)",fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:8}}>TAG INFO</div>
          {[
            ["WHAT IT SAYS", tagInfo.transit],
            ["FLIGHT", tagInfo.flight],
            ["GATE", tagInfo.gate],
            ["WEIGHT", tagInfo.weight],
          ].map(([k,v])=>(
            <div key={k} style={{marginBottom:6}}>
              <div style={{fontSize:7,color:"rgba(0,200,255,0.5)",fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>{k}</div>
              <div style={{fontSize:14,color:"#00ff88",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:1}}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom label */}
      <div style={{
        position:"absolute", bottom:"6%", left:"50%", transform:"translateX(-50%)",
        fontSize:9, color:"rgba(0,200,255,0.4)", fontFamily:"'Share Tech Mono',monospace",
        letterSpacing:2, whiteSpace:"nowrap"
      }}>
        ZOOM TAG · AUTO TRACK · EYE SELECTION
      </div>

      <style>{`
        @keyframes scanDown { from{top:0%} to{top:100%} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateX(10px) translateY(-50%)} to{opacity:1;transform:translateX(0) translateY(-50%)} }
      `}</style>
    </div>
  );
}

// ─── Cart AR Organizer ──────────────────────────────────────────────────
const CART_ITEMS = [
  { id:1, label:"B1", type:"normal", x:10, y:30, w:22, h:18, status:"ok", weight:"18kg" },
  { id:2, label:"B2", type:"normal", x:34, y:30, w:22, h:18, status:"ok", weight:"22kg" },
  { id:3, label:"B3", type:"oversize", x:58, y:20, w:30, h:32, status:"oversize", weight:"34kg" },
  { id:4, label:"B4", type:"normal", x:10, y:52, w:22, h:18, status:"misplaced", weight:"20kg" },
  { id:5, label:"B5", type:"normal", x:34, y:52, w:22, h:18, status:"ok", weight:"19kg" },
  { id:6, label:"B6", type:"normal", x:10, y:8, w:46, h:18, status:"overweight", weight:"41kg" },
];

function CartOrganizer() {
  const [selected, setSelected] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => p+1), 1000);
    return () => clearInterval(t);
  }, []);

  const statusColor = {
    ok: "#00ff88", oversize: "#ff8800", overweight: "#ff2244", misplaced: "#ff2244"
  };
  const statusLabel = {
    ok: "FIT ✓", oversize: "OVERSIZE", overweight: "OVERWEIGHT", misplaced: "MISPLACED"
  };

  const stats = {
    ok: CART_ITEMS.filter(i=>i.status==="ok").length,
    warn: CART_ITEMS.filter(i=>i.status!=="ok").length,
  };

  const sel = CART_ITEMS.find(i=>i.id===selected);

  return (
    <div style={{width:"100%",height:"100%",position:"relative"}}>
      {/* Title */}
      <div style={{
        position:"absolute", top:"5%", left:"5%",
        fontSize:9, color:"rgba(200,200,255,0.5)", fontFamily:"'Share Tech Mono',monospace", letterSpacing:2
      }}>CART ORGANIZATION · AR TAGS · OPTIMIZATION</div>

      {/* Cart view */}
      <div style={{
        position:"absolute", left:"5%", top:"13%", width:"58%", height:"72%",
        border:"1px solid rgba(100,150,255,0.3)", background:"rgba(0,10,30,0.6)", borderRadius:4,
      }}>
        {/* Cart label */}
        <div style={{
          position:"absolute", bottom:-18, left:"50%", transform:"translateX(-50%)",
          fontSize:8, color:"rgba(100,150,255,0.5)", fontFamily:"'Share Tech Mono',monospace", letterSpacing:2, whiteSpace:"nowrap"
        }}>LESS RETRI?</div>

        {/* Bags as AR overlays */}
        <svg width="100%" height="100%" style={{position:"absolute",inset:0,overflow:"visible"}}>
          {CART_ITEMS.map(item => {
            const color = statusColor[item.status];
            const isSelected = item.id === selected;
            const isPulsing = (item.status !== "ok") && (pulse % 2 === 0);
            return (
              <g key={item.id} onClick={()=>setSelected(item.id===selected?null:item.id)} style={{cursor:"pointer"}}>
                {/* Glow bg */}
                <rect x={`${item.x}%`} y={`${item.y}%`} width={`${item.w}%`} height={`${item.h}%`}
                  fill={`${color}18`}
                  stroke={color} strokeWidth={isSelected?"2":"1"}
                  rx="2" opacity={isPulsing?0.5:1}
                  style={{transition:"opacity 0.4s"}}
                />
                {/* Bag icon */}
                <text x={`${item.x+item.w/2}%`} y={`${item.y+item.h/2-2}%`}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fill={color} style={{userSelect:"none",fontFamily:"sans-serif"}}>🧳</text>
                {/* Label pill */}
                <rect x={`${item.x+item.w/2-6}%`} y={`${item.y+item.h-8}%`} width="12%" height="7%"
                  rx="2" fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth="0.5"/>
                <text x={`${item.x+item.w/2}%`} y={`${item.y+item.h-4}%`}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="6" fill={color} fontFamily="'Share Tech Mono',monospace"
                  style={{userSelect:"none"}}>{statusLabel[item.status]}</text>
              </g>
            );
          })}
        </svg>

        {/* Optimization score */}
        <div style={{
          position:"absolute", top:4, right:6, fontSize:8,
          color:"rgba(100,150,255,0.6)", fontFamily:"'Share Tech Mono',monospace"
        }}>OPT 71%</div>
      </div>

      {/* Stats panel */}
      <div style={{
        position:"absolute", right:"3%", top:"13%", width:"34%",
        display:"flex", flexDirection:"column", gap:8,
      }}>
        {/* Summary */}
        <div style={{
          background:"rgba(0,10,30,0.8)", border:"1px solid rgba(100,150,255,0.3)",
          borderRadius:3, padding:"8px 10px"
        }}>
          <div style={{fontSize:8,color:"rgba(100,150,255,0.5)",fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:6}}>CART STATUS</div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:22,color:"#00ff88",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,textShadow:"0 0 12px #00ff88"}}>{stats.ok}</div>
              <div style={{fontSize:7,color:"rgba(0,255,136,0.5)",fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>GOOD</div>
            </div>
            <div>
              <div style={{fontSize:22,color:"#ff2244",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,textShadow:"0 0 12px #ff2244"}}>{stats.warn}</div>
              <div style={{fontSize:7,color:"rgba(255,34,68,0.5)",fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>ISSUES</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          background:"rgba(0,10,30,0.8)", border:"1px solid rgba(100,150,255,0.3)",
          borderRadius:3, padding:"8px 10px"
        }}>
          <div style={{fontSize:8,color:"rgba(100,150,255,0.5)",fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:6}}>AR TAGS</div>
          {[
            ["#00ff88","NORMAL · FITS MORE"],
            ["#ff8800","OVERSIZE"],
            ["#ff2244","OVERWEIGHT / MISPLACED"],
          ].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <div style={{width:8,height:8,borderRadius:1,background:c,boxShadow:`0 0 4px ${c}`,flexShrink:0}}/>
              <div style={{fontSize:7,color:"rgba(200,200,255,0.6)",fontFamily:"'Share Tech Mono',monospace",lineHeight:1.2}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Selected item detail */}
        {sel && (
          <div style={{
            background:"rgba(0,10,30,0.9)", border:`1px solid ${statusColor[sel.status]}66`,
            borderRadius:3, padding:"8px 10px", animation:"fadeSlideIn2 0.2s ease"
          }}>
            <div style={{fontSize:8,color:"rgba(100,150,255,0.5)",fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:6}}>SELECTED</div>
            <div style={{fontSize:16,color:statusColor[sel.status],fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>{sel.label}</div>
            <div style={{fontSize:7,color:"rgba(200,200,255,0.5)",fontFamily:"'Share Tech Mono',monospace",marginTop:2}}>{sel.weight} · {sel.type.toUpperCase()}</div>
            <div style={{fontSize:8,color:statusColor[sel.status],fontFamily:"'Rajdhani',sans-serif",fontWeight:600,marginTop:4}}>
              {sel.status==="ok" && "✓ Fits optimally"}
              {sel.status==="oversize" && "⚠ Move to oversize area"}
              {sel.status==="overweight" && "✗ Exceeds 32kg limit"}
              {sel.status==="misplaced" && "✗ Wrong destination cart"}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeSlideIn2 { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

// ─── Main HUD Shell ─────────────────────────────────────────────────────
const MODES = [
  { id:"bag", label:"BAG COUNT", icon:"⬛", shortcut:"F1" },
  { id:"zoom", label:"ZOOM TAG", icon:"◎", shortcut:"F2" },
  { id:"cart", label:"CART AR", icon:"◧", shortcut:"F3" },
];

export default function BaggageHUD() {
  const [mode, setMode] = useState("bag");
  const [time, setTime] = useState(new Date());
  const [battery] = useState(87);
  const [signalBars] = useState(4);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
  const dateStr = time.toLocaleDateString("en-US",{month:"short",day:"numeric"});

  return (
    <div style={{
      minHeight:"100vh", background:"#000810",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Share Tech Mono', monospace",
    }}>
      <style>{`
        ${fonts}
        * { box-sizing: border-box; }
        body { margin: 0; }
        :root {
          --cyan: #00c8ff;
          --green: #00ff88;
          --amber: #ffb800;
          --red: #ff2244;
        }
      `}</style>

      {/* Outer glasses frame */}
      <div style={{
        width: "min(680px, 96vw)", aspectRatio:"16/10",
        background: "rgba(2,12,24,0.97)",
        border: "1.5px solid rgba(0,200,255,0.25)",
        borderRadius: 8,
        position:"relative",
        boxShadow:"0 0 60px rgba(0,200,255,0.08), inset 0 0 40px rgba(0,0,0,0.5)",
        overflow:"hidden",
      }}>
        {/* Scanlines texture */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:20,
          background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 3px)",
        }}/>

        {/* Vignette */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:19,
          background:"radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
        }}/>

        {/* ── Top HUD bar ── */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:28, zIndex:15,
          background:"rgba(0,8,20,0.9)", borderBottom:"1px solid rgba(0,200,255,0.15)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 12px",
        }}>
          {/* Left */}
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{fontSize:8,color:"rgba(0,200,255,0.6)",letterSpacing:2}}>
              ◈ BAGGAGE HUD v2.1
            </div>
            <div style={{
              fontSize:7, padding:"1px 6px", borderRadius:2,
              background:"rgba(0,200,255,0.1)", border:"1px solid rgba(0,200,255,0.2)",
              color:"rgba(0,200,255,0.7)", letterSpacing:1
            }}>GATE C14</div>
          </div>
          {/* Center */}
          <div style={{fontSize:10,color:"rgba(0,200,255,0.8)",letterSpacing:3}}>{timeStr}</div>
          {/* Right */}
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{display:"flex",gap:1.5,alignItems:"flex-end"}}>
              {[1,2,3,4,5].map(b=>(
                <div key={b} style={{
                  width:2.5, height:3+b*1.5,
                  background: b<=signalBars ? "#00c8ff" : "rgba(0,200,255,0.15)",
                  borderRadius:0.5,
                }}/>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:"rgba(0,200,255,0.6)"}}>
              <div style={{
                width:18,height:8,border:"1px solid rgba(0,200,255,0.4)",borderRadius:1,
                position:"relative", overflow:"hidden"
              }}>
                <div style={{
                  position:"absolute",left:0,top:0,bottom:0,
                  width:`${battery}%`,
                  background: battery>50?"#00ff88":battery>20?"#ffb800":"#ff2244",
                  opacity:0.7,
                }}/>
                <div style={{
                  position:"absolute",right:-3,top:"25%",height:"50%",width:2.5,
                  background:"rgba(0,200,255,0.3)", borderRadius:"0 1px 1px 0",
                }}/>
              </div>
              {battery}%
            </div>
            <div style={{fontSize:8,color:"rgba(0,200,255,0.4)"}}>{dateStr}</div>
          </div>
        </div>

        {/* ── Mode tabs ── */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:32, zIndex:15,
          background:"rgba(0,8,20,0.9)", borderTop:"1px solid rgba(0,200,255,0.15)",
          display:"flex",
        }}>
          {MODES.map((m,i) => {
            const active = mode === m.id;
            return (
              <button key={m.id} onClick={()=>setMode(m.id)} style={{
                flex:1, border:"none", outline:"none", cursor:"pointer",
                background: active ? "rgba(0,200,255,0.12)" : "transparent",
                borderRight: i<2 ? "1px solid rgba(0,200,255,0.1)" : "none",
                borderTop: active ? "1.5px solid #00c8ff" : "1.5px solid transparent",
                display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6,
                transition:"all 0.2s",
                padding:0,
              }}>
                <span style={{fontSize:10,color:active?"#00c8ff":"rgba(0,200,255,0.3)"}}>{m.icon}</span>
                <div>
                  <div style={{
                    fontSize:8, color: active ? "#00c8ff" : "rgba(0,200,255,0.35)",
                    letterSpacing:1.5, fontFamily:"'Share Tech Mono',monospace", lineHeight:1
                  }}>{m.label}</div>
                  <div style={{fontSize:6,color:"rgba(0,200,255,0.2)",letterSpacing:1}}>{m.shortcut}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Content area ── */}
        <div style={{
          position:"absolute", top:28, bottom:32, left:0, right:0, zIndex:10,
          overflow:"hidden",
        }}>
          {mode==="bag" && <BagCounter key="bag"/>}
          {mode==="zoom" && <ZoomTag key="zoom"/>}
          {mode==="cart" && <CartOrganizer key="cart"/>}
        </div>

        {/* Corner decorations */}
        {["tl","tr","bl","br"].map(c=>(
          <div key={c} style={{
            position:"absolute", zIndex:16,
            top: c.startsWith("t") ? 28 : "auto",
            bottom: c.startsWith("b") ? 32 : "auto",
            left: c.endsWith("l") ? 0 : "auto",
            right: c.endsWith("r") ? 0 : "auto",
            width:16, height:16,
            borderTop: c.startsWith("t") ? "1px solid rgba(0,200,255,0.4)" : "none",
            borderBottom: c.startsWith("b") ? "1px solid rgba(0,200,255,0.4)" : "none",
            borderLeft: c.endsWith("l") ? "1px solid rgba(0,200,255,0.4)" : "none",
            borderRight: c.endsWith("r") ? "1px solid rgba(0,200,255,0.4)" : "none",
          }}/>
        ))}
      </div>
    </div>
  );
}
