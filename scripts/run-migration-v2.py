"""Run v2 migration via Supabase Management API SQL endpoint."""
import json
import os
import sys
import urllib.request
import urllib.error

# Read .env manually
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if not os.path.exists(env_path):
    print(f"ERROR: .env not found at {env_path}")
    sys.exit(1)

env_vars = {}
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' in line:
            key, _, val = line.partition('=')
            env_vars[key.strip()] = val.strip()

access_token = env_vars.get('SUPABASE_ACCESS_TOKEN')
project_ref = env_vars.get('SUPABASE_PROJECT_REF')

if not access_token:
    print("ERROR: SUPABASE_ACCESS_TOKEN not found in .env")
    sys.exit(1)
if not project_ref:
    print("ERROR: SUPABASE_PROJECT_REF not found in .env")
    sys.exit(1)

# Read v2 migration SQL
migration_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db', 'migration-v2.sql')
with open(migration_path) as f:
    sql = f.read()

# Execute via Management API
url = f"https://api.supabase.com/v1/projects/{project_ref}/sql"
body = json.dumps({"query": sql}).encode('utf-8')
req = urllib.request.Request(
    url,
    data=body,
    headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    },
    method="POST",
)

print(f"Connecting to Supabase Management API...")
print(f"Project: {project_ref}")
print(f"Running migration-v2.sql ({len(sql)} chars)...")

try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = resp.read().decode('utf-8')
        status = resp.status
        if status == 201 or status == 200:
            print(f"✓ Migration v2 complete! Status: {status}")
            if result:
                print(result[:500])
        else:
            print(f"! Unexpected status: {status}")
            print(result[:1000])
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8') if e.fp else ''
    print(f"✗ HTTP {e.code}: {e.reason}")
    print(error_body[:2000])
    sys.exit(1)
except urllib.error.URLError as e:
    print(f"✗ Network error: {e.reason}")
    sys.exit(1)

print("\n✓ Done. If no errors above, all v2 tables are created.")
print("  Now create the 'reports' storage bucket via Supabase Dashboard → Storage.")
