import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Krost — Income verification for the gig economy'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 88px',
          background:
            'radial-gradient(120% 80% at 15% 10%, rgba(255,119,89,0.22), transparent 55%), radial-gradient(80% 60% at 90% 90%, rgba(24,99,220,0.18), transparent 60%), linear-gradient(180deg, #0b1410 0%, #0a0f0c 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        {/* top row: K mark + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              background: '#ffffff',
              color: '#0a0f0c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 600,
            }}
          >
            K
          </div>
          <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>Krost</div>
        </div>

        {/* main wordmark + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 132,
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: '#ffffff',
            }}
          >
            Krost
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              maxWidth: 920,
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            Income verification for the gig economy.
          </div>
        </div>

        {/* bottom row: coral dot + label, right-side meta */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#ff7759' }} />
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 18 }}>
              krost.app
            </div>
          </div>
          <div style={{ fontSize: 20 }}>Turn multi-platform earnings into a verified report.</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
