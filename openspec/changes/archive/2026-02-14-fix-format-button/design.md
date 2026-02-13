## Context

The Format button in ResponseConfigPanel currently only supports JSON formatting. The handleFormat function needs to be extended to handle XML and HTML content types.

## Goals / Non-Goals

**Goals:**
- Format JSON responses with proper indentation
- Format XML responses with proper indentation
- Format HTML responses with proper indentation
- Skip formatting for plain text with appropriate user feedback

**Non-Goals:**
- Auto-detect content type (always use selected content type)
- Preserve comments in XML/HTML during formatting

## Decisions

1. **XML Formatting**: Use simple regex-based pretty printing that adds newlines and indentation after closing tags.

2. **HTML Formatting**: Similar to XML, use regex-based approach to add newlines and indentation. Handle common HTML structure patterns.

3. **Plain Text Handling**: Show "Plain text cannot be formatted" message, no formatting applied.

## Risks / Trade-offs

- [Risk] Simple regex-based formatting may not handle malformed XML/HTML
  - Mitigation: Catch parse errors and show error message, keep original content unchanged
