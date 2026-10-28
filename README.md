# Wandora frontend

Wandora is a React + Vite + TypeScript frontend foundation for a travel and accommodation platform. Phase 1 delivers the public design system, responsive page shells, documented cookie-session auth flow, a credentialed shared Axios client (no CSRF — the backend removed it), persisted-role route guards, and the API contract inventory. Business feature pages are intentionally not represented as working when their live API workflows have not been built.

## Run locally

Requirements: Node.js 20+ and npm.

```sh
npm install
cp .env.example .env
npm run dev
```

Vite serves at `http://localhost:5173`. The development backend default is `http://localhost:8080`; configure the backend's credentialed CORS allowlist for the exact origin `http://localhost:5173`.

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
