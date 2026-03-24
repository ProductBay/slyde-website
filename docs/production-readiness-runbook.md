# Production Readiness Runbook

This runbook covers the minimum operating baseline for running the SLYDE website in production.

## 1. Hosting and Environment Lock

Required production settings:

- `NODE_ENV=production`
- `PERSISTENCE_DRIVER=prisma`
- `DATABASE_URL` pointed at the production Postgres instance
- `SLYDE_WEBSITE_BASE_URL` pointed at the real public website domain
- `SLYDE_APP_SYNC_BASE_URL` pointed at the real SLYDE app backend domain
- `SLYDE_APP_SYNC_SECRET` shared with the SLYDE app internal sync endpoints

Do not go live with:

- `localhost` or `127.0.0.1` base URLs
- `PERSISTENCE_DRIVER=file`
- missing Resend credentials

Check production lock in:

- `/api/internal/health`
- admin `System Health`

## 2. Public Abuse Protection

Public intake routes are rate-limited and support Cloudflare Turnstile.

Environment:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `PUBLIC_INTAKE_TURNSTILE_MODE=monitor|enforce|off`
- `PUBLIC_RATE_LIMIT_WINDOW_MS`
- `PUBLIC_RATE_LIMIT_MAX_REQUESTS`

Recommended rollout:

1. Start with `monitor`
2. Confirm Turnstile tokens are reaching the server
3. Switch to `enforce` before broad public launch

Protected routes:

- `/api/public/slyder-applications`
- `/api/public/uploads/slyder-documents`
- `/api/public/contact`
- `/api/public/business-inquiries`
- `/api/public/merchant-interest`
- `/api/public/api-access-requests`

## 3. Notification Verification

Minimum production requirement:

- Resend configured and verified

Recommended:

- Twilio WhatsApp configured

Verification commands:

```powershell
cmd /c npm run verify:notifications
```

Operational checks:

- approve a test Slyder
- confirm activation email is received
- confirm resend actions work from admin
- confirm OTP fallback behavior is correct
- confirm approval/document-review notifications render valid links

## 4. Backups

Local backup snapshot command:

```powershell
cmd /c npm run backup:data
```

This snapshots `.data` into `backups/`.

Production recommendation:

- schedule daily off-box Postgres backups
- schedule daily object/file storage backups if uploads remain disk-backed
- keep at least 7 daily restore points
- test one restore before public launch

## 5. Monitoring Basics

Minimum monitoring baseline:

- watch `/api/internal/health`
- review admin `System Health`
- review admin notification health/logs
- monitor failed public intake submissions
- monitor app-sync failures to the SLYDE app

Minimum alert conditions:

- persistence unhealthy
- storage unhealthy
- email provider not configured
- Turnstile disabled or unconfigured
- sync queue failures rising

## 6. Smoke E2E Pass

Smoke command:

```powershell
cmd /c npm run e2e:smoke
```

Default target:

- `E2E_BASE_URL=http://127.0.0.1:3002`

The smoke script verifies:

- homepage reachable
- coverage page reachable
- apply page reachable
- internal health route reachable
- public contact endpoint responds with an expected status

## 7. Go-Live Checklist

- production hosting lock passes in admin `System Health`
- Postgres is live and healthy
- Resend is live and verified
- Turnstile is set to `enforce`
- rate limits are configured
- backup job is scheduled
- smoke E2E passes against production-like hosting
- test Slyder apply -> approve -> activate -> login -> onboarding flow passes cleanly
