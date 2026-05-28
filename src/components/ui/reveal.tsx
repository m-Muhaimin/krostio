'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function RevealOnScroll({ children, delay = 0 }: { children: ReactNode; delay?: 0 | 1 | 2 }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const cls = ['reveal', delay ? `reveal-delay-${delay}` : ''].filter(Boolean).join(' ')

  return <div ref={ref} className={cls}>{children}</div>
}
