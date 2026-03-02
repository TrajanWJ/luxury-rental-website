# Admin Expansion — Deployment Checklist

**Date:** 2026-03-02
**Status:** Ready for deployment

## What Changed

### New Admin Routes
| Route | Purpose |
|-------|---------|
| `/admin` | Properties & Settings (visibility, matterport, video, SEO, floor plans, display order) |
| `/admin/photos` | Photo Management (moved from old `/admin`) |
| `/admin/site-management` | STR/Real Estate section toggles |
| `/admin/concierge` | Concierge partner CRUD |
| `/admin/activity-log` | Admin action log |

### New API Routes
| Route | Purpose |
|-------|---------|
| `/api/site-config` | Admin GET/POST for site config |
| `/api/site-config/public` | Public GET (stripped, no activity log) |
| `/api/admin/save-image` | Download URL or accept file upload → save to `/public/uploads/` |

### New Persistence Files
| File | Purpose |
|------|---------|
| `data/site-config.json` | Site config (property overrides, section toggles, concierge, activity log) |
| `public/uploads/` | Locally persisted uploaded images (floor plans, concierge photos) |
| `public/uploads/floor-plans/` | Floor plan images specifically |

### Database
New table `site_config` added to `lib/db-migrate.ts` (SQLite/Turso schema).

---

## Pre-Deployment Steps

### 1. Pull latest production data
```bash
# Pull photo orders (existing practice)
curl -s https://wilson-premier.com/api/photo-order?property=_all | \
  python3 -c "import json,sys; d=json.load(sys.stdin); json.dump(d.get('orders',{}), open('data/photo-orders.json','w'), indent=2)"

# Site config is already in git — no pull needed for first deploy
```

### 2. Run database migration (if Turso configured)
After deploying, hit the migration endpoint:
```bash
curl -X POST https://wilson-premier.com/api/admin/migrate
```
This creates the `site_config` table alongside existing tables.

### 3. Verify git tracks uploaded images
```bash
# Ensure /public/uploads/ is NOT in .gitignore
git add public/uploads/
git add data/site-config.json
```

---

## Persistence Architecture

### How it works across deployments:

1. **Site config** (`data/site-config.json`):
   - Turso DB is primary (cloud, shared across instances)
   - File is write-through cache (updated on every save)
   - On cold start: reads from Turso first, falls back to file
   - File is checked into git → new deploys start with last committed state

2. **Uploaded images** (`public/uploads/`):
   - When an image is uploaded or a URL is added, `/api/admin/save-image` downloads it to `public/uploads/`
   - Files use content-hash filenames (e.g., `a1b2c3d4e5f6.jpg`) — deduplication built-in
   - These files MUST be committed to git before deploying
   - Atomic writes: `.tmp` → rename pattern prevents corruption

3. **Photo orders** (`data/photo-orders.json`):
   - Unchanged — same Turso-first + file-fallback pattern

### Deployment workflow:

```bash
# 1. Make admin changes on production (floor plans, settings, etc.)
# 2. Before deploying new code, pull production state:

# Pull site config from production
curl -s https://wilson-premier.com/api/site-config | \
  python3 -c "import json,sys; json.dump(json.load(sys.stdin), open('data/site-config.json','w'), indent=2)"

# Pull photo orders from production
curl -s https://wilson-premier.com/api/photo-order?property=_all | \
  python3 -c "import json,sys; d=json.load(sys.stdin); json.dump(d.get('orders',{}), open('data/photo-orders.json','w'), indent=2)"

# 3. Download any new uploaded images from production
# (For images hosted on the VPS, rsync or FTP them to public/uploads/)

# 4. Commit everything
git add data/ public/uploads/
git commit -m "data: sync production state before deploy"

# 5. Deploy
npm run build
# ... normal deployment workflow
```

---

## Vercel-specific Notes

- `public/uploads/` is served as static files by Next.js automatically
- No Vercel config changes needed
- The `/api/admin/save-image` endpoint writes to the filesystem which works on Vercel for the duration of the instance, but files won't persist across redeployments unless committed to git
- **For Vercel**: always pull and commit uploaded images before each deploy
- **For VPS**: files persist naturally on the server filesystem

## Testing After Deploy

1. Visit `/admin` — should show Properties & Settings page
2. Toggle a property's homepage visibility → check homepage reflects it
3. Upload a floor plan image → verify it appears under `/uploads/floor-plans/`
4. Check `/admin/site-management` → toggle a section → verify homepage
5. Check `/admin/concierge` → edit a partner → verify experiences page
6. Check `/admin/activity-log` → should show all recent admin actions
7. Check `/admin/photos` → existing photo manager should work identically
