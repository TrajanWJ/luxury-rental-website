# Admin Dashboard Implementation Plan (Revised)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `/admin` route with photo management (reorder, upload, delete, restore from trash), clean up the public "All Photos" modal to be gallery-only, and scaffold an analytics tab.

**Architecture:** Separate `/admin` section with its own layout (mirrors `/real-estate` pattern). Cookie-based auth via Next.js middleware. Photo ordering + trash metadata stored in **MariaDB on the existing VPS** (replaces JSONBlob). New photo uploads stored on the **VPS filesystem** served via `media.wilson-premier.com`. Existing static images remain in `/public/images/`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, `serverless-mysql` (connection-pooled MySQL client for Vercel serverless), `jose` (JWT for auth cookies — edge-compatible, no native deps)

---

## Prerequisites — Manual Steps (User must complete BEFORE implementation)

> These steps configure the VPS database and file server. The implementing agent cannot do these — they require sPanel/SSH access.

### Step A: Create the MariaDB Database

1. Log into sPanel at `https://wilson-premier.com/spanel/` with credentials:
   - User: `wilsonprem_dev26` / Pass: `uBDp57whTdeE8`
2. Navigate to **MySQL Databases** (under Databases section)
3. Create a new database named: `wilsonprem_admin`
4. Create a database user:
   - Username: `wilsonprem_app`
   - **IP/Hostname: `%`** (wildcard — allows connections from any IP, required for Vercel)
   - Password: Generate a strong 32+ character random password (use the built-in generator)
   - Check "Grant the user access to the database"
5. Click Submit
6. **Save the password** — you'll need it for the Vercel env var

### Step B: Configure MariaDB for Remote Access

1. SSH into the VPS: `ssh wilsonprem_dev26@wilson-premier.com -p 6543`
   - Or use sPanel's built-in SSH terminal (under Tools section)
2. Edit MariaDB config to allow remote connections:
   ```bash
   sudo nano /etc/mysql/my.cnf
   # (or /etc/my.cnf — check which exists)
   ```
3. Find the `[mysqld]` section and change:
   ```ini
   bind-address = 0.0.0.0
   ```
   (If the line says `bind-address = 127.0.0.1`, change it. If the line doesn't exist, add it under `[mysqld]`)
4. Restart MariaDB:
   ```bash
   sudo systemctl restart mariadb
   # or: sudo systemctl restart mysql
   ```

### Step C: Open Firewall Port 3306

Still in SSH:
```bash
# Check what firewall is running:
sudo iptables -L -n | grep 3306
# or
sudo ufw status

# If using iptables directly:
sudo iptables -I INPUT -p tcp --dport 3306 -j ACCEPT
sudo iptables-save > /etc/iptables.rules

# If using ufw:
sudo ufw allow 3306/tcp

# If using CSF:
sudo csf -a 0.0.0.0/0 tcp 3306
```
Test from your local machine: `mysql -h wilson-premier.com -u wilsonprem_app -p wilsonprem_admin`

### Step D: Set Up Media Subdomain (for photo uploads)

1. In **Cloudflare DNS** (you have access), add a new record:
   - Type: **A**
   - Name: `media`
   - Content: `209.142.66.121` (the VPS IP)
   - Proxy: **DNS only (gray cloud)**
2. In sPanel, the VPS should already serve this subdomain. Create a directory for uploads:
   ```bash
   # SSH into VPS
   mkdir -p /home/wilsonprem_dev26/public_html/media/photos
   chmod 755 /home/wilsonprem_dev26/public_html/media/photos
   ```
3. Create a simple PHP upload endpoint (PHP is already running on the VPS):
   ```bash
   cat > /home/wilsonprem_dev26/public_html/media/upload.php << 'PHPEOF'
   <?php
   // Simple authenticated upload endpoint
   $SECRET = getenv('UPLOAD_SECRET') ?: 'CHANGE_THIS_TO_A_RANDOM_STRING';

   header('Content-Type: application/json');

   // Verify secret
   $auth = $_SERVER['HTTP_X_UPLOAD_SECRET'] ?? '';
   if ($auth !== $SECRET) {
       http_response_code(401);
       echo json_encode(['error' => 'Unauthorized']);
       exit;
   }

   if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
       http_response_code(405);
       echo json_encode(['error' => 'Method not allowed']);
       exit;
   }

   $property = $_POST['property'] ?? '';
   if (!$property || !preg_match('/^[a-z0-9-]+$/', $property)) {
       http_response_code(400);
       echo json_encode(['error' => 'Invalid property']);
       exit;
   }

   $uploadDir = __DIR__ . '/photos/' . $property . '/';
   if (!is_dir($uploadDir)) {
       mkdir($uploadDir, 0755, true);
   }

   $urls = [];
   foreach ($_FILES['files']['tmp_name'] as $i => $tmp) {
       $originalName = basename($_FILES['files']['name'][$i]);
       $safeName = preg_replace('/[^a-zA-Z0-9.-]/', '-', strtolower($originalName));
       $filename = time() . '-' . $safeName;
       $dest = $uploadDir . $filename;

       if (move_uploaded_file($tmp, $dest)) {
           $urls[] = 'https://media.wilson-premier.com/photos/' . $property . '/' . $filename;
       }
   }

   echo json_encode(['ok' => true, 'urls' => $urls]);
   PHPEOF
   ```
4. Set the upload secret as an environment variable on the VPS (add to `/etc/environment` or a `.env` file that PHP reads), OR just hardcode a strong random string in the PHP file for simplicity.

### Step E: Add Environment Variables to Vercel

In your Vercel project dashboard → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `MYSQL_HOST` | `209.142.66.121` (VPS IP — use IP, not domain, to avoid Cloudflare proxy) |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | `wilsonprem_app` |
| `MYSQL_PASSWORD` | (the 32+ char password from Step A) |
| `MYSQL_DATABASE` | `wilsonprem_admin` |
| `ADMIN_JWT_SECRET` | (any random 32+ char string) |
| `UPLOAD_SECRET` | (same string you set in the PHP script) |
| `MEDIA_BASE_URL` | `https://media.wilson-premier.com` |

### Step F: Test Connectivity

After Steps A-E, verify from your local machine:
```bash
# Test MySQL connection
mysql -h 209.142.66.121 -P 3306 -u wilsonprem_app -p wilsonprem_admin

# Test media subdomain
curl -I https://media.wilson-premier.com/

# Test upload endpoint
curl -X POST https://media.wilson-premier.com/upload.php \
  -H "X-Upload-Secret: YOUR_SECRET" \
  -F "property=test" \
  -F "files[]=@some-test-image.jpg"
```

---

## Implementation Tasks

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install new packages**

Run: `pnpm add serverless-mysql jose`

- `serverless-mysql` — MySQL client with automatic connection management for serverless environments (handles connect/disconnect lifecycle, prevents connection exhaustion)
- `jose` — JWT signing/verification that works in Next.js Edge Runtime (middleware). Do NOT use `jsonwebtoken` — it uses Node.js `crypto` and breaks in Edge.

**Step 2: Create `.env.local` for local development**

Create `.env.local` (git-ignored by default):

```
# VPS MariaDB
MYSQL_HOST=209.142.66.121
MYSQL_PORT=3306
MYSQL_USER=wilsonprem_app
MYSQL_PASSWORD=<password-from-step-A>
MYSQL_DATABASE=wilsonprem_admin

# Admin auth
ADMIN_JWT_SECRET=<random-32-char-string>

# VPS file uploads
UPLOAD_SECRET=<same-as-php-script>
MEDIA_BASE_URL=https://media.wilson-premier.com
```

**Step 3: Add media subdomain to next.config.mjs remotePatterns**

```js
{
  protocol: 'https',
  hostname: 'media.wilson-premier.com',
},
```

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.mjs
git commit -m "chore: add serverless-mysql and jose dependencies, media remote pattern"
```

---

### Task 2: Database Client Helper

**Files:**
- Create: `lib/db.ts`

**Step 1: Create the MySQL client singleton**

Create `lib/db.ts`:

```typescript
import mysql from "serverless-mysql"

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
})

export async function query<T = unknown>(
  sql: string,
  values?: unknown[]
): Promise<T> {
  const results = await db.query(sql, values)
  await db.end()
  return results as T
}

export default db
```

`serverless-mysql` wraps the standard `mysql2` driver but manages connections for serverless — it tracks connections across invocations, auto-disconnects idle connections, and retries on connection limit errors. The `await db.end()` call doesn't close the connection; it returns it to the pool and marks it for cleanup if idle.

**Step 2: Commit**

```bash
git add lib/db.ts
git commit -m "feat: add MariaDB client helper for serverless"
```

---

### Task 3: Database Schema Migration

**Files:**
- Create: `lib/db-migrate.ts`
- Create: `app/api/admin/migrate/route.ts`

**Step 1: Create the schema definition**

Create `lib/db-migrate.ts`:

```typescript
import { query } from "./db"

export async function runMigrations() {
  // Photo orders — one row per property
  await query(`
    CREATE TABLE IF NOT EXISTS photo_orders (
      property_slug VARCHAR(100) PRIMARY KEY,
      order_data JSON NOT NULL,
      version INT NOT NULL DEFAULT 1,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  // Trash items — soft-deleted photos
  await query(`
    CREATE TABLE IF NOT EXISTS trash_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_slug VARCHAR(100) NOT NULL,
      src VARCHAR(500) NOT NULL,
      deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_property (property_slug),
      INDEX idx_deleted_at (deleted_at)
    )
  `)
}
```

**Step 2: Create a one-time migration API endpoint**

Create `app/api/admin/migrate/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { runMigrations } from "@/lib/db-migrate"

export async function POST() {
  try {
    await runMigrations()
    return NextResponse.json({ ok: true, message: "Migrations complete" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

This endpoint will be called once during setup to create the tables, then protected by admin auth middleware. After initial setup, it's idempotent (CREATE TABLE IF NOT EXISTS).

**Step 3: Create a data migration script to seed existing JSONBlob orders into MariaDB**

Create `scripts/migrate-jsonblob.ts` (run locally, one-time):

```typescript
// Run with: npx tsx scripts/migrate-jsonblob.ts
// Reads current JSONBlob data and inserts into MariaDB

const BLOB_URL = "https://jsonblob.com/api/jsonBlob/019c9b43-c13d-7d31-9f88-4fd2e7125d1c"

async function main() {
  // Fetch existing orders from JSONBlob
  const res = await fetch(BLOB_URL, { headers: { Accept: "application/json" } })
  const data = await res.json()

  // Import db after env is loaded
  const { query } = await import("../lib/db")

  for (const [slug, order] of Object.entries(data)) {
    if (slug.startsWith("_")) continue // skip _trash or other meta keys
    await query(
      `INSERT INTO photo_orders (property_slug, order_data, version)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE order_data = VALUES(order_data)`,
      [slug, JSON.stringify(order)]
    )
    console.log(`Migrated: ${slug} (${(order as unknown[]).length} images)`)
  }

  console.log("Migration complete!")
  process.exit(0)
}

main().catch(console.error)
```

**Step 4: Commit**

```bash
git add lib/db-migrate.ts app/api/admin/migrate/route.ts scripts/migrate-jsonblob.ts
git commit -m "feat: add database schema and JSONBlob migration script"
```

---

### Task 4: Auth — Middleware + Login API

**Files:**
- Create: `middleware.ts` (project root)
- Create: `app/api/admin/auth/route.ts`
- Create: `lib/admin-auth.ts`

**Step 1: Create auth helper**

Create `lib/admin-auth.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "fallback-dev-secret-change-me")
const COOKIE_NAME = "admin-session"
const EXPIRY = "7d"

// Hardcoded credentials
const ADMIN_USER = "Wilson"
const ADMIN_PASS = "PropertyAdmin7283"

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET)
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}

export { COOKIE_NAME }
```

**Step 2: Create middleware**

Create `middleware.ts` at project root:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken, COOKIE_NAME } from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes (except login) and /api/admin routes (except auth)
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token || !(await verifySessionToken(token))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
```

**Step 3: Create login/logout API**

Create `app/api/admin/auth/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { validateCredentials, createSessionToken, COOKIE_NAME } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await createSessionToken()

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
```

**Step 4: Commit**

```bash
git add middleware.ts lib/admin-auth.ts app/api/admin/auth/route.ts
git commit -m "feat: add admin authentication with JWT cookies and middleware"
```

---

### Task 5: Admin Login Page

**Files:**
- Create: `app/admin/login/page.tsx`

No changes from original plan. Build the login page with charcoal theme, logo, username/password form, POST to `/api/admin/auth`, redirect to `/admin` on success.

**Step 1: Build the login page**

Create `app/admin/login/page.tsx` — same as original plan (lines 298-405 of original).

**Step 2: Commit**

```bash
git add app/admin/login/page.tsx
git commit -m "feat: add admin login page"
```

---

### Task 6: Admin Layout + Sidebar

**Files:**
- Create: `app/admin/(dashboard)/layout.tsx`
- Create: `components/admin/admin-sidebar.tsx`

No changes from original plan. Use route groups so login page has no sidebar. Sidebar has: Photos, Recently Deleted, Analytics tabs, plus View Live Site and Sign Out.

**Step 1: Create sidebar** — same as original plan (lines 427-512).

**Step 2: Create dashboard layout** — same as original plan (lines 519-531), using route group `(dashboard)`.

**Step 3: Commit**

```bash
git add components/admin/admin-sidebar.tsx "app/admin/(dashboard)/layout.tsx"
git commit -m "feat: add admin layout with sidebar navigation"
```

---

### Task 7: Migrate Photo Order API from JSONBlob to MariaDB

**Files:**
- Modify: `app/api/photo-order/route.ts`

This is the critical migration. The existing API reads/writes all orders from JSONBlob as a single JSON blob. The new version uses the `photo_orders` table with per-property rows and optimistic locking.

**Step 1: Rewrite the photo-order API**

Replace `app/api/photo-order/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

type ImageItem = { src: string; pos: number; locked: boolean }

interface PhotoOrderRow {
  property_slug: string
  order_data: string
  version: number
}

export async function GET(request: NextRequest) {
  const property = request.nextUrl.searchParams.get("property")
  if (!property) {
    return NextResponse.json({ error: "Missing property param" }, { status: 400 })
  }

  if (property === "_all") {
    const rows = await query<PhotoOrderRow[]>("SELECT property_slug, order_data, version FROM photo_orders")
    const orders: Record<string, ImageItem[]> = {}
    for (const row of rows) {
      orders[row.property_slug] = JSON.parse(row.order_data)
    }
    return NextResponse.json({ orders })
  }

  const rows = await query<PhotoOrderRow[]>(
    "SELECT order_data, version FROM photo_orders WHERE property_slug = ?",
    [property]
  )
  if (rows.length === 0) {
    return NextResponse.json({ images: null })
  }
  return NextResponse.json({
    images: JSON.parse(rows[0].order_data),
    version: rows[0].version,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { property, images, version } = body as {
    property: string
    images: ImageItem[]
    version?: number
  }

  if (!property || !images) {
    return NextResponse.json({ error: "Missing property or images" }, { status: 400 })
  }

  const orderJson = JSON.stringify(images)

  if (version !== undefined) {
    // Optimistic locking: only update if version matches
    const result = await query<{ affectedRows: number }>(
      `UPDATE photo_orders SET order_data = ?, version = version + 1
       WHERE property_slug = ? AND version = ?`,
      [orderJson, property, version]
    )
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Conflict — someone else updated this order. Please reload." },
        { status: 409 }
      )
    }
  } else {
    // Upsert without version check (backwards-compatible with existing clients)
    await query(
      `INSERT INTO photo_orders (property_slug, order_data, version)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE order_data = VALUES(order_data), version = version + 1`,
      [property, orderJson]
    )
  }

  return NextResponse.json({ ok: true })
}
```

Key changes from JSONBlob version:
- Per-property rows instead of one giant JSON blob
- `version` column enables optimistic locking (409 Conflict on stale writes)
- POST accepts optional `version` param — if provided, uses compare-and-swap
- Existing `photo-order-context.tsx` polling continues to work (GET `_all` still returns the same shape)

**Step 2: Update `photo-order-context.tsx` to support version tracking**

Add version tracking to the context so admin components can use optimistic locking:

In `components/photo-order-context.tsx`, extend the context to also store versions:

```typescript
type VersionMap = Record<string, number>

// Add to context value:
versions: VersionMap
// Add to saveOrder signature:
saveOrder: (propertyKey: string, images: ImageItem[], version?: number) => Promise<boolean | "conflict">
```

The fetchAll callback should also parse and store versions from the response. The public-facing components don't need to change — they don't pass `version`, so saves use the upsert path.

**Step 3: Commit**

```bash
git add app/api/photo-order/route.ts components/photo-order-context.tsx
git commit -m "feat: migrate photo ordering from JSONBlob to MariaDB with optimistic locking"
```

---

### Task 8: Upload API Route

**Files:**
- Create: `app/api/admin/upload/route.ts`

The Vercel API route receives files from the admin UI, then forwards them to the VPS PHP upload endpoint.

**Step 1: Create the upload endpoint**

```typescript
import { NextRequest, NextResponse } from "next/server"

const UPLOAD_URL = `${process.env.MEDIA_BASE_URL}/upload.php`
const UPLOAD_SECRET = process.env.UPLOAD_SECRET!

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const property = formData.get("property") as string
  const files = formData.getAll("files") as File[]

  if (!property || files.length === 0) {
    return NextResponse.json({ error: "Missing property or files" }, { status: 400 })
  }

  // Forward to VPS PHP upload endpoint
  const vpsForm = new FormData()
  vpsForm.append("property", property)
  for (const file of files) {
    vpsForm.append("files[]", file)
  }

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "X-Upload-Secret": UPLOAD_SECRET },
    body: vpsForm,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }))
    return NextResponse.json(err, { status: res.status })
  }

  const { urls } = await res.json()
  return NextResponse.json({ ok: true, urls })
}
```

**Step 2: Commit**

```bash
git add app/api/admin/upload/route.ts
git commit -m "feat: add photo upload API route forwarding to VPS"
```

---

### Task 9: Delete (Trash) API Route

**Files:**
- Create: `app/api/admin/delete/route.ts`

**Step 1: Create the soft-delete endpoint**

Uses MariaDB `trash_items` table instead of JSONBlob `_trash` key:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  const { property, src } = await request.json()

  if (!property || !src) {
    return NextResponse.json({ error: "Missing property or src" }, { status: 400 })
  }

  // Add to trash table
  await query(
    "INSERT INTO trash_items (property_slug, src) VALUES (?, ?)",
    [property, src]
  )

  return NextResponse.json({ ok: true })
}
```

Note: The admin photo manager component handles removing the image from the order list (via the photo-order API) in addition to calling this endpoint. The trash only records what was deleted.

**Step 2: Commit**

```bash
git add app/api/admin/delete/route.ts
git commit -m "feat: add soft-delete API route with MariaDB trash"
```

---

### Task 10: Restore, Purge, and List Trash API Routes

**Files:**
- Create: `app/api/admin/restore/route.ts`
- Create: `app/api/admin/purge/route.ts`
- Create: `app/api/admin/trash/route.ts`

**Step 1: Create restore endpoint**

`app/api/admin/restore/route.ts` — removes item from trash table:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  const { id } = await request.json()
  await query("DELETE FROM trash_items WHERE id = ?", [id])
  return NextResponse.json({ ok: true })
}
```

The admin UI is responsible for adding the image back to the property's order list.

**Step 2: Create purge endpoint**

`app/api/admin/purge/route.ts` — permanently deletes from trash (and optionally from VPS filesystem):

```typescript
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

interface TrashRow { id: number; src: string; property_slug: string }

export async function POST(request: NextRequest) {
  const { id, purgeExpired } = await request.json()

  if (purgeExpired) {
    // Auto-purge items older than 7 days
    const expired = await query<TrashRow[]>(
      "SELECT id, src, property_slug FROM trash_items WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
    )
    if (expired.length > 0) {
      await query(
        "DELETE FROM trash_items WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
      )
    }
    // Note: VPS files for expired items are orphaned but harmless.
    // A future cleanup cron could remove them.
    return NextResponse.json({ ok: true, purged: expired.length })
  }

  if (id) {
    await query("DELETE FROM trash_items WHERE id = ?", [id])
    return NextResponse.json({ ok: true, purged: 1 })
  }

  return NextResponse.json({ error: "Nothing to purge" }, { status: 400 })
}
```

**Step 3: Create list trash endpoint**

`app/api/admin/trash/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  const rows = await query<Array<{
    id: number
    property_slug: string
    src: string
    deleted_at: string
  }>>("SELECT id, property_slug, src, deleted_at FROM trash_items ORDER BY deleted_at DESC")

  return NextResponse.json({ trash: rows })
}
```

**Step 4: Commit**

```bash
git add app/api/admin/restore/route.ts app/api/admin/purge/route.ts app/api/admin/trash/route.ts
git commit -m "feat: add restore, purge, and list trash API routes with MariaDB"
```

---

### Task 11: Photo Manager Component (Admin)

**Files:**
- Create: `components/admin/photo-manager.tsx`

Same UI as original plan — property selector, drag-and-drop grid, position editing, lock/unlock, upload zone, delete button. Key differences from original:

- Upload calls `/api/admin/upload` (which forwards to VPS PHP)
- Delete calls `/api/admin/delete` + updates order via photo-order API
- Save order passes `version` for optimistic locking
- On 409 Conflict response, show toast: "Someone else updated — reload to see changes"
- Upload zone sends files to `/api/admin/upload` endpoint

Extract and adapt the photo management grid from `property-modal.tsx` (the existing reorder UI).

**Step 1: Create the component** — follow the structure from the original plan (lines 557-655), with the API changes noted above.

**Step 2: Commit**

```bash
git add components/admin/photo-manager.tsx
git commit -m "feat: add admin photo manager with upload, reorder, delete"
```

---

### Task 12: Admin Pages (Photos, Trash, Analytics)

**Files:**
- Create: `app/admin/(dashboard)/page.tsx`
- Create: `app/admin/(dashboard)/trash/page.tsx`
- Create: `app/admin/(dashboard)/analytics/page.tsx`
- Create: `components/admin/trash-grid.tsx`

Same as original plan Tasks 10-12. Photos page renders PhotoManager. Trash page renders TrashGrid (fetches from `/api/admin/trash`, actions call restore/purge). Analytics is a placeholder.

Key difference in TrashGrid: trash items now have an `id` field from MariaDB (instead of matching by src+property), making restore/purge operations more precise.

**Step 1: Create all pages and the trash grid component.**

**Step 2: Commit**

```bash
git add "app/admin/(dashboard)/page.tsx" "app/admin/(dashboard)/trash/page.tsx" "app/admin/(dashboard)/analytics/page.tsx" components/admin/trash-grid.tsx
git commit -m "feat: add admin photos, trash, and analytics pages"
```

---

### Task 13: Clean Up Public Photo Gallery

**Files:**
- Modify: `components/property-modal.tsx`

Same as original plan Task 13. Replace the admin-style photo grid overlay with a clean gallery viewer:
- Remove drag handles, position numbers, lock buttons, delete buttons, save button
- Add lightbox view (click photo to enlarge with prev/next navigation)
- Keep the ordered image list from PhotoOrderProvider

**Step 1: Replace the photo grid overlay** — follow original plan lines 1146-1210.

**Step 2: Commit**

```bash
git add components/property-modal.tsx
git commit -m "feat: replace admin photo grid with clean gallery viewer in property modal"
```

---

### Task 14: Mobile Responsive Admin Sidebar

**Files:**
- Modify: `components/admin/admin-sidebar.tsx`
- Modify: `app/admin/(dashboard)/layout.tsx`

Same as original plan Task 14. Make sidebar `hidden lg:flex` by default with a hamburger toggle on mobile. Layout uses `lg:ml-64`.

**Step 1: Add mobile toggle** — follow original plan Task 14.

**Step 2: Commit**

```bash
git add components/admin/admin-sidebar.tsx "app/admin/(dashboard)/layout.tsx"
git commit -m "feat: make admin sidebar responsive with mobile drawer"
```

---

### Task 15: URL Redirects for Old WordPress Routes

**Files:**
- Modify: `next.config.mjs`

Add redirects from old WordPress URL paths to new Next.js routes so bookmarks and Google results don't 404.

**Step 1: Add redirects to next.config.mjs**

```js
const nextConfig = {
  // ...existing config...
  async redirects() {
    return [
      { source: '/about-us', destination: '/', permanent: true },
      { source: '/smith-mountain-lake-reunion-homes', destination: '/', permanent: true },
      { source: '/smith-mountain-lake-reunion-homes/suite-retreat', destination: '/properties/suite-retreat', permanent: true },
      { source: '/suite-view', destination: '/properties/suite-view', permanent: true },
      { source: '/milan-manor-house', destination: '/properties/milan-manor', permanent: true },
      { source: '/rentals', destination: '/', permanent: true },
      { source: '/lake-view-condo', destination: '/properties/lake-view', permanent: true },
      { source: '/penthouse-view', destination: '/properties/penthouse-view', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      // Handle trailing slashes too
      { source: '/about-us/', destination: '/', permanent: true },
      { source: '/smith-mountain-lake-reunion-homes/', destination: '/', permanent: true },
      { source: '/smith-mountain-lake-reunion-homes/suite-retreat/', destination: '/properties/suite-retreat', permanent: true },
      { source: '/suite-view/', destination: '/properties/suite-view', permanent: true },
      { source: '/milan-manor-house/', destination: '/properties/milan-manor', permanent: true },
      { source: '/rentals/', destination: '/', permanent: true },
      { source: '/lake-view-condo/', destination: '/properties/lake-view', permanent: true },
      { source: '/penthouse-view/', destination: '/properties/penthouse-view', permanent: true },
      { source: '/contact-us/', destination: '/contact', permanent: true },
    ]
  },
}
```

**Step 2: Commit**

```bash
git add next.config.mjs
git commit -m "feat: add 301 redirects from old WordPress URLs"
```

---

### Task 16: Integration Testing & Polish

**Step 1: Run migrations**

After deploying to Vercel (or locally with env vars set):
```bash
curl -X POST https://your-vercel-url.vercel.app/api/admin/migrate
```
Then run the JSONBlob migration script locally:
```bash
MYSQL_HOST=209.142.66.121 MYSQL_PORT=3306 MYSQL_USER=wilsonprem_app MYSQL_PASSWORD=xxx MYSQL_DATABASE=wilsonprem_admin npx tsx scripts/migrate-jsonblob.ts
```

**Step 2: Test all flows**

1. `/admin` → redirects to `/admin/login`
2. Login with `Wilson` / `PropertyAdmin7283` → redirects to `/admin`
3. Select a property → photo grid loads with existing images
4. Drag and drop to reorder → saves to MariaDB
5. Open a second browser tab, make a conflicting edit → should show conflict warning
6. Upload a new photo → uploads to VPS, appears in grid
7. Delete a photo → moves to trash
8. Recently Deleted → shows trashed photo with restore/purge
9. Restore → photo returns to property
10. Analytics → shows placeholder
11. Public property modal → clean gallery only
12. Lightbox → click photo, prev/next work
13. Log out → redirects to login
14. Old WordPress URLs → 301 redirect to new routes

**Step 3: Fix any issues found and commit.**

---

## Architecture Summary

```
                         ┌─────────────────┐
                         │   Cloudflare DNS │
                         └───────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │             │
              wilson-premier.com │    media.wilson-premier.com
              (A → 76.76.21.21) │    (A → 209.142.66.121)
                    │            │             │
              ┌─────▼─────┐     │    ┌────────▼────────┐
              │   Vercel   │     │    │   VPS (sPanel)   │
              │            │     │    │                  │
              │ Next.js    │     │    │ ● MariaDB :3306  │
              │ App Router │◄────┼────│ ● PHP upload.php │
              │ API Routes │     │    │ ● nginx (media)  │
              │            │     │    │ ● Static files   │
              └────────────┘     │    └──────────────────┘
                                 │
                    booking.wilson-premier.com
                    (A → 104.155.59.202 / Hostaway)
```

### Cost

| Component | Monthly Cost |
|---|---|
| Vercel (free tier) | $0 |
| VPS (already paid by client) | $0 to you |
| Cloudflare DNS | $0 |
| MariaDB on VPS | $0 |
| Photo storage on VPS | $0 |
| **Total** | **$0** |

### Key Differences from Original Plan

| Feature | Original Plan | Revised Plan |
|---|---|---|
| Photo ordering storage | JSONBlob | MariaDB (VPS) |
| Photo upload storage | Cloudflare R2 | VPS filesystem via PHP |
| Trash manifest | JSONBlob `_trash` key | MariaDB `trash_items` table |
| Concurrency handling | None (race conditions possible) | Optimistic locking (`version` column) |
| Dependencies | `@aws-sdk/client-s3`, `jose` | `serverless-mysql`, `jose` |
| Billing required | R2 needs Cloudflare billing setup | None |
| Setup complexity | R2 bucket + API tokens + 6 env vars | MariaDB remote access + PHP script + 8 env vars |
| File storage reliability | R2 (enterprise-grade) | VPS filesystem (single server) |
