#!/usr/bin/env node
/**
 * Launch readiness gate v2 — verify via deployed API endpoints (server-side keys).
 * No local secrets needed; uses production environment.
 */

const PROD_URL = 'https://krost.xyz'
const PUBLIC_SUPABASE_URL = 'https://ucjrosgtwypntcccelhi.supabase.co'

// Stripe is OK to test with local key since it's a test-mode key
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY

const results = []
const log = (gate, status, detail) => {
  results.push({ gate, status, detail })
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '?'
  console.log(`[${icon}] ${gate}: ${status} ${detail ? '— ' + detail : ''}`)
}

const fetchWithTimeout = (url, opts = {}, ms = 15000) => {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  return fetch(url, { ...opts, signal: ctl.signal }).finally(() => clearTimeout(t))
}

async function main() {
  console.log('═══ Launch Gate Check v2 — Production API ═══\n')

  // Gate 1: production site is up and serving content
  try {
    const res = await fetchWithTimeout(PROD_URL)
    const html = await res.text()
    if (res.status === 200 && html.includes('Krost')) {
      log('Production Site', 'PASS', `${res.status}, ${html.length} bytes, brand visible`)
    } else {
      log('Production Site', 'FAIL', `${res.status}, brand=${html.includes('Krost')}`)
    }
  } catch (e) {
    log('Production Site', 'FAIL', e.message)
  }

  // Gate 2: PostHog snippet embedded
  try {
    const res = await fetchWithTimeout(PROD_URL)
    const html = await res.text()
    const hasPostHog = html.includes('posthog') || html.includes('phc_')
    const hasToken = html.match(/phc_[a-zA-Z0-9]{40,}/)
    if (hasToken) {
      log('PostHog Embed', 'PASS', `token ${hasToken[0].slice(0, 16)}... in HTML`)
    } else if (hasPostHog) {
      log('PostHog Embed', 'PARTIAL', 'posthog ref present, token deferred (likely lazy)')
    } else {
      log('PostHog Embed', 'FAIL', 'no posthog code in HTML')
    }
  } catch (e) {
    log('PostHog Embed', 'FAIL', e.message)
  }

  // Gate 3: Supabase public reachable
  try {
    // Public health check — no auth needed for /auth/v1/health
    const res = await fetchWithTimeout(`${PUBLIC_SUPABASE_URL}/auth/v1/health`)
    if (res.status === 200) {
      const data = await res.json()
      log('Supabase Health', 'PASS', `version ${data.version || 'unknown'}, name=${data.name || 'gotrue'}`)
    } else {
      log('Supabase Health', 'FAIL', `HTTP ${res.status}`)
    }
  } catch (e) {
    log('Supabase Health', 'FAIL', e.message)
  }

  // Gate 4: Lead magnet endpoint (uses server-side service role key)
  try {
    const testEmail = `gate-${Date.now()}@example.com`
    const res = await fetchWithTimeout(`${PROD_URL}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, source: 'gate-check' }),
    })
    const text = await res.text()
    if (res.status === 200 || res.status === 201) {
      log('Lead Magnet', 'PASS', `POST /api/waitlist → ${res.status}`)
    } else {
      log('Lead Magnet', 'FAIL', `${res.status}: ${text.slice(0, 200)}`)
    }
  } catch (e) {
    log('Lead Magnet', 'FAIL', e.message)
  }

  // Gate 5: Stripe products (uses local STRIPE_SECRET_KEY env)
  if (STRIPE_KEY && STRIPE_KEY.startsWith('sk_')) {
    try {
      const res = await fetchWithTimeout('https://api.stripe.com/v1/prices?limit=10', {
        headers: { Authorization: `Bearer ${STRIPE_KEY}` },
      })
      const data = await res.json()
      if (res.status === 200) {
        log('Stripe Products', 'PASS', `${data.data.length} prices found`)
      } else {
        log('Stripe Products', 'FAIL', JSON.stringify(data.error || data).slice(0, 200))
      }
    } catch (e) {
      log('Stripe Products', 'FAIL', e.message)
    }

    try {
      const res = await fetchWithTimeout('https://api.stripe.com/v1/webhook_endpoints', {
        headers: { Authorization: `Bearer ${STRIPE_KEY}` },
      })
      const data = await res.json()
      const ours = data.data.find((w) => w.url.includes('income-verifier'))
      if (ours) {
        log('Stripe Webhook', 'PASS', `${ours.url} — ${ours.enabled_events.length} events`)
      } else {
        log('Stripe Webhook', 'FAIL', `no endpoint with income-verifier in URL`)
      }
    } catch (e) {
      log('Stripe Webhook', 'FAIL', e.message)
    }
  } else {
    log('Stripe Products', 'SKIP', 'no STRIPE_SECRET_KEY in env (export and re-run)')
    log('Stripe Webhook', 'SKIP', 'no STRIPE_SECRET_KEY in env')
  }

  // Gate 6: Google OAuth via Supabase
  try {
    const url = `${PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(PROD_URL + '/api/auth/callback')}`
    const res = await fetchWithTimeout(url, { redirect: 'manual' })
    if (res.status === 302) {
      const loc = res.headers.get('location') || ''
      if (loc.includes('accounts.google.com')) {
        log('Google OAuth', 'PASS', '302 → accounts.google.com')
      } else if (loc.includes('error')) {
        log('Google OAuth', 'FAIL', loc.slice(0, 200))
      } else {
        log('Google OAuth', 'PARTIAL', loc.slice(0, 100))
      }
    } else {
      log('Google OAuth', 'FAIL', `expected 302, got ${res.status}`)
    }
  } catch (e) {
    log('Google OAuth', 'FAIL', e.message)
  }

  // Gate 7: API routes responding (not crashing)
  for (const path of ['/api/health', '/login', '/register', '/check-score', '/dashboard']) {
    try {
      const res = await fetchWithTimeout(PROD_URL + path, { redirect: 'manual' })
      const ok = [200, 301, 302, 307].includes(res.status)
      log(`Route ${path}`, ok ? 'PASS' : 'FAIL', `HTTP ${res.status}`)
    } catch (e) {
      log(`Route ${path}`, 'FAIL', e.message)
    }
  }

  // Summary
  console.log('\n═══ Summary ═══')
  const pass = results.filter((r) => r.status === 'PASS').length
  const fail = results.filter((r) => r.status === 'FAIL').length
  const partial = results.filter((r) => r.status === 'PARTIAL').length
  const skip = results.filter((r) => r.status === 'SKIP').length
  console.log(`${pass} pass · ${fail} fail · ${partial} partial · ${skip} skip\n`)

  if (fail > 0) {
    console.log('BLOCKED. Fix:')
    results.filter((r) => r.status === 'FAIL').forEach((r) => console.log(`  ✗ ${r.gate}: ${r.detail}`))
  }
  if (partial > 0) {
    console.log('\nFollow up:')
    results.filter((r) => r.status === 'PARTIAL').forEach((r) => console.log(`  ? ${r.gate}: ${r.detail}`))
  }
  if (fail === 0) {
    console.log('🚀 CLEARED FOR LAUNCH')
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1) })
