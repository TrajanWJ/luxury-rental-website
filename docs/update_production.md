# Production Update: Photo Order Persistence Fix

**Date:** 2026-03-01
**Priority:** Critical — client photo orders are not displaying on the live site

## What Happened

The photo order system relied on JSONBlob (a free external JSON storage service) as its primary data store. JSONBlob deleted the blob, meaning:

1. The live site at wilson-premier.com returns **empty photo orders** — visitors see default image order, not the client's curated arrangement
2. The admin panel saves go nowhere — JSONBlob is gone
3. The VPS couldn't even reach JSONBlob when it existed (server-side fetch failures)

The client's photo ordering work was rescued from JSONBlob moments before it disappeared and is now committed to `data/photo-orders.json` in git.

## What Changed

### Replaced JSONBlob with VPS Filesystem Storage

**Files modified:**
- `lib/file-store.ts` — **NEW** — shared read/write module for persistent JSON file
- `app/api/photo-order/route.ts` — replaced JSONBlob calls with `readStore()`/`writeStore()`
- `lib/trash-store.ts` — replaced JSONBlob calls with `readStore()`/`writeStore()`

**Fallback chain (unchanged):**
```
MariaDB (if configured) → VPS filesystem → empty seed
```

**Storage location:**
- **Development:** `./data/photo-orders.json` (project root, checked into git)
- **Production:** `$PERSISTENT_DATA_DIR/photo-orders.json` (default: `./data/` in the app directory)
  - Recommended: set `PERSISTENT_DATA_DIR=/home/wilsonprem/data` so the file lives **outside** the deploy directory and survives redeployments

**Concurrency model:**
- Single Node.js process on the VPS — sequential request handling prevents write conflicts
- Atomic writes (write to `.tmp` then rename) prevent corruption on crash
- The `PhotoOrderContext` polls `/api/photo-order?property=_all` every 3 seconds — admin panel and main site stay in sync
- Cross-tab sync via `localStorage` events (instant within same browser)

## Deployment Steps

### 1. Build the standalone app locally

```bash
cd "client sites/wilson premier"
npm run build
```

### 2. Prepare the deploy folder

```bash
# Copy standalone build
rm -rf deploy/*
cp -r .next/standalone/* deploy/
cp -r .next/standalone/.next deploy/.next
cp -r .next/static deploy/.next/static
cp -r public deploy/public

# Copy the photo orders seed data
mkdir -p deploy/data
cp data/photo-orders.json deploy/data/photo-orders.json

# Copy the app.js entry point
cp deploy/app.js deploy/app.js 2>/dev/null || true
```

### 3. Upload to VPS via FTP

```bash
# Zip the deploy folder
cd deploy && zip -r ../wilson-premier-deploy.zip . && cd ..

# Upload via FTP
curl -T wilson-premier-deploy.zip \
  ftp://209.142.66.121/wilson-premier-app/wilson-premier-deploy.zip \
  --user 'wilsonprem_trajan:USop03TKfN26J'
```

### 4. Extract and set up persistent data on VPS

> **SSH is disabled on this VPS.** All server-side commands run via the
> "FTP + PHP trick": upload a `.php` script to `public_html/` via FTP,
> then execute it by hitting it with curl over HTTP. The script deletes
> itself after running.

Save the following as `deploy-update.php` locally, then:

```bash
# Upload the PHP script
curl -s -T deploy-update.php \
  ftp://209.142.66.121/public_html/deploy-update.php \
  --user 'wilsonprem_trajan:USop03TKfN26J'

# Execute it (use the wilson-premier.com Host header so it hits the right VHost)
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

// If persistent photo-orders.json doesn't exist yet, seed it from the deploy
$persistentFile = "$dataDir/photo-orders.json";
$seedFile = "$appDir/data/photo-orders.json";
if (!file_exists($persistentFile) && file_exists($seedFile)) {
    copy($seedFile, $persistentFile);
    echo "Seeded photo-orders.json to persistent location\n";
} else if (file_exists($persistentFile)) {
    echo "Persistent photo-orders.json already exists — keeping it\n";
} else {
    echo "WARNING: No seed file found at $seedFile\n";
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

// Write .env with PERSISTENT_DATA_DIR if it doesn't have it
$envFile = "$appDir/.env";
$envContent = file_exists($envFile) ? file_get_contents($envFile) : '';
if (strpos($envContent, 'PERSISTENT_DATA_DIR') === false) {
    file_put_contents($envFile, $envContent . "\nPERSISTENT_DATA_DIR=/home/wilsonprem/data\n");
    echo "Added PERSISTENT_DATA_DIR to .env\n";
}

echo "Done. Restart the app now.\n";
unlink(__FILE__);
```

### 5. Restart the app

Save as `restart-app.php`, upload via FTP, execute via curl (same pattern as step 4):

```bash
curl -s -T restart-app.php \
  ftp://209.142.66.121/public_html/restart-app.php \
  --user 'wilsonprem_trajan:USop03TKfN26J'

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
$cmd = "cd $appDir && PERSISTENT_DATA_DIR=/home/wilsonprem/data NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 nohup $node app.js >> /home/wilsonprem/app.log 2>&1 & echo \$!";
$pid = trim(shell_exec($cmd));
echo "Started PID: $pid\n";
unlink(__FILE__);
```

### 7. Verify

```bash
# Photo orders should now return data
curl -s https://wilson-premier.com/api/photo-order?property=_all | python3 -c "
import json, sys
data = json.load(sys.stdin)
for k, v in data.get('orders', {}).items():
    print(f'{k}: {len(v)} photos')
"

# Expected output:
# suite-retreat: 112 photos
# penthouse-view: 33 photos
# lake-view: 23 photos
# suite-view: 191 photos
# milan-manor: 86 photos
```

## Ongoing Deployment Workflow

### Before every deployment:

1. **Pull latest photo orders from production** — the API is public, no auth needed:
   ```bash
   curl -s https://wilson-premier.com/api/photo-order?property=_all | \
     python3 -c "import json,sys; d=json.load(sys.stdin); json.dump(d.get('orders',{}), open('data/photo-orders.json','w'), indent=2)"
   ```
   If the API returns empty (app is down), the last committed version in git is your backup.

2. **Commit the snapshot** to git — this is your insurance policy

3. **Build and deploy** following steps 1–5 above (FTP upload + PHP execution)

4. **PERSISTENT_DATA_DIR is key** — as long as it points outside the deploy directory (`/home/wilsonprem/data`), existing photo orders survive redeployment. The seed file is only used on first boot when no persistent file exists.

### Important: What NOT to do

- **Never delete `/home/wilsonprem/data/photo-orders.json`** on the VPS — that's the live source of truth
- **Never deploy without `PERSISTENT_DATA_DIR` set** — without it, the app reads/writes inside its own directory, and the next deploy overwrites the data
- **Never assume `data/photo-orders.json` in git is current** — always pull from production before deploying if the client may have made changes

## Architecture Diagram

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
│  1. Try MariaDB (if MYSQL_* env vars set)               │
│  2. Fall back to filesystem:                             │
│     readStore() / writeStore()                           │
│     → $PERSISTENT_DATA_DIR/photo-orders.json            │
│     → atomic writes (write .tmp → rename)               │
└──────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────┐
│  /home/wilsonprem/data/photo-orders.json                │
│  (persistent — survives deployments)                     │
│                                                          │
│  Seed: data/photo-orders.json (bundled in build)        │
│  Backup: git commit history                              │
└──────────────────────────────────────────────────────────┘
```

## Future: MariaDB Migration

When SSH access is available and MariaDB is set up:

1. Set `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` in `.env`
2. Run the migrate endpoint: `POST /api/admin/migrate`
3. The API will automatically prefer MariaDB over filesystem
4. The filesystem file becomes the fallback if DB is temporarily down
5. Photo orders in MariaDB survive deployments by nature (database is independent of app code)
