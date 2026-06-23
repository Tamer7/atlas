/* global React, Icons, DATA */

// ============ TEACHER — GRADING ============
const TeacherGrading = () => {
  const [selected, setSelected] = React.useState(0);
  const queue = DATA.gradingQueue;
  const item = queue[selected];

  // Mock written submissions for current item
  const submission = {
    student: item.student,
    color: item.color,
    submittedAt: item.submitted,
    autoSection: {
      mcq: { score: 6, total: 8 },
      tf: { score: 4, total: 4 },
      breakdown: [
        { q: "Which sentence is a correctly-formed mixed conditional?", correct: true },
        { q: "Mixed conditionals always combine past with present.", correct: true },
        { q: "If I _ harder, I _ now.", correct: false, given: "studied / would have passed", expected: "had studied / would be passing" },
      ],
    },
    manualQuestions: [
      {
        id: "wq1", number: 4, points: 5, type: "Short answer",
        prompt: "In your own words, when would you choose a mixed conditional over a regular second or third conditional?",
        answer: "I would use a mixed conditional when I want to talk about a past action that still affects the present, like if I missed a flight last week and now I'm stuck somewhere. The third conditional only talks about past results, but mixed lets me bridge into now. It feels more natural in real conversation, because life doesn't usually stay in one tense.",
        rubric: "Look for: separation of past cause / present effect; nuance/contrast in time. Bonus: a clear example.",
        aiSuggested: 4,
        aiNotes: "Strong. Clear distinction, good example. Could mention reverse pattern (present condition, past result) for full marks.",
      },
      {
        id: "wq2", number: 7, points: 8, type: "Essay",
        prompt: "Describe a time when a past choice still shapes your present. Use at least two mixed conditional sentences.",
        answer: "If I hadn't moved to Madrid for university four years ago, I wouldn't be working at a Spanish-speaking company today. At the time, the decision felt impulsive — I had a stable offer in my home country, and most of my friends thought I was making a mistake. But if I were more risk-averse back then, I would have stayed there now, probably bored in a job I didn't care about.\n\nLooking back, the move shaped almost everything: my career, my partner, my second language. If my parents had pushed me harder to take the safe option, I would be living a very different life right now.",
        rubric: "2+ mixed conditionals · clear cause/effect across time · natural register.",
        aiSuggested: 7,
        aiNotes: "Excellent. Three mixed conditionals identified. Natural tone. Minor: 'were more risk-averse → would have stayed' is technically present→past (acceptable variant).",
      },
    ],
  };

  return (
    <div data-screen-label="11 Teacher · Grading">
      <div className="page-head">
        <div>
          <div className="crumbs">Assessments / Grading queue</div>
          <h1 className="h1">Grade submissions</h1>
        </div>
        <div className="row">
          <button className="btn btn-secondary"><Icons.Filter size={14} /> Filter</button>
          <button className="btn btn-secondary"><Icons.Sparkle size={14} /> AI suggest all</button>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "flex-start"}}>
        {/* Queue list */}
        <div className="card" style={{padding: 0, overflow: "hidden", position: "sticky", top: 24}}>
          <div style={{padding: "12px 14px", borderBottom: "1px solid var(--line)", background: "var(--paper)", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div>
              <div className="eyebrow">In queue</div>
              <div style={{fontSize: 13, marginTop: 2}}><b>{queue.length}</b> awaiting</div>
            </div>
            <SegControl value="all" onChange={() => {}} options={[
              { value: "all", label: "All" },
              { value: "mine", label: "Mine" },
            ]} />
          </div>
          <div>
            {queue.map((g, i) => (
              <button key={g.id} onClick={() => setSelected(i)}
                style={{
                  width: "100%", display: "flex", gap: 12, padding: "12px 14px",
                  border: 0, background: selected === i ? "var(--brand-tint)" : "transparent",
                  textAlign: "left", cursor: "pointer", borderBottom: "1px solid var(--line)",
                  borderLeft: selected === i ? "3px solid var(--brand)" : "3px solid transparent",
                }}>
                <Avatar name={g.student} color={g.color} />
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 2}}>
                    <b style={{fontSize: 13}}>{g.student}</b>
                    <Badge tone={g.type === "Exam" ? "danger" : "brand"}>{g.type}</Badge>
                  </div>
                  <div style={{fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{g.item}</div>
                  <div style={{display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11, color: "var(--muted)"}}>
                    <Icons.Clock size={11} /> {g.submitted}
                    {g.needsReview > 0 && <><span className="dot-sep" /> {g.needsReview} written</>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submission detail */}
        <div>
          {/* Header */}
          <div className="card card-pad-lg" style={{marginBottom: 16}}>
            <div className="row" style={{gap: 16, marginBottom: 16}}>
              <Avatar name={submission.student} color={submission.color} size="lg" />
              <div style={{flex: 1}}>
                <div className="row" style={{gap: 8, marginBottom: 4}}>
                  <h2 className="h3">{submission.student}</h2>
                  <Badge tone={item.type === "Exam" ? "danger" : "brand"}>{item.type}</Badge>
                </div>
                <div className="muted" style={{fontSize: 13}}>{item.item} · {item.course} · Submitted {item.submitted}</div>
              </div>
              <div className="row" style={{gap: 8}}>
                <button className="btn btn-secondary"><Icons.ArrowLeft size={14} /> Prev</button>
                <button className="btn btn-secondary">Next <Icons.ArrowRight size={14} /></button>
              </div>
            </div>

            {/* Score summary */}
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12}}>
              <div style={{padding: 14, background: "var(--paper-2)", borderRadius: "var(--r-md)"}}>
                <div className="eyebrow" style={{marginBottom: 4}}>Auto-graded</div>
                <div style={{fontSize: 22, fontWeight: 600, fontFamily: "var(--font-display)"}}>{submission.autoSection.mcq.score + submission.autoSection.tf.score} <span style={{color: "var(--muted)", fontSize: 14}}>/ {submission.autoSection.mcq.total + submission.autoSection.tf.total}</span></div>
              </div>
              <div style={{padding: 14, background: "var(--brand-tint)", borderRadius: "var(--r-md)"}}>
                <div className="eyebrow" style={{marginBottom: 4, color: "var(--brand-2)"}}>Manual (you)</div>
                <div style={{fontSize: 22, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--brand-2)"}}>11 <span style={{color: "var(--muted)", fontSize: 14}}>/ 13</span></div>
              </div>
              <div style={{padding: 14, background: "var(--paper-2)", borderRadius: "var(--r-md)"}}>
                <div className="eyebrow" style={{marginBottom: 4}}>Combined</div>
                <div style={{fontSize: 22, fontWeight: 600, fontFamily: "var(--font-display)"}}>21 <span style={{color: "var(--muted)", fontSize: 14}}>/ 25</span></div>
              </div>
              <div style={{padding: 14, background: "var(--success-tint)", borderRadius: "var(--r-md)"}}>
                <div className="eyebrow" style={{marginBottom: 4, color: "var(--success)"}}>Final grade</div>
                <div style={{fontSize: 22, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--success)"}}>84%</div>
              </div>
            </div>
          </div>

          {/* Auto-graded summary */}
          <div className="card card-pad" style={{marginBottom: 16}}>
            <div className="between" style={{marginBottom: 12}}>
              <div className="row" style={{gap: 8}}>
                <Icons.Sparkle size={14} color="var(--success)" />
                <b style={{fontSize: 14}}>Auto-graded section</b>
                <Badge tone="success">Done</Badge>
              </div>
              <button className="btn btn-ghost btn-sm">Expand <Icons.ChevronDown size={12} /></button>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
              {submission.autoSection.breakdown.map((b, i) => (
                <div key={i} className="row" style={{gap: 10, padding: "8px 12px", background: b.correct ? "var(--success-tint)" : "var(--danger-tint)", borderRadius: "var(--r-sm)"}}>
                  {b.correct ? <Icons.Check size={12} color="var(--success)" /> : <Icons.X size={12} color="var(--danger)" />}
                  <div style={{flex: 1, fontSize: 13}}>{b.q}</div>
                  {!b.correct && <span className="muted" style={{fontSize: 12, fontStyle: "italic"}}>"{b.given}"</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Manual questions */}
          {submission.manualQuestions.map((mq, i) => (
            <ManualGrader key={mq.id} q={mq} />
          ))}

          {/* Feedback + actions */}
          <div className="card card-pad-lg" style={{marginTop: 16}}>
            <h3 className="h3" style={{marginBottom: 14}}>Overall feedback to student</h3>
            <textarea className="textarea" rows={4}
              defaultValue="Strong submission overall — your mixed conditional usage in the essay was natural and accurate. One small thing to watch: the technical variant 'were more risk-averse → would have stayed' inverts the typical pattern. We'll cover this in the next session." />
            <div className="between" style={{marginTop: 16}}>
              <div className="row" style={{gap: 8}}>
                <button className="btn btn-ghost btn-sm"><Icons.Sparkle size={12} /> AI draft</button>
                <button className="btn btn-ghost btn-sm"><Icons.Paperclip size={12} /> Attach voice note</button>
              </div>
              <div className="row" style={{gap: 8}}>
                <button className="btn btn-secondary">Save draft</button>
                <button className="btn btn-brand">Return graded <Icons.Send size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Manual grader for a single written question
const ManualGrader = ({ q }) => {
  const [score, setScore] = React.useState(q.aiSuggested);
  const [comment, setComment] = React.useState("");
  const [usingAi, setUsingAi] = React.useState(true);

  return (
    <div className="card card-pad-lg" style={{marginBottom: 16}}>
      <div className="row" style={{gap: 10, marginBottom: 14}}>
        <div style={{width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "var(--paper)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700}}>
          {q.number}
        </div>
        <Badge>{q.type}</Badge>
        <Badge tone="warning">Manual review</Badge>
        <div style={{flex: 1}} />
        <div className="muted" style={{fontSize: 12}}>Worth {q.points} pts</div>
      </div>

      <div style={{fontSize: 16, lineHeight: 1.4, marginBottom: 18, color: "var(--ink-2)", fontFamily: "var(--font-display)"}}>{q.prompt}</div>

      {/* Student answer */}
      <div style={{padding: 16, background: "var(--paper-2)", borderRadius: "var(--r-md)", marginBottom: 16}}>
        <div className="eyebrow" style={{marginBottom: 8}}>Student's answer</div>
        <div style={{fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap"}}>{q.answer}</div>
      </div>

      {/* AI suggestion */}
      <div style={{padding: 14, background: "linear-gradient(90deg, var(--brand-tint), var(--paper-2))", borderRadius: "var(--r-md)", marginBottom: 16, border: "1px solid var(--brand-tint)"}}>
        <div className="row" style={{gap: 8, marginBottom: 6}}>
          <Icons.Sparkle size={14} color="var(--brand)" />
          <b style={{fontSize: 12, color: "var(--brand-2)", textTransform: "uppercase", letterSpacing: "0.08em"}}>AI suggestion</b>
          <Badge tone="brand">{q.aiSuggested} / {q.points}</Badge>
          <div style={{flex: 1}} />
          {!usingAi && <button className="btn btn-ghost btn-sm" onClick={() => { setScore(q.aiSuggested); setUsingAi(true); }}>Use suggestion</button>}
        </div>
        <div style={{fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5}}>{q.aiNotes}</div>
        <div className="muted" style={{fontSize: 11, marginTop: 8, fontStyle: "italic"}}>You're the final say. AI cross-checks against the rubric: {q.rubric}</div>
      </div>

      {/* Score control */}
      <div className="row" style={{gap: 16, marginBottom: 14}}>
        <div className="eyebrow">Your score</div>
        <div className="row" style={{gap: 6}}>
          {Array.from({length: q.points + 1}, (_, n) => (
            <button key={n} onClick={() => { setScore(n); setUsingAi(false); }}
              style={{
                width: 36, height: 36, borderRadius: "var(--r-sm)",
                border: 0, cursor: "pointer", fontWeight: 700, fontVariantNumeric: "tabular-nums", fontSize: 14,
                background: score === n ? "var(--ink)" : "var(--paper-2)",
                color: score === n ? "var(--paper)" : "var(--ink-2)",
              }}>{n}</button>
          ))}
        </div>
        <div className="muted" style={{fontSize: 13}}>of {q.points}</div>
      </div>

      {/* Comment */}
      <Field label="Your comment to student">
        <textarea className="textarea" rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Optional: leave specific feedback..." />
      </Field>
    </div>
  );
};

// ============ SETTINGS ============
const Settings = ({ role, user }) => {
  const [tab, setTab] = React.useState("profile");
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account & security" },
    { id: "notifications", label: "Notifications" },
    { id: "billing", label: "Billing" },
    { id: "appearance", label: "Appearance" },
  ];

  return (
    <div data-screen-label="12 Settings">
      <div className="page-head">
        <div>
          <div className="crumbs">{role === "teacher" ? "Instructor" : "Student"} account</div>
          <h1 className="h1">Settings</h1>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "200px 1fr", gap: 32}}>
        {/* Side tabs */}
        <div style={{display: "flex", flexDirection: "column", gap: 2}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: "10px 14px", textAlign: "left",
                background: tab === t.id ? "var(--card)" : "transparent",
                border: 0, borderRadius: "var(--r-md)",
                fontWeight: 500, fontSize: 13, cursor: "pointer",
                color: tab === t.id ? "var(--ink)" : "var(--muted)",
                boxShadow: tab === t.id ? "var(--sh-sm)" : "none",
              }}>{t.label}</button>
          ))}
        </div>

        <div style={{maxWidth: 680}}>
          {tab === "profile" && <ProfileTab user={user} role={role} />}
          {tab === "account" && <AccountTab user={user} />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "appearance" && <AppearanceTab />}
        </div>
      </div>
    </div>
  );
};

const ProfileTab = ({ user, role }) => (
  <div className="col" style={{gap: 24}}>
    <section className="card card-pad-lg">
      <h3 className="h3" style={{marginBottom: 4}}>Profile</h3>
      <p className="muted" style={{fontSize: 13, marginBottom: 20}}>How you appear across Atlas.</p>

      <div className="row" style={{gap: 20, marginBottom: 24}}>
        <Avatar name={user.name} color={user.color} size="lg" />
        <div>
          <button className="btn btn-secondary btn-sm">Upload photo</button>
          <div className="muted" style={{fontSize: 12, marginTop: 6}}>PNG or JPG · max 2MB</div>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
        <Field label="Full name"><input className="input" defaultValue={user.name} /></Field>
        <Field label="Display name"><input className="input" defaultValue={user.name.split(" ")[0]} /></Field>
        <Field label="Email"><input className="input" defaultValue={user.email} /></Field>
        <Field label="Time zone">
          <select className="select"><option>Europe/Madrid (GMT+2)</option><option>Europe/London</option><option>America/New_York</option></select>
        </Field>
        <Field label="Preferred language" hint="of the interface">
          <select className="select"><option>English</option><option>Español</option><option>Français</option></select>
        </Field>
        <Field label={role === "teacher" ? "Title" : "Goal"} hint="optional">
          <input className="input" defaultValue={role === "teacher" ? "Senior IELTS Coach" : "Reach C1 in English by Dec"} />
        </Field>
      </div>

      <hr className="divider" />

      <Field label="Bio" help="Shown on your public profile.">
        <textarea className="textarea" rows={3} defaultValue={role === "teacher" ?
          "IELTS examiner & language coach. 8 years of helping students cross the band-7 line." :
          "Software engineer prepping for a move to Madrid. Learning Spanish in parallel."} />
      </Field>

      <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24}}>
        <button className="btn btn-ghost">Discard</button>
        <button className="btn btn-primary">Save changes</button>
      </div>
    </section>
  </div>
);

const AccountTab = ({ user }) => (
  <div className="col" style={{gap: 24}}>
    <section className="card card-pad-lg">
      <h3 className="h3" style={{marginBottom: 4}}>Sign-in methods</h3>
      <p className="muted" style={{fontSize: 13, marginBottom: 20}}>Choose how you sign in to Atlas.</p>

      <div className="col" style={{gap: 12}}>
        <div className="row" style={{padding: 14, background: "var(--paper-2)", borderRadius: "var(--r-md)", gap: 14}}>
          <Icons.Mail size={20} color="var(--brand)" />
          <div style={{flex: 1}}>
            <b style={{fontSize: 13}}>Magic link sign-in</b>
            <div className="muted" style={{fontSize: 12, marginTop: 2}}>Get a one-time link emailed to {user.email}.</div>
          </div>
          <Badge tone="success">Enabled</Badge>
        </div>
        <div className="row" style={{padding: 14, background: "var(--paper-2)", borderRadius: "var(--r-md)", gap: 14}}>
          <Icons.Lock size={20} color="var(--brand)" />
          <div style={{flex: 1}}>
            <b style={{fontSize: 13}}>Password</b>
            <div className="muted" style={{fontSize: 12, marginTop: 2}}>Last changed 23 days ago</div>
          </div>
          <button className="btn btn-secondary btn-sm">Change</button>
        </div>
        <div className="row" style={{padding: 14, background: "var(--paper-2)", borderRadius: "var(--r-md)", gap: 14}}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.7 7.9 22 12 22z"/><path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 2.7 7.1l3.5 2.7c.8-2.5 3.1-4 5.8-4z"/></svg>
          <div style={{flex: 1}}>
            <b style={{fontSize: 13}}>Google</b>
            <div className="muted" style={{fontSize: 12, marginTop: 2}}>Not connected</div>
          </div>
          <button className="btn btn-secondary btn-sm">Connect</button>
        </div>
      </div>
    </section>

    <section className="card card-pad-lg">
      <h3 className="h3" style={{marginBottom: 4}}>Two-factor authentication</h3>
      <p className="muted" style={{fontSize: 13, marginBottom: 20}}>Adds a one-time code to your sign-in.</p>
      <div className="row" style={{gap: 14, padding: 14, background: "var(--warning-tint)", borderRadius: "var(--r-md)"}}>
        <Icons.Lock size={20} color="var(--warning)" />
        <div style={{flex: 1, fontSize: 13, color: "var(--ink-2)"}}>2FA is currently <b>off</b>. We strongly recommend enabling it.</div>
        <button className="btn btn-primary btn-sm">Enable 2FA</button>
      </div>
    </section>

    <section className="card card-pad-lg">
      <h3 className="h3" style={{marginBottom: 4, color: "var(--danger)"}}>Danger zone</h3>
      <p className="muted" style={{fontSize: 13, marginBottom: 16}}>These actions can't be undone.</p>
      <div className="col" style={{gap: 8}}>
        <div className="row" style={{padding: 12, border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", gap: 12}}>
          <div style={{flex: 1, fontSize: 13}}><b>Export account data</b><div className="muted" style={{fontSize: 12, marginTop: 2}}>Download everything in a ZIP.</div></div>
          <button className="btn btn-secondary btn-sm">Request export</button>
        </div>
        <div className="row" style={{padding: 12, border: "1px solid #F2C9C0", background: "var(--danger-tint)", borderRadius: "var(--r-md)", gap: 12}}>
          <div style={{flex: 1, fontSize: 13}}><b style={{color: "var(--danger)"}}>Delete account</b><div className="muted" style={{fontSize: 12, marginTop: 2}}>Permanently remove your account and all data.</div></div>
          <button className="btn btn-danger btn-sm">Delete</button>
        </div>
      </div>
    </section>
  </div>
);

const NotificationsTab = () => {
  const rows = [
    { label: "New lesson available", desc: "When a new lesson drops in a course you're in" },
    { label: "Quiz / exam graded", desc: "When your instructor returns a grade" },
    { label: "Discussion replies", desc: "Someone replies to your Q&A post" },
    { label: "Weekly progress digest", desc: "Summary of your week, every Monday" },
    { label: "Streak reminders", desc: "Gentle nudge if you miss a day" },
  ];
  return (
    <section className="card card-pad-lg">
      <h3 className="h3" style={{marginBottom: 4}}>Notifications</h3>
      <p className="muted" style={{fontSize: 13, marginBottom: 20}}>Choose how Atlas reaches you.</p>
      <table style={{width: "100%", borderCollapse: "collapse"}}>
        <thead>
          <tr style={{borderBottom: "1px solid var(--line)"}}>
            <th style={{textAlign: "left", padding: "8px 0", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em"}}></th>
            <th style={{padding: "8px 0", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", width: 80}}>Email</th>
            <th style={{padding: "8px 0", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", width: 80}}>Push</th>
            <th style={{padding: "8px 0", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", width: 80}}>In-app</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{borderBottom: "1px solid var(--line)"}}>
              <td style={{padding: "14px 0"}}>
                <b style={{fontSize: 13}}>{r.label}</b>
                <div className="muted" style={{fontSize: 12, marginTop: 2}}>{r.desc}</div>
              </td>
              <td style={{textAlign: "center"}}><Toggle defaultOn={i !== 4} /></td>
              <td style={{textAlign: "center"}}><Toggle defaultOn={i < 2} /></td>
              <td style={{textAlign: "center"}}><Toggle defaultOn /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

const Toggle = ({ defaultOn }) => {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <button onClick={() => setOn(!on)} style={{
      width: 36, height: 20, borderRadius: 99,
      background: on ? "var(--brand)" : "var(--line-2)",
      border: 0, cursor: "pointer", position: "relative",
      transition: "background .15s",
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 18 : 2,
        width: 16, height: 16, background: "#fff", borderRadius: "50%",
        transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)",
      }} />
    </button>
  );
};

const BillingTab = () => (
  <section className="card card-pad-lg">
    <h3 className="h3" style={{marginBottom: 4}}>Billing</h3>
    <p className="muted" style={{fontSize: 13, marginBottom: 20}}>Your plan and payment methods.</p>
    <div className="card card-pad" style={{background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)", color: "#fff", border: 0, marginBottom: 16}}>
      <div className="row" style={{justifyContent: "space-between"}}>
        <div>
          <div style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: .8, marginBottom: 6}}>Current plan</div>
          <div style={{fontFamily: "var(--font-display)", fontSize: 32, lineHeight: 1}}>Atlas Pro</div>
          <div style={{fontSize: 13, opacity: .85, marginTop: 8}}>€19 / month · renews June 19, 2026</div>
        </div>
        <button className="btn btn-secondary" style={{background: "#fff"}}>Manage plan</button>
      </div>
    </div>
    <div className="row" style={{padding: 14, border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", gap: 12}}>
      <div style={{width: 40, height: 28, background: "linear-gradient(135deg, #1A1F71, #3B5BC9)", borderRadius: 4, display: "grid", placeItems: "center", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em"}}>VISA</div>
      <div style={{flex: 1, fontSize: 13}}><b>•••• 4242</b><div className="muted" style={{fontSize: 12}}>Expires 09/27</div></div>
      <button className="btn btn-ghost btn-sm">Update</button>
    </div>
  </section>
);

const AppearanceTab = () => (
  <section className="card card-pad-lg">
    <h3 className="h3" style={{marginBottom: 4}}>Appearance</h3>
    <p className="muted" style={{fontSize: 13, marginBottom: 20}}>Personalize how Atlas looks. Try out theme variations from the Tweaks panel too.</p>
    <Field label="Density">
      <SegControl value="comfortable" onChange={() => {}} options={[
        { value: "compact", label: "Compact" },
        { value: "comfortable", label: "Comfortable" },
        { value: "spacious", label: "Spacious" },
      ]} />
    </Field>
    <div style={{height: 16}} />
    <Field label="Reduce motion">
      <div className="row" style={{gap: 10}}><Toggle /> <span style={{fontSize: 13, color: "var(--muted)"}}>Disable animated transitions</span></div>
    </Field>
  </section>
);

window.TeacherGrading = TeacherGrading;
window.Settings = Settings;
