'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { landingPathFor } from '@/lib/auth/guard'

/**
 * Catch-all inside the (app) group, so an unknown URL renders inside the normal
 * shell — sidebar and all — instead of Next's bare default 404 page.
 *
 * Concrete routes always win over a catch-all, so this only fires for URLs that
 * match nothing else. Paths outside this group (e.g. /login) are unaffected.
 */
export default function AppNotFound() {
  const { user } = useAuth()
  const home = user ? landingPathFor(user) : '/login'

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumbs">Not found</div>
          <h1 className="h1">404</h1>
        </div>
      </div>

      <div className="card card-pad-lg" style={{ maxWidth: 520 }}>
        <p className="muted" style={{ marginBottom: 20 }}>
          That page doesn&apos;t exist. It may have been moved, or the link that
          brought you here is out of date.
        </p>
        <Link href={home} className="btn btn-brand">
          Back to your dashboard
        </Link>
      </div>
    </div>
  )
}
