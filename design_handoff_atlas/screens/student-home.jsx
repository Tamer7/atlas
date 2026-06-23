/* global React, Icons, DATA */

// ============ STUDENT — DASHBOARD ============
const StudentDashboard = ({ setScreen, setActiveCourse }) => {
  const courses = DATA.courses.filter(c => c.lessonsDone > 0);
  const upNext = DATA.courses[0]; // English B2

  return (
    <div data-screen-label="01 Student · Dashboard">
      <div className="page-head">
        <div>
          <div className="crumbs">Tuesday, May 19</div>
          <h1 className="h1">Welcome back, <span className="serif-italic">Sofia</span>.</h1>
        </div>
        <div className="row" style={{gap: 8}}>
          <button className="btn btn-secondary"><Icons.Search size={14} /> Search lessons</button>
          <button className="btn btn-secondary btn-icon"><Icons.Bell size={14} /></button>
        </div>
      </div>

      {/* Stats row */}
      <div className="card card-pad-lg" style={{marginBottom: 24, display: "flex", gap: 32, alignItems: "center"}}>
        <Stat label="This week" value="4.2h" sub="of 5h goal" accent />
        <div style={{width: 1, height: 40, background: "var(--line)"}} />
        <Stat label="Active streak" value="11" sub="days" />
        <div style={{width: 1, height: 40, background: "var(--line)"}} />
        <Stat label="Lessons done" value="36" sub="of 96 total" />
        <div style={{width: 1, height: 40, background: "var(--line)"}} />
        <Stat label="Avg. score" value="88%" sub="↑ 4 pts" />
        <div style={{flex: 1}} />
        <button className="btn btn-ghost" onClick={() => setScreen("results")}>
          See progress <Icons.ArrowRight size={14} />
        </button>
      </div>

      {/* Up next — hero */}
      <div className="card elev" style={{padding: 0, overflow: "hidden", marginBottom: 32}}>
        <div style={{display: "grid", gridTemplateColumns: "1.1fr 1fr"}}>
          <div style={{padding: 32}}>
            <div className="eyebrow" style={{marginBottom: 12}}><Icons.Sparkle size={12} style={{verticalAlign: "-2px"}} /> Pick up where you left off</div>
            <div style={{fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.05, marginBottom: 6, letterSpacing: "-0.01em"}}>
              Lesson 15 · <span className="serif-italic">Mixed Conditionals</span>
            </div>
            <div className="muted" style={{marginBottom: 20}}>{upNext.title} · with {upNext.instructor}</div>

            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: "var(--muted)", fontSize: 12}}>
              <Icons.Clock size={12} /> 18:05 left
              <span className="dot-sep" /> <Icons.PlayOutline size={12} /> 62% through
              <span className="dot-sep" /> <Icons.ListChecks size={12} /> Quiz after
            </div>

            <Progress value={62} variant="brand" thick />

            <div style={{display: "flex", gap: 10, marginTop: 24}}>
              <button className="btn btn-brand btn-lg" onClick={() => { setActiveCourse(upNext); setScreen("lesson"); }}>
                <Icons.Play size={16} /> Resume lesson
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => { setActiveCourse(upNext); setScreen("course"); }}>
                Course overview
              </button>
            </div>
          </div>
          <div className="grad-1" style={{position: "relative", display: "flex", alignItems: "flex-end", padding: 28, minHeight: 280}}>
            <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,.18), transparent 50%)"}} />
            <div style={{position: "absolute", top: -40, right: -40, fontFamily: "var(--font-display)", fontSize: 280, lineHeight: 1, color: "rgba(255,255,255,.15)", userSelect: "none"}}>E</div>
            <div style={{position: "relative", color: "#fff"}}>
              <div style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", opacity: .8, marginBottom: 6}}>Coming up next</div>
              <div style={{fontFamily: "var(--font-display)", fontSize: 24, lineHeight: 1.1, opacity: .95}}>"If she had taken that job last year, she would be living in Lisbon right now."</div>
            </div>
          </div>
        </div>
      </div>

      {/* In progress + upcoming */}
      <div style={{display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24}}>
        <div>
          <div className="between" style={{marginBottom: 16}}>
            <h2 className="h2">In progress</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen("courses")}>View all <Icons.ArrowRight size={12} /></button>
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
            {courses.slice(0, 4).map(c => (
              <button key={c.id} className="card" style={{padding: 0, overflow: "hidden", textAlign: "left", border: "1px solid var(--line)", background: "var(--card)", cursor: "pointer"}}
                onClick={() => { setActiveCourse(c); setScreen("course"); }}>
                <CourseThumb course={c} />
                <div style={{padding: 16}}>
                  <div style={{fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4}}>{c.tag}</div>
                  <div style={{fontWeight: 600, fontSize: 15, marginBottom: 12, lineHeight: 1.3}}>{c.title}</div>
                  <div style={{display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--muted)"}}>
                    <span>{c.lessonsDone}/{c.lessonsTotal} lessons</span>
                    <span className="dot-sep" />
                    <span>{c.progress}%</span>
                  </div>
                  <div style={{marginTop: 8}}><Progress value={c.progress} variant="brand" /></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="h2" style={{marginBottom: 16}}>This week</h2>
          <div className="card card-pad">
            {[
              { day: "Tue", date: 19, type: "lesson", title: "Mixed conditionals", course: "English B2", time: "Anytime today", active: true },
              { day: "Wed", date: 20, type: "quiz", title: "Conditionals practice quiz", course: "English B2", time: "10 questions" },
              { day: "Thu", date: 21, type: "lesson", title: "Ser vs Estar in context", course: "Spanish A2", time: "with Diego" },
              { day: "Fri", date: 22, type: "exam", title: "End-of-Term Comprehensive", course: "English B2", time: "90 min · proctored", warn: true },
            ].map((it, i) => (
              <div key={i} style={{display: "flex", gap: 14, padding: "12px 0", borderBottom: i < 3 ? "1px solid var(--line)" : "0"}}>
                <div style={{width: 44, textAlign: "center", padding: "6px 0", background: it.active ? "var(--ink)" : "var(--paper-2)", color: it.active ? "var(--paper)" : "var(--ink)", borderRadius: "var(--r-sm)", flexShrink: 0}}>
                  <div style={{fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: .8}}>{it.day}</div>
                  <div style={{fontSize: 16, fontWeight: 600, lineHeight: 1.1}}>{it.date}</div>
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 2}}>
                    {it.type === "quiz" && <Badge tone="brand">Quiz</Badge>}
                    {it.type === "exam" && <Badge tone="danger">Exam</Badge>}
                    {it.type === "lesson" && <Badge>Lesson</Badge>}
                  </div>
                  <div style={{fontWeight: 600, fontSize: 13, marginBottom: 2}}>{it.title}</div>
                  <div style={{fontSize: 12, color: "var(--muted)"}}>{it.course} · {it.time}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="h2" style={{margin: "32px 0 16px"}}>Recent results</h2>
          <div className="card card-pad" style={{display: "flex", flexDirection: "column", gap: 14}}>
            {[
              { title: "Reduced forms quiz", course: "English B2", score: 90, total: 100, when: "2 days ago" },
              { title: "Linking sounds quiz", course: "English B2", score: 85, total: 100, when: "5 days ago" },
              { title: "Vocab check 3", course: "Spanish A2", score: 92, total: 100, when: "1 week ago" },
            ].map((r, i) => (
              <div key={i} style={{display: "flex", alignItems: "center", gap: 12}}>
                <div style={{width: 40, height: 40, borderRadius: "50%", background: r.score >= 85 ? "var(--success-tint)" : "var(--warning-tint)", color: r.score >= 85 ? "var(--success)" : "var(--warning)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-mono)"}}>
                  {r.score}
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontWeight: 600, fontSize: 13}}>{r.title}</div>
                  <div style={{fontSize: 12, color: "var(--muted)"}}>{r.course} · {r.when}</div>
                </div>
                <Icons.ArrowUpRight size={14} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ STUDENT — COURSES LIST ============
const StudentCourses = ({ setScreen, setActiveCourse }) => {
  const [filter, setFilter] = React.useState("all");
  const filters = [
    { value: "all", label: "All" },
    { value: "Languages", label: "Languages" },
    { value: "Test Prep", label: "Test Prep" },
    { value: "Soft Skills", label: "Soft Skills" },
  ];
  const items = filter === "all" ? DATA.courses : DATA.courses.filter(c => c.category === filter);

  return (
    <div data-screen-label="02 Student · Courses">
      <div className="page-head">
        <div>
          <div className="crumbs">Library</div>
          <h1 className="h1">My Courses</h1>
        </div>
        <div className="row" style={{gap: 8}}>
          <SegControl options={filters} value={filter} onChange={setFilter} />
          <button className="btn btn-secondary"><Icons.Plus size={14} /> Browse catalog</button>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20}}>
        {items.map(c => (
          <button key={c.id} className="card" style={{padding: 0, overflow: "hidden", textAlign: "left", cursor: "pointer", background: "var(--card)"}}
            onClick={() => { setActiveCourse(c); setScreen("course"); }}>
            <CourseThumb course={c} />
            <div style={{padding: 20}}>
              <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 10}}>
                <Badge>{c.tag}</Badge>
                {c.progress === 100 && <Badge tone="success">Done</Badge>}
                {c.progress === 0 && <Badge tone="warning">Not started</Badge>}
              </div>
              <div style={{fontWeight: 600, fontSize: 16, marginBottom: 8, lineHeight: 1.3}}>{c.title}</div>
              <div style={{fontSize: 12, color: "var(--muted)", marginBottom: 14}}>with {c.instructor}</div>
              <Progress value={c.progress} variant="brand" />
              <div style={{display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "var(--muted)"}}>
                <span>{c.lessonsDone}/{c.lessonsTotal} lessons</span>
                <span style={{fontWeight: 600, color: "var(--ink)"}}>{c.progress}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ STUDENT — COURSE PAGE (lesson list) ============
const StudentCourse = ({ course, setScreen, setActiveCourse }) => {
  const c = course || DATA.courses[0];
  const totalDuration = "8h 24m";

  return (
    <div data-screen-label="03 Student · Course">
      <div className="page-head">
        <div>
          <div className="crumbs">
            <a href="#" onClick={e => { e.preventDefault(); setScreen("courses"); }}>Courses</a> / {c.title}
          </div>
          <h1 className="h1" style={{maxWidth: 700}}>{c.title}</h1>
          <div className="row" style={{marginTop: 14, color: "var(--muted)", fontSize: 13}}>
            <span>with <b style={{color: "var(--ink)"}}>{c.instructor}</b></span>
            <span className="dot-sep" />
            <span>{c.lessonsTotal} lessons</span>
            <span className="dot-sep" />
            <span>{totalDuration}</span>
            <span className="dot-sep" />
            <Badge tone="brand">{c.tag}</Badge>
          </div>
        </div>
        <button className="btn btn-brand btn-lg" onClick={() => setScreen("lesson")}>
          <Icons.Play size={16} /> Continue · Lesson {c.lessonsDone + 1}
        </button>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 32}}>
        <div>
          <div className="between" style={{marginBottom: 16}}>
            <h2 className="h2">Curriculum</h2>
            <div className="muted" style={{fontSize: 13}}>{c.lessonsDone} of {c.lessonsTotal} complete</div>
          </div>

          {DATA.modules.map((m, mi) => (
            <div key={m.id} style={{marginBottom: 18}}>
              <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 10}}>
                <div className="eyebrow">{m.title}</div>
                <div style={{flex: 1, height: 1, background: "var(--line)"}} />
              </div>
              <div className="card" style={{padding: 0}}>
                {m.lessons.map((l, li) => (
                  <div key={l.id} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                    borderBottom: li < m.lessons.length - 1 ? "1px solid var(--line)" : "0",
                    background: l.current ? "var(--brand-tint)" : "transparent",
                    cursor: l.locked ? "default" : "pointer",
                    opacity: l.locked ? .55 : 1,
                  }}
                  onClick={() => !l.locked && setScreen("lesson")}>
                    <div style={{width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center",
                                  background: l.done ? "var(--success)" : l.current ? "var(--brand)" : l.quiz ? "var(--accent-tint)" : "var(--paper-2)",
                                  color: l.done || l.current ? "#fff" : l.quiz ? "#8B4426" : "var(--muted)",
                                  flexShrink: 0}}>
                      {l.done ? <Icons.Check size={14} /> : l.quiz ? <Icons.ListChecks size={13} /> : l.locked ? <Icons.Lock size={13} /> : <Icons.Play size={11} fill="currentColor" />}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontWeight: 500, fontSize: 14}}>
                        {!l.quiz && <span style={{color: "var(--muted)", marginRight: 8, fontVariantNumeric: "tabular-nums"}}>Lesson {l.n}</span>}
                        {l.title}
                        {l.current && <Badge tone="brand" style={{marginLeft: 10}}>Current</Badge>}
                        {l.quiz && <Badge tone="accent" style={{marginLeft: 10}}>Quiz</Badge>}
                        {l.hasQuiz && <span style={{marginLeft: 10, color: "var(--muted)", fontSize: 11}}>+ quiz</span>}
                      </div>
                    </div>
                    <div className="mono" style={{fontSize: 12, color: "var(--muted)"}}>{l.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card card-pad-lg">
            <div className="eyebrow" style={{marginBottom: 8}}>Your progress</div>
            <div style={{display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12}}>
              <div style={{fontSize: 44, fontFamily: "var(--font-display)", letterSpacing: "-0.02em"}}>{c.progress}%</div>
              <div className="muted">complete</div>
            </div>
            <Progress value={c.progress} variant="brand" thick />
            <div style={{display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "var(--muted)"}}>
              <span>{c.lessonsDone} done</span>
              <span>{c.lessonsTotal - c.lessonsDone} remaining</span>
            </div>

            <hr className="divider" />

            <div className="eyebrow" style={{marginBottom: 10}}>Instructor</div>
            <div style={{display: "flex", gap: 12, alignItems: "center"}}>
              <Avatar name={c.instructor} size="lg" color="#2747E0" />
              <div>
                <div style={{fontWeight: 600}}>{c.instructor}</div>
                <div style={{fontSize: 12, color: "var(--muted)"}}>Senior Language Coach · 8 yrs</div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm btn-block" style={{marginTop: 12}}>
              <Icons.ChatBubble size={12} /> Message instructor
            </button>
          </div>

          <div className="card card-pad-lg" style={{marginTop: 16}}>
            <div className="eyebrow" style={{marginBottom: 12}}>Assessments</div>
            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
              <div style={{display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: "var(--r-sm)", background: "var(--paper-2)"}}>
                <Icons.ListChecks size={14} color="var(--brand)" />
                <span style={{flex: 1, fontSize: 13, fontWeight: 500}}>Conditionals practice quiz</span>
                <Badge tone="brand">Due Wed</Badge>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: "var(--r-sm)", background: "var(--paper-2)"}}>
                <Icons.ClipboardCheck size={14} color="var(--danger)" />
                <span style={{flex: 1, fontSize: 13, fontWeight: 500}}>End-of-term exam</span>
                <Badge tone="danger">Due Fri</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.StudentDashboard = StudentDashboard;
window.StudentCourses = StudentCourses;
window.StudentCourse = StudentCourse;
