# Booking Flow Fix — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the complete Hostaway booking flow so dates selected in the calendar iframe reach the checkout URL, and fix all supporting UX bugs.

**Architecture:** The iframe (`hostaway-embed.html`) posts dates to the parent via `postMessage`. The parent needs a listener that writes to `window.bookingContext`, which the React hook polls. The checkout URL in `AdvancedBookingPopup` reads from that context. Currently the listener chain is broken at two points: (1) `hostaway-debug.js` isn't loaded, and (2) `hostaway-calendar.tsx` only handles `dates-cleared`, not `dates-updated`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Hostaway Calendar Widget (CDN), iframe postMessage API

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `components/hostaway-calendar.tsx` | Modify | Add `hostaway-dates-updated` message handler + date parsing |
| `app/layout.tsx` | Modify | Load `hostaway-debug.js` as backup sync layer |
| `components/advanced-booking-popup.tsx` | Modify | Pass dates to "Booking Page" URL, bump z-index, sync searchParams to context |
| `components/property-modal.tsx` | Modify | Pass dates to "Booking Page" URL |
| `hooks/use-booking-context.ts` | Modify | Add initialization of `window.bookingContext` on mount |
| `app/book/page.tsx` | Delete | Remove fake payment page |
| `components/booking-popup.tsx` | Delete | Remove dead legacy component |

---

## Chunk 1: Core Date Sync Chain

### Task 1: Add `hostaway-dates-updated` handler to `hostaway-calendar.tsx`

This is the PRIMARY fix. The iframe posts dates but nobody receives them.

**Files:**
- Modify: `components/hostaway-calendar.tsx:66-79`

- [ ] **Step 1: Add date parsing helper and `dates-updated` handler**

In `components/hostaway-calendar.tsx`, replace the existing `useEffect` message handler (lines 66-79) with one that handles both message types:

```typescript
// State Sync Listener
useEffect(() => {
    const parseHostawayDate = (dateStr: string): string | null => {
        if (!dateStr) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        const monthMap: Record<string, number> = {
            jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
            jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
        };
        const match = dateStr.match(/([A-Za-z]{3,})\s+(\d+)(?:,?\s+(\d{4}))?/);
        if (!match) return null;
        const m = monthMap[match[1].toLowerCase().substring(0, 3)];
        if (!m) return null;
        const d = match[2];
        const y = match[3] || new Date().getFullYear();
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'hostaway-dates-updated') {
            const startDate = parseHostawayDate(event.data.checkIn);
            const endDate = parseHostawayDate(event.data.checkOut);
            if (typeof window !== 'undefined') {
                const newState = {
                    startDate: startDate || (window as any).bookingContext?.startDate || null,
                    endDate: endDate || (window as any).bookingContext?.endDate || null,
                };
                (window as any).bookingContext = newState;
                localStorage.setItem('bookingContext', JSON.stringify(newState));
                window.dispatchEvent(new CustomEvent('bookingContextUpdated', { detail: newState }));
            }
        }
        if (event.data?.type === 'hostaway-dates-cleared') {
            if (typeof window !== 'undefined') {
                const emptyState = { startDate: null, endDate: null };
                (window as any).bookingContext = emptyState;
                localStorage.setItem('bookingContext', JSON.stringify(emptyState));
                window.dispatchEvent(new CustomEvent('bookingContextUpdated', { detail: emptyState }));
            }
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
}, []);
```

- [ ] **Step 2: Verify the dev server compiles without errors**

Run: `curl -s http://localhost:3000 > /dev/null && echo "OK"`

- [ ] **Step 3: Manual test — open booking popup, select dates in calendar, check browser console for `bookingContextUpdated` events**

Open DevTools console, run: `window.addEventListener('bookingContextUpdated', e => console.log('CTX:', e.detail))`
Then select dates in the Hostaway calendar. Should see `CTX: {startDate: "2026-...", endDate: "2026-..."}`.

- [ ] **Step 4: Commit**

```bash
git add components/hostaway-calendar.tsx
git commit -m "fix: add hostaway-dates-updated handler to complete iframe-to-parent date sync"
```

---

### Task 2: Initialize `window.bookingContext` on hook mount

Without initialization, the hook returns `{startDate: null, endDate: null}` from undefined.

**Files:**
- Modify: `hooks/use-booking-context.ts:16-20`

- [ ] **Step 1: Add initialization at the top of the useEffect**

Replace lines 16-20 with:

```typescript
useEffect(() => {
    // Initialize window.bookingContext if it doesn't exist
    if (typeof window !== 'undefined' && !(window as any).bookingContext) {
        (window as any).bookingContext = JSON.parse(
            localStorage.getItem('bookingContext') || '{"startDate":null,"endDate":null}'
        );
    }

    // Initial load
    if (typeof window !== 'undefined' && (window as any).bookingContext) {
        setContext((window as any).bookingContext)
    }
```

- [ ] **Step 2: Commit**

```bash
git add hooks/use-booking-context.ts
git commit -m "fix: initialize window.bookingContext from localStorage on hook mount"
```

---

### Task 3: Load `hostaway-debug.js` as backup sync layer

This provides the global B2 Assassin, dev popup, and redundant date extraction.

**Files:**
- Modify: `app/layout.tsx:72`

- [ ] **Step 1: Replace the comment with a Script tag**

Replace line 72:
```typescript
{/* Debug script removed for production */}
```
with:
```typescript
<Script src="/hostaway-debug.js" strategy="afterInteractive" />
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "fix: load hostaway-debug.js for global booking state sync and B2 Assassin"
```

---

## Chunk 2: URL Construction Fixes

### Task 4: Pass dates and guests to "Booking Page" button in popup

**Files:**
- Modify: `components/advanced-booking-popup.tsx:269-279`

- [ ] **Step 1: Update the "Booking Page" button onClick**

Replace lines 269-279:

```typescript
<div className="hidden md:flex absolute bottom-20 left-8 right-8 z-30 gap-3">
    <Button
        onClick={(e) => {
            e.stopPropagation();
            let url = `https://wilson-premier.holidayfuture.com/listings/${selectedProperty.hostawayId}`;
            if (globalContext.startDate && globalContext.endDate) {
                url += `?start=${globalContext.startDate}&end=${globalContext.endDate}&numberOfGuests=${guestCount}`;
            }
            window.open(url, '_blank');
        }}
        className="flex-1 bg-[#463930]/90 hover:bg-[#463930] text-white shadow-lg backdrop-blur-md font-semibold border border-white/20"
    >
        Booking Page
    </Button>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add components/advanced-booking-popup.tsx
git commit -m "fix: pass dates and guest count to Booking Page URL"
```

---

### Task 5: Pass dates to "Booking Page" button in property modal

**Files:**
- Modify: `components/property-modal.tsx:296-298`

- [ ] **Step 1: Update the property modal's "Booking Page" onClick**

The current code (lines 296-298):
```typescript
onClick={() => {
    if (property.hostawayId) {
        window.open(`https://wilson-premier.holidayfuture.com/listings/${property.hostawayId}`, '_blank')
    }
}}
```

Replace with:
```typescript
onClick={() => {
    if (property.hostawayId) {
        const ctx = typeof window !== 'undefined' ? (window as any).bookingContext : null;
        let url = `https://wilson-premier.holidayfuture.com/listings/${property.hostawayId}`;
        if (ctx?.startDate && ctx?.endDate) {
            url += `?start=${ctx.startDate}&end=${ctx.endDate}`;
        }
        window.open(url, '_blank');
    }
}}
```

- [ ] **Step 2: Commit**

```bash
git add components/property-modal.tsx
git commit -m "fix: pass booking context dates to property modal Booking Page URL"
```

---

## Chunk 3: UX Bug Fixes

### Task 6: Bump popup z-index above navigation

**Files:**
- Modify: `components/advanced-booking-popup.tsx:136`

- [ ] **Step 1: Change z-50 to z-[60] on the popup root**

Replace line 136:
```typescript
<div data-popup-root className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
```
with:
```typescript
<div data-popup-root className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
```

- [ ] **Step 2: Commit**

```bash
git add components/advanced-booking-popup.tsx
git commit -m "fix: bump booking popup z-index above navigation"
```

---

### Task 7: Sync searchParams dates to global context when popup opens

When `open-booking-with-context` fires with dates, they need to reach `window.bookingContext`.

**Files:**
- Modify: `components/advanced-booking-popup.tsx:101-106`

- [ ] **Step 1: Replace the empty comment block with actual sync logic**

Replace lines 101-106:
```typescript
// Parse dates and update global context if they came from search params
if (searchParams.checkIn) {
    // If we have search params but global context is empty, or they differ,
    // we should update the global context. For now, we assume search params
    // were already piped into the context by the trigger.
}
```
with:
```typescript
// Sync search params dates to global context
if (searchParams.checkIn && searchParams.checkOut) {
    const newState = {
        startDate: searchParams.checkIn,
        endDate: searchParams.checkOut,
    };
    if (typeof window !== 'undefined') {
        (window as any).bookingContext = newState;
        localStorage.setItem('bookingContext', JSON.stringify(newState));
        window.dispatchEvent(new CustomEvent('bookingContextUpdated', { detail: newState }));
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add components/advanced-booking-popup.tsx
git commit -m "fix: sync searchParams dates to global booking context on popup open"
```

---

### Task 8: Make HostawayCalendar responsive on mobile

**Files:**
- Modify: `components/hostaway-calendar.tsx:90,97`

- [ ] **Step 1: Change fixed width to responsive**

Replace line 90 (loading state container):
```typescript
<div className="w-[360px] h-[420px] bg-white flex items-center justify-center rounded-2xl shadow-xl">
```
with:
```typescript
<div className="w-full max-w-[360px] h-[420px] bg-white flex items-center justify-center rounded-2xl shadow-xl">
```

Replace line 97 (iframe container):
```typescript
<div className="w-[360px] relative h-[420px] bg-white rounded-2xl overflow-hidden">
```
with:
```typescript
<div className="w-full max-w-[360px] relative h-[420px] bg-white rounded-2xl overflow-hidden">
```

- [ ] **Step 2: Commit**

```bash
git add components/hostaway-calendar.tsx
git commit -m "fix: make HostawayCalendar responsive on mobile screens"
```

---

## Chunk 4: Dead Code Removal

### Task 9: Delete fake `/book` page

This page collects credit card numbers and shows a fake booking confirmation. Actual bookings happen via Hostaway external checkout.

**Files:**
- Delete: `app/book/page.tsx`

- [ ] **Step 1: Verify no active links point to `/book`**

Search for references:
```bash
grep -r '"/book"' components/ app/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v '.next' | grep -v deploy/
```

Expected: No results (or only the page itself and possibly router.push in book/page.tsx).

- [ ] **Step 2: Delete the file**

```bash
rm app/book/page.tsx
```

- [ ] **Step 3: Commit**

```bash
git add -A app/book/
git commit -m "chore: remove fake /book page that collected credit cards without processing"
```

---

### Task 10: Delete dead legacy `booking-popup.tsx`

**Files:**
- Delete: `components/booking-popup.tsx`

- [ ] **Step 1: Verify no imports**

```bash
grep -r 'booking-popup' components/ app/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v '.next' | grep -v deploy/
```

Expected: Only the file itself.

- [ ] **Step 2: Delete the file**

```bash
rm components/booking-popup.tsx
```

- [ ] **Step 3: Commit**

```bash
git add -A components/booking-popup.tsx
git commit -m "chore: remove unused legacy booking-popup component"
```

---

## Chunk 5: Verification

### Task 11: End-to-end verification

- [ ] **Step 1: Start dev server and open browser**

Navigate to `http://localhost:3000`

- [ ] **Step 2: Test hero widget flow**

1. Select a property in the hero widget dropdown
2. Click the dates popover — Hostaway calendar should load
3. Select check-in and check-out dates
4. Click the search button
5. Booking popup should open with:
   - Correct property pre-selected
   - Dates visible in the calendar
   - "Book Now" button enabled

- [ ] **Step 3: Test "Book Now" URL**

1. In popup, click "Book Now"
2. New tab should open to: `https://wilson-premier.holidayfuture.com/checkout/{hostawayId}?start=YYYY-MM-DD&end=YYYY-MM-DD&numberOfGuests=N`
3. Verify dates match what was selected

- [ ] **Step 4: Test "Booking Page" URL**

1. In popup, click "Booking Page" (left panel button)
2. New tab should open to: `https://wilson-premier.holidayfuture.com/listings/{hostawayId}?start=...&end=...&numberOfGuests=...`

- [ ] **Step 5: Test property switch**

1. In popup, click a different property in the right panel list
2. Calendar should reload for new property
3. Previous dates may persist (expected — Hostaway shows availability for new property)

- [ ] **Step 6: Test property modal "Book This Home"**

1. Click a property card on homepage
2. In property modal, click "Book This Home"
3. Booking popup should open with that property pre-selected

- [ ] **Step 7: Test mobile responsiveness**

1. Open DevTools, toggle device toolbar (mobile view)
2. Calendar should not overflow the popup
3. Popup should be scrollable

- [ ] **Step 8: Test `/book` page is gone**

Navigate to `http://localhost:3000/book` — should show 404.

- [ ] **Step 9: Verify build succeeds**

```bash
npm run build
```

---

## Bug Triage Reference

| Bug ID | Task | Status |
|--------|------|--------|
| C1: hostaway-debug.js not loaded | Task 3 | |
| C2: Missing dates-updated handler | Task 1 | |
| C3: Dates never reach checkout URL | Task 1 + Task 2 (fixes upstream) | |
| C4: Booking Page button no dates | Task 4 + Task 5 | |
| C5: Fake /book page | Task 9 | |
| H1: Stale dates on property switch | Accepted behavior (Hostaway shows availability) | |
| H2: searchParams dates not synced | Task 7 | |
| H3: Z-index conflict | Task 6 | |
| M1: Calendar overflow mobile | Task 8 | |
| M5: Lake View missing hostawayId | FALSE POSITIVE — Lake View has hostawayId "466645" | |
| L1: Dead booking-popup.tsx | Task 10 | |
