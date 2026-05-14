'use client'

type Variant = 'primary' | 'primary-light' | 'secondary' | 'pill-outline' | 'ink' | 'outline' | 'signal'

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  onClick,
  type = 'button',
}: {
  children: React.ReactNode
  variant?: Variant
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  const map: Record<Variant, string> = {
    primary: 'btn-primary',
    'primary-light': 'btn-primary-light',
    secondary: 'btn-secondary',
    'pill-outline': 'btn-pill-outline',
    // Legacy aliases
    ink: 'btn-primary',
    outline: 'btn-outline',
    signal: 'btn-primary',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${map[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
