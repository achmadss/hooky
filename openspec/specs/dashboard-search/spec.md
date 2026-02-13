# Capability: Dashboard Search

## Purpose

Dashboard Search provides authenticated users with the ability to search and paginate through their webhooks from the dashboard.

## Requirements

### Requirement: Dashboard webhook search
Authenticated users SHALL be able to search their webhooks by token or name from the dashboard.

#### Scenario: Search webhooks by token
- **WHEN** user types a search query in the dashboard search box
- **AND** presses Enter or waits for debounce (300ms)
- **THEN** the webhook list filters to show only webhooks with matching token

#### Scenario: Search webhooks by name
- **WHEN** user types a search query in the dashboard search box
- **AND** the query matches a webhook's description/name
- **THEN** the webhook list filters to show only webhooks with matching name

### Requirement: Dashboard pagination
The dashboard SHALL support pagination for webhook lists with server-side paging.

#### Scenario: View paginated results
- **WHEN** a user has more webhooks than the page size (default 10)
- **THEN** pagination controls appear at the bottom of the webhook list
- **AND** user can navigate between pages

#### Scenario: Search with pagination
- **WHEN** user searches with pagination active
- **THEN** search results are also paginated
- **AND** page number resets on new search

### Requirement: Clear search
Users SHALL be able to clear the search filter to see all webhooks.

#### Scenario: Clear search filter
- **WHEN** user clicks the clear button in the search field
- **THEN** the search query is cleared
- **AND** all webhooks are displayed
