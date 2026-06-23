/* global React, Icons, DATA */

const QUESTION_TYPES = [
  { id: "mcq", label: "Multiple choice", desc: "Pick one of several", icon: Icons.ListChecks, autoGraded: true },
  { id: "tf", label: "True / False", desc: "Boolean answer", icon: Icons.CheckCircle, autoGraded: true },
  { id: "short", label: "Short answer", desc: "1-3 sentence text", icon: Icons.Type, autoGraded: false },
  { id: "essay", label: "Essay", desc: "Long-form writing", icon: Icons.FileText, autoGraded: false },
  { id: "fib", label: "Fill in the blank", desc: "Type missing words", icon: Icons.Pencil, autoGraded: true },
  { id: "match", label: "Match pairs", desc: "Connect items", icon: Icons.Link, autoGraded: true },
  { id: "code", label: "Code / math", desc: "Code or LaTeX input", icon: Icons.Code, autoGraded: true },
  { id: "upload", label: "File upload", desc: "Document, image, audio", icon: Icons.Upload, autoGraded: false },
];

// ============ TEACHER — QUIZ BUILDER ============
const TeacherBuilder = () => {
  const [title, setTitle] = React.useState("Mixed Conditionals — Practice Quiz");
  const [course, setCourse] = React.useState("English B2 — Conversational Fluency");
  const [showAdd, setShowAdd] = React.useState(false);
  const [editing, setEditing] = React.useState(0);
  const [questions, setQuestions] = React.useState([
    { id: 1, type: "mcq", points: 2, prompt: "Which sentence is a correctly-formed mixed conditional?",
      options: [
        { id: "a", text: "If I had studied harder, I will pass the exam.", correct: false },
        { id: "b", text: "If I had studied harder, I would be passing the exam now.", correct: true },
        { id: "c", text: "If I would study harder, I had passed the exam.", correct: false },
        { id: "d", text: "If I studied harder, I had passed the exam.", correct: false },
      ]},
    { id: 2, type: "tf", points: 1, prompt: "Mixed conditionals always combine a past condition with a present result.",
      answer: false, explanation: "They can also combine present condition with past result." },
    { id: 3, type: "fib", points: 2, prompt: "Complete: \"If she ___ (take) that job last year, she ___ (live) in Lisbon right now.\"",
      blanks: ["had taken", "would be living"] },
    { id: 4, type: "short", points: 3, prompt: "In your own words, when would you choose a mixed conditional over a regular second or third conditional?",
      rubric: "Look for: separation of past cause / present effect; nuance/contrast in time." },
    { id: 5, type: "match", points: 3, prompt: "Match each clause with the best continuation." },
  ]);

  const addQuestion = (type) => {
    const newQ = { id: Date.now(), type, points: 2, prompt: "Untitled question" };
    if (type === "mcq") newQ.options = [{id: "a", text: "", correct: false}, {id: "b", text: "", correct: true}, {id: "c", text: "", correct: false}, {id: "d", text: "", correct: false}];
    setQuestions([...questions, newQ]);
    setEditing(questions.length);
    setShowAdd(false);
  };

  const updateQ = (i, patch) => setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));

  const totalPoints = questions.reduce((s, q) => s + (q.points || 0), 0);
  const autoCount = questions.filter(q => QUESTION_TYPES.find(t => t.id === q.type)?.autoGraded).length;

  return (
    <div data-screen-label="10 Teacher · Quiz Builder">
      <div className="page-head">
        <div>
          <div className="crumbs">Assessments / New quiz</div>
          <input value={title} onChange={e => setTitle(e.target.value)}
            style={{fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 400, letterSpacing: "-0.015em", border: 0, background: "transparent", width: "100%", maxWidth: 720, padding: 0, outline: "none", color: "var(--ink)"}} />
        </div>
        <div className="row">
          <button className="btn btn-secondary">Preview as student</button>
          <button className="btn btn-secondary">Save draft</button>
          <button className="btn btn-brand">Publish <Icons.ArrowUpRight size={14} /></button>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 320px", gap: 32}}>
        <div>
          {/* Settings bar */}
          <div className="card card-pad" style={{marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap"}}>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Course</div>
              <select className="select" style={{minWidth: 240, height: 32, padding: "0 30px 0 10px"}} value={course} onChange={e => setCourse(e.target.value)}>
                {DATA.courses.map(c => <option key={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Type</div>
              <SegControl value="quiz" onChange={() => {}} options={[
                { value: "quiz", label: "Quiz" },
                { value: "exam", label: "Exam" },
              ]} />
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Time limit</div>
              <input className="input" type="text" defaultValue="10 min" style={{width: 100, height: 32}} />
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Attempts</div>
              <input className="input" type="text" defaultValue="2" style={{width: 64, height: 32}} />
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom: 4}}>Shuffle</div>
              <SegControl value="on" onChange={() => {}} options={[
                { value: "on", label: "On" },
                { value: "off", label: "Off" },
              ]} />
            </div>
          </div>

          {/* Question list */}
          {questions.map((q, i) => (
            <QuestionEditor key={q.id} q={q} idx={i}
              isEditing={editing === i}
              onClick={() => setEditing(i)}
              onChange={(patch) => updateQ(i, patch)}
              onDelete={() => { setQuestions(qs => qs.filter((_, idx) => idx !== i)); if (editing === i) setEditing(null); }}
              onDuplicate={() => setQuestions(qs => [...qs.slice(0, i + 1), { ...q, id: Date.now() }, ...qs.slice(i + 1)])}
            />
          ))}

          {/* Add question */}
          {showAdd ? (
            <div className="card card-pad-lg" style={{marginTop: 16}}>
              <div className="between" style={{marginBottom: 16}}>
                <h3 className="h3">Add a question</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)}><Icons.X size={14} /></button>
              </div>
              <div className="q-types">
                {QUESTION_TYPES.map(t => (
                  <button key={t.id} className="q-type-btn" onClick={() => addQuestion(t.id)}>
                    <div className="ico"><t.icon size={14} /></div>
                    <div>
                      <b>{t.label}</b>
                      <div><span>{t.desc}</span></div>
                      <div style={{marginTop: 4}}>
                        {t.autoGraded ? <Badge tone="success">Auto</Badge> : <Badge tone="warning">Manual</Badge>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary btn-block btn-lg" style={{marginTop: 16, borderStyle: "dashed", height: 56}} onClick={() => setShowAdd(true)}>
              <Icons.Plus size={16} /> Add question
            </button>
          )}
        </div>

        {/* Right rail — settings + summary */}
        <div>
          <div className="card card-pad-lg" style={{position: "sticky", top: 24}}>
            <div className="eyebrow" style={{marginBottom: 12}}>Quiz summary</div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16}}>
              <div>
                <div className="muted" style={{fontSize: 12}}>Questions</div>
                <div style={{fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "-0.02em"}}>{questions.length}</div>
              </div>
              <div>
                <div className="muted" style={{fontSize: 12}}>Total points</div>
                <div style={{fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "-0.02em"}}>{totalPoints}</div>
              </div>
            </div>
            <div style={{padding: 12, background: "var(--paper-2)", borderRadius: "var(--r-md)", marginBottom: 16}}>
              <div style={{display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6}}>
                <span style={{fontWeight: 600}}>Grading</span>
                <span className="muted" style={{fontSize: 12}}>{autoCount}/{questions.length} auto</span>
              </div>
              <Progress value={(autoCount / questions.length) * 100} variant="brand" />
              <div className="muted" style={{fontSize: 12, marginTop: 8, lineHeight: 1.5}}>
                {questions.length - autoCount} question{questions.length - autoCount === 1 ? "" : "s"} will need your manual review.
              </div>
            </div>

            <hr className="divider" />

            <div className="eyebrow" style={{marginBottom: 10}}>Passing score</div>
            <div style={{display: "flex", gap: 8, alignItems: "center"}}>
              <input type="range" min="50" max="100" defaultValue="70" style={{flex: 1}} />
              <input className="input" type="text" defaultValue="70%" style={{width: 64, height: 32}} />
            </div>

            <div className="eyebrow" style={{marginBottom: 10, marginTop: 16}}>Show results</div>
            <SegControl value="after" onChange={() => {}} options={[
              { value: "instant", label: "Instant" },
              { value: "after", label: "On submit" },
              { value: "manual", label: "Manual" },
            ]} />

            <hr className="divider" />

            <div className="eyebrow" style={{marginBottom: 10}}>Visibility</div>
            <div style={{display: "flex", flexDirection: "column", gap: 8, fontSize: 13}}>
              <label className="row" style={{gap: 8}}>
                <input type="checkbox" defaultChecked /> Show explanations after submit
              </label>
              <label className="row" style={{gap: 8}}>
                <input type="checkbox" defaultChecked /> Show correct answers
              </label>
              <label className="row" style={{gap: 8}}>
                <input type="checkbox" /> Allow retakes after passing
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionEditor = ({ q, idx, isEditing, onClick, onChange, onDelete, onDuplicate }) => {
  const type = QUESTION_TYPES.find(t => t.id === q.type);

  if (!isEditing) {
    return (
      <div className="q-item" onClick={onClick} style={{marginBottom: 12, cursor: "pointer"}}>
        <div className="row" style={{gap: 12}}>
          <div style={{width: 28, height: 28, borderRadius: "50%", background: "var(--paper-2)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums"}}>
            {idx + 1}
          </div>
          <type.icon size={14} color="var(--muted)" />
          <Badge>{type.label}</Badge>
          <div style={{flex: 1, fontWeight: 500, fontSize: 14}}>{q.prompt}</div>
          <span className="muted" style={{fontSize: 12}}>{q.points} pts</span>
          <Icons.ChevronDown size={14} color="var(--muted)" />
        </div>
      </div>
    );
  }

  return (
    <div className="q-item editing" style={{marginBottom: 12}}>
      <div className="row" style={{gap: 8, marginBottom: 16}}>
        <div style={{width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--paper)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700}}>
          {idx + 1}
        </div>
        <select value={q.type} onChange={e => onChange({ type: e.target.value })}
          style={{border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", padding: "5px 8px", fontSize: 12, fontWeight: 600, background: "var(--card)"}}>
          {QUESTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <div style={{flex: 1}} />
        <div className="row" style={{gap: 4, fontSize: 12}}>
          <span className="muted">Points:</span>
          <input className="input" type="number" value={q.points} onChange={e => onChange({ points: parseInt(e.target.value) || 0 })} style={{width: 50, height: 26, padding: "0 8px", fontSize: 12}} />
        </div>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onDuplicate} title="Duplicate"><Icons.Layers size={14} /></button>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onDelete} title="Delete"><Icons.Trash size={14} /></button>
      </div>

      <textarea className="textarea" rows={2} value={q.prompt} onChange={e => onChange({ prompt: e.target.value })}
        placeholder="Question prompt..." style={{fontSize: 16, fontWeight: 500, padding: 14, marginBottom: 16}} />

      {/* Type-specific editor */}
      {q.type === "mcq" && (
        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
          {(q.options || []).map((o, i) => (
            <div key={o.id} className="row" style={{gap: 10}}>
              <label className="row" style={{gap: 6, cursor: "pointer"}}>
                <input type="radio" name={`q${q.id}`} checked={o.correct} onChange={() => onChange({ options: q.options.map(x => ({ ...x, correct: x.id === o.id })) })} />
                <span style={{fontSize: 12, fontWeight: 600, color: o.correct ? "var(--success)" : "var(--muted)", width: 70}}>{o.correct ? "CORRECT" : "Mark right"}</span>
              </label>
              <input className="input" value={o.text} onChange={e => onChange({ options: q.options.map(x => x.id === o.id ? { ...x, text: e.target.value } : x) })}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                style={{flex: 1, background: o.correct ? "var(--success-tint)" : "var(--card)", borderColor: o.correct ? "var(--success)" : "var(--line-2)"}} />
              <button className="btn btn-ghost btn-sm btn-icon"><Icons.Trash size={12} /></button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{alignSelf: "flex-start", marginTop: 4}}>
            <Icons.Plus size={12} /> Add option
          </button>
        </div>
      )}

      {q.type === "tf" && (
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
          {[true, false].map(v => (
            <button key={String(v)} onClick={() => onChange({ answer: v })}
              style={{padding: 16, border: q.answer === v ? "1px solid var(--success)" : "1px solid var(--line-2)",
                       background: q.answer === v ? "var(--success-tint)" : "var(--card)",
                       borderRadius: "var(--r-md)", cursor: "pointer", fontWeight: 600,
                       fontFamily: "var(--font-display)", fontSize: 18}}>
              {v ? "True" : "False"} {q.answer === v && <span style={{fontSize: 11, marginLeft: 8, color: "var(--success)"}}>✓ correct</span>}
            </button>
          ))}
        </div>
      )}

      {q.type === "fib" && (
        <div>
          <div className="muted" style={{fontSize: 12, marginBottom: 10}}>Use <code style={{background: "var(--paper-2)", padding: "1px 4px", borderRadius: 3}}>___</code> in your prompt for each blank, then list accepted answers:</div>
          {(q.blanks || ["", ""]).map((b, i) => (
            <div key={i} className="row" style={{gap: 8, marginBottom: 8}}>
              <span style={{width: 60, fontSize: 12, color: "var(--muted)", fontWeight: 600}}>Blank {i + 1}</span>
              <input className="input" value={b} placeholder="Accepted answer..." />
              <button className="btn btn-ghost btn-sm">+ alt</button>
            </div>
          ))}
        </div>
      )}

      {q.type === "short" && (
        <div>
          <div className="eyebrow" style={{marginBottom: 8}}>Grading rubric (for you, hidden from students)</div>
          <textarea className="textarea" rows={3} placeholder="What does a strong answer look like?..." defaultValue={q.rubric} />
          <div style={{display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: 10, background: "var(--brand-tint)", borderRadius: "var(--r-md)", fontSize: 12}}>
            <Icons.Sparkle size={14} color="var(--brand)" />
            <span style={{flex: 1, color: "var(--brand-2)"}}>AI will suggest a score; you confirm or override.</span>
          </div>
        </div>
      )}

      {q.type === "match" && (
        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
          {[1, 2, 3].map(i => (
            <div key={i} className="row" style={{gap: 8}}>
              <span style={{width: 18, fontSize: 12, color: "var(--muted)", fontWeight: 600}}>{i}</span>
              <input className="input" placeholder="Left side..." />
              <Icons.ArrowRight size={14} color="var(--muted)" />
              <input className="input" placeholder="Matches with..." />
              <button className="btn btn-ghost btn-sm btn-icon"><Icons.Trash size={12} /></button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{alignSelf: "flex-start"}}><Icons.Plus size={12} /> Add pair</button>
        </div>
      )}

      {q.type === "essay" && (
        <div>
          <div className="card card-pad" style={{background: "var(--paper-2)", border: 0}}>
            <div className="eyebrow" style={{marginBottom: 8}}>Student will see</div>
            <div style={{fontSize: 12, color: "var(--muted)", marginBottom: 6}}>A textarea for long-form writing.</div>
            <div style={{padding: 12, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 6, minHeight: 60, color: "var(--faint)", fontSize: 13}}>Type your essay here...</div>
          </div>
          <div className="row" style={{gap: 12, marginTop: 12}}>
            <Field label="Min words"><input className="input" defaultValue="200" style={{width: 80, height: 30}} /></Field>
            <Field label="Max words"><input className="input" defaultValue="500" style={{width: 80, height: 30}} /></Field>
          </div>
        </div>
      )}

      {q.type === "code" && (
        <div>
          <div className="eyebrow" style={{marginBottom: 8}}>Expected output / answer (regex supported)</div>
          <textarea className="textarea mono" rows={3} placeholder="// e.g. ^42$ or factorial(5)" />
          <div className="row" style={{gap: 8, marginTop: 10, fontSize: 12, color: "var(--muted)"}}>
            <span>Language:</span>
            <select className="select" style={{height: 28, padding: "0 24px 0 8px", fontSize: 12, width: "auto"}}>
              <option>Math (LaTeX)</option>
              <option>Python</option>
              <option>JavaScript</option>
            </select>
          </div>
        </div>
      )}

      {q.type === "upload" && (
        <div className="card card-pad" style={{background: "var(--paper-2)", border: "1px dashed var(--line-2)", textAlign: "center"}}>
          <Icons.Upload size={22} color="var(--muted)" />
          <div style={{fontWeight: 600, marginTop: 8, fontSize: 13}}>Accepts file uploads from students</div>
          <div className="muted" style={{fontSize: 12, marginTop: 4}}>PDF, DOCX, JPG, PNG, MP3 · max 25MB</div>
        </div>
      )}
    </div>
  );
};

window.TeacherBuilder = TeacherBuilder;
