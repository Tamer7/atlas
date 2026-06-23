import { Badge } from '@/components/ui'

export function statusBadge(status: string) {
  if (status === 'live') return <span className="live-pill-sm">LIVE NOW</span>
  if (status === 'soon') return <Badge tone="warning">Starts soon</Badge>
  return <Badge>Scheduled</Badge>
}
