# Proposal: Migrate from Prisma to Drizzle ORM

## Why

Prisma 7 introduced breaking changes that require complex configuration:
- Datasource URLs must be in `prisma.config.ts` instead of schema.prisma
- Complex client initialization with adapters
- Build failures in Docker due to Prisma configuration issues

Drizzle ORM provides:
- Simpler configuration - just a schema file
- Better Docker compatibility
- Lighter footprint
- More control over SQL queries

## What Changes

1. Replace Prisma with Drizzle ORM
2. Create Drizzle schema matching existing models
3. Implement soft delete logic in application code
4. Update all database queries across the codebase

## Capabilities

### New Capabilities
- **Drizzle Integration**: Set up Drizzle with PostgreSQL driver

### Modified Capabilities
- **Database Layer**: Replace Prisma queries with Drizzle queries

## Impact

- `lib/db.ts`: Complete replacement
- `prisma/`: Can be deleted after migration
- API routes: Update query syntax
- `Dockerfile`: Simplify build process
