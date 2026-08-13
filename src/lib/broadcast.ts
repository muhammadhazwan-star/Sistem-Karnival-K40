// Helper to notify the real-time service (mini-service on port 3003)
// whenever gallery or announcement data changes.
// Failures are swallowed so they never break the main request flow.

export type BroadcastType =
  | 'gallery:new'
  | 'gallery:update'
  | 'announcement:new'
  | 'announcement:update'

export async function broadcast(type: BroadcastType): Promise<void> {
  try {
    await fetch('http://localhost:3003/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
  } catch {
    // Real-time service unavailable — silently ignore
  }
}
