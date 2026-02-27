# Admin Dashboard Design (Revised)

**Date:** 2026-02-27
**Status:** Approved (Revised — VPS backend)

## Overview

Add a `/admin` route to the Wilson Premier site with photo management (reorder, upload, delete, restore), a recently deleted section, and an analytics placeholder. Clean up the public "All Photos" modal to be a pure gallery viewer.

## Storage Architecture

### Keep What Works

| Feature | Storage | Cost |
|---|---|---|
| Photo ordering/metadata | **MariaDB on VPS** (replaces JSONBlob) | Free (VPS already paid) |
| Existing property photos | `/public/images/` in git (existing) | Free |
| New photo uploads | **VPS filesystem** via `media.wilson-premier.com` | Free |
| Recently deleted photos | MariaDB `trash_items` table | Free |
| Cross-tab concurrency | 3-sec polling + localStorage (existing) + optimistic locking | Free |

### VPS MariaDB Integration

- Connection via `serverless-mysql` (handles connection lifecycle in Vercel serverless)
- Database: `wilsonprem_admin` on the existing sPanel VPS
- Remote access via port 3306 (MySQL user with `%` host, strong password)
- Tables: `photo_orders` (per-property JSON with version column), `trash_items`
- Optimistic locking via `version` column prevents concurrent edit conflicts
- Env vars: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

### VPS File Upload Integration

- Subdomain `media.wilson-premier.com` → VPS IP (209.142.66.121)
- Simple PHP upload endpoint at `/upload.php` with API key auth
- Vercel API route receives files from admin UI, forwards to VPS PHP endpoint
- Files stored at `/home/wilsonprem_dev26/public_html/media/photos/{slug}/{filename}.jpg`
- Served publicly via `https://media.wilson-premier.com/photos/{slug}/{filename}.jpg`
- Env vars: `UPLOAD_SECRET`, `MEDIA_BASE_URL`

### Image Source Resolution

Photos can come from three places:
1. Static: `/images/{slug}/{filename}.jpg` (existing, in git)
2. VPS: `https://media.wilson-premier.com/photos/{slug}/{filename}.jpg` (new uploads)
3. Legacy: any existing JSONBlob-referenced paths (migrated to MariaDB)

The photo order rows in MariaDB store full image paths/URLs in JSON, so mixed sources work naturally.

## Authentication

- Simple cookie-based login at `/admin/login`
- Hardcoded credentials: `Wilson` / `PropertyAdmin7283`
- On login: set `HttpOnly` + `Secure` + `SameSite=Strict` cookie with signed JWT (secret from env var `ADMIN_JWT_SECRET`)
- Next.js middleware on `/admin/*` and `/api/admin/*` (except login/auth) checks cookie validity
- Redirect to `/admin/login` if missing/invalid
- No external auth service

## Admin Dashboard (`/admin`)

### Layout

- Own `layout.tsx` using route group `(dashboard)` (login page excluded from layout)
- Sidebar navigation with tabs: Photos, Recently Deleted, Analytics
- Property selector dropdown in Photos tab
- Dark/neutral admin theme (charcoal bg, linen accents — on-brand)

### Photos Tab (`/admin`)

Built directly off existing photo management code from `property-modal.tsx`:

- **Property selector**: Dropdown to choose which property to manage
- **Photo grid**: Responsive grid with drag-and-drop reordering
- **Position numbers**: Editable position badges on each photo
- **Lock/unlock**: Pin photos to specific positions
- **Upload**: Drag-and-drop zone + file browser, uploads to VPS via API route
- **Delete**: Trash icon moves photo to Recently Deleted (soft delete)
- **Save order**: Persists to MariaDB with optimistic locking
- **Concurrency**: 3-sec polling keeps sessions in sync; version conflicts show warning toast

### Recently Deleted Tab (`/admin/trash`)

- Grid of all trashed photos across all properties
- Each card shows: thumbnail, property name, deletion date, days remaining
- **Restore**: Removes from trash table, admin UI adds back to property order
- **Permanently delete**: Removes from trash table
- **Empty trash**: Bulk permanent delete
- **Auto-purge**: On admin load, remove items older than 7 days from trash table
- Trash items have database IDs for precise operations

### Analytics Tab (`/admin/analytics`)

- Placeholder page with "Coming Soon" message
- Architecture ready for future integration

## Public Property Modal — Gallery Viewer

Strip the current "All Photos" overlay of all admin features. Keep only:

- Full-screen overlay triggered by "All Photos" button
- Responsive photo grid (2/3/4 columns)
- Click any photo to open lightbox/enlarged view
- Smooth transitions (Framer Motion)
- No IDs, no position numbers, no drag handles, no lock toggles, no save button
- Close button to return to property details
- Uses the ordered image list from PhotoOrderProvider (existing)

## API Routes

### `POST /api/admin/upload`
- Auth: admin cookie required
- Accepts: multipart form data (image files + property slug)
- Action: Forward to VPS PHP upload endpoint at `media.wilson-premier.com/upload.php`
- Returns: `{ ok: true, urls: string[] }`

### `POST /api/admin/delete`
- Auth: admin cookie required
- Accepts: `{ property: string, src: string }`
- Action: Insert into `trash_items` table
- Returns: `{ ok: true }`

### `POST /api/admin/restore`
- Auth: admin cookie required
- Accepts: `{ id: number }`
- Action: Delete from `trash_items` table by ID
- Returns: `{ ok: true }`

### `POST /api/admin/purge`
- Auth: admin cookie required
- Accepts: `{ id?: number, purgeExpired?: boolean }`
- Action: Permanently delete from `trash_items` (by ID or items older than 7 days)
- Returns: `{ ok: true, purged: number }`

### `GET /api/admin/trash`
- Auth: admin cookie required
- Returns: All trash items with id, property_slug, src, deleted_at

### `POST /api/admin/migrate`
- Auth: admin cookie required
- Action: Run CREATE TABLE IF NOT EXISTS for schema
- Returns: `{ ok: true }`

### Modified: `GET/POST /api/photo-order`
- **Changed**: Now reads/writes MariaDB instead of JSONBlob
- GET `_all` returns same shape as before (compatible with existing polling)
- POST accepts optional `version` param for optimistic locking
- Returns 409 Conflict if version mismatch

## File Structure

```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx        # Login page (no sidebar)
│   └── (dashboard)/
│       ├── layout.tsx       # Admin layout with sidebar nav
│       ├── page.tsx         # Photos tab (default)
│       ├── trash/
│       │   └── page.tsx     # Recently deleted
│       └── analytics/
│           └── page.tsx     # Analytics placeholder
├── api/
│   ├── admin/
│   │   ├── auth/
│   │   │   └── route.ts    # Login/logout endpoints
│   │   ├── upload/
│   │   │   └── route.ts    # Photo upload (forwards to VPS)
│   │   ├── delete/
│   │   │   └── route.ts    # Soft delete (add to trash table)
│   │   ├── restore/
│   │   │   └── route.ts    # Restore from trash
│   │   ├── purge/
│   │   │   └── route.ts    # Permanent delete
│   │   ├── trash/
│   │   │   └── route.ts    # List trash contents
│   │   └── migrate/
│   │       └── route.ts    # One-time schema migration
│   └── photo-order/
│       └── route.ts        # MODIFIED: MariaDB instead of JSONBlob
components/
├── admin/
│   ├── admin-sidebar.tsx   # Sidebar navigation
│   ├── photo-manager.tsx   # Reorder/upload/delete grid
│   └── trash-grid.tsx      # Recently deleted grid
├── property-modal.tsx      # Modified: "All Photos" becomes clean gallery
└── photo-order-context.tsx # Modified: version tracking for optimistic locking
lib/
├── db.ts                   # MariaDB client (serverless-mysql)
├── db-migrate.ts           # Schema definitions
└── admin-auth.ts           # JWT auth helpers
scripts/
└── migrate-jsonblob.ts     # One-time migration from JSONBlob to MariaDB
middleware.ts               # Admin route protection
```
