# Persistence Scaffolding

Current default driver: `file`

Environment variables:

- `PERSISTENCE_DRIVER=file|prisma`
- `DATABASE_URL=postgresql://...`

Current status:

- `file` driver is fully backed by [`store.ts`](/c:/Users/ashan/SLYDE%20Website/src/server/persistence/store.ts)
- `prisma` driver is intentionally scaffold-only and throws until the relational repository methods are implemented

Recommended next cutover sequence:

1. move one service module at a time from `store.ts` imports to `@/server/persistence`
2. implement Prisma-backed reads/writes for applications and users first
3. add migration/import scripts for `.data/slyde-onboarding-store.json`
