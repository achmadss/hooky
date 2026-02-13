## Why

The current response configuration UI is limited - status code is just a number input and response body is a plain textarea. Users need a better experience with dropdown for common status codes, code editor with syntax highlighting, and support for different content types.

## What Changes

1. Change status code input from text field to dropdown with human-readable options (200 OK, 201 Created, 400 Bad Request, etc.)
2. Replace plain textarea for response body with a code editor featuring:
   - Syntax highlighting for JSON, XML, Plain text
   - Tab support for indentation
   - Auto-formatting button
   - Line numbers
3. Add content type selector (application/json, application/xml, text/plain, etc.)
4. Show content type preview based on selection

## Capabilities

### New Capabilities
- `response-editor`: Code editor component for response body with syntax highlighting, formatting, and content type selection

### Modified Capabilities
- `response-configuration`: Update requirements to reflect new editor UI and content type support

## Impact

- Components: ResponseConfigPanel - replace textarea with code editor
- API: ResponseConfig model already stores content type, no backend changes needed
- Dependencies: Need to add a code editor library (e.g., @monaco-editor/react or CodeMirror)
