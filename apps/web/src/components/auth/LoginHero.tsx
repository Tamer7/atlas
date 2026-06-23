export function LoginHero() {
  return (
    <div
      className="flex flex-col justify-between p-12 text-white min-h-screen"
      style={{
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 60%, #0E2278 100%)',
      }}
    >
      {/* Live count */}
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full" style={{ background: '#7DDE8C' }} />
        <span className="text-xs font-semibold tracking-[0.1em] uppercase opacity-80">
          1,200 lessons taught this week
        </span>
      </div>

      {/* Main copy */}
      <div>
        <p
          className="font-semibold mb-8"
          style={{ fontSize: 52, lineHeight: 1.02, letterSpacing: '-0.035em' }}
        >
          Learn anything,
          <br />
          <span style={{ opacity: 0.65 }}>one focused</span>
          <br />
          session at a time.
        </p>

        {/* Decorative cards */}
        <div className="grid grid-cols-2 gap-3.5">
          <div
            className="p-4"
            style={{
              background: 'rgba(255,255,255,.10)',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 14,
              backdropFilter: 'blur(8px)',
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.1em] mb-2"
              style={{ opacity: 0.7 }}
            >
              Now playing
            </p>
            <p className="font-semibold text-[22px] leading-tight mb-3.5">
              Mixed Conditionals
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span>▶</span>
              <div
                className="flex-1 h-[3px] rounded-pill"
                style={{ background: 'rgba(255,255,255,.2)' }}
              >
                <div
                  className="h-full rounded-pill"
                  style={{ width: '62%', background: '#fff' }}
                />
              </div>
              <span style={{ opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}>
                06:48 / 18:05
              </span>
            </div>
          </div>

          <div
            className="p-4"
            style={{
              background: 'rgba(255,255,255,.10)',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 14,
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.1em] mb-2"
              style={{ opacity: 0.7 }}
            >
              Today
            </p>
            <p className="font-semibold text-[22px] leading-tight mb-3.5">
              3 lessons · 1 quiz
            </p>
            <div className="flex gap-1.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-[22px] h-[22px]"
                  style={{ borderRadius: 6, background: '#7DDE8C' }}
                />
              ))}
              {[3, 4].map((i) => (
                <div
                  key={i}
                  className="w-[22px] h-[22px]"
                  style={{ borderRadius: 6, background: 'rgba(255,255,255,.2)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <blockquote
        className="text-[13px] max-w-[360px] leading-relaxed"
        style={{ opacity: 0.75 }}
      >
        "Atlas changed how I prep my IELTS students — the grading flow used to take my
        Sundays. Now it takes my coffee break."
        <footer className="mt-2.5 font-semibold" style={{ opacity: 0.9 }}>
          — Prof. Marcus Vale, IELTS Coach
        </footer>
      </blockquote>
    </div>
  );
}
