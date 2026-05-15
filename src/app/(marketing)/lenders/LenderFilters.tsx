'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const LOAN_TYPES = [
  { value: 'auto', label: 'Auto' },
  { value: 'personal', label: 'Personal' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'business', label: 'Business' },
  { value: 'cash_advance', label: 'Cash advance' },
] as const

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export default function LenderFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const selectedTypes = (params.get('types') ?? '').split(',').filter(Boolean)
  const state = params.get('state') ?? ''
  const minAmount = params.get('min_amount') ?? ''

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value && value.length > 0) next.set(key, value)
      else next.delete(key)
      const qs = next.toString()
      router.replace(qs ? `/lenders?${qs}` : '/lenders', { scroll: false })
    },
    [params, router],
  )

  const toggleType = (val: string) => {
    const set = new Set(selectedTypes)
    if (set.has(val)) set.delete(val)
    else set.add(val)
    updateParam('types', set.size ? Array.from(set).join(',') : null)
  }

  const hasFilters = selectedTypes.length > 0 || state || minAmount

  return (
    <aside className="card-bordered space-y-7 p-6">
      <div>
        <p className="text-mono-label text-slate">Loan type</p>
        <div className="mt-3 space-y-2">
          {LOAN_TYPES.map((t) => (
            <label key={t.value} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={selectedTypes.includes(t.value)}
                onChange={() => toggleType(t.value)}
                className="h-4 w-4 accent-[var(--color-deep-green)]"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-mono-label text-slate">State</p>
        <select
          value={state}
          onChange={(e) => updateParam('state', e.target.value || null)}
          className="mt-3 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-ink-black"
        >
          <option value="">All states</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-mono-label text-slate">Minimum loan amount</p>
        <input
          type="number"
          min={0}
          step={1000}
          value={minAmount}
          placeholder="$0"
          onChange={(e) => updateParam('min_amount', e.target.value || null)}
          className="mt-3 w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-ink-black"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.replace('/lenders', { scroll: false })}
          className="link-editorial text-sm"
        >
          Clear filters
        </button>
      )}
    </aside>
  )
}
