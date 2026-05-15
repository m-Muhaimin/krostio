/**
 * BrandLogo — renders the Krostio logo as PNG.
 *
 * Sizes (icon only):
 *   sm       (20×20)
 *   default  (28×28)  — matches the original nav mark
 *   lg       (40×40)
 *
 * Variants:
 *   'dark'  — white K on ink-black square (logo.png)
 *   'light' — ink-black K on white square (logo-light.png)
 */

import LogoDark from '../../../media/logo.png'
import LogoLight from '../../../media/logo-light.svg'
import LogoWordmark from '../../../media/logo-wordmark.svg'
import Image from 'next/image'

const iconSizeMap = {
  sm: 20,
  default: 28,
  lg: 40,
} as const

type IconSize = keyof typeof iconSizeMap
type LogoVariant = 'dark' | 'light' | 'wordmark'

interface BrandLogoProps {
  size?: IconSize
  variant?: LogoVariant
  className?: string
}

export function BrandLogo({ size = 'default', variant = 'dark', className = '' }: BrandLogoProps) {
  const px = iconSizeMap[size]

  if (variant === 'wordmark') {
    return (
      <Image
        src={LogoWordmark}
        alt="Krostio"
        width={Math.round(px * 3.75)}
        height={px}
        className={className}
      />
    )
  }

  if (variant === 'dark') {
    return (
      <Image
        src={LogoDark}
        alt="Krostio"
        width={px}
        height={px}
        className={className}
        priority
      />
    )
  }

  // light variant — no PNG light file yet, use SVG
  return (
    <Image
      src={LogoLight}
      alt="Krostio"
      width={px}
      height={px}
      className={className}
    />
  )
}
