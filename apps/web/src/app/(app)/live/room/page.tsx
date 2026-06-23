import { Suspense } from 'react'
import { LiveRoomClient } from './LiveRoomClient'

export default function LiveRoomPage() {
  return (
    <Suspense fallback={<div className="lr" style={{ display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,.5)', fontSize: 14 }}>Joining room…</div>}>
      <LiveRoomClient />
    </Suspense>
  )
}
