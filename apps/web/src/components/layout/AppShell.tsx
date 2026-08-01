'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'

/**
 * App chrome for every signed-in route.
 *
 * Above 960px this is a two-column grid: fixed sidebar, independently
 * scrolling main. Below it the sidebar turns into an off-canvas drawer opened
 * from a sticky top bar — the grid collapses to a single column via CSS, so no
 * JS media query is involved and there is no hydration mismatch.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [lastPathname, setLastPathname] = useState(pathname)

  // Navigating away should always dismiss the drawer — including on browser
  // back/forward, which no click handler sees. Adjusting state during render
  // is React's recommended way to reset on a changed input; an effect here
  // would render the stale open drawer for a frame first.
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    // Freeze the page behind the drawer so touch scrolling stays in the panel.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <button
          type="button"
          className="app-topbar-btn"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="app-nav"
        >
          <Menu size={20} />
        </button>
        <div className="app-topbar-brand">
          <span className="logo">A</span>
          Atlas
        </div>
      </header>

      <div
        className={`app-scrim${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <Sidebar id="app-nav" open={open} onNavigate={() => setOpen(false)} />

      <main className="app-main">
        <div className="app-inner">{children}</div>
      </main>
    </div>
  )
}
