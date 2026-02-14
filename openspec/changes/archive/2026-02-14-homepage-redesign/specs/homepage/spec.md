## ADDED Requirements

### Requirement: Homepage displays app information and actions
The system SHALL show a landing page at `/` with app description and call-to-action buttons based on user authentication state.

#### Scenario: Unauthenticated user visits homepage
- **WHEN** unauthenticated user navigates to `/`
- **THEN** system displays homepage with app description
- **AND** shows "Try Now" button
- **AND** shows "Login" and "Sign Up" buttons

#### Scenario: Authenticated user visits homepage
- **WHEN** authenticated user navigates to `/`
- **THEN** system displays homepage with app description
- **AND** shows "Go to Dashboard" button
- **AND** shows user info or logout option

### Requirement: Try Now creates or uses existing webhook
When guest clicks "Try Now", the system SHALL create a webhook for them (or use existing one if session has one).

#### Scenario: Guest clicks Try Now with no existing webhook
- **WHEN** guest user clicks "Try Now" button
- **AND** user has no existing webhook in session
- **THEN** system creates a new webhook
- **AND** redirects to `/webhooks/{newWebhookId}`

#### Scenario: Guest clicks Try Now with existing webhook
- **WHEN** guest user clicks "Try Now" button
- **AND** user already has a webhook in session
- **THEN** system redirects to `/webhooks/{existingWebhookId}`
- **AND** does not create a new webhook

### Requirement: Dashboard button redirects to dashboard
Authenticated users clicking "Dashboard" SHALL be redirected to view their webhooks.

#### Scenario: Authenticated user clicks Dashboard
- **WHEN** authenticated user clicks "Dashboard" button
- **THEN** system redirects to `/` (which loads dashboard for authenticated users)
