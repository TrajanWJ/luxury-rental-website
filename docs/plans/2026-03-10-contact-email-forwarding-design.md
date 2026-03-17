# Contact Form Email Forwarding — Design

**Date:** 2026-03-10
**Status:** Approved

## Overview

Wire up contact form submissions to send emails via Resend. Different forwarding destinations for STR vs Real Estate inquiries, configurable in the admin dashboard.

## Architecture

Add Resend to the existing `/api/inquiries` route. When a form is submitted, it saves to the DB (existing behavior) AND sends an email via Resend to the configured recipient(s).

## Email Config in SiteConfig

New `emailConfig` field on `SiteConfig`:

```typescript
emailConfig: {
  strRecipients: string[]        // default: ["leslie@wilson-premier.com"]
  realEstateRecipients: string[] // default: ["craig.r.wilson.jr@gmail.com"]
}
```

## Email Details

- **From:** `onboarding@resend.dev` (upgrade to custom domain later with DNS access)
- **Reply-to:** Submitter's email address
- **Subject:** `New STR Inquiry from [Name]` or `New Real Estate Inquiry from [Name]`
- **Body:** Plain text — name, email, phone, message, area of interest or property name
- **Source mapping:**
  - `"modal"` + `"contact-page"` → STR recipients
  - `"real-estate-modal"` + `"real-estate-contact"` → Real Estate recipients
- **`email_status`:** Updated to `"sent"` or `"failed"` (currently always `"skipped"`)
- **RESEND_API_KEY** in `.env.local`

## Admin UI

New "Email Settings" section in Site Management page:
- STR forwarding email(s) input
- Real Estate forwarding email(s) input
- Uses existing config save flow + activity log

## Failure Handling

If Resend fails, inquiry is still saved. `email_status` set to `"failed"`. No retry — admin can see failed emails in Inquiries dashboard.

## Dependencies

- `resend` npm package
- `RESEND_API_KEY` environment variable
