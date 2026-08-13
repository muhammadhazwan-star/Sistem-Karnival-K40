# Portal Digital Karnival 40 Tahun PPAAB — Worklog

This is the shared worklog for all agents working on the Portal Digital Karnival 40 Tahun PPAAB project.

## Project Overview
- **Event**: Karnival 40 Tahun Pusat Pendidikan Al-Amin Berhad (PPAAB)
- **Date**: 23 Ogos 2026, Dewan Majestic Elissa Garden, Gombak, Selangor
- **Theme**: Maroon & Gold Islamic Grand Gala (glassmorphism, premium, elegant)
- **Stack**: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma (SQLite), Socket.io
- **Constraint**: Only `/` route is user-visible. All views switch client-side via Zustand.
- **Admin login**: username `admin`, password `karnival40`

## Database
- Prisma schema at `prisma/schema.prisma` (models: EventInfo, ScheduleItem, Activity, Announcement, GalleryPhoto, Ucapan, Booth, MapLocation, JourneyItem, AdminUser, Setting)
- Seed script at `prisma/seed.ts` — already run. DB populated with dummy data.
- DB client import: `import { db } from '@/lib/db'`

## Theme / Styles
- Global CSS at `src/app/globals.css` — maroon & gold glassmorphism theme with custom utilities: `.glass`, `.glass-strong`, `.glass-gold`, `.text-gold-gradient`, `.text-gold-shimmer`, `.glow-gold`, `.animate-float`, `.bokeh`, `.custom-scroll`, `.live-dot`, `.ribbon-sweep`
- Fonts: Poppins (sans), Cormorant Garamond (serif), Cinzel (display), Amiri (arabic) — loaded in `src/app/layout.tsx`
- CSS variables: `--maroon`, `--maroon-deep`, `--burgundy`, `--gold`, `--gold-light`, `--champagne`, `--cream`

## Shared Lib
- `src/lib/types.ts` — all TypeScript interfaces + PortalView type + HIGHLIGHT_CATEGORIES + ACTIVITY_CATEGORIES
- `src/lib/store.ts` — Zustand store (usePortal): view, setView, adminToken, adminName, setAdmin, logoutAdmin, shareOpen, setShareOpen, uploadOpen, setUploadOpen
- `src/lib/api.ts` — API client (`api` object with all endpoints)
- `src/hooks/use-socket.ts` — Socket.io hook connecting to port 3003 via `/?XTransformPort=3003`

## Real-time Service
- Socket.io mini-service at `mini-services/realtime-service/` on port 3003
- Emits: `gallery:new`, `gallery:update`, `announcement:new`, `announcement:update`
- Listens: `gallery:upload`, `announcement:create`

## Image Assets
- Hero: `/images/hero-gala.jpg`
- Emblem: `/images/emblem-40.png`
- Venue: `/images/venue.jpg`
- Gallery: `/images/gallery/gallery-1.jpg` to `gallery-10.jpg`, `gallery-pending-1.jpg`, `gallery-pending-2.jpg`

---
Task ID: 1
Agent: main
Task: Foundation — Prisma schema, seed data, global theme, layout, shared lib

Work Log:
- Read PRD document and extracted all requirements
- Designed Prisma schema with 11 models covering all PRD modules
- Ran `bun run db:push` and `bun run seed` — DB populated with realistic dummy data (18 schedule items, 12 activities, 6 announcements, 12 gallery photos, 8 ucapan, 8 booths, 11 map locations, 5 journey items)
- Created global CSS with maroon & gold Islamic gala glassmorphism theme
- Set up layout with 4 Google Fonts (Poppins, Cormorant Garamond, Cinzel, Amiri)
- Created shared types, Zustand store, API client, socket.io hook
- Started image generation (hero, emblem, venue, 12 gallery photos) in background

Stage Summary:
- Foundation complete. DB seeded. Theme ready. Shared lib ready.
- Next: API routes (Task 4), real-time service (Task 5), then frontend views.

---
Task ID: 4
Agent: backend-api
Task: Build all backend API routes (public reads, public submissions, admin auth + CRUD)

Work Log:
- Read worklog + schema + types + api client. Confirmed Prisma models + DB seeded.
- Created shared helpers:
  - `src/lib/admin-auth.ts` — `issueToken`, `verifyAdmin`, `revokeToken` backed by module-level `Map<token, {username, name}>`.
  - `src/lib/broadcast.ts` — `broadcast(type)` POSTs to `http://localhost:3003/broadcast`; failures swallowed in try/catch.
- Created public GET routes (11):
  - `/api/event`, `/api/schedule` (ordered by order asc, time asc), `/api/activities` (order asc),
    `/api/announcements` (published only, pinned desc, createdAt desc), `/api/gallery` (`{photos, count, mode}` approved-only, createdAt desc),
    `/api/ucapan` (`{items, mode}` approved-only), `/api/booths`, `/api/map`, `/api/journey`,
    `/api/settings`, `/api/status` (computes before|live|after using Asia/Kuala_Lumpur; honours `statusMode` override).
- Created public POST routes (2):
  - `/api/gallery` — multipart/form-data upload. Validates image content-type + 10MB max. Saves to `public/uploads/<uuid><ext>` (dir auto-created). Status = approved if `galleryMode==='auto'` else pending. Broadcasts `gallery:new` (approved) or `gallery:update` (pending).
  - `/api/ucapan` — body `{authorName, role, content}`. Status from `ucapanMode`. No broadcast (admin moderation only).
- Created admin auth:
  - `POST /api/admin/login` — checks AdminUser table; returns `{token, name}` or 401.
- Created admin CRUD routes (all check `x-admin-token`, 401 if invalid):
  - `/api/admin/schedule` (POST/PUT/DELETE)
  - `/api/admin/activities` (POST/PUT/DELETE)
  - `/api/admin/announcements` (POST/PUT/DELETE) — broadcasts `announcement:new` / `announcement:update`
  - `/api/admin/gallery/moderate` POST — `{id, action: approve|reject|delete}` → broadcasts `gallery:update`
  - `/api/admin/gallery/highlight` PUT — `{id, highlight, highlightCategory?}` → broadcasts `gallery:update`
  - `/api/admin/ucapan/moderate` POST — `{id, action: approve|reject|delete}` (no broadcast)
  - `/api/admin/event` PUT — updates EventInfo (upsert to be safe)
  - `/api/admin/settings` PUT — updates galleryMode/ucapanMode/portalUrl (upsert to be safe)
  - `/api/admin/qr` GET — uses `qrcode` npm package to produce PNG data URL; falls back to `Setting.portalUrl` when `?url=` missing; maroon foreground.
- Fixed lint error in `src/hooks/use-socket.ts` (Task 1 leftover): replaced ref-during-render with a `getSocket()` accessor + state for `connected` to satisfy React 16 rules (`react-hooks/refs`, `react-hooks/set-state-in-effect`).
- Created `public/uploads/` directory for photo uploads.
- Smoke-tested: `/api/event`, `/api/status` (returns `before`), `/api/gallery`, `/api/ucapan`, `/api/admin/login` (returns token), `/api/admin/schedule` POST (no token = 401, with token = 201), `/api/admin/qr` (returns base64 PNG). Cleaned up test record.
- `bun run lint` passes with 0 errors / 0 warnings.

Stage Summary:
- All 28 API route handlers + 2 shared helpers delivered. Real-time broadcast hooked up for gallery + announcement mutations. Admin auth token-based (memory). Lint clean.
- Next: real-time service (Task 5) can broadcast `gallery:new|gallery:update|announcement:new|announcement:update` events to socket.io clients. Frontend (Task 6+) can wire `src/lib/api.ts` against these endpoints.

---
Task ID: 5
Agent: Realtime Service Developer
Task: Build the Socket.io real-time mini-service (port 3003)

Work Log:
- Read existing worklog and use-socket.ts hook to understand the contract.
- Created `/home/z/my-project/mini-services/realtime-service/` as a standalone Bun project.
- Wrote `package.json` (name: realtime-service, scripts.dev: `bun --hot index.ts`, dep: socket.io ^4.8.3).
- Wrote `index.ts` — a single HTTP server that serves BOTH socket.io (path `/`) and the plain-HTTP routes `/health` and `/broadcast`.
- Ran `bun install` — socket.io@4.8.3 + 21 transitive deps installed cleanly.
- Discovered that with `path: '/'` engine.io's `check(req)` matches every URL (since every URL starts with `/`), so socket.io would intercept `/health` and `/broadcast` and respond with `{"code":0,"message":"Transport unknown"}`. Solved this by wrapping the request listener: after `new Server(httpServer, {path:'/'})` I capture the socket.io listener, remove it, and install my own dispatcher that answers `/health`, `/broadcast`, and OPTIONS preflight directly, delegating everything else to socket.io. This honors the literal `path: '/'` requirement from the task spec AND keeps the HTTP routes working.
- Verified the existing `use-socket.ts` client (`io('/?XTransformPort=3003')`) uses socket.io-client's default engine.io path `/socket.io/`, and confirmed the server (with path `/`) accepts it because the `/socket.io/?EIO=4&transport=polling&XTransformPort=3003` URL matches the path-`/` check. End-to-end client↔server handshake verified.
- Encountered a sandbox issue: background processes started with `nohup ... &` or `setsid ... &` were being killed when the spawning bash tool call ended (the sandbox's Python process manager reaps orphaned children of bash). Solved by using `setsid -f bash -c '...'` which forces a fork and reparents the service to PID 1 (init), so it survives across bash tool calls.
- Discovered that `/start.sh` (the container entrypoint) AUTOMATICALLY starts every mini-service found in `/home/z/my-project/mini-services/*/` by running `bun run dev` in the background, with logs at `/tmp/mini-service-{name}.log`. So the realtime-service will be auto-started on every container restart going forward.
- Manually started the service for the current session via `setsid -f bash -c 'cd /home/z/my-project/mini-services/realtime-service && exec bun --hot index.ts' > /tmp/mini-service-realtime-service.log 2>&1 < /dev/null`. Process is PID 3236, PPID 1 (fully detached, survives).

Verification Results:
- `GET /health` → `{"ok":true,"clients":N}` ✓
- `POST /broadcast` with `{"type":"gallery:new","data":{...}}` → `{"ok":true,"clients":N}` ✓ and emits to all connected clients ✓
- `POST /broadcast` with missing `type` → 400 `{"ok":false,"error":"missing \"type\" field"}` ✓
- `POST /broadcast` with invalid JSON → 400 `{"ok":false,"error":"invalid JSON body"}` ✓ (and logged, no crash)
- `OPTIONS /broadcast` (CORS preflight) → 204 with `Access-Control-Allow-Origin: *` ✓
- CORS headers present on all responses ✓
- socket.io polling handshake `GET /socket.io/?EIO=4&transport=polling` → valid sid + `upgrades:["websocket"]` ✓
- End-to-end: a Node socket.io-client connected, server broadcast `gallery:new`, client received the payload, client disconnected cleanly ✓
- `bun --hot` is active (auto-restarts on index.ts changes) ✓
- Process detached (PPID 1), survives across bash tool calls ✓

Stage Summary:
- Realtime service is fully operational on port 3003.
- Frontend can connect via `io('/?XTransformPort=3003')` (existing use-socket.ts hook works as-is).
- Next.js API routes can fan-out events by POSTing to `http://localhost:3003/broadcast` with body `{"type": "...", "data": {...}}` after DB mutations. Suggested event types: `gallery:new`, `gallery:update`, `announcement:new`, `announcement:update`.
- Service auto-starts on container restart via /start.sh's mini-services scanner.
- Logs: `/tmp/mini-service-realtime-service.log`.

---
Task ID: 9
Agent: Frontend Developer (Admin Panel)
Task: Build Admin Dashboard view (login + 8-tab management panel)

Work Log:
- Read worklog to understand foundation (DB schema, theme, shared lib, API routes, realtime service). Read existing views (AturCara, Galeri, Ucapan, Pengumuman) to align with established design patterns (glass/glass-strong/glass-gold, maroon/gold palette, motion + sonner + framer-motion patterns).
- Verified the api.ts path convention: `api.adminCall('/admin/...', ...)` resolves to `/api/admin/...` (BASE='/api' is prepended in `request()`).
- Created 2 new backend route files + extended 1 existing route to expose admin-only GET endpoints that return ALL records (incl. drafts / pending / rejected) — required because the public GET endpoints filter by status:
  - **NEW** `src/app/api/admin/gallery/route.ts` — `GET` returns ALL GalleryPhoto (any status), ordered by createdAt desc. 401 if no/invalid `x-admin-token`.
  - **NEW** `src/app/api/admin/ucapan/route.ts` — `GET` returns ALL Ucapan (any status), ordered by createdAt desc. 401 if not admin.
  - **EXTENDED** `src/app/api/admin/announcements/route.ts` — added `GET` returning ALL Announcement (incl. unpublished drafts), ordered by pinned desc then createdAt desc. Existing POST/PUT/DELETE untouched. 401 if not admin.
- Built the main Admin component at `src/components/portal/views/Admin.tsx` (~1400 lines, fully self-contained):
  - **Helpers**: `toLocalInput(iso)` / `fromLocalInput(value)` for datetime-local ↔ ISO conversion. Constant arrays for SCHEDULE_CATEGORIES, ACTIVITY_STATUS, ANNOUNCEMENT_TYPES, STATUS_MODES.
  - **`useAdminFetch` hook**: small wrapper around `api.adminCall` for token-authed GET endpoints with refetch + loading/error state.
  - **Reusable UI**: `Field`, `EmptyState`, `LoadingRows` (skeletons), `StatCard`, `CrudDialog` (themed glass dialog wrapper), `ConfirmDeleteDialog`.
  - **Login screen** (rendered when `adminToken` is null):
    - Centered glass-strong card with maroon/gold theme.
    - Decorative header: ShieldCheck icon in glass-gold circle + glow.
    - Username + password inputs (with eye toggle for password visibility), "Log Masuk Admin" button.
    - Calls `api.login({username, password})`, then `setAdmin(token, name)`, toast on success.
    - Hint box showing `admin` / `karnival40` demo credentials.
    - Subtle framer-motion entrance animation.
  - **Dashboard** (rendered when `adminToken` present):
    - Top bar: ShieldCheck icon, "Dashboard Urusetia" title, greeting "Selamat datang, {adminName}", Log Keluar button.
    - `Tabs` with horizontally-scrollable trigger bar (custom-scroll) on mobile, fixed on desktop. 8 tabs:
      1. **Maklumat Event** — full form (name, tagline, date, endDate, location, venue, logoText, statusMode select, description textarea). Pre-filled from `useEvent`. Saves via `PUT /admin/event`. Handles null dates.
      2. **Atur Cara** — list schedule items (useSchedule) as time-pinned rows with category badges; Edit/Delete buttons; "Tambah Item" opens CrudDialog with time/endTime/title/speaker/category/order fields. POST/PUT/DELETE `/admin/schedule`. ConfirmDeleteDialog before delete.
      3. **Aktiviti** — grid of activity cards (useActivities) with featured star, category & status badges, time + location; CRUD dialog with name/category(ACTIVITY_CATEGORIES)/startTime/endTime/location/description/status(ACTIVITY_STATUS)/featured(Switch)/order. POST/PUT/DELETE `/admin/activities`.
      4. **Pengumuman** — list announcements (useAdminFetch on `/admin/announcements` so drafts ARE visible) with pinned badge, type badge, draft badge when unpublished; CRUD dialog with title/content(textarea)/type/published(Switch)/pinned(Switch)/author. POST/PUT/DELETE `/admin/announcements`.
      5. **Moderasi Galeri** — `useAdminFetch` on `/admin/gallery`. StatCard grid: pending / approved / highlighted counts. Pending section: photo cards with thumbnail, contributor, caption, timeAgo + Approve (green) / Reject (amber) / Delete (red) buttons. Approved section: photo cards with Highlight Switch + highlightCategory Select (HIGHLIGHT_CATEGORIES) that calls `PUT /admin/gallery/highlight`. All mutations call `/admin/gallery/moderate` or `/admin/gallery/highlight` then refetch. Toast feedback.
      6. **Moderasi Ucapan** — `useAdminFetch` on `/admin/ucapan`. StatCard: pending / approved. Pending section: ucapan card with role+author+timeAgo+content + Approve/Reject/Delete. Approved section: list with Delete only.
      7. **Tetapan** — form (galleryMode select auto/approval, ucapanMode select auto/approval, portalUrl input). Pre-filled from `useSettings`. Saves via `PUT /admin/settings`.
      8. **QR Code** — URL input (defaults to settings.portalUrl), "Jana QR" button calls `GET /admin/qr?url=...` → displays returned `dataUrl` as `<img>`. "Muat Turun PNG" creates an anchor with `download` attribute and clicks it. "Cetak" calls `window.print()`. Loading state + empty state.
- All forms use the maroon/gold theme consistently: `bg-maroon-dark/40 border-gold/25 text-cream` inputs, `bg-gradient-to-r from-gold to-gold-light text-maroon-dark` primary buttons, `glass-strong` dialogs with `border-gold/30`, `text-gold-shimmer` titles via `font-display`.
- Responsive design: tabs scroll horizontally on mobile, schedule rows wrap into cards, activity/announcement lists switch from row→grid→stack, photo moderation grid is 1 col mobile / 2 col sm / 3 col lg.
- After every mutation, the relevant data is refetched (via `refetch()` from the appropriate hook) and a `toast.success` / `toast.error` is shown.
- Loading states use `<Skeleton>` components; empty states use `<EmptyState>` with icon + message + optional action.

Verification:
- `bun run lint` on the 4 touched files (`Admin.tsx`, `admin/gallery/route.ts`, `admin/ucapan/route.ts`, `admin/announcements/route.ts`) → 0 errors, 0 warnings. (Note: pre-existing errors in `BokehBackground.tsx` line 16 and `use-data.ts` line 23 are NOT mine — left untouched.)
- Smoke-tested the new endpoints via curl with an admin token:
  - `GET /api/admin/gallery` → 12 photos (all statuses) ✓
  - `GET /api/admin/ucapan` → 8 ucapan (all statuses) ✓
  - `GET /api/admin/announcements` → 6 announcements (incl. drafts) ✓
  - Without token → 401 ✓
- Dev server log shows clean compile (`✓ Compiled in 253ms`) and `GET / 200` — Admin.tsx is statically imported by `PortalApp.tsx`, so any syntax/type error would break the home page compile. It compiles cleanly.

Stage Summary:
- Admin Dashboard is fully functional with login + 8 management tabs covering all PRD admin workflows.
- 2 new backend route files + 1 extended route deliver admin-only "all records" GET endpoints needed for moderation views.
- Component is mobile-responsive, themed consistently with the rest of the portal (maroon & gold glassmorphism), and integrates cleanly with the existing Zustand store, api client, and data hooks.
- Next: nothing blocking from this task. If the project needs admin editing for booths / map / journey, that would be a future extension.

---
Task ID: 10
Agent: main
Task: Integration, polish, footer, responsive, self-verification with Agent Browser

Work Log:
- Wired up main page.tsx to render PortalApp
- Fixed lint errors (BokehBackground setState-in-effect → useMemo, unused eslint-disable)
- Generated all premium Islamic gala images: hero-gala.jpg, venue.jpg, 12 gallery photos
- Verified all 9 views render correctly via Agent Browser (Beranda, Atur Cara, Aktiviti, Pengumuman, Galeri, Ucapan, Peta, Booth, Perjalanan)
- Verified admin login flow (admin/karnival40) → dashboard with 8 tabs
- Verified QR code generation works
- Verified ucapan submission with toast feedback (goes to pending in approval mode)
- Verified gallery shows all 12 photos with highlights, lightbox, and filters
- Verified real-time socket.io service running on port 3003
- Confirmed lint passes clean (0 errors, 0 warnings)
- Confirmed footer is sticky to bottom (flex-col min-h-screen with mt-auto)
- Confirmed responsive design (mobile + desktop viewports)

Stage Summary:
- Portal Digital Karnival 40 Tahun PPAAB is COMPLETE and fully functional.
- All PRD requirements implemented: DISCOVER/PARTICIPATE/SHARE/REMEMBER pillars, countdown, schedule timeline, activities, announcements, live gallery with upload+moderation, ucapan, map, booths, journey, admin dashboard with QR generation.
- Real backend database (Prisma/SQLite) with comprehensive dummy data.
- Real-time updates via Socket.io for gallery and announcements.
- Premium Maroon & Gold Islamic Grand Gala glassmorphism theme.
- Browser-verified: all interactions work end-to-end.

---
Task ID: 11
Agent: main
Task: Integrate official K40 logo (LOGO K40.jpeg) into portal

Work Log:
- Analyzed uploaded logo via VLM: white background, deep red "40" with central PPAAB seal, "PPAAB" text, colorful swoosh
- Copied logo to public/images/logo-k40.jpeg
- Created reusable K40Logo component (src/components/portal/K40Logo.tsx) with sizes (sm/md/lg/xl), optional decorative ring, glow effect
- Updated Navigation header to use real logo (size sm) replacing the placeholder "40" badge
- Updated Beranda hero centerpiece to use real logo (size xl) with floating animation + decorative spinning ring
- Updated Footer brand section to use real logo (size sm)
- Logo displayed in rounded white container to complement maroon/gold theme
- Verified via Agent Browser: 3 logo instances load correctly (1080px natural width), no errors
- Lint passes clean

Stage Summary:
- Official K40 anniversary logo integrated into navigation, hero, and footer.
- Reusable K40Logo component available for future use across portal.
