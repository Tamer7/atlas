/* global React, Icons, DATA */

// ============ WHITEBOARD (real, drawable) ============
const WB_COLORS = ["#14130F", "#2747E0", "#C24A3A", "#1F7A47", "#B47A00", "#6B2E84"];

const lineSeg = (x1, y1, x2, y2) => [{ x: x1, y: y1 }, { x: x2, y: y2 }];

const Whiteboard = ({ role }) => {
  const canvasRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const drawing = React.useRef(false);
  const cur = React.useRef(null);
  const [tool, setTool] = React.useState("pen");
  const [color, setColor] = React.useState("#2747E0");
  // Seed content so the board looks like a real lesson in progress.
  const seed = React.useMemo(() => ([
    { type: "text", x: 0.30, y: 0.16, text: "Mixed Conditionals", size: 34, color: "#14130F", weight: 700 },
    { type: "path", tool: "pen", color: "#C24A3A", size: 3, pts: [
      ...lineSeg(0.30, 0.205, 0.70, 0.205) ] },
    { type: "text", x: 0.16, y: 0.40, text: "PAST", size: 16, color: "#6E6A60", weight: 700 },
    { type: "text", x: 0.74, y: 0.40, text: "NOW", size: 16, color: "#6E6A60", weight: 700 },
    { type: "path", tool: "pen", color: "#14130F", size: 2.5, pts: lineSeg(0.16, 0.46, 0.84, 0.46) },
    { type: "path", tool: "pen", color: "#14130F", size: 2.5, pts: [
      { x: 0.20, y: 0.43 }, { x: 0.20, y: 0.49 } ] },
    { type: "path", tool: "pen", color: "#14130F", size: 2.5, pts: [
      { x: 0.80, y: 0.43 }, { x: 0.80, y: 0.49 } ] },
    { type: "text", x: 0.135, y: 0.585, text: "if she had taken the job", size: 17, color: "#2747E0", weight: 500 },
    { type: "text", x: 0.56, y: 0.585, text: "she would be in Lisbon", size: 17, color: "#1F7A47", weight: 500 },
    // arrow connecting them
    { type: "path", tool: "pen", color: "#B47A00", size: 2.5, pts: [
      { x: 0.40, y: 0.62 }, { x: 0.58, y: 0.62 } ] },
    { type: "path", tool: "pen", color: "#B47A00", size: 2.5, pts: [
      { x: 0.58, y: 0.62 }, { x: 0.545, y: 0.60 } ] },
    { type: "path", tool: "pen", color: "#B47A00", size: 2.5, pts: [
      { x: 0.58, y: 0.62 }, { x: 0.545, y: 0.64 } ] },
    { type: "text", x: 0.30, y: 0.78, text: "past cause  →  present result", size: 15, color: "#6E6A60", weight: 400 },
  ]), []);
  const strokes = React.useRef([...seed]);

  const redraw = React.useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const w = cv.width, h = cv.height, dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, w, h);
    const all = strokes.current;
    for (const s of all) {
      if (s.type === "text") {
        ctx.fillStyle = s.color;
        ctx.font = `${s.weight || 400} ${s.size * dpr}px Geist, sans-serif`;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(s.text, s.x * w, s.y * h);
      } else {
        const pts = s.pts;
        if (!pts || pts.length === 0) continue;
        ctx.beginPath();
        ctx.lineJoin = "round"; ctx.lineCap = "round";
        if (s.tool === "highlighter") {
          ctx.strokeStyle = s.color; ctx.globalAlpha = 0.32; ctx.lineWidth = (s.size || 14) * dpr;
        } else if (s.tool === "eraser") {
          ctx.strokeStyle = "#F6F4EE"; ctx.globalAlpha = 1; ctx.lineWidth = (s.size || 24) * dpr;
        } else {
          ctx.strokeStyle = s.color; ctx.globalAlpha = 1; ctx.lineWidth = (s.size || 3) * dpr;
        }
        ctx.moveTo(pts[0].x * w, pts[0].y * h);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * w, pts[i].y * h);
        if (pts.length === 1) ctx.lineTo(pts[0].x * w + 0.1, pts[0].y * h + 0.1);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }, []);

  const resize = React.useCallback(() => {
    const cv = canvasRef.current, wrap = wrapRef.current; if (!cv || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const r = wrap.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    redraw();
  }, [redraw]);

  React.useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize]);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };
  const down = (e) => {
    drawing.current = true;
    const size = tool === "highlighter" ? 16 : tool === "eraser" ? 26 : 3;
    cur.current = { type: "path", tool, color, size, pts: [pos(e)] };
    strokes.current.push(cur.current);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drawing.current) return;
    cur.current.pts.push(pos(e));
    redraw();
  };
  const up = () => { drawing.current = false; cur.current = null; };

  const undo = () => { strokes.current.pop(); redraw(); };
  const clear = () => { strokes.current = []; redraw(); };

  const tools = [
    { id: "pen", icon: Icons.PenTool, label: "Pen" },
    { id: "highlighter", icon: Icons.Highlighter, label: "Highlighter" },
    { id: "eraser", icon: Icons.Eraser, label: "Eraser" },
  ];

  return (
    <div className="wb-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} className="wb-canvas"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} />

      <div className="wb-banner">
        <Icons.PenTool size={13} color="var(--brand)" />
        {role === "teacher" ? "You're presenting · everyone can draw" : "Shared whiteboard · you can draw too"}
      </div>

      {/* Remote collaborator cursors */}
      <div className="wb-cursor wb-cursor-a">
        <Icons.Pointer size={16} color="#C24A3A" fill="#C24A3A" />
        <span className="lbl" style={{ background: "#C24A3A" }}>Amir</span>
      </div>
      <div className="wb-cursor wb-cursor-b">
        <Icons.Pointer size={16} color="#1F7A47" fill="#1F7A47" />
        <span className="lbl" style={{ background: "#1F7A47" }}>Yuna</span>
      </div>

      <div className="wb-toolbar">
        {tools.map(t => (
          <button key={t.id} className={`wb-tool ${tool === t.id ? "active" : ""}`} title={t.label} onClick={() => setTool(t.id)}>
            <t.icon size={17} />
          </button>
        ))}
        <div className="wb-sep" />
        {WB_COLORS.map(c => (
          <button key={c} className={`wb-swatch ${color === c && tool !== "eraser" ? "active" : ""}`}
            style={{ background: c }} onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }} />
        ))}
        <div className="wb-sep" />
        <button className="wb-tool" title="Undo" onClick={undo}><Icons.Undo size={17} /></button>
        <button className="wb-tool" title="Clear board" onClick={clear}><Icons.Trash size={17} /></button>
      </div>
    </div>
  );
};

// ============ VIDEO TILE ============
const Tile = ({ p, big, you }) => {
  const initials = p.name.split(" ").map(n => n[0]).slice(0, 2).join("");
  return (
    <div className={`lr-tile ${p.mic && p.role === "host" ? "speaking" : ""}`} style={big ? { aspectRatio: "auto", width: "100%", height: "100%" } : {}}>
      {p.cam ? (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${p.color} 0%, #14130F 130%)` }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 35%, rgba(255,255,255,.16), transparent 55%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div style={{ width: big ? 120 : 56, height: big ? 120 : 56, borderRadius: "50%", background: "rgba(255,255,255,.12)", border: "2px solid rgba(255,255,255,.25)", display: "grid", placeItems: "center", fontSize: big ? 40 : 20, fontWeight: 700 }}>
              {initials}
            </div>
          </div>
        </div>
      ) : (
        <div className="lr-tile-avatar" style={{ background: p.color, width: big ? 120 : 64, height: big ? 120 : 64, fontSize: big ? 40 : 22 }}>{initials}</div>
      )}

      <div className="lr-tile-name">
        {p.mic ? <Icons.Mic size={12} color="#4ADE80" /> : <Icons.MicOff size={12} color="#FF8A8A" />}
        {you ? "You" : p.name.split(" ")[0]}{p.role === "host" && <span style={{ opacity: .6 }}>· Host</span>}
      </div>
      {!p.cam && <div className="lr-tile-badge"><Icons.VideoOff size={13} color="rgba(255,255,255,.7)" /></div>}
      {p.hand && <div className="lr-tile-hand"><Icons.Hand size={15} /></div>}
    </div>
  );
};

// ============ LIVE ROOM ============
const LiveRoom = ({ role, onLeave }) => {
  const L = DATA.live;
  const me = role === "teacher"
    ? L.participants[0]
    : { id: "me", name: "Sofia Chen", role: "student", color: "#2747E0", cam: true, mic: false, hand: false };

  const [mic, setMic] = React.useState(role === "teacher");
  const [cam, setCam] = React.useState(true);
  const [mode, setMode] = React.useState("speaker"); // speaker | grid | whiteboard | screen
  const [sharing, setSharing] = React.useState(false);
  const [recording, setRecording] = React.useState(role === "teacher");
  const [hand, setHand] = React.useState(false);
  const [panel, setPanel] = React.useState("people"); // none | people | chat
  const [elapsed, setElapsed] = React.useState(12 * 60 + 4);
  const [chat, setChat] = React.useState(L.chat);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const host = L.participants[0];
  const others = L.participants.slice(1);
  const everyone = role === "teacher" ? L.participants : [{ ...me }, ...L.participants];

  const startShare = () => { setSharing(true); setMode("screen"); };
  const stopShare = () => { setSharing(false); setMode("speaker"); };

  const send = () => {
    if (!draft.trim()) return;
    setChat(c => [...c, { id: Date.now(), who: me.name, role: me.role, color: me.color, time: fmt(elapsed), text: draft.trim() }]);
    setDraft("");
  };

  return (
    <div className="lr">
      {/* Top bar */}
      <div className="lr-top">
        <div className="lr-live-pill">LIVE</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{L.liveNow.title}</div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.5)" }}>{L.liveNow.course} · {host.name}</div>
        </div>
        <div style={{ flex: 1 }} />
        {recording && <div className="lr-rec"><span className="rec-dot" /> REC · {fmt(elapsed)}</div>}
        <div style={{ width: 1, height: 22, background: "rgba(255,255,255,.12)" }} />
        <div className="lr-rec"><Icons.Users size={15} /> {everyone.length}</div>
        <div className="lr-rec"><Icons.Clock size={15} /> {fmt(elapsed)}</div>
      </div>

      {/* Body */}
      <div className={`lr-body ${panel !== "none" ? "with-panel" : ""}`}>
        <div className="lr-stage">
          <div className="lr-main">
            {mode === "whiteboard" && <Whiteboard role={role} />}

            {mode === "screen" && (
              <div style={{ position: "absolute", inset: 0, background: "#0F1117" }}>
                {/* Mock shared screen: a slide */}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: 48, background: "linear-gradient(135deg, #1a1d29, #0F1117)" }}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 24 }}>{role === "teacher" ? "You're sharing your screen" : `${host.name} is sharing`}</div>
                  <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 20, maxWidth: 720 }}>The two patterns of mixed conditionals</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
                    {["Past condition → present result", "Present condition → past result"].map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: 18, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: i === 0 ? "#2747E0" : "#1F7A47", display: "grid", placeItems: "center", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontSize: 20, fontWeight: 500 }}>{t}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "auto", fontSize: 14, color: "rgba(255,255,255,.4)" }}>Atlas · English B2 · Live Workshop</div>
                </div>
                <div style={{ position: "absolute", right: 16, bottom: 16, width: 200, height: 124 }}>
                  <Tile p={host} big />
                </div>
              </div>
            )}

            {mode === "speaker" && (
              <div style={{ position: "absolute", inset: 12 }}>
                <Tile p={host} big />
              </div>
            )}

            {mode === "grid" && (
              <div className="lr-grid">
                {everyone.slice(0, 9).map((p, i) => <Tile key={p.id} p={p} you={p.id === me.id} />)}
              </div>
            )}
          </div>

          {/* Filmstrip (hidden in grid mode) */}
          {mode !== "grid" && (
            <div className="lr-strip">
              {(mode === "speaker" ? others : everyone).slice(0, 7).map(p => (
                <Tile key={p.id} p={p} you={p.id === me.id} />
              ))}
              <div className="lr-strip-more" onClick={() => setMode("grid")}>
                <Icons.Grid size={18} />
                <span>+{Math.max(0, everyone.length - 7)} more</span>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {panel !== "none" && (
          <div className="lr-panel">
            <div className="lr-panel-tabs">
              <button className={`lr-panel-tab ${panel === "people" ? "active" : ""}`} onClick={() => setPanel("people")}>People · {everyone.length}</button>
              <button className={`lr-panel-tab ${panel === "chat" ? "active" : ""}`} onClick={() => setPanel("chat")}>Chat</button>
            </div>

            {panel === "people" && (
              <div className="lr-panel-body">
                {role === "teacher" && (
                  <button className="btn btn-secondary btn-sm btn-block" style={{ marginBottom: 12, background: "#26262E", color: "#fff", borderColor: "rgba(255,255,255,.1)" }}>
                    <Icons.MicOff size={13} /> Mute all students
                  </button>
                )}
                {everyone.map(p => (
                  <div key={p.id} className="lr-people-row">
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: p.color, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {p.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.id === me.id ? "You" : p.name}</div>
                      {p.role === "host" && <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>Host · Teacher</div>}
                    </div>
                    {p.hand && <Icons.Hand size={15} color="#F5B301" />}
                    {p.mic ? <Icons.Mic size={15} color="#4ADE80" /> : <Icons.MicOff size={15} color="rgba(255,255,255,.35)" />}
                    {p.cam ? <Icons.Video size={15} color="rgba(255,255,255,.55)" /> : <Icons.VideoOff size={15} color="rgba(255,255,255,.35)" />}
                  </div>
                ))}
              </div>
            )}

            {panel === "chat" && (
              <>
                <div className="lr-panel-body">
                  {chat.map(m => (
                    <div key={m.id} className="lr-chat-msg">
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                          {m.who.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <b style={{ fontSize: 12.5 }}>{m.who}</b>
                        {m.role === "host" && <span style={{ fontSize: 10, background: "rgba(110,138,255,.25)", color: "#9DB2FF", padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>Host</span>}
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginLeft: "auto" }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.82)", lineHeight: 1.45, paddingLeft: 29 }}>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="lr-chat-input">
                  <input placeholder="Message the class…" value={draft}
                    onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
                  <button className="btn btn-brand btn-icon" onClick={send}><Icons.Send size={15} /></button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="lr-controls">
        <button className={`lr-ctrl ${mic ? "" : "off"}`} onClick={() => setMic(!mic)}>
          <div className="ic">{mic ? <Icons.Mic size={20} /> : <Icons.MicOff size={20} />}</div>
          <span>{mic ? "Mute" : "Unmute"}</span>
        </button>
        <button className={`lr-ctrl ${cam ? "" : "off"}`} onClick={() => setCam(!cam)}>
          <div className="ic">{cam ? <Icons.Video size={20} /> : <Icons.VideoOff size={20} />}</div>
          <span>{cam ? "Stop video" : "Start video"}</span>
        </button>

        <div style={{ width: 1, height: 38, background: "rgba(255,255,255,.1)", margin: "0 4px" }} />

        <button className={`lr-ctrl ${sharing ? "on" : ""}`} onClick={() => sharing ? stopShare() : startShare()}>
          <div className="ic"><Icons.ScreenShare size={20} /></div>
          <span>{sharing ? "Stop share" : "Share screen"}</span>
        </button>
        <button className={`lr-ctrl ${mode === "whiteboard" ? "on" : ""}`} onClick={() => setMode(mode === "whiteboard" ? "speaker" : "whiteboard")}>
          <div className="ic"><Icons.PenTool size={20} /></div>
          <span>Whiteboard</span>
        </button>

        {role === "student" && (
          <button className={`lr-ctrl ${hand ? "on" : ""}`} onClick={() => setHand(!hand)}>
            <div className="ic"><Icons.Hand size={20} /></div>
            <span>{hand ? "Lower hand" : "Raise hand"}</span>
          </button>
        )}

        {role === "teacher" && (
          <button className={`lr-ctrl ${recording ? "live-rec" : ""}`} onClick={() => setRecording(!recording)}>
            <div className="ic">{recording ? <Icons.Square size={16} /> : <Icons.Dot size={20} />}</div>
            <span>{recording ? "Stop rec" : "Record"}</span>
          </button>
        )}

        <div style={{ width: 1, height: 38, background: "rgba(255,255,255,.1)", margin: "0 4px" }} />

        <button className={`lr-ctrl ${panel === "people" ? "on" : ""}`} onClick={() => setPanel(panel === "people" ? "none" : "people")}>
          <div className="ic"><Icons.Users size={20} /></div>
          <span>People</span>
        </button>
        <button className={`lr-ctrl ${panel === "chat" ? "on" : ""}`} onClick={() => setPanel(panel === "chat" ? "none" : "chat")}>
          <div className="ic"><Icons.ChatBubble size={20} /></div>
          <span>Chat</span>
        </button>
        <button className="lr-ctrl" onClick={() => setMode(mode === "grid" ? "speaker" : "grid")}>
          <div className="ic"><Icons.Grid size={20} /></div>
          <span>{mode === "grid" ? "Speaker" : "Grid"}</span>
        </button>

        <button className="lr-leave" onClick={onLeave}>
          <Icons.PhoneOff size={16} /> {role === "teacher" ? "End class" : "Leave"}
        </button>
      </div>
    </div>
  );
};

window.LiveRoom = LiveRoom;
