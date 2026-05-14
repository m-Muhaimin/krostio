// seed-data.js — run with: node scripts/seed-data.js
// Generates fake gig income data for testing the scoring engine.
// Usage: node scripts/seed-data.js <user_id> <platform>

const USER_ID = process.argv[2] || 'test-user-123'
const PLATFORM = process.argv[3] || 'uber'

const platforms = ['uber', 'lyft', 'doordash', 'fiverr', 'upwork', 'instacart']

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function generateRecords(platform, monthsBack = 12) {
  const records = []
  const now = new Date()

  const platformConfig = {
    uber: { avgEarnings: 3200, volatility: 0.2, tripsPerWeek: 25 },
    lyft: { avgEarnings: 2800, volatility: 0.25, tripsPerWeek: 20 },
    doordash: { avgEarnings: 2500, volatility: 0.3, tripsPerWeek: 30 },
    fiverr: { avgEarnings: 1800, volatility: 0.4, tripsPerWeek: 5 },
    upwork: { avgEarnings: 2200, volatility: 0.35, tripsPerWeek: 3 },
    instacart: { avgEarnings: 2000, volatility: 0.25, tripsPerWeek: 15 },
  }

  const config = platformConfig[platform] || platformConfig.uber

  for (let w = 0; w < monthsBack * 4; w++) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - (w * 7 + 6))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weeklyAvg = config.avgEarnings / 4
    const earnings = randomBetween(
      weeklyAvg * (1 - config.volatility),
      weeklyAvg * (1 + config.volatility)
    )

    records.push({
      user_id: USER_ID,
      platform,
      period_start: weekStart.toISOString().split('T')[0],
      period_end: weekEnd.toISOString().split('T')[0],
      gross_earnings: earnings,
      net_earnings: earnings * 0.85,
      trips_completed: Math.round(randomBetween(config.tripsPerWeek * 0.7, config.tripsPerWeek * 1.3)),
      hours_active: randomBetween(20, 50),
      rating: randomBetween(4.2, 5.0),
      currency: 'USD',
    })
  }

  return records
}

function main() {
  console.log('Krost — Seed Data Generator')
  console.log('=====================================')
  console.log()

  const platformsToSeed = PLATFORM === 'all' ? platforms : [PLATFORM]

  for (const p of platformsToSeed) {
    console.log(`Generating 12 months of ${p} data...`)
    const records = generateRecords(p)
    console.log(`  ${records.length} weekly records`)
    console.log(`  Sample: ${JSON.stringify(records[0], null, 2)}`)
    console.log()

    // Output SQL insert
    console.log(`-- INSERT INTO income_records for ${p}`)
    console.log(`INSERT INTO income_records (user_id, platform, period_start, period_end, gross_earnings, net_earnings, trips_completed, hours_active, rating, currency) VALUES`)
    const values = records.map(r =>
      `('${r.user_id}', '${r.platform}', '${r.period_start}', '${r.period_end}', ${r.gross_earnings}, ${r.net_earnings}, ${r.trips_completed}, ${r.hours_active}, ${r.rating}, '${r.currency}')`
    ).join(',\n')
    console.log(values + ';')
    console.log()
  }
}

main()
