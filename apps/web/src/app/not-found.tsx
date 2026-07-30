import Link from 'next/link'

/**
 * Root-level fallback. The in-shell 404 at (app)/[...notfound] handles anything
 * under the authenticated app; this covers notFound() calls raised outside that
 * group, where no sidebar exists to render into.
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--paper)',
        padding: 24,
      }}
    >
      <div className="card card-pad-lg" style={{ maxWidth: 460, textAlign: 'center' }}>
        <h1 className="h1" style={{ marginBottom: 8 }}>404</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          That page doesn&apos;t exist.
        </p>
        <Link href="/login" className="btn btn-brand">
          Go to sign in
        </Link>
      </div>
    </div>
  )
}
