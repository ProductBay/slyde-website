# SLYDE Website Architecture Reference

SLYDE Website is a Next.js App Router application that combines:

- a public marketing and application site
- an admin control tower
- a Slyder activation and onboarding domain
- a dedicated employee portal
- internal API routes backing those flows

This document is a practical reference to the current architecture in this repository.

## Stack

- `Next.js 15` with App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `Zod` for schema validation
- Prisma-backed Postgres persistence for deployed environments
- file-backed persistence remains available for local development

## High-Level Domains

### 1. Public Website

Located mainly under [src/app](/c:/Users/ashan/SLYDE%20Website/src/app).

Purpose:
- brand and marketing pages
- business acquisition
- public contact flows
- Slyder application intake
- employee application intake

Examples:
- `/`
- `/about`
- `/coverage`
- `/for-businesses`
- `/contact`
- `/become-a-slyder`
- `/become-a-slyder/apply`
- `/careers/apply`

### 2. Admin Control Tower

Located under [src/app/admin](/c:/Users/ashan/SLYDE%20Website/src/app/admin).

Purpose:
- review Slyder applications
- manage coverage zones
- manage notifications
- manage legal documents
- inspect system health
- monitor readiness and launch state

Guarding:
- `platform_admin`
- `operations_admin`

Relevant files:
- [src/server/auth/guards.ts](/c:/Users/ashan/SLYDE%20Website/src/server/auth/guards.ts)
- [src/server/admin/admin-page.ts](/c:/Users/ashan/SLYDE%20Website/src/server/admin/admin-page.ts)

### 3. Slyder Domain

Located under [src/app/slyder](/c:/Users/ashan/SLYDE%20Website/src/app/slyder) and related API routes.

Purpose:
- activation
- login
- OTP verification
- onboarding
- readiness
- setup completion

Flow:
1. public application submitted
2. admin review
3. approval
4. account activation
5. login
6. onboarding
7. readiness and eligibility

Guarding:
- `slyder`

Relevant files:
- [src/modules/slyder-auth/services/slyder-auth.service.ts](/c:/Users/ashan/SLYDE%20Website/src/modules/slyder-auth/services/slyder-auth.service.ts)
- [src/server/auth/guards.ts](/c:/Users/ashan/SLYDE%20Website/src/server/auth/guards.ts)

### 4. Employee Portal

Located under [src/app/employee](/c:/Users/ashan/SLYDE%20Website/src/app/employee).

Purpose:
- employee login
- employee onboarding
- internal guides and handbook
- announcements and manager updates
- payroll and payout visibility
- employee profile access

Guarding:
- `employee_staff`
- `employee_logistics`
- `employee_supervisor`
- `employee_manager`
- `employee_hr`
- `employee_payroll`

Relevant files:
- [src/modules/employee/services/employee-auth.service.ts](/c:/Users/ashan/SLYDE%20Website/src/modules/employee/services/employee-auth.service.ts)
- [src/modules/employee/services/employee-portal.service.ts](/c:/Users/ashan/SLYDE%20Website/src/modules/employee/services/employee-portal.service.ts)
- [src/server/employee/context.ts](/c:/Users/ashan/SLYDE%20Website/src/server/employee/context.ts)

## Route Structure

### Public

- `/`
- `/about`
- `/coverage`
- `/faq`
- `/for-businesses`
- `/api-integrations`
- `/contact`
- `/become-a-slyder`
- `/become-a-slyder/apply`
- `/careers/apply`
- `/privacy`
- `/terms`
- `/legal/*`

### Admin

- `/admin`
- `/admin/slyder-applications`
- `/admin/slyders`
- `/admin/coverage-zones`
- `/admin/network-readiness`
- `/admin/notifications`
- `/admin/launch-control`
- `/admin/legal-documents`
- `/admin/legal-acceptances`
- `/admin/system-health`

### Slyder

- `/slyder/activate`
- `/slyder/login`
- `/slyder/onboarding`
- `/slyder/onboarding/legal`
- `/slyder/onboarding/setup`
- `/slyder/onboarding/readiness`
- `/slyder/onboarding/complete`

### Employee

- `/employee`
- `/employee/login`
- `/employee/onboarding`
- `/employee/portal`
- `/employee/portal/guides`
- `/employee/portal/guides/[slug]`
- `/employee/portal/announcements`
- `/employee/portal/pay`
- `/employee/portal/profile`

## Authentication Model

Shared session handling lives in:

- [src/server/auth/session.ts](/c:/Users/ashan/SLYDE%20Website/src/server/auth/session.ts)

Role guards live in:

- [src/server/auth/guards.ts](/c:/Users/ashan/SLYDE%20Website/src/server/auth/guards.ts)

Current role groups:

- admin roles
  - `platform_admin`
  - `operations_admin`
- Slyder role
  - `slyder`
- employee roles
  - `employee_staff`
  - `employee_logistics`
  - `employee_supervisor`
  - `employee_manager`
  - `employee_hr`
  - `employee_payroll`

## Persistence Model

The project supports both a file-backed store and a Prisma/Postgres-backed store.

Relevant files:
- [src/server/persistence/store.ts](/c:/Users/ashan/SLYDE%20Website/src/server/persistence/store.ts)
- [src/server/persistence/file-store-repository.ts](/c:/Users/ashan/SLYDE%20Website/src/server/persistence/file-store-repository.ts)
- [src/server/persistence/prisma-repository.ts](/c:/Users/ashan/SLYDE%20Website/src/server/persistence/prisma-repository.ts)

Default data file:
- `.data/slyde-onboarding-store.json`

Current state:
- local development can run with `PERSISTENCE_DRIVER=file`
- deployed environments are expected to run with `PERSISTENCE_DRIVER=prisma`
- Prisma schema is defined in [prisma/schema.prisma](/c:/Users/ashan/SLYDE%20Website/prisma/schema.prisma)
- runtime connectivity is validated through `/api/internal/health`

## Core Data Areas

Defined mainly in [src/types/backend/onboarding.ts](/c:/Users/ashan/SLYDE%20Website/src/types/backend/onboarding.ts).

Major entities include:
- users
- sessions
- Slyder applications
- Slyder profiles
- activation tokens
- OTP challenges
- notifications
- legal documents and acceptances
- coverage zones
- merchant interests
- employee applications
- employee profiles
- employee announcements
- employee guides
- employee payroll records
- employee payout records

## API Organization

Located under [src/app/api](/c:/Users/ashan/SLYDE%20Website/src/app/api).

Major groups:

- `api/public/*`
  - public forms and uploads
- `api/auth/slyder/*`
  - Slyder activation/login/OTP
- `api/slyder/*`
  - protected Slyder onboarding actions
- `api/auth/employee/*`
  - employee login/logout
- `api/employee/*`
  - protected employee actions
- `api/admin/*`
  - protected admin control tower actions

## SLYDE App Sync Operations

Website-side outbound sync is handled by:

- [src/modules/onboarding/services/slyde-app-sync.service.ts](/c:/Users/ashan/A%20Dash%20Software%20projects/SLYDE%20Website/src/modules/onboarding/services/slyde-app-sync.service.ts)
- [src/modules/onboarding/services/slyde-app-sync-queue.service.ts](/c:/Users/ashan/A%20Dash%20Software%20projects/SLYDE%20Website/src/modules/onboarding/services/slyde-app-sync-queue.service.ts)
- [src/app/api/internal/slyde-app-sync/process/route.ts](/c:/Users/ashan/A%20Dash%20Software%20projects/SLYDE%20Website/src/app/api/internal/slyde-app-sync/process/route.ts)

Required environment variables for deployed sync:

- `SLYDE_APP_SYNC_BASE_URL`: base URL of the SLYDE app receiving internal sync calls.
- `SLYDE_APP_SYNC_SECRET`: integration key sent as `x-slyde-integration-key`.
- `SLYDE_QUEUE_PROCESSOR_SECRET`: key accepted by the website queue processor route. `CRON_SECRET` is also accepted as a fallback.
- `SLYDE_WEBSITE_BASE_URL`: website origin, used to prevent accidental self-sync.

Local development can run without explicit sync variables. In production, sync is disabled unless the app URL and secret are explicitly set, the secret is not the development default, and the app URL does not point back to this website or localhost.

Queued sync types:

- public Slyder application submit sync
- admin approve/reject review decision sync
- Slyder lifecycle events: activation completed, legal accepted, setup updated, readiness updated, onboarding state changed, onboarding completed

Queue behavior:

- Durable queue file: `.data/slyde-app-sync-queue.json`, or `${SLYDE_DATA_DIRECTORY}/slyde-app-sync-queue.json`.
- Items move through `queued`, `processing`, `synced`, `retrying`, and `failed`.
- Retries use exponential/backoff scheduling with a max retry cap.
- `lastError`, `lastAttemptAt`, `nextAttemptAt`, `idempotencyKey`, and timestamps are retained for inspection.
- Failed items remain in the queue and are not dropped silently.

Processor trigger:

```bash
curl -X POST "$SLYDE_WEBSITE_BASE_URL/api/internal/slyde-app-sync/process" \
  -H "x-slyde-processor-key: $SLYDE_QUEUE_PROCESSOR_SECRET"
```

Run that endpoint from a scheduler every 1-5 minutes. Submit/review/onboarding flows also make a fire-and-forget processor call as a fast path, but the scheduled trigger is what guarantees retries continue autonomously.

Inspection:

- `/api/internal/health` reports sync readiness, queue counts by status/type, due item count, and the queue file path.
- Operators can inspect the queue file directly. Do not edit it while a processor run is active.

## UI Component Organization

Located under [src/components](/c:/Users/ashan/SLYDE%20Website/src/components).

Major areas:

- [src/components/site](/c:/Users/ashan/SLYDE%20Website/src/components/site)
  - public-site UI
- [src/components/admin](/c:/Users/ashan/SLYDE%20Website/src/components/admin)
  - admin shell and admin UI blocks
- [src/components/slyder](/c:/Users/ashan/SLYDE%20Website/src/components/slyder)
  - activation and onboarding UI
- [src/components/employee](/c:/Users/ashan/SLYDE%20Website/src/components/employee)
  - employee portal, handbook, guides, search, and shell
- [src/components/ui](/c:/Users/ashan/SLYDE%20Website/src/components/ui)
  - shared buttons and primitives

## Service Layer Organization

Business logic is mostly organized in:

- [src/modules/admin](/c:/Users/ashan/SLYDE%20Website/src/modules/admin)
- [src/modules/onboarding](/c:/Users/ashan/SLYDE%20Website/src/modules/onboarding)
- [src/modules/slyder-auth](/c:/Users/ashan/SLYDE%20Website/src/modules/slyder-auth)
- [src/modules/employee](/c:/Users/ashan/SLYDE%20Website/src/modules/employee)
- [src/modules/legal](/c:/Users/ashan/SLYDE%20Website/src/modules/legal)
- [src/modules/notifications](/c:/Users/ashan/SLYDE%20Website/src/modules/notifications)
- [src/modules/merchant](/c:/Users/ashan/SLYDE%20Website/src/modules/merchant)

General pattern:
- `schemas` validate payloads
- `services` implement business logic
- `repositories` abstract store access where needed

## Navigation and Layout

Root layout:
- [src/app/layout.tsx](/c:/Users/ashan/SLYDE%20Website/src/app/layout.tsx)

Chrome switching:
- [src/components/layout/app-chrome.tsx](/c:/Users/ashan/SLYDE%20Website/src/components/layout/app-chrome.tsx)

Current behavior:
- public pages use navbar + footer
- admin pages use admin shell
- Slyder flows use their own shell
- employee portal uses its own shell and internal footer

## Documentation Files

Existing internal docs live under [docs](/c:/Users/ashan/SLYDE%20Website/docs).

Examples:
- [docs/slyde-role-access-matrix.md](/c:/Users/ashan/SLYDE%20Website/docs/slyde-role-access-matrix.md)
- [docs/slyde-employee-operations-manual.md](/c:/Users/ashan/SLYDE%20Website/docs/slyde-employee-operations-manual.md)
- [docs/slyde-manual-master-export.md](/c:/Users/ashan/SLYDE%20Website/docs/slyde-manual-master-export.md)

## Local Development

Common commands:

```bash
npm run dev
npm run build
npm run lint
```

Useful notes:
- `.env` controls runtime behavior
- local development may use `PERSISTENCE_DRIVER=file` with a local `.data` store
- local development may also point `DATABASE_URL` at Postgres when testing Prisma-backed flows
- employee seed accounts are created in the store bootstrap logic
- admin fallback behavior exists for local admin access

## Production Deployment

Current production deployment expectations:

- host on `Vercel`
- use `Neon` for the production Postgres database
- set `PERSISTENCE_DRIVER=prisma`
- set `DATABASE_URL` to the Neon pooled connection string
- set `DATABASE_URL_UNPOOLED` to the Neon direct connection string

Core production environment variables:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `PERSISTENCE_DRIVER=prisma`
- `SLYDE_WEBSITE_BASE_URL=https://slydenetwork.com`
- `SLYDE_APP_SYNC_BASE_URL=https://slyde.app`
- `SLYDE_APP_SYNC_SECRET=<shared secret>`
- `RESEND_API_KEY=<resend api key>`
- `RESEND_FROM_EMAIL=SLYDE <no-reply@...>`

Database bootstrap:

```powershell
$env:DATABASE_URL="<production DATABASE_URL_UNPOOLED>"
cmd /c npx prisma db push
```

Health verification:

- open `/api/internal/health`
- confirm `overallStatus` is `healthy`
- confirm `persistence.status` is `healthy`
- confirm `productionLocked` is `true`

Turnstile note:

- if `PUBLIC_INTAKE_TURNSTILE_MODE=enforce`, both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` must be configured
- if Turnstile keys are not ready yet, use `PUBLIC_INTAKE_TURNSTILE_MODE=monitor`

Upload storage warning:

- uploads are currently written to runtime disk under `/tmp/slyde-data/uploads` in production
- this is ephemeral on Vercel and is not durable object storage
- move uploads to a durable provider such as Vercel Blob, S3, or Cloudinary before relying on production document storage

## Architectural Notes

- The public website, admin tower, Slyder flow, and employee portal are all part of one Next.js codebase
- Slyders and employees are now separate access domains
- Admin is separate from both
- The codebase already has a service-layer direction, but not every area is fully normalized yet
- Local file persistence remains useful for development, while production is expected to use Prisma with Postgres

## Recommended Next Architecture Improvements

- complete Prisma repository implementation
- add dedicated employee admin/provisioning UI
- add employee application review tooling
- add richer shared document and handbook infrastructure
- add route-level architecture diagrams to `docs/`
- formalize a root `src/types` split between public, admin, Slyder, and employee domains
