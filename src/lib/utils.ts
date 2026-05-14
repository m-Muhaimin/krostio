import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatScore(score: number): string {
  if (score >= 750) return 'Excellent'
  if (score >= 670) return 'Good'
  if (score >= 580) return 'Fair'
  return 'Needs Improvement'
}

export function getScoreColor(score: number): string {
  if (score >= 750) return 'text-green-500'
  if (score >= 670) return 'text-blue-500'
  if (score >= 580) return 'text-yellow-500'
  return 'text-red-500'
}

export function getScoreBarColor(score: number): string {
  if (score >= 750) return 'bg-green-500'
  if (score >= 670) return 'bg-blue-500'
  if (score >= 580) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function generateAttestationId(): string {
  return `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`
}

export function daysSince(date: string): number {
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  )
}
