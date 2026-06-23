/* global React, Icons, DATA */

// ============ TEACHER — DASHBOARD ============
const TeacherDashboard = ({ setScreen }) => {
  return (
    <div data-screen-label="08 Teacher · Dashboard">
      <div className="page-head">
        <div>
          <div className="crumbs">Tuesday, May 19</div>
          <h1 className="h1">Good morning, <span className="serif-italic">Prof. Vale</span>.</h1>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icons.Calendar size={14} /> May 2026</button>
          <button className="btn btn-brand"><Icons.Plus size={14} /> Create</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32}}>
        {[
          { label: "Active students", value: "47", sub: "across 4 courses" },
          { label: "Awaiting grading", value: "5", sub: "items in queue", accent: true, screen: "grading" },
          { label: "Avg. class score", value: "82%", sub: "↑ 3 pts this week" },
          { label: "At-risk students", value: "2", sub: "need attention", warn: true },
        ].map((s, i) => (
          <div key={i} className="card card-pad-lg" onClick={() => s.screen && setScreen(s.screen)} style={{cursor: s.screen ? "pointer" : "default"}}>
            <div className="eyebrow" style={{marginBottom: 10}}>{s.label}</div>
            <div style={{display: "flex", alignItems: "baseline", gap: 8}}>
              <div style={{fontSize: 36, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: s.accent ? "var(--brand)" : s.warn ? "var(--danger)" : "var(--ink)"}}>{s.value}</div>
            </div>
            <div className="muted" style={{fontSize: 12, marginTop: 4}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24}}>
        {/* Grading queue preview */}
        <div>
          <div className="between" style={{marginBottom: 16}}>
            <h2 className="h2">Grading queue</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen("grading")}>Open queue <Icons.ArrowRight size={12} /></button>
          </div>
          <div className="card" style={{padding: 0}}>
            {DATA.gradingQueue.slice(0, 4).map((g, i) => (
              <div key={g.id} style={{display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < 3 ? "1px solid var(--line)" : "0", cursor: "pointer"}}
                onClick={() => setScreen("grading")}>
                <Avatar name={g.student} color={g.color} />
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: "flex", gap: 8, alignItems: "center", marginBottom: 2}}>
                    <b style={{fontSize: 13}}>{g.student}</b>
                    <Badge tone={g.type === "Exam" ? "danger" : "brand"}>{g.type}</Badge>
                  </div>
                  <div style={{fontSize: 12, color: "var(--muted)"}}>{g.item} · {g.course} · {g.submitted}</div>
                </div>
                <div style={{textAlign: "right"}}>
                  <div style={{fontSize: 12, fontWeight: 600}}>{g.needsReview} need review</div>
                  <div style={{fontSize: 11, color: "var(--muted)"}}>{g.autoScore != null ? `${g.autoScore}/${g.total} auto` : "Manual"}</div>
                </div>
                <Icons.ArrowRight size={14} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>

        {/* Today + alerts */}
        <div style={{display: "flex", flexDirection: "column", gap: 24}}>
          <div>
            <h2 className="h2" style={{marginBottom: 16}}>Today's schedule</h2>
            <div className="card card-pad">
              {[
                { time: "10:00", title: "Office hours · English B2", who: "8 students booked", color: "var(--brand)" },
                { time: "13:30", title: "Live class · IELTS Writing", who: "12 attending", color: "var(--accent)" },
                { time: "16:00", title: "1-on-1 with Yuna Park", who: "30 min · Spanish A2", color: "var(--success)" },
              ].map((s, i) => (
                <div key={i} style={{display: "flex", gap: 14, padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--line)" : "0"}}>
                  <div style={{width: 4, background: s.color, borderRadius: 4, alignSelf: "stretch"}} />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 13, fontWeight: 600}}>{s.title}</div>
                    <div style={{fontSize: 12, color: "var(--muted)"}}>{s.who}</div>
                  </div>
                  <div className="mono" style={{fontSize: 12, color: "var(--muted)", fontWeight: 600}}>{s.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="h2" style={{marginBottom: 16}}>Needs your attention</h2>
            <div style={{display: "flex", flexDirection: "column", gap: 10}}>
              <div className="card card-pad" style={{borderColor: "var(--danger-tint)", background: "color-mix(in srgb, var(--danger-tint) 25%, white)"}}>
                <div className="row" style={{gap: 10}}>
                  <Icons.Flag size={16} color="var(--danger)" />
                  <div style={{flex: 1}}>
                    <b style={{fontSize: 13}}>Priya Raman</b> hasn't logged in for 7 days
                    <div style={{fontSize: 12, color: "var(--muted)", marginTop: 2}}>Avg score dropped 12 points</div>
                  </div>
                  <button className="btn btn-secondary btn-sm">Reach out</button>
                </div>
              </div>
              <div className="card card-pad" style={{borderColor: "var(--warning-tint)", background: "color-mix(in srgb, var(--warning-tint) 25%, white)"}}>
                <div className="row" style={{gap: 10}}>
                  <Icons.Clock size={16} color="var(--warning)" />
                  <div style={{flex: 1}}>
                    <b style={{fontSize: 13}}>Exam closes Fri</b> — End-of-term comprehensive
                    <div style={{fontSize: 12, color: "var(--muted)", marginTop: 2}}>32 students have started · 18 not started</div>
                  </div>
                  <button className="btn btn-secondary btn-sm">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ TEACHER — STUDENT ROSTER ============
const TeacherRoster = ({ setScreen }) => {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState(null);

  const filters = [
    { value: "all", label: "All" },
    { value: "excelling", label: "Excelling" },
    { value: "on-track", label: "On track" },
    { value: "at-risk", label: "At-risk" },
  ];

  const items = DATA.roster
    .filter(s => filter === "all" || s.status === filter)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div data-screen-label="09 Teacher · Roster">
      <div className="page-head">
        <div>
          <div className="crumbs">Students</div>
          <h1 className="h1">Class roster <span className="muted" style={{fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 500, marginLeft: 8}}>· {DATA.roster.length}</span></h1>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icons.Upload size={14} /> Export CSV</button>
          <button className="btn btn-brand"><Icons.Plus size={14} /> Invite student</button>
        </div>
      </div>

      <div className="row" style={{marginBottom: 20, gap: 12}}>
        <div style={{position: "relative", flex: 1, maxWidth: 360}}>
          <Icons.Search size={14} color="var(--muted)" style={{position: "absolute", left: 12, top: 12}} />
          <input className="input" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} style={{paddingLeft: 36}} />
        </div>
        <SegControl options={filters} value={filter} onChange={setFilter} />
        <div style={{flex: 1}} />
        <button className="btn btn-secondary"><Icons.Filter size={14} /> Course: All</button>
      </div>

      <div className="card" style={{padding: 0, overflow: "hidden"}}>
        <table className="table">
          <thead>
            <tr>
              <th style={{width: 40}}><input type="checkbox" /></th>
              <th>Student</th>
              <th>Status</th>
              <th>Courses</th>
              <th>Attendance</th>
              <th>Avg score</th>
              <th>Trend</th>
              <th>Last active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id} style={{cursor: "pointer"}} onClick={() => setSelected(s)}>
                <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                <td>
                  <div style={{display: "flex", alignItems: "center", gap: 10}}>
                    <Avatar name={s.name} color={s.color} />
                    <div>
                      <div style={{fontWeight: 600}}>{s.name}</div>
                      <div style={{fontSize: 11, color: "var(--muted)"}}>{s.name.toLowerCase().replace(" ", ".")}@email.com</div>
                    </div>
                  </div>
                </td>
                <td>
                  {s.status === "excelling" && <Badge tone="success">Excelling</Badge>}
                  {s.status === "on-track" && <Badge tone="brand">On track</Badge>}
                  {s.status === "at-risk" && <Badge tone="danger">At-risk</Badge>}
                </td>
                <td className="num">{s.courses}</td>
                <td className="num">
                  <div className="row" style={{gap: 8}}>
                    <span>{s.attendance}%</span>
                    <div style={{flex: 1, maxWidth: 60}}><Progress value={s.attendance} variant={s.attendance > 85 ? "brand" : "default"} /></div>
                  </div>
                </td>
                <td className="num"><b>{s.avgScore}%</b></td>
                <td>
                  <Sparkline values={[s.avgScore - 8, s.avgScore - 4, s.avgScore - 6, s.avgScore - 2, s.avgScore, s.avgScore + 1, s.avgScore]} positive={s.status !== "at-risk"} />
                </td>
                <td className="muted">{s.last}</td>
                <td>
                  {s.flagged && <Icons.Flag size={14} color="var(--danger)" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <StudentDrawer student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const Sparkline = ({ values = [], positive = true }) => {
  const w = 64, h = 22;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={positive ? "var(--success)" : "var(--danger)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StudentDrawer = ({ student, onClose }) => (
  <div style={{position: "fixed", inset: 0, background: "var(--overlay)", display: "flex", justifyContent: "flex-end", zIndex: 50}}
    onClick={onClose}>
    <div style={{width: 480, height: "100%", background: "var(--card)", overflow: "auto", padding: 28, boxShadow: "var(--sh-pop)"}}
      onClick={e => e.stopPropagation()}>
      <div className="between" style={{marginBottom: 24}}>
        <div className="row">
          <Avatar name={student.name} color={student.color} size="lg" />
          <div>
            <div style={{fontWeight: 600, fontSize: 18}}>{student.name}</div>
            <div className="muted" style={{fontSize: 12}}>{student.name.toLowerCase().replace(" ", ".")}@email.com</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><Icons.X size={14} /></button>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24}}>
        <div className="card card-pad" style={{background: "var(--paper-2)", border: 0}}>
          <div className="eyebrow">Avg score</div>
          <div style={{fontSize: 24, fontWeight: 600, fontFamily: "var(--font-display)"}}>{student.avgScore}%</div>
        </div>
        <div className="card card-pad" style={{background: "var(--paper-2)", border: 0}}>
          <div className="eyebrow">Attendance</div>
          <div style={{fontSize: 24, fontWeight: 600, fontFamily: "var(--font-display)"}}>{student.attendance}%</div>
        </div>
        <div className="card card-pad" style={{background: "var(--paper-2)", border: 0}}>
          <div className="eyebrow">Courses</div>
          <div style={{fontSize: 24, fontWeight: 600, fontFamily: "var(--font-display)"}}>{student.courses}</div>
        </div>
      </div>

      <h3 className="h3" style={{marginBottom: 12}}>Recent activity</h3>
      <div style={{display: "flex", flexDirection: "column", gap: 10, marginBottom: 24}}>
        {[
          { what: "Submitted Mixed Conditionals quiz", score: 80, when: "2h ago" },
          { what: "Watched Lesson 14 — 2nd conditional", when: "Yesterday" },
          { what: "Posted question in Q&A", when: "2d ago" },
          { what: "Submitted Reduced forms quiz", score: 90, when: "5d ago" },
        ].map((a, i) => (
          <div key={i} className="row" style={{padding: 10, borderRadius: "var(--r-sm)", background: "var(--paper)", gap: 10}}>
            <Icons.CheckCircle size={14} color="var(--success)" />
            <div style={{flex: 1, fontSize: 13}}>{a.what}</div>
            {a.score && <Badge tone="brand">{a.score}%</Badge>}
            <span className="muted" style={{fontSize: 12}}>{a.when}</span>
          </div>
        ))}
      </div>

      <div className="row" style={{gap: 10}}>
        <button className="btn btn-brand btn-block"><Icons.ChatBubble size={14} /> Message</button>
        <button className="btn btn-secondary btn-block"><Icons.FileText size={14} /> View profile</button>
      </div>
    </div>
  </div>
);

window.TeacherDashboard = TeacherDashboard;
window.TeacherRoster = TeacherRoster;
