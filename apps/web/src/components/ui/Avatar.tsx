export function Avatar({ name = '??', size = 'md', color, src }: {
  name?: string; size?: 'sm' | 'md' | 'lg'; color?: string; src?: string
}) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const cls = ['avatar', size === 'lg' ? 'avatar-lg' : size === 'sm' ? 'avatar-sm' : ''].filter(Boolean).join(' ')
  return (
    <span className={cls} style={{ background: color, color: color ? '#fff' : undefined }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </span>
  )
}
