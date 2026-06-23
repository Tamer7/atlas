/* global React, Icons, DATA */

const RecordingPlayer = ({ rec, onClose }) => {
  const [playing, setPlaying] = React.useState(true);
  const [t, setT] = React.useState(0);
  const parse = (d) => { const p = d.split(":").map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
  const dur = parse(rec.duration);
  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT(x => Math.min(dur, x + 1)), 250);
    return () => clearInterval(id);
  }, [playing, dur]);
  const fmt = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + ":" : "") + String(m).padStart(h ? 2 : 1, "0") + ":" + String(sec).padStart(2, "0"); };
  const pct = (t / dur) * 100;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,10,.8)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }} onClick={onClose}>
      <div style={{ width: "min(1040px, 96vw)", background: "#101015", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--sh-pop)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.08)", color: "#fff" }}>
          <Icons.Broadcast size={16} color="#FF8A8A" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{rec.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{rec.course} · {rec.instructor} · Recorded {rec.date}</div>
          </div>
          <button className="btn btn-ghost btn-icon" style={{ color: "#fff" }} onClick={onClose}><Icons.X size={16} /></button>
        </div>

        {/* Stage */}
        <div style={{ position: "relative", aspectRatio: "16/9", background: "#0F1117" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: 48, background: "linear-gradient(135deg, #1a1d29, #0F1117)" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 20 }}>Recording · Whiteboard segment</div>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", marginBottom: 16 }}>{rec.title.split("—")[0].trim()}</div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: 16, maxWidth: 560 }}>Playback includes the shared whiteboard{rec.hasChat ? " and class chat" : ""} captured during the live session.</div>
          </div>
          {!playing && (
            <button onClick={() => setPlaying(true)} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.25)", border: 0, cursor: "pointer" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,.95)", display: "grid", placeItems: "center" }}><Icons.Play size={26} color="#0B0A07" /></div>
            </button>
          )}
          {/* chapter markers */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, background: "linear-gradient(transparent, rgba(0,0,0,.75))", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setPlaying(!playing)} style={{ background: "transparent", border: 0, color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}>
              {playing ? <Icons.Pause size={20} /> : <Icons.Play size={18} fill="#fff" />}
            </button>
            <span style={{ color: "#fff", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{fmt(t)}</span>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.2)", borderRadius: 99, position: "relative", cursor: "pointer" }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setT(Math.round(((e.clientX - r.left) / r.width) * dur)); }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "#FF3B3B", borderRadius: 99 }} />
              {[18, 44, 67].map(m => <div key={m} style={{ position: "absolute", left: `${m}%`, top: -3, width: 2, height: 10, background: "rgba(255,255,255,.6)" }} />)}
            </div>
            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{rec.duration}</span>
            <button style={{ background: "transparent", border: 0, color: "#fff", cursor: "pointer" }}><Icons.CC size={18} /></button>
            <button style={{ background: "transparent", border: 0, color: "#fff", cursor: "pointer" }}><Icons.Maximize size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScheduleModal = ({ onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
    <div className="card" style={{ width: "min(560px, 96vw)", maxHeight: "90vh", overflow: "auto", padding: 28 }} onClick={e => e.stopPropagation()}>
      <div className="between" style={{ marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>New session</div>
          <h2 className="h3">Schedule a live class</h2>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><Icons.X size={16} /></button>
      </div>
      <div className="col" style={{ gap: 16 }}>
        <Field label="Class title"><input className="input" defaultValue="Mixed Conditionals — Live Workshop" /></Field>
        <Field label="Course">
          <select className="select">{DATA.courses.map(c => <option key={c.id}>{c.title}</option>)}</select>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Date"><input className="input" type="date" defaultValue="2026-06-15" /></Field>
          <Field label="Time"><input className="input" type="time" defaultValue="13:30" /></Field>
          <Field label="Duration"><select className="select"><option>45 min</option><option>60 min</option><option>90 min</option></select></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Capacity"><input className="input" defaultValue="20" /></Field>
          <Field label="Visibility"><select className="select"><option>Enrolled students</option><option>Invite only</option><option>Public</option></select></Field>
        </div>
        <div className="card" style={{ padding: 14, background: "var(--paper-2)", border: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Session features</div>
          <div className="col" style={{ gap: 8, fontSize: 13 }}>
            <label className="row" style={{ gap: 8 }}><input type="checkbox" defaultChecked /> Record automatically &amp; publish to course</label>
            <label className="row" style={{ gap: 8 }}><input type="checkbox" defaultChecked /> Collaborative whiteboard (students can draw)</label>
            <label className="row" style={{ gap: 8 }}><input type="checkbox" defaultChecked /> Allow student screen share on request</label>
            <label className="row" style={{ gap: 8 }}><input type="checkbox" /> Require approval to join</label>
          </div>
        </div>
        <div className="row" style={{ gap: 10, marginTop: 4 }}>
          <button className="btn btn-secondary btn-block" onClick={onClose}>Cancel</button>
          <button className="btn btn-brand btn-block" onClick={onClose}><Icons.Calendar size={14} /> Schedule class</button>
        </div>
      </div>
    </div>
  </div>
);

const statusBadge = (s) => s === "live" ? <span className="live-pill-sm">LIVE NOW</span>
  : s === "soon" ? <Badge tone="warning">Starts soon</Badge>
  : <Badge>Scheduled</Badge>;

// ============ STUDENT — LIVE CLASSES ============
const LiveClassesStudent = ({ enterRoom }) => {
  const L = DATA.live;
  const [rec, setRec] = React.useState(null);
  const live = L.upcoming.find(u => u.status === "live");
  const upcoming = L.upcoming.filter(u => u.status !== "live");

  return (
    <div data-screen-label="13 Student · Live Classes">
      <div className="page-head">
        <div>
          <div className="crumbs">Learn</div>
          <h1 className="h1">Live Classes</h1>
        </div>
      </div>

      {/* Live now hero */}
      {live && (
        <div className="card elev" style={{ padding: 0, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr" }}>
            <div style={{ padding: 32 }}>
              <span className="live-pill-sm" style={{ marginBottom: 16 }}>LIVE NOW</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1, margin: "14px 0 8px" }}>{live.title}</div>
              <div className="muted" style={{ marginBottom: 18 }}>{live.course} · with {live.instructor}</div>
              <div className="row" style={{ gap: 8, marginBottom: 22 }}>
                <div className="avatar-stack">
                  {L.participants.slice(1, 5).map(p => (
                    <span key={p.id} className="avatar avatar-sm" style={{ background: p.color, color: "#fff", borderColor: "var(--card)" }}>{p.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
                  ))}
                </div>
                <span className="muted" style={{ fontSize: 13 }}>{live.attending} classmates in the room · started {L.liveNow.startedAgo}</span>
              </div>
              <button className="btn btn-brand btn-lg" onClick={() => enterRoom("student")}>
                <Icons.Video size={16} /> Join live class
              </button>
            </div>
            <div className={live.thumb} style={{ position: "relative", minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 40%, rgba(255,255,255,.18), transparent 55%)" }} />
              <div style={{ width: 84, height: 84, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center", position: "relative", boxShadow: "0 12px 40px rgba(0,0,0,.3)" }}>
                <Icons.Play size={30} color="#14130F" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <h2 className="h2" style={{ marginBottom: 16 }}>Upcoming sessions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}>
        {upcoming.map(u => (
          <div key={u.id} className="live-card">
            <div className={`live-card-thumb ${u.thumb}`}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, transparent, rgba(0,0,0,.35))" }} />
              <div style={{ position: "absolute", top: 12, left: 12 }}>{statusBadge(u.status)}</div>
              <div style={{ position: "relative", color: "#fff" }}>
                <div style={{ fontSize: 12, opacity: .85 }}>{u.date}</div>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>{u.title}</div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>{u.course} · {u.instructor}</div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row" style={{ gap: 6, color: "var(--muted)", fontSize: 12 }}>
                  <Icons.Clock size={13} /> {u.when} · {u.duration}
                </div>
                <button className="btn btn-secondary btn-sm">RSVP</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recordings */}
      <div className="between" style={{ marginBottom: 16 }}>
        <h2 className="h2">Class recordings</h2>
        <span className="muted" style={{ fontSize: 13 }}>Missed a class? Catch up here.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {L.recordings.map(r => (
          <button key={r.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", textAlign: "left", cursor: "pointer", background: "var(--card)" }} onClick={() => setRec(r)}>
            <div className={`${r.thumb}`} style={{ width: 180, flexShrink: 0, position: "relative", display: "grid", placeItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "grid", placeItems: "center" }}><Icons.Play size={18} color="#14130F" /></div>
              <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.7)", color: "#fff", fontSize: 11, padding: "2px 6px", borderRadius: 4, fontVariantNumeric: "tabular-nums" }}>{r.duration}</span>
            </div>
            <div style={{ padding: 16, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>{r.title}</div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>{r.course} · {r.instructor}</div>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <Badge>{r.date}</Badge>
                {r.hasWhiteboard && <Badge tone="brand"><Icons.PenTool size={11} /> Whiteboard</Badge>}
                <span className="muted" style={{ fontSize: 12 }}>· {r.views} views</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {rec && <RecordingPlayer rec={rec} onClose={() => setRec(null)} />}
    </div>
  );
};

// ============ TEACHER — LIVE CLASSES ============
const LiveClassesTeacher = ({ enterRoom }) => {
  const L = DATA.live;
  const [rec, setRec] = React.useState(null);
  const [scheduling, setScheduling] = React.useState(false);
  const live = L.upcoming.find(u => u.status === "live");
  const upcoming = L.upcoming.filter(u => u.status !== "live");

  return (
    <div data-screen-label="14 Teacher · Live Classes">
      <div className="page-head">
        <div>
          <div className="crumbs">Teach</div>
          <h1 className="h1">Live Classes</h1>
        </div>
        <div className="row">
          <button className="btn btn-secondary" onClick={() => setScheduling(true)}><Icons.Calendar size={14} /> Schedule</button>
          <button className="btn btn-brand" onClick={() => enterRoom("teacher")}><Icons.Broadcast size={14} /> Start instant class</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Live now", value: "1", sub: "session running", accent: true },
          { label: "Scheduled", value: upcoming.length, sub: "this week" },
          { label: "Recordings", value: L.recordings.length, sub: "published" },
          { label: "Avg. attendance", value: "82%", sub: "last 30 days" },
        ].map((s, i) => (
          <div key={i} className="card card-pad-lg">
            <div className="eyebrow" style={{ marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontSize: 34, fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.02em", color: s.accent ? "var(--brand)" : "var(--ink)" }}>{s.value}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live now resume */}
      {live && (
        <div className="card elev" style={{ padding: 24, marginBottom: 28, display: "flex", gap: 20, alignItems: "center", borderColor: "#F3C6C0", background: "color-mix(in srgb, var(--danger-tint) 18%, white)" }}>
          <div className={live.thumb} style={{ width: 120, height: 76, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icons.Broadcast size={26} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <span className="live-pill-sm" style={{ marginBottom: 8 }}>LIVE NOW · REC</span>
            <div style={{ fontWeight: 600, fontSize: 18, margin: "8px 0 4px" }}>{live.title}</div>
            <div className="muted" style={{ fontSize: 13 }}>{live.attending} students in the room · recording in progress · started {L.liveNow.startedAgo}</div>
          </div>
          <button className="btn btn-brand btn-lg" onClick={() => enterRoom("teacher")}><Icons.ArrowRight size={16} /> Rejoin class</button>
        </div>
      )}

      {/* Scheduled list */}
      <h2 className="h2" style={{ marginBottom: 16 }}>Scheduled</h2>
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 36 }}>
        {upcoming.map((u, i) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: i < upcoming.length - 1 ? "1px solid var(--line)" : "0" }}>
            <div style={{ width: 52, textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{u.date.split(" ")[0]}</div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{u.date.split(" ")[1] || ""}</div>
            </div>
            <div className={u.thumb} style={{ width: 48, height: 48, borderRadius: "var(--r-md)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{u.title}</div>
              <div className="muted" style={{ fontSize: 12 }}>{u.course} · {u.when} · {u.duration}</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              {statusBadge(u.status)}
              <Badge><Icons.Users size={11} /> {u.rsvp} RSVP</Badge>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn btn-ghost btn-sm">Edit</button>
              <button className="btn btn-secondary btn-sm" onClick={() => enterRoom("teacher")}>Start</button>
            </div>
          </div>
        ))}
      </div>

      {/* Recordings */}
      <div className="between" style={{ marginBottom: 16 }}>
        <h2 className="h2">Your recordings</h2>
        <span className="muted" style={{ fontSize: 13 }}>Auto-published to each course</span>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr><th>Session</th><th>Course</th><th>Date</th><th>Length</th><th>Views</th><th>Includes</th><th></th></tr>
          </thead>
          <tbody>
            {L.recordings.map(r => (
              <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setRec(r)}>
                <td>
                  <div className="row" style={{ gap: 12 }}>
                    <div className={r.thumb} style={{ width: 48, height: 30, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center" }}><Icons.Play size={12} color="#fff" /></div>
                    <b>{r.title}</b>
                  </div>
                </td>
                <td className="muted">{r.course}</td>
                <td className="muted">{r.date}</td>
                <td className="num mono">{r.duration}</td>
                <td className="num">{r.views}</td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    {r.hasWhiteboard && <Badge tone="brand"><Icons.PenTool size={10} /></Badge>}
                    {r.hasChat && <Badge><Icons.ChatBubble size={10} /></Badge>}
                  </div>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Copy link"><Icons.Copy size={13} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Download"><Icons.Download size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rec && <RecordingPlayer rec={rec} onClose={() => setRec(null)} />}
      {scheduling && <ScheduleModal onClose={() => setScheduling(false)} />}
    </div>
  );
};

window.LiveClassesStudent = LiveClassesStudent;
window.LiveClassesTeacher = LiveClassesTeacher;
