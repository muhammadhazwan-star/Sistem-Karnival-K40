/**
 * Realtime Service — Portal Digital Karnival 40 Tahun PPAAB
 * ---------------------------------------------------------
 * Standalone Bun + Socket.io mini-service (port 3003).
 *
 * Responsibilities:
 *   1. Maintain socket.io connections from portal clients.
 *   2. Expose an HTTP `POST /broadcast` endpoint that the Next.js API
 *      routes call after DB mutations to fan-out events to all clients.
 *   3. Expose `GET /health` for liveness checks.
 *
 * Frontend connects via the gateway with: io('/?XTransformPort=3003')
 * (socket.io-client default path `/socket.io/` is used)
 * Next.js API routes broadcast via:       POST http://localhost:3003/broadcast
 *
 * Emitted events (consumed by the portal frontend):
 *   - gallery:new          { photo }
 *   - gallery:update       { photos }
 *   - announcement:new     { announcement }
 *   - announcement:update  { announcements }
 *
 * IMPORTANT — path / caveat:
 *   The task spec asks for `path: '/'` on the socket.io server. With that
 *   setting, engine.io's `check(req)` matches *every* URL (because every
 *   URL starts with `/`), which means socket.io would intercept `/health`
 *   and `/broadcast` and respond with `{"code":0,"message":"Transport
 *   unknown"}`. To honor the literal `path: '/'` requirement *and* keep
 *   the HTTP routes working, we attach socket.io with `path: '/'` and then
 *   swap out the request listener it registered so our own handler runs
 *   first. Requests for `/health` and `/broadcast` are answered by us;
 *   everything else is delegated to socket.io's wrapper (which in turn
 *   handles engine.io handshakes on any URL — the client connects to
 *   `/socket.io/?EIO=4&transport=polling&XTransformPort=3003`).
 */

import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Server, Socket } from 'socket.io'

const PORT = 3003

// --- Helpers ----------------------------------------------------------------
function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

// --- HTTP server (shared with socket.io) ------------------------------------
// We create the server with NO request callback — socket.io will attach its
// own listener, which we then wrap (see below).
const httpServer = createServer()

// --- Socket.io server -------------------------------------------------------
// path: '/' as required by the task spec. See the header comment for why
// we additionally wrap the request listener.
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
})

// --- Wrap socket.io's request listener so /health and /broadcast work -------
// After `new Server(httpServer, ...)`, engine.io has registered a single
// 'request' listener that intercepts every URL (because path === '/').
// We replace it with our own dispatcher that handles our HTTP routes first
// and delegates everything else to the original socket.io listener.
const socketIoListeners = httpServer.listeners('request').slice(0)
httpServer.removeAllListeners('request')

httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
  setCorsHeaders(res)

  // Preflight for any route
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Liveness probe
  if (req.url === '/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, clients: io.engine.clientsCount })
    return
  }

  // Broadcast fan-out — called by Next.js API routes after DB mutations
  if (req.url === '/broadcast' && req.method === 'POST') {
    let body = ''
    req.on('data', (chunk: Buffer | string) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}') as { type?: string; data?: unknown }
        const { type, data } = parsed

        if (!type || typeof type !== 'string') {
          sendJson(res, 400, { ok: false, error: 'missing "type" field' })
          return
        }

        io.emit(type, data)
        console.log(`[broadcast] "${type}" -> ${io.engine.clientsCount} client(s)`)
        sendJson(res, 200, { ok: true, clients: io.engine.clientsCount })
      } catch (err) {
        console.error('[broadcast] JSON parse error:', err)
        sendJson(res, 400, { ok: false, error: 'invalid JSON body' })
      }
    })
    req.on('error', (err) => {
      console.error('[broadcast] request stream error:', err)
      sendJson(res, 400, { ok: false, error: 'request stream error' })
    })
    return
  }

  // Delegate everything else to socket.io's original listener (handles
  // engine.io handshakes/upgrades on any URL since path === '/').
  for (const listener of socketIoListeners) {
    listener.call(httpServer, req, res)
  }
})

// --- Socket.io connection lifecycle ----------------------------------------
io.on('connection', (socket: Socket) => {
  const total = io.engine.clientsCount
  console.log(`[socket] client connected  id=${socket.id}  total=${total}`)

  // Lightweight echo handler — useful for manual smoke testing from the
  // browser console: socket.emit('ping', { hello: 'world' })
  socket.on('ping', (payload: unknown) => {
    socket.emit('pong', { received: payload, at: new Date().toISOString() })
  })

  // The portal frontend emits these to signal intent; actual fan-out is
  // triggered by the Next.js API routes via POST /broadcast once the DB
  // mutation succeeds. We log them here for observability.
  socket.on('gallery:upload', (payload: unknown) => {
    console.log('[socket] gallery:upload received (client signal)', payload)
  })

  socket.on('announcement:create', (payload: unknown) => {
    console.log('[socket] announcement:create received (client signal)', payload)
  })

  socket.on('disconnect', (reason: string) => {
    const remaining = io.engine.clientsCount
    console.log(
      `[socket] client disconnected id=${socket.id}  reason=${reason}  total=${remaining}`,
    )
  })

  socket.on('error', (err: unknown) => {
    console.error(`[socket] error on id=${socket.id}:`, err)
  })
})

// --- Start ------------------------------------------------------------------
httpServer.listen(PORT, () => {
  console.log('============================================================')
  console.log(`  🔌 Realtime service running on port ${PORT}`)
  console.log(`     - socket.io:  ws://localhost:${PORT}/  (path=/)`)
  console.log(`     - health:     GET  http://localhost:${PORT}/health`)
  console.log(`     - broadcast:  POST http://localhost:${PORT}/broadcast`)
  console.log('============================================================')
})

// --- Graceful shutdown ------------------------------------------------------
function shutdown(signal: string): void {
  console.log(`\n[shutdown] received ${signal}, closing realtime service...`)
  io.close(() => {
    httpServer.close(() => {
      console.log('[shutdown] realtime service closed.')
      process.exit(0)
    })
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
