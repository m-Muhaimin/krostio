/**
 * Apply all pending migrations to Supabase
 *
 * Uses Supabase Management API (requires SUPABASE_ACCESS_TOKEN in env).
 * Reads each migration file in order, executes against the project's
 * database via /database/query endpoint, and tracks applied migrations
 * in the _migrations table.
 *
 * Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-all-migrations.js
 */
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN env var required');
  console.error('   Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/apply-all-migrations.js');
  process.exit(1);
}
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ucjrosgtwypntcccelhi';
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;

const MIGRATIONS_DIR = path.join(__dirname, '..', 'db');
const MIGRATION_ORDER = [
  'migration.sql',              // 001 — base schema
  'migration-002-waitlist.sql', // 002
  'migration-003-plaid.sql',    // 003
  'migration-004-income-verification.sql', // 004
  'migration-005-reports.sql',  // 005
  'migration-006-lender-verifications.sql', // 006
  'migration-007-lender-directory.sql',      // 007
  'migration-008-v2-platform.sql',           // 008 — NEW v2 schema
];

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

async function getAppliedMigrations() {
  try {
    // Ensure tracking table exists
    await runSQL(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    const res = await runSQL('SELECT name FROM public._migrations');
    if (!res.ok) {
      console.error('  Could not query _migrations table:', res.status);
      return new Set();
    }
    const data = await res.json();
    return new Set((data || []).map(r => r.name));
  } catch (e) {
    console.error('  Could not query _migrations table:', e.message);
    return new Set();
  }
}

async function main() {
  console.log(`🔌 Connecting via Supabase Management API...\n`);
  console.log(`Project: ${PROJECT_REF}\n`);

  const appliedMigrations = await getAppliedMigrations();
  console.log(`📋 ${appliedMigrations.size} migrations already tracked.\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const filename of MIGRATION_ORDER) {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename} — file not found, skipping`);
      skipCount++;
      continue;
    }

    // Extract migration name from filename
    const match = filename.match(/migration(?:-([\w-]+))?\.sql$/);
    const migrationName = match && match[1] ? match[1] : 'base';

    if (appliedMigrations.has(migrationName)) {
      console.log(`⏭️  ${filename} (${migrationName}) — already applied, skipping`);
      skipCount++;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`🔄 ${filename} (${migrationName}) — applying...`);

    try {
      const res = await runSQL(sql);
      if (res.ok) {
        // Track it
        await runSQL(
          `INSERT INTO public._migrations (name, applied_at) VALUES ('${migrationName.replace(/'/g, "''")}', NOW()) ON CONFLICT DO NOTHING`
        );
        console.log(`✅ ${filename} — applied successfully`);
        successCount++;
      } else {
        const text = await res.text();
        console.error(`❌ ${filename} — FAILED (${res.status}): ${text.slice(0, 300)}`);
        failCount++;
      }
    } catch (e) {
      console.error(`❌ ${filename} — ERROR: ${e.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} applied, ${skipCount} skipped, ${failCount} failed`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
