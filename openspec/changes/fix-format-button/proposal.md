## Why

The Format button in the response configuration currently only formats JSON content. Users need to format XML and HTML responses as well, while plain text should remain unformatted.

## What Changes

- Update the Format button to detect content type and apply appropriate formatting
- Add XML formatting using pretty-print algorithm
- Add HTML formatting using pretty-print algorithm
- Skip formatting for plain text content type (no-op with user feedback)

## Capabilities

### New Capabilities
<!-- No new capabilities being introduced -->

### Modified Capabilities
- `response-editor`: Update format functionality to handle JSON, XML, and HTML content types; plain text should not be formatted

## Impact

- Component: ResponseConfigPanel - update handleFormat function
- No database or API changes needed
