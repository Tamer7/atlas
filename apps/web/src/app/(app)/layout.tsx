export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder — full sidebar added in Phase 2 */}
      <aside
        className="flex-shrink-0 flex flex-col"
        style={{
          width: 248,
          background: 'var(--paper-2)',
          borderRight: '1px solid var(--line)',
          padding: '24px 16px',
        }}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-7 h-7 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--ink)', borderRadius: 'var(--r-sm)' }}
          >
            A
          </div>
          <span className="font-semibold text-ink text-lg tracking-tight">Atlas</span>
        </div>
        <p className="text-xs text-muted">Navigation coming in Phase 2</p>
      </aside>
      <main className="flex-1 bg-paper">{children}</main>
    </div>
  );
}
