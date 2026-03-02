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

## Infrastructure

**VPS:** SSH is disabled. All server commands run via "FTP + PHP trick": upload a `.php` script to `public_html/`, execute via HTTP with Host header, script self-deletes.

**Process manager:** PM2 (at `/usr/bin/pm2`). sPanel's Node.js Manager configures PM2 to run the app. The saved PM2 config runs `app.js` via `/home/wilsonprem/node20/bin/node`.

**Env vars:** `app.js` reads `/home/wilsonprem/wilson-premier-app/.env` on startup. The standalone Next.js server doesn't auto-load `.env` — our `app.js` wrapper handles this.

**Current .env on VPS:**
```
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
PERSISTENT_DATA_DIR=/home/wilsonprem/data
TURSO_DATABASE_URL=libsql://wilson-premier-wilsonprem-dev26.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=<token>
```

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

// Extract the new deploy FIRST (so seed files are available)
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

// Seed data files only if they don't already exist (AFTER extraction)
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

echo "Done. Restart the app now.\n";
unlink(__FILE__);
```

### 5. Restart the app via PM2

Save as `restart-app.php`, upload, execute:

```bash
curl -s -T restart-app.php \
  ftp://209.142.66.121/public_html/restart-app.php \
  --user 'wilsonprem_trajan:<password>'

curl -s --max-time 25 -H "Host: wilson-premier.com" \
  http://209.142.66.121/restart-app.php
```

**`restart-app.php`:**
```php
<?php
set_time_limit(20);
$pm2 = '/usr/bin/pm2';

echo "=== Stopping PM2 process ===\n";
echo shell_exec("HOME=/home/wilsonprem $pm2 stop all 2>&1") . "\n";

// Kill any orphaned node processes
shell_exec("pkill -9 -f 'next-server' 2>&1");
shell_exec("pkill -9 -f 'node.*server.js' 2>&1");
shell_exec("pkill -9 -f 'node.*app.js' 2>&1");
sleep(3);

echo "=== Starting PM2 process ===\n";
echo shell_exec("HOME=/home/wilsonprem $pm2 start all 2>&1") . "\n";

sleep(3);

echo "=== PM2 status ===\n";
echo shell_exec("HOME=/home/wilsonprem $pm2 list 2>&1") . "\n";

echo "=== Saving PM2 config ===\n";
echo shell_exec("HOME=/home/wilsonprem $pm2 save 2>&1") . "\n";

unlink(__FILE__);
```

**Key details:**
- PM2 is managed by sPanel's Node.js Manager at `/usr/bin/pm2`
- PM2's saved config runs `app.js` which loads `.env` before starting the server
- Must kill orphaned `next-server` processes — PM2 sometimes leaves them behind
- `HOME=/home/wilsonprem` is required for PM2 to find its config

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
# Login first to get session token
curl -s -X POST https://wilson-premier.com/api/admin/auth \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"username":"Admin","password":"WPPAdmin26"}' \
  -D /dev/stderr 2>&1 | head -1
# Copy the admin-session token from the set-cookie header

# Create tables (requires browser-like headers to pass Apache)
curl -s -X POST https://wilson-premier.com/api/admin/migrate \
  -H "Cookie: admin-session=<token>" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Origin: https://wilson-premier.com" \
  -H "Referer: https://wilson-premier.com/admin"
```

### 4. Migrate existing JSON data to Turso

```bash
curl -s -X POST https://wilson-premier.com/api/admin/migrate-data \
  -H "Cookie: admin-session=<token>" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Origin: https://wilson-premier.com" \
  -H "Referer: https://wilson-premier.com/admin"
```

Both endpoints are auth-protected. The migration is idempotent — safe to run multiple times (trash and inquiries are cleared before re-inserting).

### 5. Verify Turso is active

Check the Turso dashboard at https://turso.tech/app — tables should show row counts matching the JSON data.

## Important Notes

- **Never delete `/home/wilsonprem/data/`** on the VPS — it's the filesystem fallback
- **`.env` is the single source of truth** — all env vars live there, `app.js` reads it on startup
- **PM2 manages the process** — don't use `nohup node app.js` directly, use PM2 stop/start
- **Turso going down is not catastrophic** — the app falls back to filesystem JSON automatically
- **Always run `scripts/backup-production-data.sh` before deploying** — commits a snapshot to git
- **The admin panel has two logins:** Wilson / PropertyAdmin7283, Admin / WPPAdmin26
- **Apache blocks bare POST requests** — migration curl commands need browser-like headers (User-Agent, Origin, Referer)
