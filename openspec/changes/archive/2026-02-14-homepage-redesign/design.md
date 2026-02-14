## Context

Currently, the app has no landing page. Visiting `/` triggers:
1. Redirect to `/api/init`
2. Creates a new webhook with session ID
3. Redirects to `/webhooks/[id]` showing the webhook detail
4. If user logs in, they're prompted to "claim" the webhook

This is confusing for new users who want to understand what the app does first.

## Goals / Non-Goals

**Goals:**
- Show landing page at `/` with app description
- Allow guests to try the app via "Try Now" button
- Allow authenticated users to access dashboard
- Remove claim prompt after login

**Non-Goals:**
- Complete app redesign - only homepage changes
- Add user registration flow (already exists)
- Add pricing/marketing pages

## Decisions

### 1. Homepage Design

**Option A**: Create entirely new homepage component
- Pros: Full control, can be as simple or fancy as needed
- Cons: More code to maintain

**Option B**: Use redirect to webhook detail but add "Back to Home" link
- Cons: Doesn't solve the core problem, just adds escape hatch

**Chosen**: Option A - New homepage component

### 2. "Try Now" Button Behavior

- Check if user already has a session with webhook via `/api/init` response
- If webhook exists → redirect to `/webhooks/[existing-id]`
- If no webhook → create new one, redirect to new webhook detail

### 3. `/api/init` Endpoint

- Keep it working for "Try Now" button
- Modify to not redirect - just return webhook data
- OR create new endpoint `/api/webhooks/ensure` that returns webhook without redirect

## Risks / Trade-offs

- [Risk] Existing users with sessions might be confused → Mitigation: "Try Now" uses existing webhook if session exists
- [Risk] Breaking changes for users who bookmarked webhook URLs → Mitigation: Webhook URLs still work, only `/` behavior changes

## Migration Plan

1. Create new Homepage component with hero and CTA buttons
2. Update `app/page.tsx` to render Homepage (authenticated: show Dashboard link, guest: show Try Now)
3. Modify `/api/init` to return JSON instead of redirect (or create new endpoint)
4. Update `proxy.ts` to allow `/` without session cookie
5. Test: Guest → Try Now → sees webhook
6. Test: Authenticated → Dashboard → sees webhooks
