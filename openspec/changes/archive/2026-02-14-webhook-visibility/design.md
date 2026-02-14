## Context

Currently, webhooks can only be viewed by their owner. There's no way to share webhook details with others. This change adds a visibility setting so owners can choose to make webhooks public.

## Goals / Non-Goals

**Goals:**
- Allow webhook owners to set visibility as `public` or `private`
- Public webhooks can be viewed by anyone (anonymous or authenticated)
- Private webhooks can only be viewed by the owner
- The webhook endpoint itself remains accessible regardless of visibility

**Non-Goals:**
- Team-based access (multiple users per webhook) - not in scope
- Per-request visibility settings - not in scope

## Decisions

### 1. Database Schema

Add `visibility` column to `webhooks` table:
- Type: `varchar(20)` with values `'public'` or `'private'`
- Default: `'private'`
- Not nullable

Migration: Add column via Drizzle migration

### 2. API Changes

**Create webhook** (`POST /api/webhooks`):
- Add optional `visibility` field (default: `'private'`)

**Update webhook** (`PATCH /api/webhooks/[id]`):
- Add optional `visibility` field

**Get webhook** (`GET /api/webhooks/[id]`):
- Return `visibility` field in response

### 3. Access Control Logic

In webhook detail page (`/webhooks/[id]`):
```
canView = 
  isOwner ||
  isAnonymousOwner ||
  (webhook.visibility === 'public')
```

- If `canView` is false, return `notFound()` (404)

### 4. UI Components

**Webhook creation form**:
- Add visibility toggle (radio or select: Public/Private)
- Default to Private

**Webhook edit modal**:
- Add visibility toggle
- Show current visibility setting

**Webhook detail page**:
- Show visibility badge (Public/Private) next to name
- Show edit button if owner

## Migration Plan

1. Add `visibility` column to database (non-breaking, nullable then not null)
2. Default all existing webhooks to `private` (preserve current behavior)
3. Update API routes to accept/return visibility
4. Update UI components
5. Update webhook detail page access logic

## Risks / Trade-offs

- [Risk] Users might accidentally make sensitive webhooks public → Mitigation: Default is private, make it clear in UI
- [Risk] Backward compatibility → Mitigation: Default visibility to private preserves existing behavior
