# CredChain React

Production frontend for the CredChain decentralized credential platform.

## Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 (`@theme` tokens, no config file)
- shadcn/ui + Radix primitives (in `src/shared/components/ui/`)
- TanStack Query + axios for server state
- Zustand for client state (auth + UI)
- React Router 7 with lazy routes
- React Hook Form + Zod for forms
- i18next (en + id) mirroring backend locales
- Google OAuth via `@react-oauth/google`
- Vitest + Testing Library + MSW for unit/integration tests
- Playwright for E2E

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the full reference.

## Quick start

```bash
cp .env.example .env
# Fill in VITE_GOOGLE_CLIENT_ID

npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:8080` (set `VITE_API_PROXY` to override).
The Go backend (`../CredChain_Golang`) must be running for auth and data flows.

## Scripts

```bash
npm run dev              # Vite dev server (port 5173)
npm run build            # tsc + vite build
npm run preview          # preview production build
npm run lint             # ESLint
npm run format           # Prettier
npm run test             # Vitest run
npm run test:watch       # Vitest watch
npm run test:coverage    # Vitest with coverage
npm run test:e2e         # Playwright
npm run check-locales    # Verify locale sync with Go backend
```

## Architecture

```
src/
  app/         # cross-cutting wiring (providers, store, router, App)
  feature/     # business domains (auth, user, credential, dashboard)
  shared/      # cross-feature code (api, auth, components, hooks, i18n, lib, types)
  styles/      # Tailwind entry + tokens
  test/        # Vitest setup, MSW handlers, fixtures
```

Hard rules:
- `feature/<X>` may import from `shared/` — never the reverse, never cross-feature
- All API calls via TanStack Query hooks in `feature/*/api/`
- All tokens via `@theme` in `styles/index.css` — no hex codes in components
- All classNames via `cn()` from `shared/lib/cn.ts` — no template-string concatenation
- shadcn/ui components in `shared/components/ui/` — restyle to tokens before use
- Role logic only in `shared/auth/role.ts`
- Named exports only — no default exports

## Backend integration

- Auth tokens are httpOnly cookies set by the Go backend (axios `withCredentials: true`)
- Response envelope `{ code, message, data? }` is unwrapped by the response interceptor
- 401 triggers a single silent refresh attempt before signing out
- Backend response codes (6-digit AABBCC) map to i18n keys via `src/shared/api/codes.ts`

## See also

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — full visual + engineering spec
- [AGENTS.md](./AGENTS.md) — instructions for AI assistants working in this repo
- `../CredChain_Golang/` — Go backend
- `../CredChain_Solidity/` — smart contracts
