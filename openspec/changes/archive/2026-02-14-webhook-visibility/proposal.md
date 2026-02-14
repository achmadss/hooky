## Why

Currently, webhooks created by authenticated users can only be viewed by the owner. There's no way to share webhook details (like the URL and request history) with others. This limits the usefulness of the webhook service for teams or public integrations.

## What Changes

- Add a `visibility` field to webhooks with values `public` or `private` (default: `private`)
- Allow webhook owners to set visibility when creating or editing a webhook
- Allow anyone to view webhook details if visibility is set to `public`
- Maintain 404 for private webhooks viewed by non-owners
- The webhook endpoint (`/api/wh/[token]`) remains accessible regardless of visibility - it's the detail page that's affected

## Capabilities

### New Capabilities
- `webhook-visibility`: Controls who can view webhook details (public or private)

### Modified Capabilities
- None - this is a new feature

## Impact

- **Database**: Add `visibility` column to webhooks table
- **API**: Add `visibility` to webhook creation/update payloads
- **UI**: Add visibility toggle in webhook creation/edit forms and detail page
- **Auth**: Update webhook detail page to allow access for public webhooks by anyone
