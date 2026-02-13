# Capability: Request Inspector UI

## Overview

Request Inspector UI provides a web interface for viewing and analyzing captured webhook requests. Anonymous users are auto-redirected to a webhook detail page on homepage visit with request inspection functionality only. Authenticated users see the full management dashboard with webhook list, creation, and management features.

## ADDED Requirements

### Requirement: Homepage behavior (Authenticated vs Anonymous)
The system SHALL provide different homepage experiences based on authentication status.

#### Scenario: Authenticated user views homepage dashboard
- **WHEN** authenticated user navigates to the home page `/`
- **THEN** system displays webhook management dashboard
- **AND** dashboard shows list of all owned webhooks
- **AND** each webhook shows: name, token, creation date, request count, status
- **AND** "Create Webhook" button is visible

#### Scenario: Empty webhook list for authenticated user
- **WHEN** authenticated user navigates to home page and no webhooks exist
- **THEN** system displays empty state message with CTA to create webhook
- **AND** shows "Create Webhook" button prominently

#### Scenario: Anonymous user visits homepage
- **WHEN** anonymous user navigates to the home page `/`
- **THEN** system auto-creates new webhook with random token
- **AND** redirects to `/webhooks/{webhookId}`
- **AND** user does not see management dashboard

#### Scenario: Anonymous user with existing webhook visits homepage
- **WHEN** anonymous user with existing webhook navigates to `/`
- **THEN** system redirects to existing webhook detail page
- **AND** does not create new webhook

### Requirement: Create webhook form (Authenticated Only)
The system SHALL provide a form for authenticated users to create new webhooks.

#### Scenario: Authenticated user creates webhook with auto-generated token
- **WHEN** authenticated user clicks "Create Webhook" button on dashboard
- **AND** enters webhook name "My Webhook"
- **AND** leaves custom token field empty
- **AND** submits the form
- **THEN** system creates webhook with auto-generated token
- **AND** redirects to webhook detail page

#### Scenario: Authenticated user creates webhook with custom token
- **WHEN** authenticated user clicks "Create Webhook" button
- **AND** enters webhook name "My Webhook"
- **AND** enters custom token "my-awesome-webhook"
- **AND** submits the form
- **THEN** system creates webhook with token "my-awesome-webhook"
- **AND** redirects to webhook detail page

#### Scenario: Custom token preview
- **WHEN** user types in custom token field "My Awesome Webhook"
- **THEN** system shows live preview of sanitized token: "my-awesome-webhook"

#### Scenario: Duplicate token error
- **WHEN** user attempts to create webhook with token that already exists
- **THEN** system displays error message "Token already in use"

#### Scenario: Anonymous user cannot see create webhook button
- **WHEN** anonymous user views webhook detail page
- **THEN** system does not display "Create Webhook" button
- **AND** user can only view their single auto-created webhook

### Requirement: Webhook detail page
The system SHALL display a detailed view for each webhook.

#### Scenario: View webhook details
- **WHEN** user navigates to `/webhooks/{id}`
- **THEN** system displays:
  - Webhook name and token
  - Full webhook URL (e.g., `http://localhost:3000/api/wh/{token}`)
  - Request count
  - Creation date
  - Copy URL button

#### Scenario: Non-existent webhook
- **WHEN** user navigates to `/webhooks/{id}` for non-existent webhook
- **THEN** system displays 404 page with link to home

### Requirement: Request list panel
The system SHALL display a list of captured requests for the webhook.

#### Scenario: Display request list
- **WHEN** user views webhook detail page
- **THEN** system displays list of requests sorted by timestamp (newest first)
- **AND** each request shows: method, timestamp, and truncated preview

#### Scenario: Empty request list
- **WHEN** webhook has no captured requests
- **THEN** system displays empty state with instructions on how to send test requests

#### Scenario: Real-time request updates
- **WHEN** new request arrives for the webhook
- **THEN** system adds the request to the top of the list without page refresh

#### Scenario: Request selection
- **WHEN** user clicks on a request in the list
- **THEN** system displays request details in the detail panel
- **AND** highlights the selected request

### Requirement: Request detail panel
The system SHALL display detailed information about a selected request.

#### Scenario: Display request overview
- **WHEN** user selects a request
- **THEN** system displays:
  - HTTP method with color coding (GET=blue, POST=green, etc.)
  - Full timestamp
  - Source IP address
  - User agent

### Requirement: Pretty formatted payload viewer
The system SHALL display request body with syntax highlighting and formatting.

#### Scenario: View formatted JSON
- **WHEN** request body is valid JSON
- **THEN** system displays formatted JSON with syntax highlighting
- **AND** provides expand/collapse functionality for nested objects

#### Scenario: View formatted XML
- **WHEN** request body is valid XML
- **THEN** system displays formatted XML with syntax highlighting
- **AND** provides collapsible tree view

#### Scenario: View plain text
- **WHEN** request body is plain text
- **THEN** system displays text with monospace font
- **AND** preserves whitespace and line breaks

#### Scenario: Empty body
- **WHEN** request has no body
- **THEN** system displays "No body" message

### Requirement: Raw request viewer
The system SHALL provide a raw request view showing the complete HTTP request.

#### Scenario: View raw request
- **WHEN** user clicks "Raw" tab
- **THEN** system displays raw HTTP request including:
  - Request line (METHOD /path?query HTTP/1.1)
  - All headers
  - Body (if present)

#### Scenario: Copy raw request
- **WHEN** user clicks "Copy" button in raw view
- **THEN** system copies the complete raw request to clipboard

### Requirement: Headers explorer
The system SHALL display request headers in an explorable format.

#### Scenario: View headers table
- **WHEN** user views request details
- **THEN** system displays headers in a table with columns: Name, Value
- **AND** headers are sorted alphabetically by name

#### Scenario: Search headers
- **WHEN** user types in header search box "content"
- **THEN** system filters headers to show only those matching the search term

#### Scenario: Copy header value
- **WHEN** user clicks copy icon next to a header value
- **THEN** system copies that header value to clipboard

### Requirement: Query parameters explorer
The system SHALL display query parameters in an explorable format.

#### Scenario: View query parameters
- **WHEN** request has query parameters
- **THEN** system displays parameters in a table with columns: Key, Value

#### Scenario: Empty query parameters
- **WHEN** request has no query parameters
- **THEN** system displays "No query parameters" message

### Requirement: Response configuration panel (Authenticated Only)
The system SHALL provide UI for authenticated users to configure webhook responses.

#### Scenario: Authenticated user opens response config
- **WHEN** authenticated user clicks "Response Configuration" tab
- **AND** user owns the webhook
- **THEN** system displays form with:
  - Status code input (number)
  - Headers editor (key-value pairs)
  - Body textarea

#### Scenario: Save response config
- **WHEN** authenticated user updates response configuration
- **AND** user owns the webhook
- **AND** clicks "Save" button
- **THEN** system saves the configuration
- **AND** displays success message

#### Scenario: Reset to defaults
- **WHEN** authenticated user clicks "Reset to Defaults" button
- **AND** user owns the webhook
- **THEN** system clears custom configuration
- **AND** reverts to default 200 OK response

#### Scenario: Anonymous user cannot configure response
- **WHEN** anonymous user views webhook detail page
- **THEN** system does not display "Response Configuration" tab
- **AND** system shows read-only response info with default 200 OK
- **AND** anonymous users cannot modify webhook response configuration

### Requirement: Copy webhook URL
The system SHALL provide easy copying of the webhook URL.

#### Scenario: Copy URL button
- **WHEN** user clicks "Copy URL" button
- **THEN** system copies the full webhook URL to clipboard
- **AND** shows brief "Copied!" confirmation

#### Scenario: URL display
- **WHEN** user views webhook detail page
- **THEN** system prominently displays the full webhook URL in a copyable format

### Requirement: Delete webhook (Authenticated Only)
The system SHALL provide UI for authenticated users to delete webhooks they own.

#### Scenario: Authenticated user deletes webhook with confirmation
- **WHEN** authenticated user clicks "Delete Webhook" button on owned webhook
- **THEN** system shows confirmation dialog "Are you sure? This will delete all captured requests."
- **AND** upon confirmation, deletes the webhook
- **AND** redirects to home page

#### Scenario: Cancel delete
- **WHEN** user clicks "Delete Webhook" button
- **AND** clicks "Cancel" in confirmation dialog
- **THEN** system closes dialog without deleting

#### Scenario: Anonymous user cannot see delete button
- **WHEN** anonymous user views webhook detail page
- **THEN** system does not display "Delete Webhook" button
- **AND** anonymous users cannot delete webhooks

### Requirement: Webhook enable/disable UI (Authenticated Only)
The system SHALL provide UI for authenticated users to enable and disable webhooks they own.

#### Scenario: Display webhook status (for all users)
- **WHEN** user views webhook detail page
- **THEN** system displays current webhook status (Enabled/Disabled)
- **AND** shows visual indicator (green for enabled, gray for disabled)

#### Scenario: Authenticated user disables webhook
- **WHEN** authenticated user toggles webhook status to "Disabled"
- **AND** user owns the webhook
- **THEN** system sends PATCH request to update isEnabled to false
- **AND** displays confirmation "Webhook disabled"
- **AND** UI updates to show disabled state

#### Scenario: Authenticated user enables webhook
- **WHEN** authenticated user toggles webhook status to "Enabled"
- **AND** user owns the webhook
- **THEN** system sends PATCH request to update isEnabled to true
- **AND** displays confirmation "Webhook enabled"
- **AND** UI updates to show enabled state

#### Scenario: Disabled webhook warning
- **WHEN** user views disabled webhook
- **THEN** system displays warning banner "This webhook is disabled. Requests will return 404."

#### Scenario: Anonymous user cannot toggle webhook status
- **WHEN** anonymous user views webhook detail page
- **THEN** system displays current status as read-only
- **AND** does not provide toggle or enable/disable controls
- **AND** webhook remains enabled (anonymous webhooks are always enabled)

### Requirement: Anonymous mode indicator
The system SHALL display a persistent indicator when user is in anonymous mode.

#### Scenario: Anonymous mode banner
- **WHEN** user is not authenticated
- **THEN** system displays persistent banner at top of page
- **AND** banner shows "Anonymous Mode - Requests auto-deleted after 7 days"
- **AND** banner includes "Sign Up" and "Log In" buttons

#### Scenario: Anonymous mode dismissible banner
- **WHEN** user views anonymous mode banner
- **THEN** user can dismiss banner with X button
- **AND** banner remains dismissed for session duration

#### Scenario: Authenticated mode indicator
- **WHEN** user is authenticated
- **THEN** system displays user email or name in header
- **AND** shows "Log Out" button instead of Sign Up/Log In

### Requirement: Authentication UI
The system SHALL provide UI for user authentication (registration and login).

#### Scenario: Display auth buttons in header
- **WHEN** user views any page
- **THEN** system displays "Sign Up" and "Log In" buttons in header (if anonymous)
- **OR** displays user info and "Log Out" button (if authenticated)

#### Scenario: Registration modal
- **WHEN** user clicks "Sign Up" button
- **THEN** system displays registration modal with:
  - Email input field
  - Password input field
  - Confirm password input field
  - Submit button
  - Link to switch to login

#### Scenario: Login modal
- **WHEN** user clicks "Log In" button
- **THEN** system displays login modal with:
  - Email input field
  - Password input field
  - Submit button
  - Link to switch to registration

#### Scenario: Registration validation errors
- **WHEN** user submits registration with invalid data
- **THEN** system displays validation errors inline
- **AND** highlights fields with errors

#### Scenario: Authentication error handling
- **WHEN** authentication fails (wrong password, etc.)
- **THEN** system displays error message in modal
- **AND** keeps modal open for retry

### Requirement: Webhook claiming prompt
The system SHALL prompt users to claim their auto-created anonymous webhook after logging in.

#### Scenario: Display claim prompt on login
- **WHEN** user logs in from webhook detail page
- **AND** webhook has matching anonymous session with null ownerId
- **THEN** system displays claim prompt modal/dialog
- **AND** prompt shows the auto-created webhook token/name

#### Scenario: Claim prompt content
- **WHEN** claim prompt is displayed
- **THEN** system explains: "You have a webhook created anonymously. Add it to your account for persistent storage?"
- **AND** explains benefits: "Your webhook requests will no longer be auto-deleted after 7 days, and you'll be able to create and manage multiple webhooks."

#### Scenario: Accept webhook claiming
- **WHEN** user clicks "Add to My Account" button
- **THEN** system sends request to claim webhook
- **AND** displays success message "Webhook added to your account"
- **AND** closes prompt
- **AND** redirects to homepage dashboard

#### Scenario: Decline webhook claiming
- **WHEN** user clicks "Keep Anonymous" button
- **THEN** system closes prompt without claiming
- **AND** redirects to homepage dashboard
- **AND** webhook remains subject to 7-day cleanup
- **AND** user can create new owned webhooks from dashboard

#### Scenario: No unclaimed webhook
- **WHEN** user logs in with no unclaimed webhook (already claimed or none exists)
- **THEN** no claim prompt is shown
- **AND** user proceeds to homepage dashboard immediately

### Requirement: Webhook ownership indicator
The system SHALL display webhook ownership status in the UI.

#### Scenario: Show ownership status in webhook list (Authenticated)
- **WHEN** authenticated user views webhook list on dashboard
- **THEN** each webhook shows ownership indicator:
  - "Owned" badge for authenticated user's webhooks
  - "Anonymous" badge for webhooks without owner (from claiming workflow)

#### Scenario: Show ownership in webhook detail
- **WHEN** user views webhook detail page
- **THEN** system displays ownership status
- **AND** for anonymous webhooks, shows warning about 7-day retention

#### Scenario: Anonymous user sees ownership indicator
- **WHEN** anonymous user views webhook detail page
- **THEN** system displays "Anonymous" badge
- **AND** shows persistent banner about 7-day retention
- **AND** includes CTA to register/login for persistent storage

### Requirement: Dark mode support
The system SHALL support dark mode with automatic system preference detection and manual toggle.

#### Scenario: System preference detection
- **WHEN** user visits app with system set to dark mode
- **THEN** system automatically applies dark theme
- **AND** all UI components render in dark colors

#### Scenario: System preference detection for light mode
- **WHEN** user visits app with system set to light mode
- **THEN** system automatically applies light theme
- **AND** all UI components render in light colors

#### Scenario: Manual theme toggle
- **WHEN** user clicks dark mode toggle button in header
- **THEN** system switches between light and dark themes
- **AND** preference is saved to localStorage
- **AND** theme persists on page reload

#### Scenario: Theme persistence
- **WHEN** user has manually selected dark mode
- **AND** user reloads the page
- **THEN** system applies dark theme regardless of system preference
- **AND** uses the saved preference from localStorage

#### Scenario: All components support both themes
- **WHEN** user toggles between light and dark modes
- **THEN** all UI components update accordingly:
  - Background colors
  - Text colors
  - Border colors
  - Button styles
  - Input fields
  - Code/syntax highlighting
  - Tables and lists

### Requirement: Request search and filtering
The system SHALL provide search and filtering functionality for captured requests.

#### Scenario: Search by HTTP method
- **WHEN** user types "POST" in search box
- **THEN** system filters request list to show only POST requests
- **AND** updates count of filtered results

#### Scenario: Search by request body content
- **WHEN** user types "userId" in search box
- **THEN** system filters requests containing "userId" in body
- **AND** highlights matching text in results

#### Scenario: Search by headers
- **WHEN** user types "Authorization" in search box
- **THEN** system filters requests containing "Authorization" in headers
- **AND** shows matching requests

#### Scenario: Filter by time range
- **WHEN** user selects "Last hour" from time filter dropdown
- **THEN** system filters requests to show only those from last hour
- **AND** options include: Last hour, Last 24 hours, Last 7 days, All time

#### Scenario: Combine search and filters
- **WHEN** user searches for "POST" AND selects "Last 24 hours"
- **THEN** system shows only POST requests from last 24 hours

#### Scenario: Clear filters
- **WHEN** user clicks "Clear filters" button
- **THEN** system resets all search and filter criteria
- **AND** shows all requests for the webhook

#### Scenario: Real-time search
- **WHEN** user types in search box
- **THEN** system filters results in real-time as user types
- **AND** shows "Searching..." indicator during filtering

#### Scenario: No search results
- **WHEN** user searches with criteria matching no requests
- **THEN** system displays "No requests match your search" message
- **AND** shows option to clear filters

### Requirement: Responsive design
The system SHALL provide a usable interface on different screen sizes.

#### Scenario: Desktop layout
- **WHEN** user views on desktop (>= 1024px)
- **THEN** system displays sidebar with request list and main panel with request details

#### Scenario: Mobile layout
- **WHEN** user views on mobile (< 768px)
- **THEN** system displays list view with option to tap for detail view
- **AND** provides back button to return to list

### Requirement: Navigation for authenticated users
The system SHALL provide navigation for authenticated users to access the dashboard from webhook detail pages.

#### Scenario: Back to dashboard button
- **WHEN** authenticated user views webhook detail page `/webhooks/{id}`
- **THEN** system displays "Back to Dashboard" button or link
- **AND** clicking it navigates to homepage `/`

#### Scenario: Dashboard link in header
- **WHEN** authenticated user views any page
- **THEN** system displays "Dashboard" link in header/navigation
- **AND** clicking it navigates to homepage `/`

#### Scenario: Anonymous user does not see dashboard link
- **WHEN** anonymous user views webhook detail page
- **THEN** system does not display "Back to Dashboard" button
- **AND** does not display dashboard navigation option
