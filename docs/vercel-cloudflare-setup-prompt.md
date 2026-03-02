# Vercel + Cloudflare DNS Setup — AI Agent Prompt

> Copy everything below this line and paste it into the AI agent while on the relevant dashboard.

---

I need you to help me point the domain `wilson-premier.com` to my Vercel-hosted Next.js site. This involves two dashboards: **Vercel** and **Cloudflare**. I'll navigate to each one and you'll tell me exactly what to click and fill in. Guide me step by step — confirm each action before moving on.

## Context

- **Domain:** wilson-premier.com
- **Current state:** Domain points to an old WordPress site on a VPS (IP: 209.142.66.121). We are replacing it.
- **Goal:** Point the domain to Vercel where our new Next.js site is already deployed and working.
- **VPS IP:** 209.142.66.121 (the OLD server — we are moving AWAY from this for now)
- **Cloudflare nameservers:** aragorn.ns.cloudflare.com, cortney.ns.cloudflare.com

### CRITICAL — Records that MUST NOT be touched:
These handle email and other services. **Do NOT modify or delete any of these:**

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| MX | wilson-premier.com | `wilsonpremier-com01e.mail.protection.outlook.com` (priority 0) | Microsoft 365 email |
| TXT | wilson-premier.com | `v=spf1 include:spf.protection.outlook.com -all` | Email authentication |
| TXT | wilson-premier.com | `google-site-verification=xHoMr4GbzwWZPUXpmSLbA2rRuGkmoeUwt5L5WWtRYnY` | Google Search Console |
| TXT | _dmarc | `v=DMARC1; p=quarantine; rua=mailto:...@dmarc-reports.cloudflare.net` | DMARC email policy |
| TXT | default._domainkey | (long RSA key) | DKIM email signing |
| A | booking | `104.155.59.202` | Hostaway/Lodgify booking portal — separate service |

**If you see ANY of these records, leave them alone. Only modify the A record for the apex domain and the CNAME/A for www.**

---

## PART 1: Vercel Dashboard

Navigate to: **https://vercel.com/dashboard**

Log in if needed, then:

### Step 1: Find the project

- Look for the Wilson Premier project in the project list (it may be called `wilson-premier` or similar)
- Click on it to open the project dashboard

### Step 2: Add the domain

- Go to **Settings** (tab at the top of the project page)
- Click **Domains** in the left sidebar
- In the domain input field, type: `wilson-premier.com`
- Click **Add**
- Vercel will show configuration instructions — note what it says but don't worry about it yet

### Step 3: Add the www subdomain

- In the same Domains page, add: `www.wilson-premier.com`
- Click **Add**
- Vercel will likely recommend one of these setups:
  - **Option A:** `wilson-premier.com` as primary, `www` redirects to it
  - **Option B:** `www.wilson-premier.com` as primary, apex redirects to it
- **Choose Option A** (apex `wilson-premier.com` as primary, www redirects). This is the cleaner URL.

### Step 4: Note the required DNS records

Vercel will show what DNS records are needed. It should be something like:
- **A record** for `wilson-premier.com` → `76.76.21.21`
- **CNAME record** for `www` → `cname.vercel-dns.com`

The page will show "Invalid Configuration" with a yellow/red indicator. That's expected — we haven't updated DNS yet.

**Tell me exactly what DNS records Vercel is asking for before we proceed to Cloudflare.** Screenshot or type out the values shown.

---

## PART 2: Cloudflare Dashboard

Navigate to: **https://dash.cloudflare.com/**

Log in if needed. I should have member access to the wilson-premier.com zone.

### Step 5: Select the domain

- Find and click on **wilson-premier.com** in the site list
- You should see the Cloudflare dashboard for this zone

### Step 6: Go to DNS settings

- Click **DNS** in the left sidebar, then **Records**
- You should see a list of existing DNS records

### Step 7: Verify the critical records are present

Before changing anything, confirm these records exist (READ ONLY — do not modify):
- ✅ MX record pointing to `wilsonpremier-com01e.mail.protection.outlook.com`
- ✅ TXT record with SPF (`v=spf1 include:spf.protection.outlook.com`)
- ✅ TXT record with Google site verification
- ✅ A record for `booking` pointing to `104.155.59.202`

**Tell me what you see. List ALL existing DNS records before we change anything.**

### Step 8: Update the A record for the apex domain

Find the existing **A record** for `wilson-premier.com` (the apex/root domain). It currently points to a Cloudflare-proxied address or the VPS IP.

- Click **Edit** on this A record
- Change the **IPv4 address** to: `76.76.21.21` (Vercel's IP — or whatever Vercel showed in Step 4)
- **IMPORTANT: Toggle the proxy to "DNS only" (gray cloud icon)**
  - The orange cloud means Cloudflare is proxying traffic (we don't want this — it conflicts with Vercel's SSL)
  - The gray cloud means DNS only (Vercel handles everything)
- Click **Save**

### Step 9: Update or create the www record

Look for an existing record for `www`. It might be:
- A CNAME pointing to `wilson-premier.com`
- An A record pointing to the VPS IP

**If a www record exists:** Edit it:
- Change it to a **CNAME** record (if it isn't already)
- Name: `www`
- Target: `cname.vercel-dns.com` (or whatever Vercel showed in Step 4)
- **Proxy status: DNS only (gray cloud)**
- Click **Save**

**If no www record exists:** Create a new one:
- Click **Add record**
- Type: **CNAME**
- Name: `www`
- Target: `cname.vercel-dns.com`
- Proxy status: **DNS only (gray cloud)**
- Click **Save**

### Step 10: Verify — check for conflicting records

After saving, review the full DNS record list. Make sure there are NOT:
- ❌ Two A records for the apex domain (there should be exactly one, pointing to 76.76.21.21)
- ❌ Any AAAA records for the apex domain pointing to old IPs (delete these if present)
- ❌ Any other A/CNAME records for `www` besides the one you just set

**Do NOT delete:**
- Any MX records
- Any TXT records
- The `booking` A record
- Any `_dmarc` or `_domainkey` TXT records

### Step 11: SSL/TLS settings

While still in Cloudflare:
- Go to **SSL/TLS** in the left sidebar
- Check the encryption mode — since we set DNS only (gray cloud), Cloudflare isn't handling SSL. Vercel will provision its own certificate via Let's Encrypt.
- No changes needed here, but tell me what the current setting is (Off, Flexible, Full, or Full Strict).

---

## PART 3: Verify in Vercel

Navigate back to the Vercel project → **Settings → Domains**

### Step 12: Check domain status

- The status for `wilson-premier.com` should change from "Invalid Configuration" to a **green checkmark** within a few minutes
- The status for `www.wilson-premier.com` should also turn green
- If it still shows invalid, **wait 2-3 minutes and refresh** — DNS propagation takes a moment

### Step 13: Test the live site

Once both domains show green:
- Open a new browser tab
- Go to **https://wilson-premier.com**
- Verify the new Next.js site loads (not the old WordPress site)
- Go to **https://www.wilson-premier.com** — it should redirect to `https://wilson-premier.com`
- Check that HTTPS works (padlock icon in browser)

---

## TROUBLESHOOTING

### If Vercel still shows "Invalid Configuration" after 5 minutes:
- Go back to Cloudflare and double-check:
  - A record for apex = `76.76.21.21` with **gray cloud** (DNS only)
  - CNAME for www = `cname.vercel-dns.com` with **gray cloud** (DNS only)
- Make sure there are no duplicate A records for the apex domain
- Try: `dig wilson-premier.com A` in terminal to verify the record updated

### If the site loads but shows SSL errors:
- Make sure Cloudflare proxy is OFF (gray cloud, not orange cloud) for both records
- Wait 5-10 minutes for Vercel to provision the SSL certificate

### If the old WordPress site still shows:
- DNS propagation may take up to 48 hours in some cases (usually minutes)
- Try clearing your browser cache or opening in incognito
- Try: `curl -I https://wilson-premier.com` to check what server responds

### If email stops working:
- This should NOT happen if you only touched the A and www records
- Verify MX, TXT (SPF, DKIM, DMARC) records are still present in Cloudflare

---

## SUMMARY OF WHAT I NEED FROM YOU

After completing all steps, give me:

1. ✅ or ❌ for each step
2. **Screenshot or list** of the final Cloudflare DNS records
3. **Vercel domain status** — are both domains green?
4. **Live site test** — does https://wilson-premier.com load the new site?
5. **SSL status** — is the padlock showing in the browser?
6. Any errors or issues encountered

---

## WHAT THIS DOES

- `wilson-premier.com` → Vercel (new Next.js site)
- `www.wilson-premier.com` → redirects to `wilson-premier.com`
- `booking.wilson-premier.com` → unchanged (still Hostaway/Lodgify)
- Email (MX, SPF, DKIM, DMARC) → unchanged (still Microsoft 365)
- Google Search Console verification → unchanged

This is a **temporary setup** while we configure the VPS for permanent hosting. When the VPS is ready, we'll simply change the A record from Vercel's IP back to the VPS IP. One DNS change, zero downtime.
