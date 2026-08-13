// Admin token store — kept in module-level memory Map.
// On server restart, all sessions are invalidated (acceptable for this portal).

const tokens = new Map<string, { username: string; name: string }>()

export function issueToken(username: string, name: string): string {
  const token = crypto.randomUUID()
  tokens.set(token, { username, name })
  return token
}

export function verifyAdmin(
  token?: string | null,
): { username: string; name: string } | null {
  if (!token) return null
  return tokens.get(token) ?? null
}

export function revokeToken(token: string): void {
  tokens.delete(token)
}
