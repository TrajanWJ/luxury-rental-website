# Production Deployment Guide

**Last updated:** 2026-03-02

## Architecture

**Storage strategy:** Turso (SQLite cloud) as primary, VPS filesystem JSON as fallback + write-through cache.

```
┌──────────────────────────┐     ┌──────────────────────────┐
│   Main Site (visitors)   │     │   Admin Panel (client)   │
│   getOrderedImages()     │     │   saveOrder()            │
└───────────┬──────────────┘     └───────────┬──────────────┘
            │ polls every 3s                  │ POST on save
            ▼                                 ▼
┌──────────────────────────────────────────────────────────┐
│              /api/photo-order (Next.js API)              │
│                                                          │
│  1. Try Turso (if TURSO_* env vars set)                 │
│  2. Fall back to filesystem:                             │
│     readStore() / writeStore()                           │
│     → $PERSISTENT_DATA_DIR/photo-orders.json            │
│     → atomic writes (write .tmp → rename)               │
└──────────────────────────────────────────────────────────┘
            │                          │
            ▼                          ▼
┌──────────────────────┐   ┌────────────────────────────────┐
│  Turso Cloud DB      │   │  /home/wilsonprem/data/        │
│  (primary — survives │   │  photo-orders.json             │
│   VPS resets)        │   │  site-config.json              │
│                      │   │  (write-through cache —        │
│  Tables:             │   │   survives deploys)            │
│  - photo_orders      │   └────────────────────────────────┘
│  - trash_items       │
│  - inquiries         │
│  - site_config       │
└──────────────────────┘
```

**Concurrency model:**
- Single Node.js process on the VPS — sequential request handling prevents write conflicts
- Turso uses optimistic locking (version column) for photo orders and site config
- Atomic filesystem writes (write to `.tmp` then rename) prevent corruption on crash
- `PhotoOrderContext` polls `/api/photo-order?property=_all` every 3 seconds

## Prerequisites

**VPS:** SSH is disabled. All server commands run via "FTP + PHP trick": upload a `.php` script to `public_html/`, execute via HTTP with Host header, script self-deletes.

**Env vars on VPS (.env file):**
```
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
PERSISTENT_DATA_DIR=/home/wilsonprem/data
TURSO_DATABASE_URL=libsql://wilson-premier-wilsonprem-dev26.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=<token>
```

If Turso vars are missing, run `scripts/set-turso-env.php` via the FTP + PHP trick (see "First-Time Turso Setup" below).

## Deployment Steps

### 0. Backup production data

```bash
./scripts/backup-production-data.sh
```

This pulls live data from the API and commits it to git as insurance.

### 1. Build the standalone app

```bash
cd "client sites/wilson premier"
npm run build
```

### 2. Prepare the deploy folder

```bash
rm -rf deploy/.next deploy/node_modules deploy/public deploy/data
cp -r .next/standalone/* deploy/
cp -r .next/standalone/.next deploy/.next
cp -r .next/static deploy/.next/static
cp -r public deploy/public

mkdir -p deploy/data
cp data/photo-orders.json deploy/data/photo-orders.json
cp data/site-config.json deploy/data/site-config.json
```

### 3. Upload to VPS via FTP

```bash
cd deploy && zip -r ../wilson-premier-deploy.zip . && cd ..

curl -T wilson-premier-deploy.zip \
  ftp://209.142.66.121/wilson-premier-app/wilson-premier-deploy.zip \
  --user 'wilsonprem_trajan:<password>'
```

### 4. Extract on VPS

Save as `deploy-update.php`, upload, execute:

```bash
curl -s -T deploy-update.php \
  ftp://209.142.66.121/public_html/deploy-update.php \
  --user 'wilsonprem_trajan:<password>'

curl -s --max-time 120 -H "Host: wilson-premier.com" \
  http://209.142.66.121/deploy-update.php
```

**`deploy-update.php`:**
```php
<?php
set_time_limit(120);
$appDir = '/home/wilsonprem/wilson-premier-app';
$dataDir = '/home/wilsonprem/data';

// Create persistent data directory
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
    echo "Created $dataDir\n";
}

// Seed data files only if they don't already exist
foreach (['photo-orders.json', 'site-config.json'] as $file) {
    $persistent = "$dataDir/$file";
    $seed = "$appDir/data/$file";
    if (!file_exists($persistent) && file_exists($seed)) {
        copy($seed, $persistent);
        echo "Seeded $file to persistent location\n";
    } else if (file_exists($persistent)) {
        echo "$file already exists — keeping it\n";
    }
}

// Extract the new deploy
$zip = "$appDir/wilson-premier-deploy.zip";
if (file_exists($zip)) {
    $za = new ZipArchive();
    if ($za->open($zip) === TRUE) {
        $za->extractTo($appDir);
        $za->close();
        echo "Extracted deploy zip\n";
        unlink($zip);
    }
}

echo "Done. Restart the app now.\n";
unlink(__FILE__);
```

### 5. Restart the app

Save as `restart-app.php`, upload, execute:

```bash
curl -s -T restart-app.php \
  ftp://209.142.66.121/public_html/restart-app.php \
  --user 'wilsonprem_trajan:<password>'

curl -s --max-time 15 -H "Host: wilson-premier.com" \
  http://209.142.66.121/restart-app.php
```

**`restart-app.php`:**
```php
<?php
set_time_limit(10);
$node = '/home/wilsonprem/node20/bin/node';
$appDir = '/home/wilsonprem/wilson-premier-app';
shell_exec("pkill -f 'node.*server.js' 2>&1");
sleep(1);
$cmd = "cd $appDir && set -a && source .env && set +a && nohup $node app.js >> /home/wilsonprem/app.log 2>&1 & echo \$!";
$pid = trim(shell_exec($cmd));
echo "Started PID: $pid\n";
unlink(__FILE__);
```

**Key change:** The restart script now sources `.env` instead of hardcoding env vars. This means `.env` is the single source of truth for `PERSISTENT_DATA_DIR`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, etc.

### 6. Verify

```bash
# Photo orders should return data
curl -s https://wilson-premier.com/api/photo-order?property=_all | python3 -c "
import json, sys
data = json.load(sys.stdin)
for k, v in data.get('orders', {}).items():
    print(f'{k}: {len(v)} photos')
"

# Expected:
# suite-retreat: 112 photos
# penthouse-view: 33 photos
# lake-view: 23 photos
# suite-view: 191 photos
# milan-manor: 86 photos
```

## First-Time Turso Setup

Only needed once to add Turso env vars to the VPS.

### 1. Set env vars on VPS

```bash
curl -s -T scripts/set-turso-env.php \
  ftp://209.142.66.121/public_html/set-turso-env.php \
  --user 'wilsonprem_trajan:<password>'

curl -s -H "Host: wilson-premier.com" \
  http://209.142.66.121/set-turso-env.php
```

### 2. Restart the app (step 5 above)

### 3. Create Turso tables

```bash
curl -s -X POST https://wilson-premier.com/api/admin/migrate
```

### 4. Migrate existing JSON data to Turso

```bash
curl -s -X POST https://wilson-premier.com/api/admin/migrate-data \
  -H "Cookie: admin-session=<your-jwt>"
```

Both endpoints are auth-protected (admin session required for migrate-data). The migration is idempotent — safe to run multiple times.

### 5. Verify Turso is active

Check the Turso dashboard at https://turso.tech/app — tables should show row counts matching the JSON data.

## Important Notes

- **Never delete `/home/wilsonprem/data/`** on the VPS — it's the filesystem fallback
- **`.env` is the single source of truth** — all env vars live there, `restart-app.php` sources it
- **Turso going down is not catastrophic** — the app falls back to filesystem JSON automatically
- **Always run `scripts/backup-production-data.sh` before deploying** — commits a snapshot to git
- **The admin panel has two logins:** Wilson / PropertyAdmin7283, Admin / WPPAdmin26
