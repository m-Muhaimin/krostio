// Reads SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF from env
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!ACCESS_TOKEN) { console.error('❌ SUPABASE_ACCESS_TOKEN env var required'); process.exit(1); }
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ucjrosgtwypntcccelhi';
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;

async function query(sql) {
  const res = await fetch(`${API_BASE}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function main() {
  console.log(`🔌 Probing project ${PROJECT_REF}...\n`);

  // Check _migrations table
  try {
    const tables = await query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_migrations') AS exists`);
    console.log('_migrations table exists:', tables[0]?.exists);

    if (tables[0]?.exists) {
      const migs = await query('SELECT name, applied_at FROM public._migrations ORDER BY applied_at');
      console.log(`\n📋 ${migs.length} migrations tracked:`);
      for (const m of migs) {
        console.log(`  ${m.name} — ${m.applied_at}`);
      }
    }
  } catch (e) {
    console.log('⚠️  Could not query _migrations:', e.message);
  }

  // Check key new tables
  console.log('\n📊 Table status:');
  for (const table of ['ledger_entries', 'passports', 'attestation_history', 'lender_orgs', 'report_views', 'krost_scores']) {
    try {
      const rows = await query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table}') AS exists`);
      console.log(`  ${table} exists:`, rows[0]?.exists);
    } catch (e) {
      console.log(`  ${table}: ERROR — ${e.message}`);
    }
  }
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
