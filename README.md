# Wandora frontend

Wandora is a React + Vite + TypeScript frontend foundation for a travel and accommodation platform. Phase 1 delivers the public design system, responsive page shells, documented cookie-session auth flow, a credentialed shared Axios client (no CSRF — the backend removed it), persisted-role route guards, and the API contract inventory. Business feature pages are intentionally not represented as working when their live API workflows have not been built.

## Run locally

Requirements: Node.js 20+ and npm.

```sh
npm install
cp .env.example .env
npm run dev
```

Vite serves at `http://localhost:5173`. The development backend default is `http://localhost:8080`.
Without `VITE_API_BASE_URL`, the browser talks to the Vite origin and the dev server proxies `/api` and
the `/host` API paths (`/host/create`, `/host/update`, `/host/email`, `/host/phone`) to
`VITE_API_PROXY_TARGET`. Session cookies therefore stay first-party and no local CORS setup is needed.
Set `VITE_API_BASE_URL` to call the backend directly instead; that path needs the backend's credentialed
CORS allowlist for the exact frontend origin. Production builds keep the documented
`http://localhost:8080` fallback when no base URL is configured.

## UI, navigation and accessibility

- One shared authenticated shell (`src/layouts/AppShell.tsx`) renders the header, role-aware navigation,
  workspace switcher, account menu and mobile drawer for the traveler, host and admin areas. Pages render
  through its router outlet, so no page defines a second header.
- `src/auth/redirect.ts` holds the navigation rules: the post-login destination prefers the protected page
  the visitor originally requested (path + query + hash) and falls back to the role-appropriate home;
  unsafe or external redirects are rejected.
- `src/routes/guards.tsx` exposes `RequireAuth`, `RequireRole` and `RequireGuest`. Guards wait for session
  initialization, preserve the intended destination, and keep signed-in users away from `/login` and
  `/register`.
- Design tokens (colors, type, spacing, radii, shadows, breakpoints) live in the "design system v3" section
  of `src/styles.css`; shared buttons, forms, cards, badges, pagination, confirmation dialogs and
  loading/error/empty states are reused across every screen.
- Responsive coverage is verified at 375, 430, 768, 1024, 1366 and 1440 px; the header collapses into a
  keyboard-accessible drawer below 960 px.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Contract documentation

- [Complete API operation inventory](docs/api-inventory.md)
- [User flows and phase-one scope](docs/user-flows.md)
- [Security, CORS, and integration assumptions](docs/security-and-integration.md)

The root [wandora-apis.json](wandora-apis.json) is the supplied OpenAPI specification. [Wandora.html](Wandora.html) is the supplied saved Swagger UI used to cross-check its operation list.
