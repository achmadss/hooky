## 1. Database Schema

- [x] 1.1 Add `visibility` column to webhooks table in `lib/db/schema.ts`
- [x] 1.2 Generate Drizzle migration for the new column

## 2. Update API Routes

- [x] 2.1 Update `POST /api/webhooks` to accept `visibility` field
- [x] 2.2 Update `PATCH /api/webhooks/[id]` to accept `visibility` field
- [x] 2.3 Update webhook responses to include `visibility` field

## 3. Update Webhook Detail Page Access Logic

- [x] 3.1 Update `app/webhooks/[id]/page.tsx` to check visibility
- [x] 3.2 Allow access if `webhook.visibility === 'public'`
- [x] 3.3 Return 404 for private webhooks viewed by non-owners

## 4. Update UI Components

- [x] 4.1 Add visibility toggle to webhook creation form
- [x] 4.2 Add visibility toggle to webhook edit modal
- [x] 4.3 Display visibility badge on webhook detail page

## 5. Test and Verify

- [x] 5.1 Test public webhook access as anonymous
- [x] 5.2 Test public webhook access as non-owner authenticated
- [x] 5.3 Test private webhook access as non-owner (should 404)
- [x] 5.4 Test webhook endpoint still works regardless of visibility
- [x] 5.5 Run build and verify no errors
