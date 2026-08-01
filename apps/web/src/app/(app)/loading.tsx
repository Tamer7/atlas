import { Skeleton, SkeletonPageHead } from '@/components/ui'

/**
 * Route-level fallback. Previously an empty div, which is why a refresh looked
 * like the content had simply vanished.
 */
export default function AppLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <SkeletonPageHead />
      <div className="g g-cards">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skeleton w="55%" h={14} />
            <Skeleton w="80%" h={11} />
            <Skeleton w="35%" h={11} />
          </div>
        ))}
      </div>
    </div>
  )
}
