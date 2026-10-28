# Wandora user flows — Phase 2

The supplied `wandora-apis.json` is the source of truth. The Swagger HTML is cross-checked for operation presence. The frontend never presents sample accommodation or invented backend success as live data.

## Authentication-aware navigation

- Public routes stay public: `/`, `/stays`, `/stays/:hotelId`, `/login`, `/register`, `/verify-email`, `/host`
  (invitation), `/forbidden` and the 404 fallback. Every `/app/*`, `/host/*` and `/admin/*` route is protected.
- Opening a protected route while signed out redirects to `/login` and keeps the full intended destination
  (pathname, query string and hash) in router state. After a successful login the visitor returns to that
  destination when it is a safe internal path; otherwise they land on the home for their persisted roles
  (`/app` for traveler and host accounts, `/admin` for admin-only accounts).
- `/login` and `/register` are guest-only. The decision is taken once the session query has settled — never
  while it is loading — and signed-in visitors are redirected to their intended destination or role home.
  The register → verify-email hand-off is preserved: the guard defers its redirect by a tick and then renders
  it declaratively, so a completed registration reaches `/verify-email` (covered by
  `src/routes/guest-guard.test.tsx`) instead of being bounced straight to `/app`.
- `/host` and `/host/*` require the persisted `HOST` role; `/admin/*` requires `ADMIN`. Missing roles render
  `/forbidden`, which links back to the user's own workspace. The backend remains the authority.
- The authenticated shell shows only the workspaces the persisted roles allow: traveler, host and admin
  navigation are derived from `/api/auth/me/roles`, with a workspace switcher when more than one applies.
  Switching workspaces is pure navigation and never changes roles or permissions.
- Signed-in visitors see a "My Wandora" entry in the public header instead of login/join links.
- Logout clears only in-memory session/query state and returns to the landing page. Expired sessions surface
  as a sign-in prompt in API error states rather than a dead end.
- Unknown paths inside the shell render an in-shell 404 so navigation stays available; `/dashboard` redirects
  to `/app` for old links.

## Public experience and auth

- `/` is the Wandora landing page. `/stays` searches live hotel inventory with documented city, dates, roomCount and pagination. Hotel cards show only API-returned fields and photo URLs; details use public hotel/room endpoints. `/stays/:hotelId` is the actual details route. Search is initiated only after the visitor submits the form; client validation requires both dates together and check-out after check-in. The form allows a complete date range or neither date, matching its fields; current backend search returns HTTP 500 for omitted dates (null date arithmetic) and valid-date searches (a `LinkedHashMap` to `Page` cast failure). See [security and integration notes](security-and-integration.md).
- Login/registration use exact request fields. Registration creates an account/session but does not send OTP. The signed-in user requests a code through `/api/auth/resendotp` and submits email+OTP to `/api/auth/verify/otp`.
- Persisted roles are fetched from `/api/auth/me/roles`. Logout calls `/api/auth/logout` and clears only in-memory auth and query state. No tokens are read or stored in browser storage.

## Traveler workspace

- Profile reads `/api/me`; profile changes, image upload (`file` multipart), and phone add/remove use their documented routes.
- Discovery pages `/api/users`. Per-user status is fetched from `/api/friendships/{targetUserId}/status`; friend request and friendship removal use the documented operations. No accept/reject request endpoint is documented, so those actions are not fabricated.
- Search results lead to booking input with hotel and room ids. `/api/bookings/init` creates a reservation with exact date/count fields; guests use the documented numeric user-id array. Booking states and cancellation eligibility are backend returned. Payment order initiation is wired; checkout SDK is not available, so no payment is represented as complete absent backend signature verification.
- Booking drive access first loads the booking drive; photo pages, upload field `file`, signed URLs and delete actions use the documented endpoints and backend permission checks.
- Travel plans support list/create/open/update/cancel/status, invitations and responses, member removal, itinerary CRUD, stay-option CRUD, plan messages, and existing booking links. This collaboration is REST only, not real-time/WebSocket. The UI does not infer permissions from the lack of OpenAPI security annotations.

## Host workspace

- Host routes require backend-persisted HOST role. Host application submission uses multipart `application`, `pan`, `aadhaar`, and `photo`; status and document links are read from documented routes.
- Host profile creation requires an approved application and sends only documented host fields. Phone/email OTP request and confirm bodies match the DTOs; profile edits use hostName, description, and active.
- Hotel application form sends all six required document parts, JSON application/contact block, refund tiers and pricing policy. Hotel creation sends amenities/active only after approval; owner update, photo management, room create/list/deactivate, room photos, and booking listing use their existing APIs.

## Admin workspace

- `/admin/*` is gated by backend roles; backend authorization remains authoritative. Dashboard figures come only from the summary endpoint. Hotels list supports city/active filters and pagination; details use the admin detail operation.
- Hotel and host application tables support API status filters and pagination. Details include the documented application/document APIs. Approvals use bodyless PATCH, rejections send `{reason}`. 403 is an access error, not an empty result.

## UI state and errors

TanStack Query provides loading, retry, empty states and cache invalidation. The shared Axios client unwraps successful backend `{success, data}` responses and keeps server errors visible. Form constraints mirror contract fields; destructive actions prompt confirmation. No fake analytics, data, pricing, payment state or role is used.
