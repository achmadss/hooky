## 1. Setup Drizzle

- [x] 1.1 Install Drizzle dependencies (drizzle-orm, pg, drizzle-kit)
- [x] 1.2 Create lib/db/schema.ts with all 4 table definitions
- [x] 1.3 Create lib/db/index.ts with Drizzle client setup

## 2. Implement Soft Delete Helpers

- [x] 2.1 Create lib/db/soft-delete.ts with softDelete function
- [x] 2.2 Create whereNotDeleted helper to add deletedAt: null to queries

## 3. Update Authentication Layer

- [x] 3.1 Update lib/auth.ts to use Drizzle queries
- [x] 3.2 Update lib/api-auth.ts to use Drizzle queries

## 4. Update Cleanup Job

- [x] 4.1 Update lib/cleanup.ts to use Drizzle queries

## 5. Update API Routes

- [x] 5.1 Update app/api/webhooks/route.ts
- [x] 5.2 Update app/api/webhooks/[id]/route.ts
- [x] 5.3 Update app/api/webhooks/[id]/response/route.ts
- [x] 5.4 Update app/api/webhooks/claim/route.ts
- [x] 5.5 Update app/api/webhooks/unclaimed/route.ts
- [x] 5.6 Update app/api/wh/[token]/route.ts
- [x] 5.7 Update app/api/auth/register/route.ts
- [x] 5.8 Update app/api/init/route.ts

## 6. Remove Prisma

- [x] 6.1 Remove Prisma from package.json dependencies
- [x] 6.2 Delete prisma/ directory
- [x] 6.3 Delete lib/db.ts

## 7. Update Docker and Test

- [x] 7.1 Update Dockerfile to remove prisma generate
- [x] 7.2 Test build with bun run build
- [x] 7.3 Test Docker image locally
