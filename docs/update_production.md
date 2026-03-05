# Production Deployment Guide

**Last updated:** 2026-03-05

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

**VPS:** `209.142.66.121` — ScalaHosting sPanel, Rocky Linux

**SSH access:**
```bash
ssh -p 6543 wilsonprem@209.142.66.121
```
Key auth is configured (`~/.ssh/authorized_keys`). sPanel also has a browser-based SSH Terminal under Tools.

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

**Key paths:**
| Path | Purpose |
|------|---------|
| `/home/wilsonprem/wilson-premier-app/` | App code (overwritten each deploy) |
| `/home/wilsonprem/wilson-premier-app/.env` | Env vars (persists across deploys) |
| `/home/wilsonprem/wilson-premier-app/app.js` | Entry point (loads .env, starts server) |
| `/home/wilsonprem/data/` | Persistent data (never touched by deploys) |
| `/home/wilsonprem/node20/bin/node` | Node.js v20 binary |
| `/home/wilsonprem/.pm2/` | PM2 config, logs, pids |

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

### 3. Upload to VPS via rsync

```bash
rsync -avz --delete \
  --exclude='.env' \
  --exclude='public/images/' \
  -e 'ssh -p 6543' \
  deploy/ wilsonprem@209.142.66.121:~/wilson-premier-app/
```

The `--exclude='public/images/'` skips the ~920MB property photos (already on VPS). Remove this flag on first deploy or when images change.

To upload images (first deploy or when changed):
```bash
rsync -avz -e 'ssh -p 6543' \
  deploy/public/images/ wilsonprem@209.142.66.121:~/wilson-premier-app/public/images/
```

### 4. Seed data (first deploy only)

```bash
ssh -p 6543 wilsonprem@209.142.66.121 '
  mkdir -p ~/data
  for f in photo-orders.json site-config.json; do
    [ ! -f ~/data/$f ] && cp ~/wilson-premier-app/data/$f ~/data/$f && echo "Seeded $f"
    [ -f ~/data/$f ] && echo "$f already exists"
  done
'
```

### 5. Restart the app

```bash
ssh -p 6543 wilsonprem@209.142.66.121 '
  /usr/bin/pm2 stop all
  pkill -9 -f "next-server" 2>/dev/null
  sleep 2
  /usr/bin/pm2 start all
  sleep 3
  /usr/bin/pm2 list
  /usr/bin/pm2 save
'
```

If the restart fails with EADDRINUSE, the orphan kill didn't catch everything:
```bash
ssh -p 6543 wilsonprem@209.142.66.121 '
  /usr/bin/pm2 stop all
  pkill -9 -f node 2>/dev/null
  sleep 3
  /usr/bin/pm2 start all
  /usr/bin/pm2 save
'
```

### 6. Verify

```bash
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

## Quick Reference

**One-liner deploy (after build + prepare):**
```bash
rsync -avz --delete --exclude='.env' --exclude='public/images/' \
  -e 'ssh -p 6543' deploy/ wilsonprem@209.142.66.121:~/wilson-premier-app/ && \
ssh -p 6543 wilsonprem@209.142.66.121 \
  '/usr/bin/pm2 stop all; pkill -9 -f "next-server" 2>/dev/null; sleep 2; /usr/bin/pm2 start all; /usr/bin/pm2 save; /usr/bin/pm2 list'
```

**Check logs:**
```bash
ssh -p 6543 wilsonprem@209.142.66.121 '/usr/bin/pm2 logs --lines 30 --nostream'
```

**Check status:**
```bash
ssh -p 6543 wilsonprem@209.142.66.121 '/usr/bin/pm2 list'
```

**Edit .env:**
```bash
ssh -p 6543 wilsonprem@209.142.66.121 'nano ~/wilson-premier-app/.env'
```

## First-Time Turso Setup

Only needed once when setting up a fresh VPS.

### 1. Set env vars

```bash
ssh -p 6543 wilsonprem@209.142.66.121 'cat >> ~/wilson-premier-app/.env << "EOF"
TURSO_DATABASE_URL=libsql://wilson-premier-wilsonprem-dev26.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=<paste-token-here>
PERSISTENT_DATA_DIR=/home/wilsonprem/data
EOF'
```

### 2. Restart the app (step 5 above)

### 3. Create Turso tables

```bash
# Login to get session token
TOKEN=$(curl -s -X POST https://wilson-premier.com/api/admin/auth \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"username":"Admin","password":"WPPAdmin26"}' \
  -c - | grep admin-session | awk '{print $NF}')

# Create tables (browser-like headers required to pass Apache)
curl -s -X POST https://wilson-premier.com/api/admin/migrate \
  -H "Cookie: admin-session=$TOKEN" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Origin: https://wilson-premier.com" \
  -H "Referer: https://wilson-premier.com/admin"
```

### 4. Migrate JSON data to Turso

```bash
curl -s -X POST https://wilson-premier.com/api/admin/migrate-data \
  -H "Cookie: admin-session=$TOKEN" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Origin: https://wilson-premier.com" \
  -H "Referer: https://wilson-premier.com/admin"
```

Migration is idempotent — safe to run multiple times.

## Important Notes

- **Never delete `/home/wilsonprem/data/`** on the VPS — it's the filesystem fallback
- **`.env` is the single source of truth** — all env vars live there, `app.js` reads it on startup
- **PM2 manages the process** — don't use `nohup node app.js` directly, use `pm2 stop/start`
- **Turso going down is not catastrophic** — the app falls back to filesystem JSON automatically
- **Always run `scripts/backup-production-data.sh` before deploying** — commits a snapshot to git
- **The admin panel has two logins:** Wilson / PropertyAdmin7283, Admin / WPPAdmin26
- **Apache blocks bare POST requests** — migration curl commands need browser-like headers (User-Agent, Origin, Referer)
- **rsync `--exclude='.env'`** is critical — never overwrite the VPS .env with the local one
- **SSH port is 6543** (not 22) — ScalaHosting/sPanel uses a non-standard port

## Legacy: FTP + PHP Trick

Before SSH was enabled, all server commands ran via uploading `.php` scripts to `public_html/` via FTP and executing them via HTTP. This is no longer needed but the scripts remain in `scripts/` for reference. FTP credentials: `wilsonprem_trajan:USop03TKfN26J` at `ftp://209.142.66.121`.
