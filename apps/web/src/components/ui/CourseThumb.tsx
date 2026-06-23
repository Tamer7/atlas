interface Course { id: number; tag: string; title: string; glyph?: string }
export function CourseThumb({ course, size = 'md' }: { course: Course; size?: 'sm' | 'md' }) {
  const grads = ['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5', 'grad-6']
  const grad = grads[course.id % grads.length]
  return (
    <div className={`thumb ${grad}`} style={size === 'sm' ? { fontSize: 14 } : {}}>
      <div className="thumb-tag">{course.tag}</div>
      <div className="thumb-title" style={size === 'sm' ? { fontSize: 16 } : {}}>{course.title}</div>
      <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.18, fontSize: 140, lineHeight: 1, color: '#fff', userSelect: 'none' }}>
        {course.glyph || course.title[0]}
      </div>
    </div>
  )
}
