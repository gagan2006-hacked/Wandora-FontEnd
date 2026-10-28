# Wandora API inventory

> Generated from the supplied OpenAPI 3.1 document (Wandora API 0.0.1-SNAPSHOT). OpenAPI is the source of truth; the saved Swagger UI was cross-checked for the exact operation set.

- OpenAPI paths: **93**
- Operations: **105**
- Saved Swagger UI operations matched: **105/105** method/path pairs
- Error envelope: API description says errors use ApiError (success, message, error, dateTime, info); no reusable ApiError component schema is declared.

**Reading role requirements:** this table records operation-level security and explicit tag/operation descriptions. “No additional role specified” is not permission to bypass server authorization. The frontend treats the backend as authoritative. The travel-plan operations have no operation-level security declaration in the supplied JSON.

## Authentication & OTP (8)

### POST /api/auth/verify/otp — verifyOtp

Verify an OTP code.

- **Parameters:** None
- **Request body:** application/json: Schema OtpVerificationReq (required body)
- **Responses:** **202** — OTP accepted and the account is verified<br>No response body documented<br><br>**400** — Request body failed validation or the code is invalid<br>No response body documented<br><br>**401** — No authenticated session or verification failed<br>No response body documented
- **Role/session requirement:** Authenticated session cookie required.
- **Frontend usage:** Verify an OTP code

### POST /api/auth/resendotp — resendOtp

Send a verification OTP to the current user.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — OTP sent<br>No response body documented<br><br>**401** — No authenticated session<br>No response body documented
- **Role/session requirement:** Authenticated session cookie required.
- **Frontend usage:** Send a verification OTP to the current user

### POST /api/auth/register — register

Register a new account.

- **Parameters:** None
- **Request body:** application/json: Schema RegisterRequest (required body)
- **Responses:** **200** — Account created and session cookies written<br>*/*: Schema AuthResponse<br><br>**400** — Request body failed validation<br>*/*: Schema AuthResponse<br><br>**409** — Username or email is already registered<br>*/*: Schema AuthResponse
- **Role/session requirement:** Public route according to operation description.
- **Frontend usage:** Register a new account

### POST /api/auth/refresh — refresh

Refresh the session.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — Session rotated; new cookies written<br>*/*: Schema AuthResponse<br><br>**409** — Refresh token is missing, invalid or expired<br>*/*: Schema AuthResponse
- **Role/session requirement:** Public route according to operation description.
- **Frontend usage:** Refresh the session

### POST /api/auth/logout — logout

Sign out.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — Session cleared; returns {"loggedOut": true}<br>*/*: object
- **Role/session requirement:** Public route according to operation description.
- **Frontend usage:** Sign out

### POST /api/auth/login — login

Sign in with username or email and password.

- **Parameters:** None
- **Request body:** application/json: Schema LoginRequest (required body)
- **Responses:** **200** — Authenticated; session cookies written<br>*/*: Schema AuthResponse<br><br>**400** — Request body failed validation<br>*/*: Schema AuthResponse<br><br>**401** — Invalid credentials or disabled account<br>*/*: Schema AuthResponse
- **Role/session requirement:** Public route according to operation description.
- **Frontend usage:** Sign in with username or email and password

### GET /api/auth/me/roles — getMyRoles

Get my roles.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — Current user id and roles returned<br>*/*: Schema AuthResponse<br><br>**401** — No valid authenticated session<br>*/*: Schema AuthResponse
- **Role/session requirement:** Authenticated session cookie required.
- **Frontend usage:** Get my roles

### GET /api/auth/csrf — csrf

Get the CSRF token. Documented in the supplied OpenAPI only; the running backend has since removed CSRF protection, and `GET /api/auth/csrf` now fails server-side (`csrfToken is null`).

- **Parameters:** query: csrfToken Schema CsrfToken (required)
- **Request body:** None
- **Responses:** **200** — Returns {"token": "..."}<br>*/*: object
- **Role/session requirement:** Public route according to operation description.
- **Frontend usage:** **Not applicable to frontend.** The client no longer calls this route, sends no `X-XSRF-TOKEN` header and does not read any `XSRF-TOKEN` cookie, matching the current backend configuration. Retained here only because the supplied specification still declares it.

## Profile (5)

### PUT /api/me/profile-image — uploadProfileImage

Upload my profile image.

- **Parameters:** None
- **Request body:** multipart/form-data: file: string (binary) (required)
- **Responses:** **200** — Updated profile<br>*/*: Schema UserProfileResponseDto<br><br>**400** — Missing or invalid image file<br>*/*: Schema UserProfileResponseDto<br><br>**401** — No authenticated session<br>*/*: Schema UserProfileResponseDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Upload my profile image

### PUT /api/me/phones — addPhone

Add a phone number.

- **Parameters:** query: phone string (required)
- **Request body:** None
- **Responses:** **200** — Updated profile<br>*/*: Schema UserProfileResponseDto<br><br>**400** — Phone number is missing or invalid<br>*/*: Schema UserProfileResponseDto<br><br>**401** — No authenticated session<br>*/*: Schema UserProfileResponseDto<br><br>**409** — Phone limit reached or number already present<br>*/*: Schema UserProfileResponseDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Add a phone number

### DELETE /api/me/phones — removePhone

Remove a phone number.

- **Parameters:** query: phone string (required)
- **Request body:** None
- **Responses:** **200** — Updated profile<br>*/*: Schema UserProfileResponseDto<br><br>**400** — Phone number is missing or invalid<br>*/*: Schema UserProfileResponseDto<br><br>**401** — No authenticated session<br>*/*: Schema UserProfileResponseDto<br><br>**404** — Phone number not present on the profile<br>*/*: Schema UserProfileResponseDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Remove a phone number

### GET /api/me — getMyProfile

Get my profile.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — Profile returned<br>*/*: Schema UserProfileResponseDto<br><br>**401** — No authenticated session<br>*/*: Schema UserProfileResponseDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get my profile

### PATCH /api/me — updateMyProfile

Update my profile.

- **Parameters:** None
- **Request body:** application/json: Schema UpdateProfileRequestDto (required body)
- **Responses:** **200** — Updated profile<br>*/*: Schema UserProfileResponseDto<br><br>**400** — Request body failed validation<br>*/*: Schema UserProfileResponseDto<br><br>**401** — No authenticated session<br>*/*: Schema UserProfileResponseDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Update my profile

## User discovery (1)

### GET /api/users — getAllUsers

List users.

- **Parameters:** query: page integer (int32) (default 0)<br>query: size integer (int32) (default 20)
- **Request body:** None
- **Responses:** **200** — Page of users<br>*/*: Schema PageUserSummaryDto<br><br>**400** — page must be >= 0 and size must be between 1 and 100<br>*/*: Schema PageUserSummaryDto<br><br>**401** — No authenticated session<br>*/*: Schema PageUserSummaryDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** List users

## Friendships (4)

### POST /api/friendships/requests/{targetUserId} — sendRequest

Send a friend request.

- **Parameters:** path: targetUserId integer (int64) (required)
- **Request body:** None
- **Responses:** **201** — Friend request created<br>*/*: Schema FriendshipResponseDto<br><br>**400** — Invalid target user (for example a request to yourself)<br>*/*: Schema FriendshipResponseDto<br><br>**401** — No authenticated session<br>*/*: Schema FriendshipResponseDto<br><br>**404** — Target user not found<br>*/*: Schema FriendshipResponseDto<br><br>**409** — A friendship or pending request already exists<br>*/*: Schema FriendshipResponseDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Send a friend request

### GET /api/friendships — getFriends

List my friends.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — List of friendships (may be empty)<br>*/*: array<br><br>**401** — No authenticated session<br>*/*: array
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** List my friends

### GET /api/friendships/{targetUserId}/status — checkFriendship

Check friendship status.

- **Parameters:** path: targetUserId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Relationship status returned<br>*/*: Schema FriendshipStatusResponseDto<br><br>**401** — No authenticated session<br>*/*: Schema FriendshipStatusResponseDto<br><br>**404** — Target user not found<br>*/*: Schema FriendshipStatusResponseDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Check friendship status

### DELETE /api/friendships/{targetUserId} — deleteFriendship

Remove a friendship.

- **Parameters:** path: targetUserId integer (int64) (required)
- **Request body:** None
- **Responses:** **204** — Friendship removed<br>No response body documented<br><br>**401** — No authenticated session<br>No response body documented<br><br>**404** — No friendship exists with this user<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Remove a friendship

## Hotel search (4)

### GET /api/hotels/search — getHotelByStartAndEndDate

Search available hotels by stay dates.

- **Parameters:** query: hotelRequestInfo Schema HotelRequestInfo (required)
- **Request body:** None
- **Responses:** **200** — Page of matching hotels<br>*/*: Schema PageHotelSearchInfoDto<br><br>**400** — Query parameters failed validation<br>*/*: Schema PageHotelSearchInfoDto
- **Role/session requirement:** Public (permitAll per tag description).
- **Frontend usage:** Search available hotels by stay dates

### GET /api/hotels/search/{hotelId}/info — getHotelByIDAndStartAndEndDate

Get public hotel details.

- **Parameters:** path: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — Hotel information returned<br>*/*: Schema HotelInfoDto<br><br>**404** — Hotel not found<br>*/*: Schema HotelInfoDto
- **Role/session requirement:** Public (permitAll per tag description).
- **Frontend usage:** Get public hotel details

### GET /api/hotels/search/photos — hotelSearchHotelPhotos

Get public hotel photo links.

- **Parameters:** query: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — List of photo URLs<br>*/*: array<br><br>**400** — hotelId query parameter is missing<br>*/*: array<br><br>**404** — Hotel not found<br>*/*: array
- **Role/session requirement:** Public (permitAll per tag description).
- **Frontend usage:** Get public hotel photo links

### GET /api/hotels/search/photos/{roomId} — hotelSearchRoomPhotos

Get public room photo links.

- **Parameters:** path: roomId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — List of photo URLs<br>*/*: array<br><br>**404** — Room not found<br>*/*: array
- **Role/session requirement:** Public (permitAll per tag description).
- **Frontend usage:** Get public room photo links

## Host profile and verification (9)

### POST /host/phone/verify — phoneVerify

Request an OTP for host phone verification.

- **Parameters:** None
- **Request body:** application/json: Schema PhoneNumberDto (required body)
- **Responses:** **204** — OTP sent<br>No response body documented<br><br>**400** — Request body failed validation<br>No response body documented<br><br>**401** — No authenticated session or verification failed<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Request an OTP for host phone verification

### POST /host/email/verify — emailVerify

Request an OTP for host email verification.

- **Parameters:** None
- **Request body:** application/json: Schema EmailDataDto (required body)
- **Responses:** **204** — OTP sent<br>No response body documented<br><br>**400** — Request body failed validation<br>No response body documented<br><br>**401** — No authenticated session or verification failed<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Request an OTP for host email verification

### POST /host/create — createHost

Create the host profile.

- **Parameters:** None
- **Request body:** application/json: Schema HostDataCreateDto (required body)
- **Responses:** **201** — Host profile created in PENDING_VERIFICATION status<br>*/*: Schema HostDataDto<br><br>**400** — Request body invalid or the user has no approved host application<br>*/*: Schema HostDataDto<br><br>**401** — No authenticated session<br>*/*: Schema HostDataDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Create the host profile

### PATCH /host/update — updateHost

Update the current user's host profile.

- **Parameters:** None
- **Request body:** application/json: Schema HostUpdateDto (required body)
- **Responses:** **200** — Updated host profile<br>*/*: Schema HostDataDto<br><br>**400** — Request body failed validation<br>*/*: Schema HostDataDto<br><br>**401** — No authenticated session<br>*/*: Schema HostDataDto<br><br>**404** — The current user is not a host<br>*/*: Schema HostDataDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Update the current user's host profile

### PATCH /host/phone/otp — otpVerify

Confirm the host phone OTP.

- **Parameters:** None
- **Request body:** application/json: Schema PhoneVerifyDto (required body)
- **Responses:** **202** — OTP accepted<br>No response body documented<br><br>**400** — Request body failed validation<br>No response body documented<br><br>**401** — No authenticated session or verification failed<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Confirm the host phone OTP

### PATCH /host/email/otp — otpEmailVerify

Confirm the host email OTP.

- **Parameters:** None
- **Request body:** application/json: Schema EmailDataVerifyDto (required body)
- **Responses:** **202** — OTP accepted<br>No response body documented<br><br>**400** — Request body failed validation<br>No response body documented<br><br>**401** — No authenticated session or verification failed<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Confirm the host email OTP

### PATCH /host/deactivate/{hostId} — deactivateHost

Deactivate the current user's host profile.

- **Parameters:** path: hostId integer (int64) (required)
- **Request body:** None
- **Responses:** **204** — Host profile deactivated<br>No response body documented<br><br>**401** — No authenticated session<br>No response body documented<br><br>**404** — The current user is not a host<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Deactivate the current user's host profile

### GET /host/{hostId} — getHostData

Get a host profile.

- **Parameters:** path: hostId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Host profile returned<br>*/*: Schema HostDataDto<br><br>**401** — No authenticated session<br>*/*: Schema HostDataDto<br><br>**403** — Caller is not allowed to view this host<br>*/*: Schema HostDataDto<br><br>**404** — Host not found<br>*/*: Schema HostDataDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get a host profile

### DELETE /host/remove/{hostId} — removeHost

Remove the current user's host profile.

- **Parameters:** path: hostId integer (int64) (required)
- **Request body:** None
- **Responses:** **204** — Host profile removed (deactivated)<br>No response body documented<br><br>**401** — No authenticated session<br>No response body documented<br><br>**404** — The current user is not a host<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Remove the current user's host profile

## Host applications (5)

### POST /api/host/application/apply — createHostApplication

Submit a host application.

- **Parameters:** None
- **Request body:** multipart/form-data: application: Schema HostApplicationReqDto (required), pan: string (binary) (required), aadhaar: string (binary) (required), photo: string (binary) (required)
- **Responses:** **201** — Application created with its three verification documents<br>*/*: Schema HostApplicationResponse<br><br>**400** — Invalid application data, invalid image, or an application already exists<br>*/*: Schema HostApplicationResponse<br><br>**401** — No authenticated session<br>*/*: Schema HostApplicationResponse
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Submit a host application

### GET /api/host/application/{applicationId} — getHostApplicationById

Get a host application by id.

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Application found<br>*/*: Schema HostApplicationResponse<br><br>**401** — No authenticated session<br>*/*: Schema HostApplicationResponse<br><br>**403** — Caller is not allowed to view this application<br>*/*: Schema HostApplicationResponse<br><br>**404** — Application not found<br>*/*: Schema HostApplicationResponse
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get a host application by id

### GET /api/host/application/status — getHostApplicationStatus

Get the latest host application status.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — Latest application returned<br>*/*: Schema HostApplicationResponse<br><br>**401** — No authenticated session<br>*/*: Schema HostApplicationResponse<br><br>**404** — No host application exists for the user<br>*/*: Schema HostApplicationResponse
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get the latest host application status

### GET /api/host/application/photos — getAllPhotos

Get download links for the current user's verification documents.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — List of signed download URLs<br>*/*: array<br><br>**401** — No authenticated session<br>*/*: array<br><br>**404** — No host application exists for the user<br>*/*: array
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get download links for the current user's verification documents

### GET /api/host/application/all — getAllHostApplications

List the current user's host applications.

- **Parameters:** query: pageNo integer (int32) (default 0)<br>query: pageSize integer (int32) (default 10)
- **Request body:** None
- **Responses:** **200** — Page of applications (may be empty)<br>*/*: Schema PageHostApplicationResponse<br><br>**401** — No authenticated session<br>*/*: Schema PageHostApplicationResponse<br><br>**404** — User has no host record<br>*/*: Schema PageHostApplicationResponse
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** List the current user's host applications

## Hotels (15)

### POST /api/hotel/create — createHotel

Create a hotel.

- **Parameters:** None
- **Request body:** application/json: Schema HotelCreationReqDto (required body)
- **Responses:** **201** — Hotel created<br>*/*: Schema HotelDataDto<br><br>**400** — Request body failed validation<br>*/*: Schema HotelDataDto<br><br>**401** — No authenticated session or caller is not a host<br>*/*: Schema HotelDataDto<br><br>**404** — No approved hotel application exists for the host<br>*/*: Schema HotelDataDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Create a hotel

### POST /api/hotel/apply — createHotelApplication

Submit a hotel application.

- **Parameters:** None
- **Request body:** multipart/form-data: application: Schema HotelApplicationRequestDto (required), id: string (binary) (required), address_proof: string (binary) (required), hotel_license: string (binary) (required), ownership_proof: string (binary) (required), business_registration: string (binary) (required), gst_certificate: string (binary) (required), refund_policy: Schema RefundPolicyReq (required), pricing_policy: Schema PricingPolicyReq (required)
- **Responses:** **201** — Application created<br>*/*: Schema HotelApplicationResponse<br><br>**400** — Invalid document, invalid image, or the caller is not a host<br>*/*: Schema HotelApplicationResponse<br><br>**401** — No authenticated session<br>*/*: Schema HotelApplicationResponse
- **Role/session requirement:** Authenticated session; host access required by operation description (backend authorization remains authoritative).
- **Frontend usage:** Submit a hotel application

### POST /api/hotel/add/photo/{hotelId} — uploadHotelImage

Upload a hotel photo.

- **Parameters:** path: hotelId integer (int32) (required)
- **Request body:** application/json: file: string (binary) (required)
- **Responses:** **202** — Photo accepted and stored<br>No response body documented<br><br>**400** — Invalid image file<br>No response body documented<br><br>**401** — No authenticated session or caller is not a host<br>No response body documented<br><br>**404** — Hotel not found or not owned by the caller<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Upload a hotel photo

### PATCH /api/hotel/update — updateHotel

Update a hotel.

- **Parameters:** query: hotelId integer (int32) (required)
- **Request body:** application/json: Schema HotelUpdateDto (required body)
- **Responses:** **200** — Updated hotel<br>*/*: Schema HotelDataDto<br><br>**400** — Request body failed validation or hotelId is missing<br>*/*: Schema HotelDataDto<br><br>**401** — No authenticated session or caller is not a host<br>*/*: Schema HotelDataDto<br><br>**403** — Caller does not own this hotel<br>*/*: Schema HotelDataDto<br><br>**404** — Hotel not found<br>*/*: Schema HotelDataDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Update a hotel

### PATCH /api/hotel/deactivate/{hotelId} — deactivateHotel

Deactivate a hotel.

- **Parameters:** path: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **204** — Hotel deactivated<br>No response body documented<br><br>**401** — No authenticated session or caller is not a host<br>No response body documented<br><br>**404** — Hotel not found<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Deactivate a hotel

### GET /api/hotel/{hotelId} — getHotelData

Get a hotel as its owner.

- **Parameters:** path: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — Hotel returned<br>*/*: Schema HotelDataDto<br><br>**401** — No authenticated session or caller is not a host<br>*/*: Schema HotelDataDto<br><br>**403** — Caller does not own this hotel<br>*/*: Schema HotelDataDto<br><br>**404** — Hotel not found<br>*/*: Schema HotelDataDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get a hotel as its owner

### GET /api/hotel/verification/doc/{hotelApplicationId} — getVerificationDocs

Get verification document links for a hotel application.

- **Parameters:** path: hotelApplicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — List of signed download URLs<br>*/*: array<br><br>**401** — No authenticated session or caller is not a host<br>*/*: array<br><br>**404** — Application not found<br>*/*: array<br><br>**500** — The ownership rejection is thrown as an exception type that the global handler maps generically; see the report<br>*/*: array
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get verification document links for a hotel application

### GET /api/hotel/refund-policies/options — getRefundPoliciesOptions

Get refund policy options.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — Refund policy option text<br>*/*: string
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get refund policy options

### GET /api/hotel/photos — hotelGetPhotos

Get my hotel's photo links.

- **Parameters:** query: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — List of signed photo URLs<br>*/*: array<br><br>**401** — No authenticated session or caller is not a host<br>*/*: array<br><br>**404** — Hotel not found or not owned by the caller<br>*/*: array
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get my hotel's photo links

### GET /api/hotel/bookings/{hotelId} — getBookings

List bookings for a hotel.

- **Parameters:** path: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — List of hotel bookings (may be empty)<br>*/*: array<br><br>**401** — No authenticated session or caller is not a host<br>*/*: array<br><br>**404** — Hotel not found or not owned by the caller<br>*/*: array
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** List bookings for a hotel

### GET /api/hotel/applications — getAllHotelApplications

List my hotel applications.

- **Parameters:** query: pageNo integer (int32) (default 0)<br>query: pageSize integer (int32) (default 10)
- **Request body:** None
- **Responses:** **200** — Page of applications<br>*/*: Schema PageHotelApplicationResponse<br><br>**401** — No authenticated session or caller is not a host<br>*/*: Schema PageHotelApplicationResponse<br><br>**404** — Caller has no host record<br>*/*: Schema PageHotelApplicationResponse
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** List my hotel applications

### GET /api/hotel/application/{applicationId} — getHotelApplicationById

Get a hotel application.

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Application found<br>*/*: Schema HotelApplicationResponse<br><br>**401** — No authenticated session or caller is not a host<br>*/*: Schema HotelApplicationResponse<br><br>**403** — Caller does not own this application<br>*/*: Schema HotelApplicationResponse<br><br>**404** — Application not found<br>*/*: Schema HotelApplicationResponse
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get a hotel application

### GET /api/hotel/application/status — getHotelApplicationStatus

Get my latest hotel application status.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — Application status returned<br>*/*: Schema HotelApplicationResponse<br><br>**401** — No authenticated session or caller is not a host<br>*/*: Schema HotelApplicationResponse<br><br>**404** — Caller has no hotel application<br>*/*: Schema HotelApplicationResponse
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get my latest hotel application status

### DELETE /api/hotel/remove/{hotelId} — removeHotel

Remove a hotel.

- **Parameters:** path: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **204** — Hotel removed (deactivated)<br>No response body documented<br><br>**401** — No authenticated session or caller is not a host<br>No response body documented<br><br>**404** — Hotel not found<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Remove a hotel

### DELETE /api/hotel/delete/photo/{hotelId} — deleteHotelImage

Delete a hotel photo.

- **Parameters:** path: hotelId integer (int32) (required)<br>query: filePath string (required)
- **Request body:** None
- **Responses:** **204** — Photo deleted<br>No response body documented<br><br>**401** — No authenticated session or caller is not a host<br>No response body documented<br><br>**404** — Hotel or photo not found<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Delete a hotel photo

## Rooms (5)

### POST /api/room/create — createRoom

Create a room.

- **Parameters:** None
- **Request body:** multipart/form-data: application: Schema RoomApplicationCreateReq (required), photos: array (required)
- **Responses:** **201** — Room created<br>*/*: Schema RoomCreatedResponseDto<br><br>**400** — Invalid room data or invalid photo<br>*/*: Schema RoomCreatedResponseDto<br><br>**401** — No authenticated session or caller is not a host<br>*/*: Schema RoomCreatedResponseDto
- **Role/session requirement:** Authenticated session; host access required by operation description (backend authorization remains authoritative).
- **Frontend usage:** Create a room

### PATCH /api/room/deactive/{roomId} — deactivateRoomById

Deactivate a room.

- **Parameters:** path: roomId integer (int32) (required)
- **Request body:** None
- **Responses:** **204** — Room deactivated<br>*/*: Schema RoomDto<br><br>**401** — No authenticated session<br>*/*: Schema RoomDto<br><br>**404** — Room not found<br>*/*: Schema RoomDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Deactivate a room

### GET /api/room/{roomId} — getRoomById

Get a room.

- **Parameters:** path: roomId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — Room found<br>*/*: Schema RoomDto<br><br>**401** — No authenticated session<br>*/*: Schema RoomDto<br><br>**404** — Room not found<br>*/*: Schema RoomDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get a room

### GET /api/room/photos/{roomId} — roomGetPhotos

Get room photo links.

- **Parameters:** path: roomId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — List of signed photo URLs<br>*/*: array<br><br>**401** — No authenticated session<br>*/*: array<br><br>**404** — Room not found<br>*/*: array
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get room photo links

### GET /api/room/hotel/{hotelId} — getAllRoomOfHotelWithHotelId

List the rooms of a hotel.

- **Parameters:** path: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — List of rooms (may be empty)<br>*/*: array<br><br>**401** — No authenticated session<br>*/*: array<br><br>**404** — Hotel not found<br>*/*: array
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** List the rooms of a hotel

## Bookings (5)

### POST /api/bookings/{bookingId}/payments — initiatePayment

Initiate payment for a booking.

- **Parameters:** path: bookingId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Order created and returned<br>*/*: Schema OrderInfoDto<br><br>**401** — No authenticated session or caller does not own the booking<br>*/*: Schema OrderInfoDto<br><br>**404** — Booking not found<br>*/*: Schema OrderInfoDto<br><br>**409** — Booking is not in a payable state<br>*/*: Schema OrderInfoDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Initiate payment for a booking

### POST /api/bookings/{bookingId}/cancel — cancelBooking

Cancel a booking.

- **Parameters:** path: bookingId integer (int64) (required)
- **Request body:** None
- **Responses:** **204** — Booking cancelled<br>No response body documented<br><br>**401** — No authenticated session or caller does not own the booking<br>No response body documented<br><br>**404** — Booking not found<br>No response body documented<br><br>**409** — Booking cannot be cancelled in its current state<br>No response body documented<br><br>**410** — Booking has expired<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Cancel a booking

### POST /api/bookings/init — createBooking

Initialize a booking.

- **Parameters:** None
- **Request body:** application/json: Schema BookingRequestDto (required body)
- **Responses:** **201** — Booking created in RESERVED status<br>*/*: Schema BookingInfoDto<br><br>**400** — Request body failed validation or the stay is unavailable<br>*/*: Schema BookingInfoDto<br><br>**401** — No authenticated session<br>*/*: Schema BookingInfoDto<br><br>**404** — Hotel or room not found<br>*/*: Schema BookingInfoDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Initialize a booking

### PATCH /api/bookings/{bookingId}/guests — addGuests

Add guests to a booking.

- **Parameters:** path: bookingId integer (int64) (required)
- **Request body:** application/json: array (required body)
- **Responses:** **200** — Updated booking with its guests<br>*/*: Schema BookingInfoDto<br><br>**400** — Request body failed validation<br>*/*: Schema BookingInfoDto<br><br>**401** — No authenticated session or caller does not own the booking<br>*/*: Schema BookingInfoDto<br><br>**404** — Booking or guest user not found<br>*/*: Schema BookingInfoDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Add guests to a booking

### GET /api/bookings — getAllBookings

List the current user's bookings.

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — List of bookings (may be empty)<br>*/*: array<br><br>**401** — No authenticated session<br>*/*: array
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** List the current user's bookings

## Payments (2)

### POST /api/payments/webhook — handleWebhook

Receive a Razorpay payment webhook.

- **Parameters:** header: X-Razorpay-Signature string (required)
- **Request body:** application/json: string (required body)
- **Responses:** **204** — Webhook accepted<br>No response body documented<br><br>**400** — Payload could not be processed<br>No response body documented<br><br>**401** — Missing or invalid Razorpay webhook signature<br>No response body documented<br><br>**500** — Signature verification or payment processing failed<br>No response body documented
- **Role/session requirement:** Razorpay server-to-server request; HMAC signature required.
- **Frontend usage:** **Not applicable to frontend.** Server-to-server callback; the browser must never call it.

### POST /api/payments/verify — verifyPayment

Verify a payment and confirm the booking.

- **Parameters:** None
- **Request body:** application/json: Schema PaymentVerificationDto (required body)
- **Responses:** **200** — Payment verified and booking returned<br>*/*: Schema BookingInfoDto<br><br>**400** — Request body failed validation or payment details are invalid<br>*/*: Schema BookingInfoDto<br><br>**401** — No authenticated session<br>*/*: Schema BookingInfoDto<br><br>**404** — Booking not found<br>*/*: Schema BookingInfoDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Verify a payment and confirm the booking

## Booking drive (4)

### GET /api/drives/{driveId}/photos — bookingDriveListPhotos

List photos in a drive.

- **Parameters:** path: driveId integer (int64) (required)<br>query: page integer (int32) (default 0)<br>query: size integer (int32) (default 20)
- **Request body:** None
- **Responses:** **200** — Page of photos (may be empty)<br>*/*: Schema PageBookingPhotoDto<br><br>**400** — Invalid pagination values<br>*/*: Schema PageBookingPhotoDto<br><br>**401** — No authenticated session or caller is not a booking participant<br>*/*: Schema PageBookingPhotoDto<br><br>**404** — Drive not found<br>*/*: Schema PageBookingPhotoDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** List photos in a drive

### POST /api/drives/{driveId}/photos — uploadPhoto

Upload a photo to a drive.

- **Parameters:** path: driveId integer (int64) (required)
- **Request body:** multipart/form-data: file: string (binary) (required)
- **Responses:** **201** — Photo stored and its metadata returned<br>*/*: Schema BookingPhotoDto<br><br>**400** — Invalid or missing file<br>*/*: Schema BookingPhotoDto<br><br>**401** — No authenticated session or caller is not a booking participant<br>*/*: Schema BookingPhotoDto<br><br>**404** — Drive not found<br>*/*: Schema BookingPhotoDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Upload a photo to a drive

### GET /api/bookings/{bookingId}/drive — getDrive

Get the drive of a booking.

- **Parameters:** path: bookingId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Drive returned<br>*/*: Schema BookingDriveDto<br><br>**401** — No authenticated session or caller is not a booking participant<br>*/*: Schema BookingDriveDto<br><br>**404** — Booking not found<br>*/*: Schema BookingDriveDto
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Get the drive of a booking

### DELETE /api/drives/{driveId}/photos/{photoId} — deletePhoto

Delete a photo from a drive.

- **Parameters:** path: driveId integer (int64) (required)<br>path: photoId integer (int64) (required)
- **Request body:** None
- **Responses:** **204** — Photo deleted<br>No response body documented<br><br>**401** — No authenticated session or caller is not a booking participant<br>No response body documented<br><br>**404** — Drive or photo not found<br>No response body documented
- **Role/session requirement:** Authenticated session cookie (ACCESS_TOKEN) required; no additional role is specified.
- **Frontend usage:** Delete a photo from a drive

## Collaborative travel plans (25)

### GET /api/travel-plans — list

- **Parameters:** query: page integer (int32) (default 0)<br>query: size integer (int32) (default 20)
- **Request body:** None
- **Responses:** **200** — OK<br>*/*: Schema PagePlanResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the GET operation for its documented collaborative travel plans workflow.

### POST /api/travel-plans — create

- **Parameters:** None
- **Request body:** application/json: Schema CreatePlanRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema PlanResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the POST operation for its documented collaborative travel plans workflow.

### GET /api/travel-plans/{planId}/stay-options — stayOptions

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>*/*: array
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the GET operation for its documented collaborative travel plans workflow.

### POST /api/travel-plans/{planId}/stay-options — addStayOption

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema StayOptionRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema StayOptionResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the POST operation for its documented collaborative travel plans workflow.

### GET /api/travel-plans/{planId}/messages — messages

- **Parameters:** path: planId integer (int64) (required)<br>query: page integer (int32) (default 0)<br>query: size integer (int32) (default 20)
- **Request body:** None
- **Responses:** **200** — OK<br>*/*: Schema PageMessageResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the GET operation for its documented collaborative travel plans workflow.

### POST /api/travel-plans/{planId}/messages — sendMessage

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema MessageRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema MessageResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the POST operation for its documented collaborative travel plans workflow.

### GET /api/travel-plans/{planId}/itinerary — itinerary

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>*/*: array
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the GET operation for its documented collaborative travel plans workflow.

### POST /api/travel-plans/{planId}/itinerary — addItinerary

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema ItineraryRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema ItineraryResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the POST operation for its documented collaborative travel plans workflow.

### POST /api/travel-plans/{planId}/invitations — invite

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema InvitationRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema MemberResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the POST operation for its documented collaborative travel plans workflow.

### POST /api/travel-plans/{planId}/invitations/respond — respond

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema InvitationResponseRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema MemberResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the POST operation for its documented collaborative travel plans workflow.

### GET /api/travel-plans/{planId}/bookings — bookings

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>*/*: array
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the GET operation for its documented collaborative travel plans workflow.

### POST /api/travel-plans/{planId}/bookings — linkBooking

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema BookingLinkRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema BookingLinkResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the POST operation for its documented collaborative travel plans workflow.

### GET /api/travel-plans/{planId} — get

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>*/*: Schema PlanResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the GET operation for its documented collaborative travel plans workflow.

### DELETE /api/travel-plans/{planId} — cancel

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>No response body documented
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the DELETE operation for its documented collaborative travel plans workflow.

### PATCH /api/travel-plans/{planId} — update

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema UpdatePlanRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema PlanResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the PATCH operation for its documented collaborative travel plans workflow.

### DELETE /api/travel-plans/{planId}/stay-options/{optionId} — deleteStayOption

- **Parameters:** path: planId integer (int64) (required)<br>path: optionId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>No response body documented
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the DELETE operation for its documented collaborative travel plans workflow.

### PATCH /api/travel-plans/{planId}/stay-options/{optionId} — updateStayOption

- **Parameters:** path: planId integer (int64) (required)<br>path: optionId integer (int64) (required)
- **Request body:** application/json: Schema StayOptionUpdateRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema StayOptionResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the PATCH operation for its documented collaborative travel plans workflow.

### PATCH /api/travel-plans/{planId}/status — status

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema StatusRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema PlanResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the PATCH operation for its documented collaborative travel plans workflow.

### DELETE /api/travel-plans/{planId}/itinerary/{itemId} — deleteItinerary

- **Parameters:** path: planId integer (int64) (required)<br>path: itemId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>No response body documented
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the DELETE operation for its documented collaborative travel plans workflow.

### PATCH /api/travel-plans/{planId}/itinerary/{itemId} — updateItinerary

- **Parameters:** path: planId integer (int64) (required)<br>path: itemId integer (int64) (required)
- **Request body:** application/json: Schema UpdateItineraryRequest (required body)
- **Responses:** **200** — OK<br>*/*: Schema ItineraryResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the PATCH operation for its documented collaborative travel plans workflow.

### PATCH /api/travel-plans/{planId}/itinerary/reorder — reorder

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** application/json: Schema ReorderRequest (required body)
- **Responses:** **200** — OK<br>*/*: array
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the PATCH operation for its documented collaborative travel plans workflow.

### GET /api/travel-plans/{planId}/members — members

- **Parameters:** path: planId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>*/*: array
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the GET operation for its documented collaborative travel plans workflow.

### GET /api/travel-plans/invitations — invitations

- **Parameters:** query: page integer (int32) (default 0)<br>query: size integer (int32) (default 20)
- **Request body:** None
- **Responses:** **200** — OK<br>*/*: Schema PageInvitationResponse
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the GET operation for its documented collaborative travel plans workflow.

### DELETE /api/travel-plans/{planId}/members/{userId} — removeMember

- **Parameters:** path: planId integer (int64) (required)<br>path: userId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>No response body documented
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the DELETE operation for its documented collaborative travel plans workflow.

### DELETE /api/travel-plans/{planId}/bookings/{linkId} — unlinkBooking

- **Parameters:** path: planId integer (int64) (required)<br>path: linkId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — OK<br>No response body documented
- **Role/session requirement:** No operation-level security or role requirement is specified in this OpenAPI entry; confirm backend authorization before relying on it.
- **Frontend usage:** Use the DELETE operation for its documented collaborative travel plans workflow.

## Admin (13)

### PATCH /api/admin/hotel-applications/{applicationId}/reject — rejectHotelApplication

Reject a hotel application (admin).

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** application/json: Schema RejectionRequest (required body)
- **Responses:** **200** — Application rejected with the stored reason<br>*/*: Schema HotelApplicationDetails<br><br>**400** — Rejection reason is missing, blank or longer than 1000 characters<br>*/*: Schema HotelApplicationDetails<br><br>**401** — No authenticated session<br>*/*: Schema HotelApplicationDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema HotelApplicationDetails<br><br>**404** — Application not found<br>*/*: Schema HotelApplicationDetails<br><br>**409** — Application is not pending review (repeated transition)<br>*/*: Schema HotelApplicationDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Reject a hotel application (admin)

### PATCH /api/admin/hotel-applications/{applicationId}/approve — approveHotelApplication

Approve a hotel application (admin).

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Application approved; the host user now also has the HOST role<br>*/*: Schema HotelApplicationDetails<br><br>**401** — No authenticated session<br>*/*: Schema HotelApplicationDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema HotelApplicationDetails<br><br>**404** — Application not found<br>*/*: Schema HotelApplicationDetails<br><br>**409** — Application is not pending review (repeated transition)<br>*/*: Schema HotelApplicationDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Approve a hotel application (admin)

### PATCH /api/admin/host-applications/{applicationId}/reject — rejectHostApplication

Reject a host application (admin).

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** application/json: Schema RejectionRequest (required body)
- **Responses:** **200** — Application rejected with the stored reason<br>*/*: Schema HostApplicationDetails<br><br>**400** — Rejection reason is missing, blank or longer than 1000 characters<br>*/*: Schema HostApplicationDetails<br><br>**401** — No authenticated session<br>*/*: Schema HostApplicationDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema HostApplicationDetails<br><br>**404** — Application not found<br>*/*: Schema HostApplicationDetails<br><br>**409** — Application is not pending review (repeated transition)<br>*/*: Schema HostApplicationDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Reject a host application (admin)

### PATCH /api/admin/host-applications/{applicationId}/approve — approveHostApplication

Approve a host application (admin).

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Application approved; the applicant now also has the HOST role<br>*/*: Schema HostApplicationDetails<br><br>**401** — No authenticated session<br>*/*: Schema HostApplicationDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema HostApplicationDetails<br><br>**404** — Application not found<br>*/*: Schema HostApplicationDetails<br><br>**409** — Application is not pending review (repeated transition)<br>*/*: Schema HostApplicationDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Approve a host application (admin)

### GET /api/admin/hotels — hotels

List hotels (admin).

- **Parameters:** query: active boolean<br>query: city string<br>query: page integer (int32) (default 0)<br>query: size integer (int32) (default 20)
- **Request body:** None
- **Responses:** **200** — Page of hotels (may be empty)<br>*/*: Schema PageHotelSummary<br><br>**400** — page must be non-negative and size positive<br>*/*: Schema PageHotelSummary<br><br>**401** — No authenticated session<br>*/*: Schema PageHotelSummary<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema PageHotelSummary
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** List hotels (admin)

### GET /api/admin/hotels/{hotelId} — hotel

Get a hotel (admin).

- **Parameters:** path: hotelId integer (int32) (required)
- **Request body:** None
- **Responses:** **200** — Hotel details<br>*/*: Schema HotelDetails<br><br>**401** — No authenticated session<br>*/*: Schema HotelDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema HotelDetails<br><br>**404** — Hotel not found<br>*/*: Schema HotelDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Get a hotel (admin)

### GET /api/admin/hotel-applications — hotelApplications

List hotel applications (admin).

- **Parameters:** query: status string<br>query: page integer (int32) (default 0)<br>query: size integer (int32) (default 20)
- **Request body:** None
- **Responses:** **200** — Page of applications<br>*/*: Schema PageHotelApplicationDetails<br><br>**400** — Invalid pagination or unknown status value<br>*/*: Schema PageHotelApplicationDetails<br><br>**401** — No authenticated session<br>*/*: Schema PageHotelApplicationDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema PageHotelApplicationDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** List hotel applications (admin)

### GET /api/admin/hotel-applications/{applicationId} — hotelApplication

Get a hotel application (admin).

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Application details<br>*/*: Schema HotelApplicationDetails<br><br>**401** — No authenticated session<br>*/*: Schema HotelApplicationDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema HotelApplicationDetails<br><br>**404** — Application not found<br>*/*: Schema HotelApplicationDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Get a hotel application (admin)

### GET /api/admin/hotel-applications/{applicationId}/documents — hotelApplicationDocuments

Get hotel application document links (admin).

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Document metadata with signed download URLs<br>*/*: array<br><br>**401** — No authenticated session<br>*/*: array<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: array<br><br>**404** — Application not found<br>*/*: array
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Get hotel application document links (admin)

### GET /api/admin/host-applications — hostApplications

List host applications (admin).

- **Parameters:** query: status string<br>query: page integer (int32) (default 0)<br>query: size integer (int32) (default 20)
- **Request body:** None
- **Responses:** **200** — Page of applications<br>*/*: Schema PageHostApplicationDetails<br><br>**400** — Invalid pagination or unknown status value<br>*/*: Schema PageHostApplicationDetails<br><br>**401** — No authenticated session<br>*/*: Schema PageHostApplicationDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema PageHostApplicationDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** List host applications (admin)

### GET /api/admin/host-applications/{applicationId} — hostApplication

Get a host application (admin).

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Application details<br>*/*: Schema HostApplicationDetails<br><br>**401** — No authenticated session<br>*/*: Schema HostApplicationDetails<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema HostApplicationDetails<br><br>**404** — Application not found<br>*/*: Schema HostApplicationDetails
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Get a host application (admin)

### GET /api/admin/host-applications/{applicationId}/documents — hostApplicationDocuments

Get host application document links (admin).

- **Parameters:** path: applicationId integer (int64) (required)
- **Request body:** None
- **Responses:** **200** — Document metadata with signed download URLs<br>*/*: array<br><br>**401** — No authenticated session<br>*/*: array<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: array<br><br>**404** — Application not found<br>*/*: array
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Get host application document links (admin)

### GET /api/admin/dashboard/summary — dashboardSummary

Get dashboard statistics (admin).

- **Parameters:** None
- **Request body:** None
- **Responses:** **200** — Dashboard summary<br>*/*: Schema DashboardSummary<br><br>**401** — No authenticated session<br>*/*: Schema DashboardSummary<br><br>**403** — Authenticated user does not have the ADMIN role<br>*/*: Schema DashboardSummary
- **Role/session requirement:** Authenticated session; persisted ADMIN role (ROLE_ADMIN in Spring Security). OpenAPI says non-admin receives 403.
- **Frontend usage:** Get dashboard statistics (admin)

## Contract notes

- A cookieAuth security requirement is an OpenAPI cookie API-key declaration named ACCESS_TOKEN; browser code must never read it. The backend sets the actual HttpOnly cookie.
- GET /api/auth/csrf is still declared in the supplied OpenAPI, but the running backend has removed CSRF protection; the route returns HTTP 500 and the client sends no CSRF header or bootstrap. Live backend behavior is authoritative over the saved specification here.
- Operations under travel-plan-controller have no declared operation-level security in the supplied OpenAPI JSON; verify server authorization before implementing collaborative trip features.
- Some request content types or schemas are surprising as documented (for example, binary upload declarations); keep exact contract until backend implementation confirms otherwise.
