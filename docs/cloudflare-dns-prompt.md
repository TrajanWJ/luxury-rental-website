# Cloudflare DNS Update — Claude Browser Extension Prompt

> Copy everything below this line and paste it into Claude while on the Cloudflare dashboard.

---

I need to update DNS records for wilson-premier.com to point to my VPS server. Guide me step by step.

## What to do

Go to **DNS → Records** for the wilson-premier.com zone.

### Update the A record for the apex domain

Find the existing **A record** for `wilson-premier.com` (the root/apex domain).

- Click **Edit**
- Set IPv4 address to: `209.142.66.121`
- Set proxy status to: **Proxied (orange cloud)** — we want Cloudflare's CDN and SSL in front of the VPS
- Click **Save**

### Update the www record

Find the existing record for `www` (CNAME or A record).

- Click **Edit** (or create new if it doesn't exist)
- Type: **CNAME**
- Name: `www`
- Target: `wilson-premier.com`
- Proxy status: **Proxied (orange cloud)**
- Click **Save**

### SSL/TLS setting

Go to **SSL/TLS** in the left sidebar:

- Set encryption mode to **Full** (not "Full Strict", not "Flexible")
- "Full" means Cloudflare connects to the VPS over HTTPS and accepts the server's self-signed certificate

### DO NOT TOUCH these records — they handle email and booking:

- Any **MX** records (Microsoft 365 email)
- Any **TXT** records (SPF, DKIM, DMARC, Google verification)
- The **A record** for `booking` (points to 104.155.59.202 — Hostaway booking system)
- Any `_dmarc` or `_domainkey` records

Only modify the apex A record and the www record. Nothing else.

### Verify

After saving, the DNS records should look like:

- `wilson-premier.com` → A → `209.142.66.121` → Proxied (orange)
- `www` → CNAME → `wilson-premier.com` → Proxied (orange)
- `booking` → A → `104.155.59.202` → (unchanged)
- MX, TXT records → (all unchanged)

Tell me when both records are saved and what the SSL/TLS mode is set to.
