// Task 3.2 / 21.1: Generate a 16-char alphanumeric random token
export function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

// Task 3.3 / 21.2: Sanitize a custom token
// - lowercase
// - spaces → dashes
// - strip non-alphanumeric (except dashes)
export function sanitizeToken(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Task 3.4: Validate a token (3–64 chars, alphanumeric + dashes)
export function validateToken(token: string): { valid: boolean; error?: string } {
  if (token.length < 3) return { valid: false, error: 'Token must be at least 3 characters' }
  if (token.length > 64) return { valid: false, error: 'Token must be at most 64 characters' }
  if (!/^[a-z0-9-]+$/.test(token)) return { valid: false, error: 'Token may only contain lowercase letters, numbers, and dashes' }
  return { valid: true }
}
