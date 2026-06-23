/* global React, Icons, DATA */

// ============ STUDENT — QUIZ TAKING ============
const StudentQuiz = ({ setScreen }) => {
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);
  const quiz = DATA.quiz;
  const q = quiz.questions[idx];
  const total = quiz.questions.length;

  const answer = (val) => setAnswers(a => ({ ...a, [q.id]: val }));
  const cur = answers[q.id];

  if (submitted) {
    return <StudentResults setScreen={setScreen} answers={answers} />;
  }

  return (
    <div data-screen-label="05 Student · Quiz">
      <div className="page-head">
        <div>
          <div className="crumbs">
            <a href="#" onClick={(e) => { e.preventDefault(); setScreen("course"); }}>English B2</a> · Module 3
          </div>
          <h1 className="h2">{quiz.title}</h1>
        </div>
        <div className="row">
          <div className="row" style={{color: "var(--muted)", fontSize: 13}}>
            <Icons.Clock size={14} /> ~{quiz.minutes} min
          </div>
          <button className="btn btn-ghost" onClick={() => setScreen("lesson")}><Icons.X size={14} /> Exit</button>
        </div>
      </div>

      <div className="quiz-shell">
        {/* Progress bar with question pips */}
        <div style={{marginBottom: 28}}>
          <div style={{display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "var(--muted)", fontWeight: 600}}>
            <span>Question {idx + 1} of {total}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div style={{display: "grid", gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 4}}>
            {quiz.questions.map((qq, i) => (
              <button key={qq.id} onClick={() => setIdx(i)} style={{
                height: 4, border: 0, borderRadius: 99, cursor: "pointer", padding: 0,
                background: i === idx ? "var(--ink)" :
                           answers[qq.id] != null ? "var(--brand)" :
                           "var(--line-2)",
              }} />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="card card-pad-lg">
          <div className="row" style={{marginBottom: 14, gap: 8}}>
            <Badge tone="brand">{
              q.type === "mcq" ? "Multiple choice" :
              q.type === "tf" ? "True / False" :
              q.type === "fib" ? "Fill in the blank" :
              q.type === "short" ? "Short answer" :
              q.type === "match" ? "Match pairs" : q.type
            }</Badge>
            <span className="muted" style={{fontSize: 12}}>2 points</span>
          </div>

          <div style={{fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1.25, marginBottom: 24, letterSpacing: "-0.005em"}}>
            {q.prompt}
          </div>

          {/* MCQ */}
          {q.type === "mcq" && (
            <div style={{display: "flex", flexDirection: "column", gap: 10}}>
              {q.options.map((o, i) => (
                <div key={o.id} className={`choice ${cur === o.id ? "selected" : ""}`} onClick={() => answer(o.id)}>
                  <div className="letter">{String.fromCharCode(65 + i)}</div>
                  <div style={{flex: 1, fontSize: 15, lineHeight: 1.5}}>{o.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* T/F */}
          {q.type === "tf" && (
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
              {[true, false].map(v => (
                <div key={String(v)} className={`choice ${cur === v ? "selected" : ""}`} onClick={() => answer(v)} style={{justifyContent: "center", padding: 22}}>
                  <div style={{fontFamily: "var(--font-display)", fontSize: 26}}>{v ? "True" : "False"}</div>
                </div>
              ))}
            </div>
          )}

          {/* Fill in blank */}
          {q.type === "fib" && (
            <div style={{display: "flex", flexDirection: "column", gap: 14}}>
              {q.blanks.map((b, i) => (
                <div key={i}>
                  <label className="label">Blank {i + 1}</label>
                  <input className="input input-lg" placeholder="Type your answer..."
                    value={(cur || [])[i] || ""}
                    onChange={e => {
                      const arr = [...(cur || ["", ""])];
                      arr[i] = e.target.value;
                      answer(arr);
                    }} />
                </div>
              ))}
              <div style={{fontSize: 12, color: "var(--muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 6}}>
                <Icons.Sparkle size={12} /> Don't worry about minor capitalization — we're forgiving.
              </div>
            </div>
          )}

          {/* Short answer */}
          {q.type === "short" && (
            <div>
              <textarea className="textarea" rows={6} placeholder="Write your answer in 2-3 sentences..."
                value={cur || ""} onChange={e => answer(e.target.value)} />
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: 12, color: "var(--muted)"}}>
                <span>{(cur || "").trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>Reviewed by your instructor</span>
              </div>
            </div>
          )}

          {/* Match pairs */}
          {q.type === "match" && (
            <MatchPairs pairs={q.pairs} value={cur} onChange={answer} />
          )}
        </div>

        {/* Footer */}
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28}}>
          <button className="btn btn-secondary" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
            <Icons.ArrowLeft size={14} /> Previous
          </button>
          <div className="row" style={{gap: 8}}>
            <button className="btn btn-ghost"><Icons.Flag size={14} /> Flag for review</button>
            {idx === total - 1 ? (
              <button className="btn btn-brand" onClick={() => setSubmitted(true)}>
                Submit quiz <Icons.Check size={14} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setIdx(idx + 1)}>
                Next <Icons.ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Match-pairs interactive widget
const MatchPairs = ({ pairs, value = {}, onChange }) => {
  // Right column shuffled but stable
  const shuffled = React.useMemo(() => {
    return [...pairs].map((p, i) => ({ ...p, _i: i })).sort((a, b) => (a.r.length - b.r.length));
  }, [pairs]);

  return (
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14}}>
      <div style={{display: "flex", flexDirection: "column", gap: 10}}>
        {pairs.map((p, i) => (
          <div key={i} style={{padding: "12px 14px", border: "1px solid var(--line-2)", background: "var(--card)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", gap: 12}}>
            <div className="letter" style={{width: 22, height: 22, fontSize: 11}}>{i + 1}</div>
            <div style={{flex: 1, fontSize: 14}}>{p.l}</div>
          </div>
        ))}
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 10}}>
        {shuffled.map((p, i) => {
          const matchedTo = Object.entries(value).find(([k, v]) => v === p._i)?.[0];
          return (
            <select
              key={i}
              value={matchedTo || ""}
              onChange={(e) => {
                const newVal = { ...value };
                Object.keys(newVal).forEach(k => { if (newVal[k] === p._i) delete newVal[k]; });
                if (e.target.value) newVal[e.target.value] = p._i;
                onChange(newVal);
              }}
              className="select"
              style={{height: 46, fontSize: 14}}>
              <option value="">— matches with —</option>
              {pairs.map((_, li) => (
                <option key={li} value={li}>{li + 1}. {pairs[li].l.slice(0, 50)}{pairs[li].l.length > 50 ? "…" : ""}</option>
              ))}
            </select>
          );
        })}
        <div style={{marginTop: 6}}>
          {shuffled.map((p, i) => (
            <div key={i} style={{padding: "8px 14px", fontSize: 13, color: "var(--ink-2)", borderLeft: "2px solid var(--line-2)", marginLeft: 10, marginTop: 4}}>
              <span className="muted" style={{fontSize: 11, fontFamily: "var(--font-mono)", marginRight: 6}}>{String.fromCharCode(65 + i)}.</span>
              {p.r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ STUDENT — EXAM (timed) ============
const StudentExam = ({ setScreen }) => {
  const [started, setStarted] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(DATA.exam.duration * 60);
  const [qIdx, setQIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [flagged, setFlagged] = React.useState({});

  React.useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [started]);

  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const exam = DATA.exam;
  // Build pseudo-questions: reuse quiz qs + fillers
  const examQs = React.useMemo(() => {
    const base = DATA.quiz.questions;
    const arr = [];
    for (let i = 0; i < exam.questions; i++) arr.push({ ...base[i % base.length], id: "ex" + i });
    return arr;
  }, []);

  if (!started) {
    return (
      <div data-screen-label="06 Student · Exam Lobby" style={{display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: 32}}>
        <div className="card card-pad-lg" style={{maxWidth: 560, width: "100%", textAlign: "center"}}>
          <div style={{display: "inline-flex", padding: 12, background: "var(--danger-tint)", color: "var(--danger)", borderRadius: "50%", marginBottom: 20}}>
            <Icons.ClipboardCheck size={28} />
          </div>
          <h1 className="h1" style={{marginBottom: 12}}>{exam.title}</h1>
          <p className="muted" style={{marginBottom: 28, fontSize: 15, maxWidth: 420, marginLeft: "auto", marginRight: "auto"}}>
            You're about to start a <b>{exam.duration}-minute timed exam</b>. Once you begin, the timer doesn't stop — even if you close the tab.
          </p>

          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28, textAlign: "left"}}>
            <div className="card card-pad" style={{background: "var(--paper-2)", border: 0}}>
              <Icons.Clock size={16} color="var(--brand)" />
              <div style={{marginTop: 8, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600}}>Duration</div>
              <div style={{fontWeight: 600, fontSize: 18}}>{exam.duration} min</div>
            </div>
            <div className="card card-pad" style={{background: "var(--paper-2)", border: 0}}>
              <Icons.ListChecks size={16} color="var(--brand)" />
              <div style={{marginTop: 8, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600}}>Questions</div>
              <div style={{fontWeight: 600, fontSize: 18}}>{exam.questions}</div>
            </div>
            <div className="card card-pad" style={{background: "var(--paper-2)", border: 0}}>
              <Icons.Trophy size={16} color="var(--brand)" />
              <div style={{marginTop: 8, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600}}>Points</div>
              <div style={{fontWeight: 600, fontSize: 18}}>{exam.pointsTotal}</div>
            </div>
          </div>

          <div style={{padding: 14, background: "var(--warning-tint)", color: "var(--warning)", borderRadius: "var(--r-md)", textAlign: "left", marginBottom: 24, fontSize: 13}}>
            <b>Honor pledge.</b> By starting this exam you confirm you will work independently. Tab switching is logged.
          </div>

          <div style={{display: "flex", gap: 12}}>
            <button className="btn btn-secondary btn-lg btn-block" onClick={() => setScreen("course")}>Cancel</button>
            <button className="btn btn-brand btn-lg btn-block" onClick={() => setStarted(true)}>Start exam</button>
          </div>
        </div>
      </div>
    );
  }

  const q = examQs[qIdx];
  const cur = answers[q.id];
  const warn = secondsLeft < 600;

  return (
    <div data-screen-label="06 Student · Exam">
      {/* Top exam banner */}
      <div className="exam-banner" style={{marginBottom: 24, background: warn ? "var(--danger)" : "var(--ink)"}}>
        <Icons.Clock size={18} />
        <div className="exam-timer">{fmt(secondsLeft)}</div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 13, fontWeight: 600}}>{exam.title}</div>
          <div style={{fontSize: 12, opacity: .7}}>Question {qIdx + 1} of {exam.questions} · {Object.keys(answers).length} answered</div>
        </div>
        <button className="btn btn-sm" style={{background: "transparent", border: "1px solid rgba(255,255,255,.25)", color: "#fff"}}>
          Save & exit
        </button>
        <button className="btn btn-sm" style={{background: "#fff", color: "var(--ink)"}}>
          Submit early
        </button>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 280px", gap: 28}}>
        <div>
          <div className="card card-pad-lg">
            <div className="row" style={{marginBottom: 14, gap: 8}}>
              <Badge tone="brand">Section II · Grammar</Badge>
              <Badge>Question {qIdx + 1}</Badge>
              <div style={{flex: 1}} />
              <button className="btn btn-ghost btn-sm" onClick={() => setFlagged(f => ({...f, [q.id]: !f[q.id]}))}>
                <Icons.Flag size={12} color={flagged[q.id] ? "var(--accent)" : "var(--muted)"} /> {flagged[q.id] ? "Flagged" : "Flag"}
              </button>
            </div>

            <div style={{fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1.25, marginBottom: 24}}>{q.prompt}</div>

            {q.type === "mcq" && (
              <div style={{display: "flex", flexDirection: "column", gap: 10}}>
                {q.options.map((o, i) => (
                  <div key={o.id} className={`choice ${cur === o.id ? "selected" : ""}`}
                    onClick={() => setAnswers(a => ({...a, [q.id]: o.id}))}>
                    <div className="letter">{String.fromCharCode(65 + i)}</div>
                    <div style={{flex: 1, fontSize: 15}}>{o.text}</div>
                  </div>
                ))}
              </div>
            )}
            {q.type === "tf" && (
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
                {[true, false].map(v => (
                  <div key={String(v)} className={`choice ${cur === v ? "selected" : ""}`} onClick={() => setAnswers(a => ({...a, [q.id]: v}))} style={{justifyContent: "center", padding: 22}}>
                    <div style={{fontFamily: "var(--font-display)", fontSize: 26}}>{v ? "True" : "False"}</div>
                  </div>
                ))}
              </div>
            )}
            {q.type === "short" && (
              <textarea className="textarea" rows={6} placeholder="Write your answer..." value={cur || ""} onChange={e => setAnswers(a => ({...a, [q.id]: e.target.value}))} />
            )}
            {q.type === "fib" && (
              <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                {q.blanks.map((b, i) => (
                  <input key={i} className="input input-lg" placeholder={`Blank ${i + 1}...`}
                    value={(cur || [])[i] || ""}
                    onChange={e => {
                      const arr = [...(cur || ["", ""])];
                      arr[i] = e.target.value;
                      setAnswers(a => ({...a, [q.id]: arr}));
                    }} />
                ))}
              </div>
            )}
            {q.type === "match" && <MatchPairs pairs={q.pairs} value={cur} onChange={(v) => setAnswers(a => ({...a, [q.id]: v}))} />}
          </div>

          <div style={{display: "flex", justifyContent: "space-between", marginTop: 20}}>
            <button className="btn btn-secondary" disabled={qIdx === 0} onClick={() => setQIdx(qIdx - 1)}>
              <Icons.ArrowLeft size={14} /> Previous
            </button>
            <button className="btn btn-primary" onClick={() => setQIdx(Math.min(examQs.length - 1, qIdx + 1))}>
              Next <Icons.ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right rail — question palette */}
        <div className="card card-pad">
          <div className="eyebrow" style={{marginBottom: 12}}>Question palette</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6}}>
            {examQs.map((eq, i) => {
              const isAnswered = answers[eq.id] != null;
              const isFlagged = flagged[eq.id];
              const isCur = i === qIdx;
              return (
                <button key={eq.id} onClick={() => setQIdx(i)}
                  style={{
                    aspectRatio: "1", border: 0, borderRadius: "var(--r-sm)", cursor: "pointer",
                    fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                    background: isCur ? "var(--ink)" : isAnswered ? "var(--success-tint)" : "var(--paper-2)",
                    color: isCur ? "var(--paper)" : isAnswered ? "var(--success)" : "var(--ink-2)",
                    position: "relative",
                    outline: isFlagged ? "2px solid var(--accent)" : "none",
                    outlineOffset: -2,
                  }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <hr className="divider" />
          <div style={{display: "flex", flexDirection: "column", gap: 8, fontSize: 12}}>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <div style={{width: 12, height: 12, background: "var(--ink)", borderRadius: 3}} /> <span>Current</span>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <div style={{width: 12, height: 12, background: "var(--success-tint)", borderRadius: 3}} /> <span>Answered</span>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <div style={{width: 12, height: 12, background: "var(--paper-2)", borderRadius: 3}} /> <span>Unanswered</span>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <div style={{width: 12, height: 12, background: "var(--paper-2)", borderRadius: 3, outline: "2px solid var(--accent)", outlineOffset: -2}} /> <span>Flagged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ STUDENT — RESULTS ============
const StudentResults = ({ setScreen, answers = {} }) => {
  const quiz = DATA.quiz;
  // Compute correctness for graded questions
  const breakdown = quiz.questions.map(q => {
    const a = answers[q.id];
    let correct = null;
    if (q.type === "mcq") correct = a === q.answer;
    else if (q.type === "tf") correct = a === q.answer;
    else if (q.type === "fib") correct = (a || []).every((v, i) => (v || "").toLowerCase().trim() === q.blanks[i].toLowerCase());
    else if (q.type === "match") correct = (a && Object.keys(a).length === q.pairs.length && Object.entries(a).every(([k, v]) => Number(k) === v));
    return { q, a, correct };
  });
  const auto = breakdown.filter(b => b.correct !== null);
  const correct = auto.filter(b => b.correct).length;
  const score = Math.round((correct / auto.length) * 100);
  const pending = breakdown.filter(b => b.correct === null).length;

  return (
    <div data-screen-label="07 Student · Results">
      <div className="page-head">
        <div>
          <div className="crumbs">English B2 · Module 3</div>
          <h1 className="h2">Quiz results · Mixed Conditionals</h1>
        </div>
        <div className="row">
          <button className="btn btn-secondary" onClick={() => setScreen("course")}>Back to course</button>
          <button className="btn btn-primary" onClick={() => setScreen("lesson")}>Continue to next lesson <Icons.ArrowRight size={14} /></button>
        </div>
      </div>

      {/* Score hero */}
      <div className="card card-pad-lg" style={{display: "flex", gap: 32, alignItems: "center", marginBottom: 24, background: "linear-gradient(135deg, var(--card) 0%, var(--paper-2) 100%)"}}>
        <div style={{position: "relative", width: 140, height: 140}}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--line-2)" strokeWidth="10" />
            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--brand)" strokeWidth="10"
              strokeDasharray={`${(score / 100) * 377} 377`} strokeLinecap="round"
              transform="rotate(-90 70 70)" />
          </svg>
          <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center"}}>
            <div>
              <div style={{fontFamily: "var(--font-display)", fontSize: 48, lineHeight: 1, letterSpacing: "-0.02em"}}>{score}</div>
              <div className="muted" style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600}}>auto-graded</div>
            </div>
          </div>
        </div>
        <div style={{flex: 1}}>
          <Badge tone="success">Passed</Badge>
          <div style={{fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: "-0.01em", margin: "10px 0 8px"}}>
            Strong work, <span className="serif-italic">Sofia</span>.
          </div>
          <p className="muted" style={{maxWidth: 480}}>
            You scored <b style={{color: "var(--ink)"}}>{correct} out of {auto.length}</b> on auto-graded questions. {pending > 0 && <>The remaining <b style={{color: "var(--ink)"}}>{pending} written answer{pending > 1 ? "s are" : " is"}</b> with your instructor for review.</>}
          </p>
        </div>
        <div style={{textAlign: "right", display: "flex", flexDirection: "column", gap: 10}}>
          <Stat label="Class average" value="74%" />
          <Stat label="Your time" value="6:42" sub={`of ${quiz.minutes}:00`} />
        </div>
      </div>

      {/* Breakdown */}
      <h2 className="h2" style={{marginBottom: 16}}>Question-by-question breakdown</h2>
      <div style={{display: "flex", flexDirection: "column", gap: 12}}>
        {breakdown.map((b, i) => (
          <div key={b.q.id} className="card card-pad">
            <div className="row" style={{marginBottom: 10}}>
              <div style={{width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center",
                background: b.correct === true ? "var(--success-tint)" : b.correct === false ? "var(--danger-tint)" : "var(--warning-tint)",
                color: b.correct === true ? "var(--success)" : b.correct === false ? "var(--danger)" : "var(--warning)",
              }}>
                {b.correct === true ? <Icons.Check size={14} /> : b.correct === false ? <Icons.X size={14} /> : <Icons.Clock size={14} />}
              </div>
              <div style={{fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", fontWeight: 600}}>Q{i + 1}</div>
              <Badge>{
                b.q.type === "mcq" ? "Multiple choice" :
                b.q.type === "tf" ? "True / False" :
                b.q.type === "fib" ? "Fill blank" :
                b.q.type === "short" ? "Short answer" :
                b.q.type === "match" ? "Match" : b.q.type
              }</Badge>
              <div style={{flex: 1}} />
              {b.correct === null && <Badge tone="warning">Pending review</Badge>}
              <div className="muted mono" style={{fontSize: 12}}>{b.correct === true ? "+2" : b.correct === false ? "0" : "—"} / 2</div>
            </div>
            <div style={{fontSize: 15, marginBottom: 10, color: "var(--ink-2)"}}>{b.q.prompt}</div>

            {b.correct === false && b.q.type === "mcq" && (
              <div style={{display: "flex", flexDirection: "column", gap: 6, marginTop: 8}}>
                <div className="choice wrong">
                  <div className="letter">{String.fromCharCode(65 + b.q.options.findIndex(o => o.id === b.a))}</div>
                  <div style={{flex: 1, fontSize: 13}}>{b.q.options.find(o => o.id === b.a)?.text || "(not answered)"}</div>
                  <span style={{fontSize: 11, fontWeight: 600, color: "var(--danger)"}}>YOUR ANSWER</span>
                </div>
                <div className="choice correct">
                  <div className="letter">{String.fromCharCode(65 + b.q.options.findIndex(o => o.id === b.q.answer))}</div>
                  <div style={{flex: 1, fontSize: 13}}>{b.q.options.find(o => o.id === b.q.answer)?.text}</div>
                  <span style={{fontSize: 11, fontWeight: 600, color: "var(--success)"}}>CORRECT</span>
                </div>
              </div>
            )}
            {b.correct === true && (
              <div style={{fontSize: 13, color: "var(--success)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6}}>
                <Icons.Check size={14} /> Your answer was correct.
              </div>
            )}
            {b.correct === null && (
              <div style={{padding: 12, background: "var(--warning-tint)", borderRadius: "var(--r-md)", marginTop: 6}}>
                <div style={{fontSize: 12, fontWeight: 600, color: "var(--warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em"}}>Your answer · awaiting instructor review</div>
                <div style={{fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5}}>{b.a || "(you didn't answer)"}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{display: "flex", justifyContent: "center", gap: 12, marginTop: 32, marginBottom: 24}}>
        <button className="btn btn-secondary btn-lg">Retake quiz</button>
        <button className="btn btn-brand btn-lg" onClick={() => setScreen("lesson")}>Continue to next lesson <Icons.ArrowRight size={16} /></button>
      </div>
    </div>
  );
};

window.StudentQuiz = StudentQuiz;
window.StudentExam = StudentExam;
window.StudentResults = StudentResults;
