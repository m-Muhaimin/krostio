#!/usr/bin/env node
/**
 * Launch readiness gate check — Krostio production endpoints.
 *
 * Run: node scripts/verify-launch-gates.js
 */

// ───────────────────────────────────────────────────────────
// CONFIG — Krostio
// ───────────────────────────────────────────────────────────
const PROD_URL = 'https://krostio.vercel.app'
const PUBLIC_SUPABASE_URL = 'https://ucjrosgtwypntcccelhi.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const EXPECTED_BRAND_STRING = 'Krostio'
const CRITICAL_ROUTES = ['/api/health', '/login', '/register', '/dashboard', '/check-score', '/pricing']

// ───────────────────────────────────────────────────────────
// Verification logic
// ───────────────────────────────────────────────────────────
const results = []
const log = (gate, status, detail) => {
  results.push({ gate, status, detail })
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : status === 'PARTIAL' ? '~' : '?'
  console.log(`[${icon}] ${gate}: ${status}${detail ? ' — ' + detail : ''}`)
}

const fetchWithTimeout = (url, opts = {}, ms = 15000) => {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  return fetch(url, { ...opts, signal: ctl.signal }).finally(() => clearTimeout(t))
}

async function main() {
  console.log('═══ Krostio Launch Readiness Gate Check ═══\n')

  // Gate 1: production site is up
  try {
    const res = await fetchWithTimeout(PROD_URL)
    const html = await res.text()
    if (res.status === 200 && html.includes(EXPECTED_BRAND_STRING)) {
      log('Production Site', 'PASS', `${res.status}, ${html.length} bytes, brand visible`)
    } else {
      log('Production Site', 'FAIL', `${res.status}, brand=${html.includes(EXPECTED_BRAND_STRING)}`)
    }
  } catch (e) {
    log('Production Site', 'FAIL', e.message + ' (probably local network blocking Vercel)')
  }

  // Gate 2: PostHog embedded
  try {
    const res = await fetchWithTimeout(PROD_URL)
    const html = await res.text()
    const tokenMatch = html.match(/phc_[a-zA-Z0-9]{40,}/)
    if (tokenMatch) {
      log('PostHog Embed', 'PASS', `token ${tokenMatch[0].slice(0, 16)}... in HTML`)
    } else if (html.includes('posthog')) {
      log('PostHog Embed', 'PARTIAL', 'posthog reference present, token lazy-loaded')
    } else {
      log('PostHog Embed', 'FAIL', 'no posthog code in HTML — analytics not wired')
    }
  } catch (e) {
    log('PostHog Embed', 'FAIL', e.message)
  }

  // Gate 3: Supabase auth health
  try {
    const res = await fetchWithTimeout(`${PUBLIC_SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    })
    if (res.status === 200) {
      const data = await res.json()
      log('Supabase Health', 'PASS', `${data.name || 'gotrue'} ${data.version || ''}`)
    } else {
      log('Supabase Health', 'PARTIAL', `HTTP ${res.status}`)
    }
  } catch (e) {
    log('Supabase Health', 'FAIL', e.message)
  }

  // Gate 4: Lead magnet / waitlist endpoint
  try {
    const res = await fetchWithTimeout(`${PROD_URL}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `gate-${Date.now()}@example.com`, source: 'gate-check' }),
    })
    if ([200, 201, 405, 404].includes(res.status)) {
      const statusLabel = res.status === 405 ? 'no endpoint (maybe not exposed)' :
                          res.status === 404 ? 'no endpoint at /api/waitlist (try /api/check-score)' : 'accepted'
      log('Lead Magnet /api/waitlist', res.status === 200 || res.status === 201 ? 'PASS' : 'PARTIAL', `${res.status} — ${statusLabel}`)
    } else {
      const text = await res.text()
      log('Lead Magnet /api/waitlist', 'FAIL', `${res.status}: ${text.slice(0, 200)}`)
    }
  } catch (e) {
    log('Lead Magnet /api/waitlist', 'FAIL', e.message)
  }

  // Gate 5: Stripe products + webhook
  if (STRIPE_KEY && STRIPE_KEY.startsWith('sk_')) {
    try {
      const res = await fetchWithTimeout('https://api.stripe.com/v1/prices?limit=10', {
        headers: { Authorization: `Bearer ${STRIPE_KEY}` },
      })
      const data = await res.json()
      if (res.status === 200 && data.data.length > 0) {
        const summary = data.data.slice(0, 4).map((p) => `${p.id.slice(-6)} $${p.unit_amount / 100}/${p.recurring?.interval || 'oneoff'}`).join(', ')
        log('Stripe Products', 'PASS', `${data.data.length} prices: ${summary}`)
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
      const ours = data.data.find((w) => w.url.includes('krostio.vercel.app'))
      if (ours) {
        const required = ['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.payment_failed']
        const missing = required.filter((e) => !ours.enabled_events.includes(e) && !ours.enabled_events.includes('*'))
        if (missing.length === 0) {
          log('Stripe Webhook', 'PASS', `${ours.url} — all required events configured`)
        } else {
          log('Stripe Webhook', 'PARTIAL', `endpoint exists but missing: ${missing.join(', ')}`)
        }
      } else {
        log('Stripe Webhook', 'FAIL', `no endpoint pointing at krostio.vercel.app`)
      }
    } catch (e) {
      log('Stripe Webhook', 'FAIL', e.message)
    }
  } else {
    log('Stripe Products', 'SKIP', 'no STRIPE_SECRET_KEY')
    log('Stripe Webhook', 'SKIP', 'no STRIPE_SECRET_KEY')
  }

  // Gate 6: Google OAuth via Supabase
  try {
    const url = `${PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(PROD_URL + '/api/auth/callback')}`
    const res = await fetchWithTimeout(url, { redirect: 'manual' })
    if (res.status === 302) {
      const loc = res.headers.get('location') || ''
      if (loc.includes('accounts.google.com')) {
        log('Google OAuth', 'PASS', '302 → accounts.google.com')
      } else if (loc.includes('error') || loc.includes('Provider not enabled')) {
        log('Google OAuth', 'FAIL', `provider not enabled: ${loc.slice(0, 200)}`)
      } else {
        log('Google OAuth', 'PARTIAL', loc.slice(0, 100))
      }
    } else {
      log('Google OAuth', 'FAIL', `expected 302, got ${res.status}`)
    }
  } catch (e) {
    log('Google OAuth', 'FAIL', e.message)
  }

  // Gate 7: Critical routes respond
  for (const path of CRITICAL_ROUTES) {
    try {
      const res = await fetchWithTimeout(PROD_URL + path, { redirect: 'manual' })
      const ok = res.status < 500
      log(`Route ${path}`, ok ? 'PASS' : 'FAIL', `HTTP ${res.status}`)
    } catch (e) {
      log(`Route ${path}`, 'FAIL', e.message)
    }
  }

  // Summary
  console.log('\n═══ Summary ═══')
  const counts = { PASS: 0, FAIL: 0, PARTIAL: 0, SKIP: 0 }
  results.forEach((r) => counts[r.status]++)
  console.log(`${counts.PASS} pass · ${counts.FAIL} fail · ${counts.PARTIAL} partial · ${counts.SKIP} skip\n`)

  if (counts.FAIL > 0) {
    console.log('BLOCKED. Fix:')
    results.filter((r) => r.status === 'FAIL').forEach((r) => console.log(`  ✗ ${r.gate}: ${r.detail}`))
  }
  if (counts.PARTIAL > 0) {
    console.log('\nFollow-up:')
    results.filter((r) => r.status === 'PARTIAL').forEach((r) => console.log(`  ~ ${r.gate}: ${r.detail}`))
  }
  if (counts.FAIL === 0) {
    console.log('🚀 CLEARED FOR LAUNCH')
  }
  process.exit(counts.FAIL > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
