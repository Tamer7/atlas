import { ElementType, ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'brand' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ElementType
  iconRight?: ElementType
  block?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'secondary', size = 'md', icon: Icon, iconRight: IconR,
  block, children, className = '', ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    !children ? 'btn-icon' : '',
    className,
  ].filter(Boolean).join(' ')
  const iconSize = size === 'lg' ? 16 : 14
  return (
    <button className={cls} {...rest}>
      {Icon && <Icon size={iconSize} />}
      {children}
      {IconR && <IconR size={iconSize} />}
    </button>
  )
}
