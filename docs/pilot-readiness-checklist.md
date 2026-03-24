# SLYDE Pilot Readiness Checklist

## Decision Gate

Use this checklist before collecting real Slyder data in a pilot.

Go live for a controlled pilot only when every `Required` item is complete.

## Required Before Pilot

### Data Storage

- [ ] Public Slyder applications are stored in PostgreSQL, not only in `.data` JSON files.
- [ ] Document records are stored with real `storageKey` and `fileUrl` values.
- [ ] Database backups are configured and tested.
- [ ] Access to production applicant data is limited to authorized admin users.

### Document Uploads

- [ ] The public form uploads actual files, not metadata-only placeholders.
- [ ] Upload validation enforces size and content-type limits.
- [ ] Uploaded files are stored under non-guessable paths.
- [ ] Applicant documents are not publicly accessible without authorization.
- [ ] Admin users can review uploaded documents safely.

### Intake Reliability

- [ ] The website can save an application even if the separate SLYDE app sync is unavailable.
- [ ] Application submission is idempotent enough to prevent accidental duplicate records.
- [ ] Submission failures are logged with actionable error context.

### Notifications

- [ ] Email delivery is configured with a real provider.
- [ ] WhatsApp or SMS delivery is configured with a real provider.
- [ ] Notification failures are visible to operations.
- [ ] Applicant confirmation does not rely on stub providers.

### Security

- [ ] Public intake routes are protected with rate limiting.
- [ ] Public intake routes have bot protection such as Turnstile or reCAPTCHA.
- [ ] Production admin access does not rely on dev fallback keys.
- [ ] Sensitive environment variables are set only in secure runtime config.

### Legal And Compliance

- [ ] Active applicant privacy and onboarding terms are published.
- [ ] Legal acceptance evidence is recorded with timestamp and version.
- [ ] Data retention rules are defined for rejected and inactive applicants.
- [ ] A process exists for applicant data deletion/export requests.

### Operations

- [ ] Admin review flow is tested end to end with pilot data.
- [ ] Approval, rejection, and document request actions are tested.
- [ ] Activation invite flow is tested with a real delivery provider.
- [ ] Monitoring is in place for form submissions, uploads, notification failures, and server errors.

## Recommended Before Public Launch

- [ ] Complete migration of applications, documents, users, profiles, and legal acceptances to Postgres.
- [ ] Move notification and audit data off the JSON store.
- [ ] Add virus scanning or document risk checks for uploaded files.
- [ ] Add signed/private document access instead of route-based file serving.
- [ ] Add operator dashboards for pilot conversion funnel and document review load.

## Current Status After This Change

- [x] Real multipart document upload path exists.
- [x] Public application intake can write application, vehicle, and document rows into Postgres when `PERSISTENCE_DRIVER=prisma`.
- [x] Legacy file-store mirror remains in place for existing notification, legal, and admin flows.
- [ ] Public intake is resilient if SLYDE app sync is down.
- [ ] Live notification providers are mandatory in production.
- [ ] Rate limiting and bot protection are still missing.
