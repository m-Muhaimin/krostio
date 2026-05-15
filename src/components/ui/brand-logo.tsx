/**
 * BrandLogo — renders the Krostio SVG logo.
 *
 * Sizes (icon only):
 *   sm       (20×20)
 *   default  (28×28)  — matches the original nav mark
 *   lg       (40×40)
 *
 * Variants:
 *   'dark'  — white K on ink-black square   ← default (for dark-on-light pages)
 *   'light' — ink-black K on white square   ← for light-on-dark page sections
 *
 * Wordmark (icon + text):
 *   variant="wordmark" — renders the horizontal wordmark SVG
 */

import LogoDark from '../../../media/logo.svg'
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

  const src = variant === 'light' ? LogoLight : LogoDark

  return (
    <Image
      src={src}
      alt="Krostio"
      width={px}
      height={px}
      className={className}
    />
  )
}
