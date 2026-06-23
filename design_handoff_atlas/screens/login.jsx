/* global React, Icons */

const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = React.useState("link"); // 'link' | 'password'
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [linkSent, setLinkSent] = React.useState(false);

  return (
    <div className="login-shell" data-screen-label="00 Login">
      {/* LEFT — login forms */}
      <div className="login-left">
        <div className="login-card">
          <div className="brand-mark" style={{padding: 0, marginBottom: 40}}>
            <div className="logo">A</div>
            <div className="name">Atlas</div>
          </div>

          <h1 className="h1" style={{marginBottom: 8}}>Welcome back.</h1>
          <p className="muted" style={{marginBottom: 28, fontSize: 15, maxWidth: 360}}>
            Sign in to continue your learning. Choose <span style={{color: "var(--ink)", fontWeight: 600}}>magic link</span> for a passwordless flow, or use your password.
          </p>

          {/* Side-by-side methods */}
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 4, background: "var(--paper-2)", borderRadius: "var(--r-md)", marginBottom: 24}}>
            <button onClick={() => setMode("link")}
              style={{background: mode === "link" ? "var(--card)" : "transparent",
                      boxShadow: mode === "link" ? "var(--sh-sm)" : "none",
                      border: 0, padding: "10px 12px", borderRadius: "var(--r-sm)",
                      fontWeight: 600, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      color: mode === "link" ? "var(--ink)" : "var(--muted)"}}>
              <Icons.Sparkle size={14} /> Magic link
            </button>
            <button onClick={() => setMode("password")}
              style={{background: mode === "password" ? "var(--card)" : "transparent",
                      boxShadow: mode === "password" ? "var(--sh-sm)" : "none",
                      border: 0, padding: "10px 12px", borderRadius: "var(--r-sm)",
                      fontWeight: 600, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      color: mode === "password" ? "var(--ink)" : "var(--muted)"}}>
              <Icons.Lock size={14} /> Password
            </button>
          </div>

          {linkSent ? (
            <div style={{padding: 20, background: "var(--success-tint)", border: "1px solid #B5DBC0", borderRadius: "var(--r-md)", marginBottom: 16}}>
              <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 6}}>
                <Icons.Mail size={16} color="var(--success)" />
                <b style={{color: "var(--success)"}}>Check your inbox</b>
              </div>
              <p style={{margin: 0, fontSize: 13, color: "var(--ink-2)"}}>
                We sent a sign-in link to <b>{email || "your email"}</b>. It expires in 15 minutes.
              </p>
              <button className="btn btn-ghost btn-sm" style={{marginTop: 12, padding: 0}} onClick={() => setLinkSent(false)}>Use a different email →</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (mode === "link") setLinkSent(true); else onLogin(); }}>
              <Field label="Email" hint={mode === "link" ? "We'll email you a sign-in link" : undefined}>
                <input className="input input-lg" type="email" placeholder="you@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </Field>

              {mode === "password" && (
                <>
                  <div style={{height: 14}} />
                  <Field label="Password">
                    <div style={{position: "relative"}}>
                      <input className="input input-lg" type={showPw ? "text" : "password"} placeholder="••••••••"
                        value={pw} onChange={e => setPw(e.target.value)} style={{paddingRight: 40}} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        style={{position: "absolute", right: 10, top: 0, bottom: 0, border: 0, background: "transparent", color: "var(--muted)", cursor: "pointer"}}>
                        <Icons.Eye size={16} />
                      </button>
                    </div>
                  </Field>
                  <div style={{textAlign: "right", marginTop: 6}}>
                    <a href="#" style={{color: "var(--brand)", fontSize: 12, fontWeight: 600, textDecoration: "none"}}>Forgot password?</a>
                  </div>
                </>
              )}

              <div style={{height: 20}} />
              <button className="btn btn-brand btn-lg btn-block" type="submit">
                {mode === "link" ? <><Icons.Sparkle size={16} /> Send sign-in link</> : <><Icons.ArrowRight size={16} /> Sign in</>}
              </button>
            </form>
          )}

          <div style={{margin: "28px 0 16px", display: "flex", alignItems: "center", gap: 10, color: "var(--faint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em"}}>
            <div style={{flex: 1, height: 1, background: "var(--line)"}} /> OR <div style={{flex: 1, height: 1, background: "var(--line)"}} />
          </div>

          <button className="btn btn-secondary btn-lg btn-block">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.7 7.9 22 12 22z"/><path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 2.7 7.1l3.5 2.7c.8-2.5 3.1-4 5.8-4z"/></svg>
            Continue with Google
          </button>

          <p style={{marginTop: 28, color: "var(--muted)", fontSize: 12, textAlign: "center"}}>
            New here? <a href="#" style={{color: "var(--ink)", fontWeight: 600, textDecoration: "none"}}>Create an account</a>
          </p>
        </div>
      </div>

      {/* RIGHT — marketing/illustrative */}
      <div className="login-right">
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <div style={{width: 8, height: 8, borderRadius: "50%", background: "#7DDE8C"}} />
          <span style={{fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", opacity: .8}}>1,200 lessons taught this week</span>
        </div>

        <div>
          <div style={{fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 600, lineHeight: 1.02, letterSpacing: "-0.035em", marginBottom: 24}}>
            Learn anything,<br/>
            <span style={{opacity: .65}}>one focused</span><br/>
            session at a time.
          </div>

          {/* Decorative course cards */}
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 32}}>
            <div style={{background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: 16, backdropFilter: "blur(8px)"}}>
              <div style={{fontSize: 11, opacity: .7, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8}}>Now playing</div>
              <div style={{fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.1, marginBottom: 14}}>Mixed Conditionals</div>
              <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12}}>
                <Icons.Play size={12} fill="#fff" />
                <div style={{flex: 1, height: 3, background: "rgba(255,255,255,.2)", borderRadius: 99}}>
                  <div style={{width: "62%", height: "100%", background: "#fff", borderRadius: 99}} />
                </div>
                <span style={{fontVariantNumeric: "tabular-nums", opacity: .8}}>06:48 / 18:05</span>
              </div>
            </div>
            <div style={{background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: 16}}>
              <div style={{fontSize: 11, opacity: .7, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8}}>Today</div>
              <div style={{fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.1, marginBottom: 14}}>3 lessons · 1 quiz</div>
              <div style={{display: "flex", gap: 6}}>
                <div style={{width: 22, height: 22, borderRadius: 6, background: "#7DDE8C"}} />
                <div style={{width: 22, height: 22, borderRadius: 6, background: "#7DDE8C"}} />
                <div style={{width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,.2)"}} />
                <div style={{width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,.2)"}} />
              </div>
            </div>
          </div>
        </div>

        <div style={{fontSize: 13, opacity: .75, maxWidth: 360, lineHeight: 1.5}}>
          "Atlas changed how I prep my IELTS students — the grading flow used to take my Sundays. Now it takes my coffee break."
          <div style={{marginTop: 10, fontWeight: 600, opacity: .9}}>— Prof. Marcus Vale, IELTS Coach</div>
        </div>
      </div>
    </div>
  );
};

window.LoginScreen = LoginScreen;
