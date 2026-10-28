# Wandora security and integration — Phase 2

## Backend origin and CORS

`src/api/http.ts` reads `import.meta.env.VITE_API_BASE_URL`; the local example is `http://localhost:8080` in [.env.example](../.env.example). Vite serves at `http://localhost:5173`. Spring must allow that exact origin with credentialed CORS, explicitly permit the client methods and headers (JSON and multipart content), and configure cookies with a policy compatible with the local origin. `Access-Control-Allow-Origin: *` is not compatible with credentialed requests. The backend was not modified.

## Cookie authentication and persisted roles

The shared Axios client sets `withCredentials: true`. `ACCESS_TOKEN`/`REFRESH_TOKEN` remain backend-issued HttpOnly cookies. The UI never accesses or persists them, writes bearer headers, or stores frontend auth flags as an access decision. Session/role lookup comes from `GET /api/auth/me/roles`; route guards do not replace server-side authorization. Logout calls the backend and clears only in-memory state/query cache. `401`/`403` are presented as session/access errors.

## CSRF

CSRF protection has been removed from the Wandora backend. The frontend matches the current backend implementation:

- `GET /api/auth/csrf` is never called.
- No `X-XSRF-TOKEN` or other CSRF-specific request header is sent.
- No `XSRF-TOKEN` cookie is read, parsed or depended on.
- There is no CSRF token service, interceptor, state, hook or loading/error path; the old `src/auth/csrf.ts` service and its tests were deleted.

The shared Axios client keeps `withCredentials: true` so the HttpOnly session cookies continue to travel with every request. `src/api/http.test.ts` asserts that the client installs no request interceptor and attaches no CSRF header, so a regression that reintroduces one fails the test suite. Cookie-based JWT authentication, CSRF-free. Live verification on the running backend: `GET /api/auth/csrf` returns HTTP 500 (`csrfToken is null`), confirming the endpoint is no longer serviced, and state-changing requests are accepted without any CSRF header once a session cookie is present.

## Contract-driven API handling

- Successful backend responses use a `{success, message, data, ...}` envelope; the shared Axios response interceptor unwraps successful `data` and raises a typed API error when `success` is false. HTTP error envelopes and network failures retain centralized error handling.
- `docs/api-inventory.md` catalogs the OpenAPI method/path, request/response schema and errors; source spec is `wandora-apis.json`.
- Feature API modules use the documented endpoints and parameters; TanStack Query keys and invalidations are centralized. Multipart field names follow the OpenAPI parts. API errors are normalized from the declared envelope or transport status.
- Public hotel search/photo routes are treated as public per the OpenAPI tag. Host/admin resources are rendered behind role layouts and still depend on backend role, ownership, application approval and booking participant checks.
- Collaborative plan APIs have no operation-level OpenAPI security declarations. The UI does not call them real-time/WebSocket; backend membership authorization should be verified before deployment.

## Uploads and signed URLs

Private application/booking document links and booking drive URLs are rendered only from backend responses, not fabricated. Uploads use multipart form data and cookie credentials. The backend remains responsible for file-type/size validation, signed URL expiry and resource ownership. No backend URLs or secrets are embedded in code.

## Payments

The frontend creates the payment order through `/api/bookings/{bookingId}/payments` and can submit Razorpay callback fields to `/api/payments/verify`. The Razorpay browser checkout SDK is not present in dependencies, and Gravity Index had no suitable integration recommendation. Therefore this version does not claim to open Checkout or complete a payment; it exposes the returned order and verification workflow transparently, without reporting a success until the backend verification succeeds. The Razorpay webhook is server-to-server and must never be called by this browser.

## Live backend verification and limitations

The local Spring service at `http://localhost:8080` was reachable. Credentialed CORS preflight from `http://localhost:5173` returned the exact origin and `Access-Control-Allow-Credentials: true`. The CSRF bootstrap was removed from the client to match the backend, and `GET /api/auth/csrf` now returns HTTP 500, confirming the backend no longer services it. Hotel search at `GET /api/hotels/search` returned HTTP 500 when dates were omitted (backend attempted date arithmetic with a null value) and also with valid `HotelRequestInfo` fields (backend attempted to cast a `LinkedHashMap` to `Page`). These are backend defects; the search form reports the server error instead of fabricating empty results. Browser verification confirmed the configured default API origin reaches Spring: `GET /api/auth/me/roles` returns the expected unauthenticated 401 instead of being sent to Vite. Authenticated registration/login/OTP, profile changes, booking/payment, host flows, and admin workflows were not exercised because no authenticated user/admin session was provided. No backend project is touched by this frontend.
