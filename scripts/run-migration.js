const { Client } = require('pg');
const fs = require('fs');
const sql = fs.readFileSync('db/migration.sql', 'utf8');

// URL-encode the & in password
const password = encodeURIComponent('q&QiU36Uhxr44fm');
const connStr = 'postgresql://postgres:' + password + '@db.ucjrosgtwypntcccelhi.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connStr });
  console.log('Connecting to Supabase...');
  await client.connect();
  console.log('Connected. Running migration...');
  await client.query(sql);
  console.log('Migration complete! All tables and RLS policies created.');
  await client.end();
}
run().catch(e => { console.error('Error:', e.message); process.exit(1); });
