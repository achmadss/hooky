## Why

Currently, unauthenticated users visiting `/` are immediately redirected to a random webhook detail page and prompted to claim it when they log in. This is a poor user experience - users should see the app's landing page first to understand what the app does before being thrown into the webhook detail view.

## What Changes

- Create a new homepage (`/`) with app description, hero section, and call-to-action buttons
- Remove automatic redirect from `/` to `/api/init` (which creates and redirects to webhook)
- "Try Now" button for guests → redirects to their assigned webhook (creates one if doesn't exist)
- "Dashboard" button for authenticated users → redirects to `/dashboard`
- Create separate `/dashboard` route for authenticated users
- Update claim modal redirect targets to `/dashboard`
- Change "Keep Anonymous" button text to "Skip"
- Add logo to navbar

## Capabilities

### New Capabilities
- `homepage`: Landing page showcasing the app with call-to-action buttons

### Modified Capabilities
- `webhook-management`: Remove automatic webhook creation on first visit
- `authentication`: Remove claim prompt after login (webhook already belongs to user if created during session)

## Impact

- **Routes**: `/` changes from redirect logic to homepage component, `/dashboard` for authenticated users
- **API**: `/api/init` updated to return JSON for "Try Now" functionality
- **Components**: New Homepage component with hero, description, CTA buttons; Logo added to navbar
- **Auth flow**: Claim modal buttons redirect to `/dashboard`, "Keep Anonymous" changed to "Skip"
