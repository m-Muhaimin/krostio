'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

type MonthlyPoint = {
  month: string
  gross_total: number
}

function formatCurrency(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k'
  return '$' + Math.round(n)
}

function formatMonthLabel(iso: string): string {
  const [y, m] = iso.split('-')
  const d = new Date(parseInt(y), parseInt(m) - 1)
  return d.toLocaleDateString('en-US', { month: 'short' })
}

function formatMonthFull(iso: string): string {
  const [y, m] = iso.split('-')
  const d = new Date(parseInt(y), parseInt(m) - 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function ScoreTrendChart({ variant = 'dark', noCard }: { variant?: 'dark' | 'light'; noCard?: boolean }) {
  const isLight = variant === 'light'
  const [data, setData] = useState<MonthlyPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [animReady, setAnimReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  const PAD = { top: 32, right: 20, bottom: 36, left: 52 }

  useEffect(() => {
    fetch('/api/ledger/summary?months=12')
      .then((r) => r.json() as Promise<{ monthly: { month: string; gross_total: number }[] }>)
      .then((json) => {
        const raw = json.monthly ?? []
        const monthly: MonthlyPoint[] = raw
          .map((m) => ({ month: m.month, gross_total: Number(m.gross_total) || 0 }))
          .sort((a, b) => a.month.localeCompare(b.month))
        setData(monthly)
        setLoading(false)
        requestAnimationFrame(() => setAnimReady(true))
      })
      .catch(() => setLoading(false))
  }, [])

  const measure = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDims({ w: rect.width, h: rect.height })
    }
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const cw = dims.w || 600
  const ch = dims.h || 220
  const plotW = cw - PAD.left - PAD.right
  const plotH = ch - PAD.top - PAD.bottom

  const values = data.map((d) => d.gross_total)
  const maxVal = Math.max(...values, 1)
  const minVal = 0

  const xScale = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * plotW
  const yScale = (v: number) => PAD.top + plotH - ((v - minVal) / (maxVal - minVal)) * plotH

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d.gross_total)}`)
    .join('')

  const areaD =
    pathD +
    ` L${xScale(data.length - 1)},${PAD.top + plotH} L${xScale(0)},${PAD.top + plotH} Z`

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => minVal + (maxVal - minVal) * pct)

  // Build sparkline data: show the last 6 data points as a sparkline row
  const recent = data.slice(-6).reverse()

  return (
    <div
      ref={containerRef}
      className={isLight && !noCard ? 'card relative overflow-hidden' : isLight && noCard ? 'relative' : 'chart-body lg:col-span-2 relative'}
      style={{ minHeight: 280 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p className={isLight ? 'card-label mb-0' : 'chart-body-label'}>Income trend</p>
        {!loading && data.length > 0 && (
          <div className="flex items-center gap-3">
            <span className={`text-xs ${isLight ? 'text-muted-slate' : 'text-white/40'}`}>
              {formatMonthLabel(data[0].month)} – {formatMonthLabel(data[data.length - 1].month)}
            </span>
            <span className={`flex items-center gap-1.5 text-xs ${isLight ? 'text-slate' : 'text-white/60'}`}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-accent)' }} />
              Gross income
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: ch }}>
          <div className={`h-5 w-5 animate-spin rounded-full border-2 ${isLight ? 'border-ink-black border-t-transparent' : 'border-white border-t-transparent'}`} />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center" style={{ height: ch }}>
          <p className={`text-sm ${isLight ? 'text-slate' : 'text-white/50'}`}>No income data yet.</p>
          <p className={`mt-1 text-xs ${isLight ? 'text-muted-slate' : 'text-white/30'}`}>Connect platforms to see your trend.</p>
        </div>
      ) : (
        <svg width={cw} height={ch} className="overflow-visible">
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-chart-accent)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trend-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-chart-accent)" />
              <stop offset="100%" stopColor="var(--color-chart-accent-light)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                y1={yScale(v)}
                x2={cw - PAD.right}
                y2={yScale(v)}
                stroke={isLight ? 'var(--color-hairline)' : 'rgba(255,255,255,0.06)'}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={yScale(v) + 3}
                textAnchor="end"
                fill={isLight ? 'var(--color-slate)' : 'rgba(255,255,255,0.3)'}
                fontSize={10}
              >
                {formatCurrency(v)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#trend-fill)" className="transition-all duration-500" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#trend-line)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: animReady ? 'none' : '2000',
              strokeDashoffset: animReady ? 0 : 2000,
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />

          {/* Data dots */}
          {data.map((d, i) => (
            <circle
              key={d.month}
              cx={xScale(i)}
              cy={yScale(d.gross_total)}
              r={hoveredIdx === i ? 5 : 3}
              fill={hoveredIdx === i ? 'var(--color-chart-accent)' : (isLight ? 'var(--color-ink-black)' : 'rgba(255,255,255,0.8)')}
              stroke={hoveredIdx === i ? (isLight ? '#fff' : 'var(--color-canvas)') : 'none'}
              strokeWidth={2}
              className="transition-all duration-150"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* Hover vertical line + tooltip */}
          {hoveredIdx !== null && (
            <g>
              <line
                x1={xScale(hoveredIdx)}
                y1={PAD.top}
                x2={xScale(hoveredIdx)}
                y2={PAD.top + plotH}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <rect
                x={Math.min(xScale(hoveredIdx) - 60, cw - PAD.right - 140)}
                y={Math.max(yScale(data[hoveredIdx].gross_total) - 48, 4)}
                width={140}
                height={38}
                rx={8}
                fill={isLight ? '#fff' : 'var(--color-chart-bg)'}
                stroke={isLight ? 'var(--color-hairline)' : 'rgba(255,255,255,0.15)'}
                strokeWidth={1}
              />
              <text
                x={Math.min(xScale(hoveredIdx), cw - PAD.right - 70) + 10}
                y={Math.max(yScale(data[hoveredIdx].gross_total) - 28, 12)}
                fill={isLight ? 'var(--color-slate)' : 'rgba(255,255,255,0.5)'}
                fontSize={10}
              >
                {formatMonthFull(data[hoveredIdx].month)}
              </text>
              <text
                x={Math.min(xScale(hoveredIdx), cw - PAD.right - 70) + 10}
                y={Math.max(yScale(data[hoveredIdx].gross_total) - 14, 26)}
                fill={isLight ? 'var(--color-ink-black)' : '#fff'}
                fontSize={13}
                fontWeight={600}
              >
                {formatCurrency(data[hoveredIdx].gross_total)}
              </text>
            </g>
          )}

          {/* X-axis labels (show every Nth label to avoid crowding) */}
          {data.map((d, i) => {
            const skip = Math.max(1, Math.floor(data.length / 7))
            if (i % skip !== 0 && i !== data.length - 1) return null
            return (
              <text
                key={d.month}
                x={xScale(i)}
                y={ch - 8}
                textAnchor="middle"
                fill={isLight ? 'var(--color-slate)' : 'rgba(255,255,255,0.3)'}
                fontSize={10}
              >
                {formatMonthLabel(d.month)}
              </text>
            )
          })}
        </svg>
      )}

      {/* Sparkline row at bottom */}
      {!loading && data.length > 0 && (
        <div className={`mt-2 flex items-center gap-4 border-t ${isLight ? 'border-hairline' : 'border-white/5'} pt-3`}>
          <span className={`text-[10px] ${isLight ? 'text-muted-slate' : 'text-white/30'} tracking-widest`}>Recent</span>
          {recent.map((d, i) => (
            <span key={d.month} className="flex items-center gap-1 text-xs">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--color-chart-accent)', opacity: Math.max(0.2, 1 - i * 0.13) }}
              />
              <span className={isLight ? 'text-muted-slate' : 'text-white/50'}>{formatMonthLabel(d.month)}</span>
              <span className={`${isLight ? 'text-ink-black' : 'text-white/70'} font-medium`}>{formatCurrency(d.gross_total)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
