const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!ACCESS_TOKEN) throw new Error('SUPABASE_ACCESS_TOKEN env var required');
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ucjrosgtwypntcccelhi';
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;

const MIGRATIONS_DIR = path.join(__dirname, '..', 'db');

// Order of migrations to apply
const MIGRATION_ORDER = [
  { file: 'migration-003-plaid.sql',               name: '003-plaid' },
  { file: 'migration-004-income-verification.sql',  name: '004-income-verification' },
  { file: 'migration-005-reports.sql',              name: '005-reports' },
  { file: 'migration-007-lender-directory.sql',     name: '007-lender-directory' },
  { file: 'migration-008-v2-platform.sql',          name: '008-v2-platform' },
];

async function getAppliedMigrations() {
  try {
    const res = await fetch(`${API_BASE}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `SELECT name, applied_at FROM public._migrations ORDER BY applied_at`
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.log(`  DB query failed (${res.status}): ${text.slice(0, 200)}`);
      return { error: true, status: res.status, body: text.slice(0, 200) };
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.log(`  Unexpected response:`, JSON.stringify(data).slice(0, 200));
      return { error: true, data };
    }
    return new Set(data.map(r => r.name));
  } catch (e) {
    console.log(`  Connection error: ${e.message}`);
    return { error: true, message: e.message };
  }
}

async function runSQL(sql) {
  const res = await fetch(`${API_BASE}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  return res;
}

async function main() {
  console.log(`🔌 Connecting via Supabase Management API...\n`);
  console.log(`Project: ${PROJECT_REF}`);

  // Step 1: Get currently applied migrations
  const appliedMigrations = await getAppliedMigrations();
  
  let appliedSet;
  if (appliedMigrations instanceof Set) {
    console.log(`📋 ${appliedMigrations.size} migrations tracked.\n`);
    appliedSet = appliedMigrations;
  } else {
    console.log(`⚠️  Could not read _migrations table. Will try running all.`);
    // Create tracking table first
    console.log(`\nCreating _migrations tracking table...`);
    const createRes = await runSQL(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    if (createRes.ok) {
      console.log(`✅ _migrations table ready`);
    } else {
      console.log(`⚠️  _migrations table check: ${createRes.status}`);
    }
    appliedSet = new Set();
  }

  console.log('');
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const { file, name } of MIGRATION_ORDER) {
    if (appliedSet.has(name)) {
      console.log(`⏭️  ${file} (${name}) — already applied`);
      skipCount++;
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${file} — file not found`);
      skipCount++;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`🔄 ${file} (${name}) — applying...`);

    try {
      const res = await runSQL(sql);
      if (res.ok) {
        // Track it
        await runSQL(
          `INSERT INTO public._migrations (name, applied_at) VALUES ('${name}', NOW()) ON CONFLICT DO NOTHING`
        );
        console.log(`✅ ${file} — applied successfully`);
        successCount++;
      } else {
        const text = await res.text();
        console.error(`❌ ${file} — FAILED (${res.status}): ${text.slice(0, 300)}`);
        failCount++;
      }
    } catch (e) {
      console.error(`❌ ${file} — ERROR: ${e.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} applied, ${skipCount} skipped, ${failCount} failed`);
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
