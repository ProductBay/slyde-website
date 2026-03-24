# SLYDE Postgres Schema And Migration Plan

## Recommendation

Use PostgreSQL with Prisma.

This codebase is relational:

- one `user` may map to one `slyder_profile`
- one `application` may create one `user` and one `slyder_profile`
- one `application` has many `documents`
- one `application` has zero or one `vehicle`
- one `legal_document` has many `legal_acceptances` and many `legal_publish_history` records
- one `notification_template` has many `notifications`

The current JSON store in [`src/server/persistence/store.ts`](/c:/Users/ashan/SLYDE%20Website/src/server/persistence/store.ts) should become a proper relational store with JSONB only where the payload is truly flexible.

## Modeling Rules

- Keep all primary keys as UUIDs.
- Keep timestamps as `timestamptz`.
- Use enums for finite state machines already defined in [`src/types/backend/onboarding.ts`](/c:/Users/ashan/SLYDE%20Website/src/types/backend/onboarding.ts).
- Use `jsonb` only for flexible payloads such as notification payloads, arbitrary metadata, and dynamic form answers.
- Use array columns only for small bounded lists that are not first-class entities yet, such as `preferred_zones`, `delivery_type_preferences`, and `actor_scopes`.
- Add unique constraints where the current code assumes uniqueness.

## Table Design

### `users`

Purpose: system and slyder identities.

Important constraints:

- unique `email`
- unique `phone`
- optional `password_hash`
- `roles` as enum array

### `slyder_applications`

Purpose: public intake record from the multi-step application form.

Important constraints:

- unique `application_code`
- optional `linked_user_id`
- optional `linked_slyder_profile_id`
- keep application workflow fields on this table because they are queried together in admin review

### `slyder_application_vehicles`

Purpose: one optional vehicle record per application.

Important constraints:

- unique `application_id`

### `slyder_application_documents`

Purpose: uploaded or metadata-only application documents.

Important constraints:

- index `(application_id, type)`
- index `(verification_status, type)`

### `slyder_profiles`

Purpose: approved courier operational profile.

Important constraints:

- unique `user_id`
- unique `application_id`
- optional `coverage_zone_id`

Note:

The current nested `readinessChecklist` should not stay nested. It is fixed-shape operational state and belongs as columns on `slyder_profiles`.

### `status_history`

Purpose: audit log for application, user, and slyder profile lifecycle changes.

Important constraints:

- index `(entity_type, entity_id, created_at desc)`

### `activation_tokens`

Purpose: invitation and activation tokens.

Important constraints:

- unique `token_hash`
- index `(user_id, created_at desc)`

### `otp_challenges`

Purpose: login verification codes.

Important constraints:

- index `(user_id, created_at desc)`
- optional future cleanup job by `expires_at`

### `sessions`

Purpose: current auth sessions.

Important constraints:

- index `(user_id, expires_at)`

### `notification_templates`

Purpose: versioned communication templates.

Important constraints:

- unique `(key, version, channel)`
- index `(actor_type, event_type, channel, is_active)`

### `notification_trigger_events`

Purpose: event queue/audit for notification fan-out.

Important constraints:

- unique `event_key`
- index `(status, created_at)`

### `notifications`

Purpose: sent or queued notification records.

Important constraints:

- optional `template_id`
- optional `trigger_event_id`
- optional self-reference `resent_from_id`
- index `(actor_type, actor_id, created_at desc)`
- index `(application_id, created_at desc)`
- index `(slyder_profile_id, created_at desc)`
- unique nullable `dedupe_key` if you want idempotent sends

### `coverage_zones`

Purpose: operational launch regions.

Important constraints:

- unique `(name, parish)`

### `merchant_interests`

Purpose: public business interest and onboarding waitlist.

Important constraints:

- optional `zone_id`
- optional `linked_merchant_user_id`
- index `(lifecycle_status, created_at desc)`

### `legal_documents`

Purpose: versioned legal sources of truth.

Important constraints:

- unique `(document_type, version)`
- unique `slug`
- partial uniqueness logic for active document per type should be enforced in application logic or a database partial index

### `legal_acceptances`

Purpose: immutable acceptance evidence.

Important constraints:

- index `(actor_type, actor_id, accepted_at desc)`
- index `(document_id, accepted_at desc)`
- optional unique guard on `(actor_type, actor_id, document_id, document_version)` if duplicate same-version accepts should be prevented

### `legal_document_publish_history`

Purpose: audit trail of legal document lifecycle operations.

Important constraints:

- index `(legal_document_id, created_at desc)`

## JSON To Relational Mapping

### Fields that should stay JSONB

- `slyder_applications.readiness_answers`
- `slyder_applications.agreements_accepted`
- `status_history.metadata`
- `notifications.variables_snapshot`
- `notifications.metadata`
- `notifications.payload`
- `notification_trigger_events.payload`
- `legal_acceptances.metadata`

### Fields that should become columns

- all `readinessChecklist.*` fields on `slyder_profiles`
- `linkedUserId` and `linkedSlyderProfileId` on `slyder_applications`
- notification foreign-key-like fields now stored as loose strings

## Prisma Schema Draft

The concrete schema draft is in [`prisma/schema.prisma`](/c:/Users/ashan/SLYDE%20Website/prisma/schema.prisma).

## Migration Plan

### Phase 1: Prepare The Repo

1. Add Prisma and Postgres connection wiring.
2. Add `DATABASE_URL` to env files.
3. Keep the current JSON store as the source of truth during initial setup.
4. Generate the initial migration from the Prisma schema.

### Phase 2: Add A Repository Boundary

1. Introduce a persistence interface that mirrors current store operations:
   - `findUserById`
   - `findUserByEmailOrPhone`
   - `findProfileByUserId`
   - `attachApplication`
   - `upsertUser`
   - `upsertSlyderProfile`
   - notification and legal document operations
2. Keep JSON-backed implementation as `FileStoreRepository`.
3. Add `PrismaRepository`.
4. Switch service modules to consume the repository instead of importing `readStore` and `withStoreTransaction` directly.

This is the important architectural step. Do this before data migration.

### Phase 3: Export Existing JSON Data

1. Read `.data/slyde-onboarding-store.json`.
2. Validate every record against the existing TypeScript types.
3. Preflight checks:
   - all IDs are valid UUIDs
   - all foreign keys point to existing parents
   - all `linkedUserId`, `linkedSlyderProfileId`, `reviewedBy`, `approvedBy`, `createdBy`, `updatedBy`, `actedBy`, `triggeredByUserId` references either resolve or are recorded as null-remediation items
   - emails and phones that should be unique are normalized and deduplicated
4. Produce a migration report before inserting anything.

### Phase 4: Load Reference And Parent Tables First

Insert in this order:

1. `users`
2. `coverage_zones`
3. `notification_templates`
4. `legal_documents`
5. `slyder_applications`
6. `merchant_interests`

### Phase 5: Load Child Tables

Insert in this order:

1. `slyder_application_vehicles`
2. `slyder_application_documents`
3. `slyder_profiles`
4. `status_history`
5. `activation_tokens`
6. `otp_challenges`
7. `sessions`
8. `notification_trigger_events`
9. `notifications`
10. `legal_acceptances`
11. `legal_document_publish_history`

### Phase 6: Verification

Run row-count and integrity checks:

- JSON `users.length` equals SQL `users.count`
- JSON `applications.length` equals SQL `slyder_applications.count`
- JSON `vehicles.length` equals SQL `slyder_application_vehicles.count`
- JSON `documents.length` equals SQL `slyder_application_documents.count`
- JSON `slyderProfiles.length` equals SQL `slyder_profiles.count`
- JSON `notifications.length` equals SQL `notifications.count`
- JSON `legalDocuments.length` equals SQL `legal_documents.count`
- JSON `legalAcceptances.length` equals SQL `legal_acceptances.count`

Then verify spot checks:

- one approved application with linked user and profile
- one active legal document per document type
- one notification resend chain
- one slyder onboarding flow from activation to setup/readiness

### Phase 7: Dual Write

For a short transition period:

1. Write to Postgres first.
2. Mirror writes to JSON.
3. Read from Postgres in non-critical admin screens first.
4. Then move public forms and auth flows.

Do not dual-write indefinitely. It increases failure modes.

### Phase 8: Cutover

1. Switch all reads to Postgres.
2. Disable JSON writes.
3. Keep the JSON export as a backup snapshot.
4. Remove `store.ts` transaction usage after one stable release window.

## Suggested Implementation Order In Code

1. Auth and user/session tables
2. Applications, vehicles, documents
3. Slyder profiles and readiness
4. Legal documents and acceptances
5. Merchant interests
6. Notifications
7. Admin dashboards and reporting queries

## Risks To Handle Explicitly

- `users.email` and `users.phone` uniqueness may fail if historical JSON data was stored with inconsistent formatting.
- `linkedUserId` and `linkedSlyderProfileId` may reference missing rows if any manual edits happened in JSON.
- `reviewedBy`, `approvedBy`, `createdBy`, and similar actor fields are currently free-form strings in some places and may need nullable foreign keys plus snapshot labels.
- `readinessChecklist` timestamps may not deserve separate persisted columns if the team does not use them operationally.
- `legal_documents.is_active` should be protected so only one active document per `document_type` exists at a time.

## Recommended First Cut

For the first production database rollout, I would keep these as JSONB to reduce migration friction:

- `readiness_answers`
- `agreements_accepted`
- notification payload and metadata blobs
- legal acceptance metadata

I would not keep `readinessChecklist` as JSONB. That one is operational state and should be queryable by column.
