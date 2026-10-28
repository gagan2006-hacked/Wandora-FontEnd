# Wandora API coverage

> Generated from `wandora-apis.json` (OpenAPI 3.1, 105 operations) and cross-checked against the saved `Wandora.html` Swagger surface. A companion operation-by-operation inventory with full request/response schemas lives in [api-inventory.md](api-inventory.md); this document answers a different question: **is each documented operation actually wired into the UI?**

## How operations were classified

An operation counts as `Implemented` only when all three of the following are true:

1. a typed call exists in the API layer (`src/api/auth/authApi.ts` or `src/api/features.ts`) with the documented method, path, path/query parameters and body shape;
2. that call is reached from a TanStack Query hook or mutation (`src/api/hooks.ts`, `src/auth/session.ts`), so loading, error, caching and invalidation are handled;
3. a real screen renders the result and exposes a user action — no dead buttons, no mocked success.

Classification keys:

| Status | Meaning |
| --- | --- |
| `Implemented` | Call site + hook + working UI entry point. |
| `Partially implemented` | Wired, but reachable only from a secondary/manual control rather than a primary screen. |
| `Not implemented` | Documented by the backend, no user-facing entry point in this frontend. |
| `Blocked by backend/environment` | UI exists but the route cannot succeed in the current environment. |
| `Not applicable to frontend` | A browser must not call it; justification required. |

**Totals: 105 operations — 91 implemented, 1 partially implemented, 11 not implemented, 0 blocked by the backend, 2 not applicable to the frontend.**

No operation is currently classified `Blocked by backend/environment` at the wiring level: every screen that exists can send its request. Two live backend defects are documented under [Known backend limitations](#known-backend-limitations) and surface as visible error states rather than silent failures.

## Coverage by domain

| Domain | Operations | Implemented | Owning screens |
| --- | --- | --- | --- |
| Authentication | 8 | 7/8 | `/login` · `/register` · `/verify-email` (+ session bootstrap on every route) |
| My Profile | 5 | 5/5 | `/app/profile` |
| User Discovery | 1 | 1/1 | `/app/friends` |
| Friendships | 4 | 4/4 | `/app/friends` |
| Hotel Search | 4 | 4/4 | `/stays` · `/stays/:hotelId` |
| Host Profile | 9 | 6/9 | `/host/dashboard` |
| Host Applications | 5 | 2/5 | `/host/dashboard` |
| Hotels | 15 | 10/15 | `/host/dashboard` (properties & applications) |
| Rooms | 5 | 4/5 | `/host/dashboard` · room cards on `/stays/:hotelId` |
| Bookings | 5 | 5/5 | `/app/bookings` · `/app/book` |
| Payments | 2 | 1/2 | `/app/bookings` |
| Booking Drive | 4 | 4/4 | `/app/drive/:bookingId` |
| travel-plan-controller | 25 | 25/25 | `/app/trips` |
| Admin | 13 | 13/13 | `/admin` · `/admin/hotels` · `/admin/applications` |

## Route → screen → API wiring

| Route | Screen | Domains it consumes |
| --- | --- | --- |
| `/` | HomePage (PublicLayout) | Hotel Search (search form), Authentication (nav state) |
| `/stays` | PublicStaySearchPage | Hotel Search |
| `/stays/:hotelId` | PublicHotelDetailsPage | Hotel Search, Rooms (public room cards) |
| `/login`, `/register`, `/verify-email` | LoginPage / RegisterPage / VerifyEmailPage | Authentication |
| `/app` | TravelerDashboard | My Profile, Bookings, travel-plan-controller, Friendships |
| `/app/profile` | TravelerProfilePage | My Profile |
| `/app/friends` | FriendsPage | User Discovery, Friendships |
| `/app/bookings` | BookingsPage | Bookings, Payments |
| `/app/book` | BookingCreatePage | Bookings |
| `/app/drive/:bookingId` | BookingDrivePage | Booking Drive |
| `/app/trips` | TravelPlansPage (plan workspace) | travel-plan-controller |
| `/host/dashboard`, `/host/stays`, `/host/profile` | HostDashboardPage (tabbed) | Host Applications, Host Profile, Hotels, Rooms, Bookings (property view) |
| `/admin` | AdminDashboardPage | Admin (summary) |
| `/admin/hotels` | AdminHotelsPage | Admin (hotel list/detail) |
| `/admin/applications` | AdminApplicationsPage | Admin (application lists, detail, documents, approve/reject) |
| `/forbidden`, `*` | ForbiddenPage / NotFoundPage | none (guards and fallbacks) |

## Complete operation table

| Method | Path | Operation ID | Domain | Status | Frontend call site(s) | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/verify/otp` | verifyOtp | Authentication | Implemented | `src/auth/authApi.ts` |  |
| POST | `/api/auth/resendotp` | resendOtp | Authentication | Implemented | `src/auth/authApi.ts` |  |
| POST | `/api/auth/register` | register | Authentication | Implemented | `src/auth/authApi.ts` |  |
| POST | `/api/auth/refresh` | refresh | Authentication | Implemented | `src/auth/authApi.ts` |  |
| POST | `/api/auth/logout` | logout | Authentication | Implemented | `src/api/http.test.ts`, `src/auth/authApi.ts` |  |
| POST | `/api/auth/login` | login | Authentication | Implemented | `src/auth/authApi.ts` |  |
| GET | `/api/auth/me/roles` | getMyRoles | Authentication | Implemented | `src/auth/authApi.ts` |  |
| GET | `/api/auth/csrf` | csrf | Authentication | Not applicable to frontend | — | CSRF protection was removed from the backend. The client never calls this route, sends no `X-XSRF-TOKEN` header and reads no `XSRF-TOKEN` cookie; the live route returns HTTP 500. |
| PUT | `/api/me/profile-image` | uploadProfileImage | My Profile | Implemented | `src/api/features.ts` |  |
| PUT | `/api/me/phones` | addPhone | My Profile | Implemented | `src/api/features.ts` |  |
| DELETE | `/api/me/phones` | removePhone | My Profile | Implemented | `src/api/features.ts` |  |
| GET | `/api/me` | getMyProfile | My Profile | Implemented | `src/api/features.ts`, `src/api/http.test.ts`, `src/auth/authApi.ts` |  |
| PATCH | `/api/me` | updateMyProfile | My Profile | Implemented | `src/api/features.ts`, `src/api/http.test.ts`, `src/auth/authApi.ts` |  |
| GET | `/api/users` | getAllUsers | User Discovery | Implemented | `src/api/features.ts` |  |
| POST | `/api/friendships/requests/{targetUserId}` | sendRequest | Friendships | Implemented | `src/api/features.ts` |  |
| GET | `/api/friendships` | getFriends | Friendships | Implemented | `src/api/features.ts` |  |
| GET | `/api/friendships/{targetUserId}/status` | checkFriendship | Friendships | Implemented | `src/api/features.ts` |  |
| DELETE | `/api/friendships/{targetUserId}` | deleteFriendship | Friendships | Implemented | `src/api/features.ts` |  |
| GET | `/api/hotels/search` | getHotelByStartAndEndDate | Hotel Search | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| GET | `/api/hotels/search/{hotelId}/info` | getHotelByIDAndStartAndEndDate | Hotel Search | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| GET | `/api/hotels/search/photos` | hotelSearchHotelPhotos | Hotel Search | Implemented | `src/api/features.ts` |  |
| GET | `/api/hotels/search/photos/{roomId}` | hotelSearchRoomPhotos | Hotel Search | Implemented | `src/api/features.ts` |  |
| POST | `/host/phone/verify` | phoneVerify | Host Profile | Implemented | `src/api/features.ts` |  |
| POST | `/host/email/verify` | emailVerify | Host Profile | Implemented | `src/api/features.ts` |  |
| POST | `/host/create` | createHost | Host Profile | Implemented | `src/api/features.ts` |  |
| PATCH | `/host/update` | updateHost | Host Profile | Implemented | `src/api/features.ts` |  |
| PATCH | `/host/phone/otp` | otpVerify | Host Profile | Implemented | `src/api/features.ts` |  |
| PATCH | `/host/email/otp` | otpEmailVerify | Host Profile | Implemented | `src/api/features.ts` |  |
| PATCH | `/host/deactivate/{hostId}` | deactivateHost | Host Profile | Not implemented | `src/api/features.ts` | API function `hostApi.deactivate` exists but nothing calls it. Host active state is edited through `PATCH /host/update`. |
| GET | `/host/{hostId}` | getHostData | Host Profile | Partially implemented | `src/api/features.ts`, `src/layouts/AppShell.tsx`, `src/routes/AppRoutes.tsx` | Only from the host panel's manual "Load host profile" control (`hostApi.getProfile`); there is no public host profile page. |
| DELETE | `/host/remove/{hostId}` | removeHost | Host Profile | Not implemented | — | No call site. Deleting the host profile is irreversible and has no confirming screen; deactivation is the documented softer path. |
| POST | `/api/host/application/apply` | createHostApplication | Host Applications | Implemented | `src/api/features.ts` |  |
| GET | `/api/host/application/{applicationId}` | getHostApplicationById | Host Applications | Not implemented | `src/api/features.ts` | API function exists; the host dashboard uses `/api/host/application/status`. |
| GET | `/api/host/application/status` | getHostApplicationStatus | Host Applications | Implemented | `src/api/features.ts` |  |
| GET | `/api/host/application/photos` | getAllPhotos | Host Applications | Not implemented | `src/api/features.ts` | API function `hostApi.documentPhotos` exists but nothing calls it; uploaded documents are not listed back to the host. |
| GET | `/api/host/application/all` | getAllHostApplications | Host Applications | Not implemented | `src/api/features.ts` | API function `hostApi.allApplications` exists but nothing calls it; no application history screen. |
| POST | `/api/hotel/create` | createHotel | Hotels | Implemented | `src/api/features.ts` |  |
| POST | `/api/hotel/apply` | createHotelApplication | Hotels | Implemented | `src/api/features.ts` |  |
| POST | `/api/hotel/add/photo/{hotelId}` | uploadHotelImage | Hotels | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/hotel/update` | updateHotel | Hotels | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/hotel/deactivate/{hotelId}` | deactivateHotel | Hotels | Not implemented | — | No call site. Hotel active state is edited through `PATCH /api/hotel/update` in the host property panel. |
| GET | `/api/hotel/{hotelId}` | getHotelData | Hotels | Implemented | `src/api/features.ts` |  |
| GET | `/api/hotel/verification/doc/{hotelApplicationId}` | getVerificationDocs | Hotels | Not implemented | — | Host-side document links for the caller's own hotel application. The admin documents endpoint (`/api/admin/.../documents`) is implemented and used in the review dialog. |
| GET | `/api/hotel/refund-policies/options` | getRefundPoliciesOptions | Hotels | Implemented | `src/api/features.ts` |  |
| GET | `/api/hotel/photos` | hotelGetPhotos | Hotels | Implemented | `src/api/features.ts` |  |
| GET | `/api/hotel/bookings/{hotelId}` | getBookings | Hotels | Implemented | `src/api/features.ts` |  |
| GET | `/api/hotel/applications` | getAllHotelApplications | Hotels | Not implemented | `src/api/features.ts` | API function exists; the host dashboard renders only the latest status (`/api/hotel/application/status`), not the history list. |
| GET | `/api/hotel/application/{applicationId}` | getHotelApplicationById | Hotels | Not implemented | `src/api/features.ts` | API function exists; no screen reads a single host-side hotel application. |
| GET | `/api/hotel/application/status` | getHotelApplicationStatus | Hotels | Implemented | `src/api/features.ts` |  |
| DELETE | `/api/hotel/remove/{hotelId}` | removeHotel | Hotels | Not implemented | — | No call site. Removal is described by the contract as deactivation and is not exposed as a destructive control. |
| DELETE | `/api/hotel/delete/photo/{hotelId}` | deleteHotelImage | Hotels | Implemented | `src/api/features.ts` |  |
| POST | `/api/room/create` | createRoom | Rooms | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/room/deactive/{roomId}` | deactivateRoomById | Rooms | Implemented | `src/api/features.ts` |  |
| GET | `/api/room/{roomId}` | getRoomById | Rooms | Not implemented | `src/api/features.ts` | `hostApi`/room lookup exists but no screen calls it; rooms are always read through `GET /api/room/hotel/{hotelId}`. |
| GET | `/api/room/photos/{roomId}` | roomGetPhotos | Rooms | Implemented | `src/api/features.ts` |  |
| GET | `/api/room/hotel/{hotelId}` | getAllRoomOfHotelWithHotelId | Rooms | Implemented | `src/api/features.ts` |  |
| POST | `/api/bookings/{bookingId}/payments` | initiatePayment | Bookings | Implemented | `src/api/features.ts` |  |
| POST | `/api/bookings/{bookingId}/cancel` | cancelBooking | Bookings | Implemented | `src/api/features.ts` |  |
| POST | `/api/bookings/init` | createBooking | Bookings | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/bookings/{bookingId}/guests` | addGuests | Bookings | Implemented | `src/api/features.ts` |  |
| GET | `/api/bookings` | getAllBookings | Bookings | Implemented | `src/api/features.ts` |  |
| POST | `/api/payments/webhook` | handleWebhook | Payments | Not applicable to frontend | — | Server-to-server Razorpay callback verified with an HMAC header; a browser must never call it. |
| POST | `/api/payments/verify` | verifyPayment | Payments | Implemented | `src/api/features.ts` |  |
| GET | `/api/drives/{driveId}/photos` | bookingDriveListPhotos | Booking Drive | Implemented | `src/api/features.ts` |  |
| POST | `/api/drives/{driveId}/photos` | uploadPhoto | Booking Drive | Implemented | `src/api/features.ts` |  |
| GET | `/api/bookings/{bookingId}/drive` | getDrive | Booking Drive | Implemented | `src/api/features.ts` |  |
| DELETE | `/api/drives/{driveId}/photos/{photoId}` | deletePhoto | Booking Drive | Implemented | `src/api/features.ts` |  |
| GET | `/api/travel-plans` | list | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| POST | `/api/travel-plans` | create | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| GET | `/api/travel-plans/{planId}/stay-options` | stayOptions | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| POST | `/api/travel-plans/{planId}/stay-options` | addStayOption | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| GET | `/api/travel-plans/{planId}/messages` | messages | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| POST | `/api/travel-plans/{planId}/messages` | sendMessage | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| GET | `/api/travel-plans/{planId}/itinerary` | itinerary | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| POST | `/api/travel-plans/{planId}/itinerary` | addItinerary | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| POST | `/api/travel-plans/{planId}/invitations` | invite | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| POST | `/api/travel-plans/{planId}/invitations/respond` | respond | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| GET | `/api/travel-plans/{planId}/bookings` | bookings | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| POST | `/api/travel-plans/{planId}/bookings` | linkBooking | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| GET | `/api/travel-plans/{planId}` | get | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| DELETE | `/api/travel-plans/{planId}` | cancel | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| PATCH | `/api/travel-plans/{planId}` | update | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| DELETE | `/api/travel-plans/{planId}/stay-options/{optionId}` | deleteStayOption | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/travel-plans/{planId}/stay-options/{optionId}` | updateStayOption | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/travel-plans/{planId}/status` | status | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| DELETE | `/api/travel-plans/{planId}/itinerary/{itemId}` | deleteItinerary | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| PATCH | `/api/travel-plans/{planId}/itinerary/{itemId}` | updateItinerary | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| PATCH | `/api/travel-plans/{planId}/itinerary/reorder` | reorder | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| GET | `/api/travel-plans/{planId}/members` | members | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| GET | `/api/travel-plans/invitations` | invitations | travel-plan-controller | Implemented | `src/api/features.ts` |  |
| DELETE | `/api/travel-plans/{planId}/members/{userId}` | removeMember | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| DELETE | `/api/travel-plans/{planId}/bookings/{linkId}` | unlinkBooking | travel-plan-controller | Implemented | `src/api/features.ts`, `src/api/plans.test.ts` |  |
| PATCH | `/api/admin/hotel-applications/{applicationId}/reject` | rejectHotelApplication | Admin | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/admin/hotel-applications/{applicationId}/approve` | approveHotelApplication | Admin | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/admin/host-applications/{applicationId}/reject` | rejectHostApplication | Admin | Implemented | `src/api/features.ts` |  |
| PATCH | `/api/admin/host-applications/{applicationId}/approve` | approveHostApplication | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/hotels` | hotels | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/hotels/{hotelId}` | hotel | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/hotel-applications` | hotelApplications | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/hotel-applications/{applicationId}` | hotelApplication | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/hotel-applications/{applicationId}/documents` | hotelApplicationDocuments | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/host-applications` | hostApplications | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/host-applications/{applicationId}` | hostApplication | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/host-applications/{applicationId}/documents` | hostApplicationDocuments | Admin | Implemented | `src/api/features.ts` |  |
| GET | `/api/admin/dashboard/summary` | dashboardSummary | Admin | Implemented | `src/api/features.ts` |  |

## Gaps with no UI entry point

These are documented backend operations this frontend deliberately does not expose, so nothing is presented as finished when it is not:

- **PATCH /host/deactivate/{hostId}** (deactivateHost) — API function `hostApi.deactivate` exists but nothing calls it. Host active state is edited through `PATCH /host/update`.
- **GET /host/{hostId}** (getHostData) — Only from the host panel's manual "Load host profile" control (`hostApi.getProfile`); there is no public host profile page.
- **DELETE /host/remove/{hostId}** (removeHost) — No call site. Deleting the host profile is irreversible and has no confirming screen; deactivation is the documented softer path.
- **GET /api/host/application/{applicationId}** (getHostApplicationById) — API function exists; the host dashboard uses `/api/host/application/status`.
- **GET /api/host/application/photos** (getAllPhotos) — API function `hostApi.documentPhotos` exists but nothing calls it; uploaded documents are not listed back to the host.
- **GET /api/host/application/all** (getAllHostApplications) — API function `hostApi.allApplications` exists but nothing calls it; no application history screen.
- **PATCH /api/hotel/deactivate/{hotelId}** (deactivateHotel) — No call site. Hotel active state is edited through `PATCH /api/hotel/update` in the host property panel.
- **GET /api/hotel/verification/doc/{hotelApplicationId}** (getVerificationDocs) — Host-side document links for the caller's own hotel application. The admin documents endpoint (`/api/admin/.../documents`) is implemented and used in the review dialog.
- **GET /api/hotel/applications** (getAllHotelApplications) — API function exists; the host dashboard renders only the latest status (`/api/hotel/application/status`), not the history list.
- **GET /api/hotel/application/{applicationId}** (getHotelApplicationById) — API function exists; no screen reads a single host-side hotel application.
- **DELETE /api/hotel/remove/{hotelId}** (removeHotel) — No call site. Removal is described by the contract as deactivation and is not exposed as a destructive control.
- **GET /api/room/{roomId}** (getRoomById) — `hostApi`/room lookup exists but no screen calls it; rooms are always read through `GET /api/room/hotel/{hotelId}`.

## Operations not applicable to the frontend

- **GET /api/auth/csrf** (csrf) — CSRF protection was removed from the backend. The client never calls this route, sends no `X-XSRF-TOKEN` header and reads no `XSRF-TOKEN` cookie; the live route returns HTTP 500.
- **POST /api/payments/webhook** (handleWebhook) — Server-to-server Razorpay callback verified with an HMAC header; a browser must never call it.

## Known backend limitations

- `GET /api/hotels/search` returns HTTP 500 from the running backend. With no dates it fails on date arithmetic with a null value; with valid `HotelRequestInfo` fields it fails while casting a `LinkedHashMap` to `Page`. The search screens surface this as an error state with retry — they never fabricate an empty result set.
- `GET /api/auth/csrf` returns HTTP 500 (`csrfToken is null`) because CSRF protection was removed from the backend. The client no longer calls it.
- `POST /api/auth/register` requires the documented `name`/`username`/`email`/`password` shape; the login route requires `identifier` + `password`. Validation failures return HTTP 400 with the backend message, which the forms render verbatim.
- The Razorpay browser checkout SDK is not part of this project, so `POST /api/payments/verify` is only reachable with provider callback values the user pastes in. The UI states plainly that no payment has completed until the backend verification succeeds.
- Travel-plan operations carry no operation-level security in the supplied specification. The screens treat the backend as authoritative and do not claim real-time collaboration; the endpoints are plain REST.

## Verification status

| Check | Result |
| --- | --- |
| Operations cross-checked against saved Swagger HTML | 105/105 method+path pairs match (asserted in `src/test/api-contract.test.ts`) |
| Credentialed CORS preflight from `http://localhost:5173` | `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Credentials: true`, `Access-Control-Allow-Headers: content-type` |
| No CSRF header or bootstrap in the browser | Verified: only `Accept` + `Content-Type` sent on `POST /api/auth/login`; no `/api/auth/csrf` request observed |
| Unauthenticated session probe | `GET /api/auth/me/roles` → 401 (expected), `POST /api/auth/logout` → 200 `{loggedOut:true}` |
| Authenticated flows (profile, bookings, payments, host, admin) | Not exercised — no account credentials were available for this session |
| Hotel search | Fails server-side (HTTP 500) — see limitations above |

Regenerate the operation table by running the classification script logic against `wandora-apis.json` and `src/`; the counts above were produced that way rather than by hand.
