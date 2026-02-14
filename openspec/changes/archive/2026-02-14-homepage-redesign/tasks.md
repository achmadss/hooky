## 1. Create Homepage Component

- [x] 1.1 Create `components/Homepage.tsx` with hero section, app description
- [x] 1.2 Add "Try Now" button for unauthenticated users
- [x] 1.3 Add "Dashboard" button for authenticated users
- [x] 1.4 Add Login/Signup buttons for unauthenticated users

## 2. Update Root Page

- [x] 2.1 Update `app/page.tsx` to render Homepage component
- [x] 2.2 Remove automatic redirect logic from `/`
- [x] 2.3 Authenticated users should see Dashboard link, not redirected to webhook

## 3. Update API Init Endpoint

- [x] 3.1 Modify `/api/init` to return JSON instead of redirect (or create new endpoint)
- [x] 3.2 Ensure it returns webhook data for "Try Now" functionality

## 4. Update Proxy/Middleware

- [x] 4.1 Allow `/` without session cookie
- [x] 4.2 Ensure unauthenticated users can access homepage

## 5. Test and Verify

- [x] 5.1 Test: Guest visits `/` → sees homepage
- [x] 5.2 Test: Guest clicks "Try Now" → redirected to webhook
- [x] 5.3 Test: Authenticated user visits `/` → sees homepage with Dashboard button
- [x] 5.4 Test: Authenticated clicks Dashboard → sees webhooks
- [x] 5.5 Test: Existing authenticated user no longer prompted to claim webhook
- [x] 5.6 Test: Run build and verify no errors

## 6. Create Dashboard Route

- [x] 6.1 Create `app/dashboard/page.tsx` for authenticated users

## 7. Update Redirects

- [x] 7.1 Update DashboardClient.tsx to redirect to /dashboard
- [x] 7.2 Update WebhookClaimPrompt.tsx redirect to /dashboard
- [x] 7.3 Update WebhookDetailActions.tsx redirect to /dashboard

## 8. UI Updates

- [x] 8.1 Change "Keep Anonymous" to "Skip" in claim modal
- [x] 8.2 Add logo to GlobalNavbar.tsx

## 9. Test and Verify

- [x] 9.1 Test all redirects work correctly
- [x] 9.2 Run build and verify
