## Context

Currently the project uses Prisma 7.4.0 with PostgreSQL. Prisma 7 introduced breaking changes that require complex configuration:
- Datasource URLs must be in `prisma.config.ts` instead of schema.prisma
- Complex client initialization with adapters required
- Build failures in Docker due to Prisma configuration issues
- Prisma generates large binaries that slow down Docker builds

The application uses:
- PostgreSQL database
- 4 models: User, Webhook, Request, ResponseConfig
- Soft delete pattern with `deletedAt` timestamp on all models

## Goals / Non-Goals

**Goals:**
- Replace Prisma with Drizzle ORM
- Maintain all existing functionality
- Keep soft delete behavior
- Simplify Docker build process
- Fix Prisma 7 configuration issues

**Non-Goals:**
- Change database (still PostgreSQL)
- Change data model structure
- Add new features
- Migrate existing data (schema stays compatible)

## Decisions

### Decision 1: Use Drizzle instead of Prisma

**Rationale:** Drizzle provides simpler configuration with just a schema file, better Docker compatibility, lighter footprint, and more control over SQL queries. Drizzle doesn't require a generation step - it works directly with the schema definition.

**Alternatives considered:**
- Stay with Prisma and downgrade to version 6: Would work but locks to older version
- Use raw SQL with pg: Loses ORM benefits

### Decision 2: Implement soft delete in application layer

**Rationale:** Instead of Prisma middleware, implement soft delete as:
- Helper functions that add `deletedAt: null` to WHERE clauses
- A `softDelete` function that updates `deletedAt` timestamp instead of deleting

**Alternatives considered:**
- Database triggers: More complex, less portable
- Separate deleted tables: More migration work

### Decision 3: Use `pg` driver directly

**Rationale:** Simple, well-maintained, works with Drizzle. No need for serverless drivers since this is a traditional server deployment.

**Alternatives considered:**
- @neondatabase/serverless: For serverless deployments
- @vercel/postgres: For Vercel deployment

## Risks / Trade-offs

- **Risk**: Query syntax changes across 12+ files → Mitigation: Create helper functions to match Prisma-like API
- **Risk**: Type safety without Prisma's generated types → Mitigation: Drizzle provides type inference from schema
- **Risk**: Migration testing → Mitigation: Test thoroughly in development first

## Migration Plan

1. Install Drizzle dependencies
2. Create Drizzle schema (lib/db/schema.ts)
3. Set up Drizzle connection (lib/db/index.ts)
4. Create soft delete helpers (lib/db/soft-delete.ts)
5. Update lib/auth.ts
6. Update lib/api-auth.ts
7. Update lib/cleanup.ts
8. Update all 8 API route files
9. Remove Prisma from package.json
10. Delete prisma/ directory
11. Update Dockerfile
12. Test in Docker

## Open Questions

- Should we keep Prisma's `include` pattern or use Drizzle's joins? → Use Drizzle's joins for better type safety
