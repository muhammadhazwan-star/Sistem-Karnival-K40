# Task 5 — Realtime Service Developer

## What I built
A standalone Bun + Socket.io mini-service at `/home/z/my-project/mini-services/realtime-service/` that runs on port **3003** and provides:

1. **Socket.io server** (path `/`) — accepts connections from the portal frontend via `io('/?XTransformPort=3003')`.
2. **`POST /broadcast`** HTTP endpoint — called by Next.js API routes after DB mutations to fan-out events to all connected clients. Body: `{"type": string, "data?: any"}`. Response: `{"ok": true, "clients": N}`.
3. **`GET /health`** HTTP endpoint — liveness probe. Response: `{"ok": true, "clients": N}`.
4. **CORS** — `Access-Control-Allow-Origin: *` on all responses, with `OPTIONS` preflight handled.

## Files
- `mini-services/realtime-service/package.json` — name `realtime-service`, `dev` script is `bun --hot index.ts`, depends on `socket.io@^4.8.3`.
- `mini-services/realtime-service/index.ts` — the server implementation (~200 lines, fully commented).
- `mini-services/realtime-service/bun.lock` — lockfile.
- `mini-services/realtime-service/node_modules/` — socket.io + engine.io + deps.

## Key implementation note (path `/` caveat)
The task spec asks for `path: '/'` on the socket.io server. With that setting, engine.io's `check(req)` function (`path === req.url.slice(0, path.length)`) matches **every** URL (since every URL starts with `/`). This causes socket.io to intercept `/health` and `/broadcast` and respond with `{"code":0,"message":"Transport unknown"}`.

**Solution:** After `new Server(httpServer, {path:'/'})`, I capture the socket.io request listener that engine.io registered, remove it, and install my own dispatcher. My dispatcher answers `/health`, `/broadcast`, and `OPTIONS` directly; everything else is delegated to the original socket.io listener. This honors the literal `path: '/'` requirement AND keeps the HTTP routes working.

The existing client hook `src/hooks/use-socket.ts` uses `io('/?XTransformPort=3003')` which results in socket.io-client's default engine.io path `/socket.io/`. The polling URL becomes `/socket.io/?EIO=4&transport=polling&XTransformPort=3003`. The server (with path `/`) accepts this because the URL starts with `/`. End-to-end handshake verified working.

## How the service is started
- **On container restart:** `/start.sh` automatically scans `/home/z/my-project/mini-services/*/` and runs `bun run dev` for each service that has a `package.json` with a `dev` script. So the realtime-service will auto-start on every container boot, with logs at `/tmp/mini-service-realtime-service.log`.
- **For the current session:** Started manually via `setsid -f bash -c 'cd /home/z/my-project/mini-services/realtime-service && exec bun --hot index.ts'` (reparented to PID 1 so it survives across bash tool calls). Current PID: 3236.

## Sandbox gotcha (for future agents)
Background processes started with plain `nohup ... &` or `setsid ... &` get killed when the spawning bash tool call ends — the sandbox's Python process manager (PID 925) reaps orphaned children of bash. To start a long-running background process that survives across bash tool calls, use `setsid -f bash -c '...'` (the `-f` flag forces a fork and reparents the child to PID 1/init).

## API contract for Next.js API routes
After a DB mutation, fan out the change to all portal clients:
```ts
// Server-side (Next.js API route / server action)
await fetch('http://localhost:3003/broadcast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'gallery:new', data: { photo } }),
})
```

Suggested event types (consumed by the frontend):
- `gallery:new` — `{ photo }` — a new photo was uploaded/approved.
- `gallery:update` — `{ photos }` — the full photo list refreshed.
- `announcement:new` — `{ announcement }` — a new announcement was posted.
- `announcement:update` — `{ announcements }` — the full announcement list refreshed.

## Verification
All endpoints tested and working:
- `GET /health` → `{"ok":true,"clients":0}` ✓
- `POST /broadcast` valid → `{"ok":true,"clients":N}` + emits to clients ✓
- `POST /broadcast` missing type → 400 ✓
- `POST /broadcast` invalid JSON → 400 (no crash) ✓
- `OPTIONS` preflight → 204 with CORS headers ✓
- socket.io polling handshake → valid sid ✓
- End-to-end: Node client connected, received broadcast, disconnected cleanly ✓
- Process survives across bash tool calls (PPID 1) ✓
- `bun --hot` active for auto-restart on file changes ✓
