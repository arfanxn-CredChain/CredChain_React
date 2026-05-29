# CredChain React - Agent Instructions

Production frontend for the CredChain decentralized credential platform. This file is the authoritative reference for AI assistants and engineers working in `CredChain_React/`. For the full visual + engineering specification, see `DESIGN_SYSTEM.md`. Backend contract details live in `../CredChain_Golang/AGENTS.md`.

## Repo Position

Sibling to `CredChain_Golang/` (Go backend) and `CredChain_Solidity/` (smart contracts). Talks to Go backend over `/api`. Never imports from `CredChain_React_Demo/` (deprecated - hard migration only).

## Critical Commands

```bash
npm install                  # one-time, after cloning
npm run dev                  # Vite dev server on port 5173 (proxies /api -> :8080)
npm run build                # tsc -b && vite build (strict TypeScript)
npm run preview              # serve production build locally
npm run lint                 # ESLint
npm run format               # Prettier write
npm run format:check         # Prettier check (CI)
npm run test                 # Vitest run
npm run test:watch           # Vitest watch mode
npm run test:coverage        # Vitest with v8 coverage
npm run test:e2e             # Playwright tests (auth, public, a11y)
npm run check-locales        # Verify en.json/id.json sync with backend locales/
```

**Env setup:** copy `.env.example` to `.env.local` and fill `VITE_GOOGLE_CLIENT_ID`. Tests use `.env.test` (committed, placeholder values). Production needs `VITE_GOOGLE_CLIENT_ID` set in deployment env.

**Required env vars** (validated at startup in `src/shared/lib/env.ts`):
- `VITE_GOOGLE_CLIENT_ID` - fatal if missing
- `VITE_API_BASE_URL` - defaults to `/api`
- `VITE_APP_ENV` - development | staging | production

Engine note: tested on Node 20.20.2; `package.json` does not pin engines.

## Project Architecture

```
CredChain_React/
  public/
  e2e/                       # Playwright specs (auth, public, a11y)
  scripts/                   # check-locales-sync.mjs
  src/
    app/                     # cross-cutting wiring
      App.tsx                # RouterProvider mount
      providers.tsx          # QueryClient + I18n + GoogleOAuth + ErrorBoundary + OfflineBanner + Toaster
      router.tsx             # createBrowserRouter with lazyRoute() helper
      SessionHydrator.tsx    # validates session via /users/self, syncs i18n with Zustand locale
      store/index.ts         # Zustand: auth slice + UI slice (persist middleware)
    feature/                 # one folder per business domain
      auth/                  # Login + 2 hooks (useGoogleLogin, useLogout)
      user/                  # 5 screens, 9 hooks, schemas, 2 row/badge components
      credential/            # 5 screens, 6 hooks, schemas, card + status + row components
      dashboard/             # Dashboard + Settings (with i18n switcher)
    shared/
      api/                   # client + envelope + codes + query-client
      auth/                  # role + guards
      components/            # 14 shared components
        ui/                  # 11 shadcn-style primitives
        layout/              # AuthLayout, PublicLayout, DashboardLayout, Sidebar, TopNav
      hooks/                 # useT, useDebouncedValue, useOnline
      i18n/                  # config + en.json + id.json
      lib/                   # cn, env, format, forms, hash, notify
      types/                 # api.ts (DTO mirrors)
    styles/index.css         # @theme tokens + base + utilities + reduced-motion + print
    test/                    # setup, fixtures, MSW handlers, TestProviders
  .env.example, .env.test    # .env.test committed, used by Vitest
  components.json            # shadcn/ui config
  DESIGN_SYSTEM.md           # full design + engineering spec
  AGENTS.md                  # this file
  README.md
  eslint.config.js, prettier.config.js
  tsconfig.json + .app.json + .node.json
  vite.config.ts, vitest.config.ts, playwright.config.ts
  package.json
```

### Module Boundary Rules (HARD)

1. `feature/<X>` may import from `shared/` — never the reverse
2. `feature/<X>` may NOT import from `feature/<Y>` — share via `shared/` if needed
3. `shared/components/ui/` is the only place where Radix primitives are imported
4. `shared/api/client.ts` is the only place where axios is imported directly
5. `app/` wires everything; do not put business logic here
6. Avoid deep barrel re-exports; feature folders may have a single top-level `index.ts`

### Path Aliases (in `tsconfig.app.json` + `vite.config.ts` + `vitest.config.ts`)

- `@/*` → `src/*`
- `@app/*` → `src/app/*`
- `@feature/*` → `src/feature/*`
- `@shared/*` → `src/shared/*`
- `@ui/*` → `src/shared/components/ui/*`

## Tech Stack (frozen versions)

| Layer | Choice | Version |
|---|---|---|
| Language | TypeScript | ~5.9 strict + verbatimModuleSyntax |
| Framework | React | ^19 |
| Build | Vite | ^7 |
| Styling | Tailwind CSS v4 | ^4.2 (@theme directive, no config file) |
| UI primitives | shadcn/ui + Radix UI | latest |
| Icons | lucide-react | latest (named imports only) |
| Routing | React Router | ^7 (lazy via `lazyRoute()` helper) |
| Server state | TanStack Query | ^5 |
| HTTP | axios | ^1 (with interceptors) |
| Client state | Zustand | ^5 (with persist middleware) |
| Forms | React Hook Form | ^7 |
| Validation | Zod | ^3 |
| i18n | i18next + react-i18next | ^23 / ^14 |
| Auth | @react-oauth/google | ^0.12 |
| Toasts | sonner | ^1 (via `notify` helper) |
| Class merge | clsx + tailwind-merge | latest (via `cn()`) |
| Tests | Vitest 3 + Testing Library + MSW 2 | |
| E2E | Playwright + @axe-core/playwright | ^1 / ^4 |

## Design System (locked)

Palette (from `src/styles/index.css` `@theme` block):
- `navy` `#0F172A` — primary brand, body text, sidebar
- `gold` `#C9A227` — accent, premium CTAs, focus ring
- `base` `#F8FAFC` — page background
- `surface` `#FFFFFF` — card / elevated surface
- `error` `#B91C1C` — destructive, revoked state
- Extended `gray-50..900`, semantic aliases (primary, secondary, muted, etc.), status (success/info/warning)

Typography (Google Fonts, loaded in `index.html`):
- `font-display` → Fraunces (serif) — headings, hero, stat values
- `font-sans` → DM Sans (geometric) — body, buttons, inputs, labels
- `font-mono` → JetBrains Mono — hashes, IDs, addresses

Radius defaults: `rounded-xl` (inputs/buttons), `rounded-2xl` (cards), `rounded-md` (badges), `rounded-full` (pills/avatars).

Tinted shadows (signature): `shadow-md shadow-navy/20`, `shadow-lg shadow-gold/20`, `shadow-error/20` under brand-colored elements.

`<DecorBlob>` — single soft radial gradient per hero area, never multiple competing blobs.

See `DESIGN_SYSTEM.md` Section 6.5 for the full visual language principles (anti-patterns, density philosophy, asymmetry rules).

## State Management

**Two-layer model — never mix:**

| Layer | Tool | What lives here |
|---|---|---|
| Server state | TanStack Query | All API data: users, credentials, paginated lists |
| Client state | Zustand `useStore` | Current user session, UI (sidebar, locale) |

`useStore` is persisted to localStorage via `persist` middleware. Only `user`, `isAuthenticated`, and `locale` are persisted.

Query key conventions (in `feature/*/api/keys.ts`):
```ts
userKeys = { all, list, detail, self }
credentialKeys = { all, list, detail, mine }
```

All mutations invalidate the `all()` key on success.

## API Integration

Single axios instance at `@shared/api/client.ts` with:
- `withCredentials: true` — sends httpOnly cookies automatically
- 30s timeout
- Request interceptor: adds `Accept-Language` from Zustand locale
- Response interceptor: unwraps `{code, message, data}` envelope → returns just `data`
- Error interceptor:
  - 401 → single silent refresh attempt (deduplicated via `refreshInFlight` promise) → retry with `X-Retry: 1` header
  - 429 → maps to `system.rate_limited` or `system.rate_limited_with_retry` if `Retry-After` header present
  - other → wraps in `ApiError` with translated `messageKey`

`ApiError` (`@shared/api/envelope.ts`) carries `status`, `code`, `messageKey`, `fieldErrors`, and original `cause`. Use `isApiError(e)` type guard.

Backend response codes (6-digit `AABBCC`) map to i18n keys via `CODE_TO_MESSAGE_KEY` in `@shared/api/codes.ts`. **Keep in sync with `CredChain_Golang/domain/codes.go`** — when backend adds a code, add it here AND to both locale files.

## Authentication

**Flow:** Google OAuth ID token → `POST /api/auth/google` → backend sets httpOnly cookies (access + refresh) → Zustand stores `UserDTO` only (NOT tokens).

**Frontend never reads or writes tokens.** Axios sends them automatically via cookies.

**Silent refresh:** axios interceptor catches 401, calls `POST /api/auth/refresh` once, retries original request. On refresh failure, clears Zustand session and redirects to `/login`.

**Session hydration:** `SessionHydrator` (mounted under `Providers`) calls `GET /users/self` on mount. If 200 → sets user. If 401 → clears session. Renders full-page spinner until first load completes.

**Email update with Google reauth:** `UserSelfEmail` is a 2-step form. Step 1 captures new email. Step 2 prompts Google sign-in for the new address; the resulting ID token is sent to `PUT /users/self/email` along with the email. Backend verifies the token's email matches.

**Logout:** `POST /api/auth/logout` clears cookies, then frontend clears Zustand + Query cache.

## Routing & Authorization

**Single source of role logic:** `@shared/auth/role.ts` exports `Role` enum, `ROLE_LEVEL` hierarchy, `canAccess(userRole, minRole)`, `canAccessAny(userRole, allowed[])`, `formatRole`.

```
None(0) - on-chain only, never persisted
Holder(1) - receives credentials
Issuer(2) - issues/revokes/verifies
Admin(3) - manages users
SuperAdmin(4) - bootstrapped via Go CLI only
```

**Guards** (`@shared/auth/guards.tsx`):
- `ProtectedRoute` — redirects unauthenticated to `/login`, role-mismatched to fallback
- `PublicRoute` — redirects authenticated away (login is public-only)
- `RoleGate` — inline UI gating for show/hide based on role

**Lazy routes:** every protected route is loaded via `lazyRoute()` helper in `app/router.tsx`. The helper wraps the component in `Suspense` (with `LoadingSpinner` fallback) and attaches `RouteErrorBoundary` automatically. This means **route components must be named exports** — the helper takes the export name as a string.

## Forms & Validation

**Stack:** React Hook Form + Zod via `@hookform/resolvers/zod`.

**Schemas mirror Go Ozzo rules** (see `feature/*/schemas/`):
- E.164 phone via `STRICT_E164` regex `/^\+[1-9]\d{6,14}$/`
- ISO date via `/^\d{4}-\d{2}-\d{2}$/`
- Email max 256, name 1-256, batch limits 50-100
- `optionalEmptyToNull` helper treats empty strings as undefined

**Field arrays for batch forms** (`UserCreate`, `CredentialIssue`):
```ts
const { fields, append, remove } = useFieldArray({ control: form.control, name: "users" });
```

**Server validation errors:** mutation hooks accept the form via generic param (`useCreateUsers<T>(form)`), and `setServerErrors(form, errors)` from `@shared/lib/forms` maps `{ field: messageKey }` shape onto `form.setError`.

**Always wire `notify` for non-validation errors:**
```ts
onError: (error) => {
  if (isApiError(error) && error.fieldErrors && form) {
    setServerErrors(form, error.fieldErrors);
  } else if (isApiError(error)) {
    notify.error(error.messageKey);
  }
}
```

## Internationalization

**Locales:** `en` and `id` only, mirroring backend `CredChain_Golang/locales/`.

**Sync verification:** `npm run check-locales` reads both files, flattens keys, and exits 1 if any backend key is missing from frontend. Run in CI or pre-commit.

**Backend code → frontend key:** `CODE_TO_MESSAGE_KEY` map in `@shared/api/codes.ts`. Mirrors `CredChain_Golang/infrastructure/http/responder/mapper.go`. Adding a domain code requires updating: (a) this map, (b) both `locales/{en,id}.json` files, (c) backend's `CodeToMessageKey` and `HttpCodes` maps.

**Locale state:** `useStore.locale` is the source of truth. `LanguageSwitcher` updates both i18next AND Zustand. `SessionHydrator` syncs `i18next.changeLanguage()` with stored locale on mount. Axios sends `Accept-Language` header so backend serves the matching locale.

## Component Recipes

**Always use `cn()`** from `@shared/lib/cn` for className composition. Never template-string concatenation:

```tsx
// CORRECT
className={cn("base classes", isActive && "active", className)}

// WRONG - tailwind-merge can't dedupe
className={`base classes ${isActive ? "active" : ""} ${className}`}
```

**Always use `notify`** from `@shared/lib/notify` for toasts. It auto-translates keys via i18n and applies consistent styling. Available: `notify.success`, `notify.error`, `notify.info`, `notify.warning`.

**shadcn primitives** (in `@ui/*`):
- `Button` — variants: `primary` (navy), `gold`, `destructive`, `outline`, `ghost`, `link`, `dashed`. Sizes: `sm`, `md`, `lg`, `icon`, `icon-mobile`.
- `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter`
- `Input` — accepts `leadingIcon` and `trailingAction` props
- `Label` — Radix-based, supports peer-disabled
- `Select` — full Radix Select with `SelectValue`
- `Dialog` + `ConfirmDialog` + `useConfirm()` hook (NEVER use `window.confirm`)
- `DropdownMenu` — full Radix DropdownMenu with `destructive` item variant
- `Table` + `TableHeader` + `TableBody` + `TableRow` + `TableHead` + `TableCell`
- `Badge` — tones: navy, gold, error, green, gray
- `Skeleton` — animate-pulse rounded gray box
- `Toaster` — sonner integration with token-styled toasts

**Custom shared components** (`@shared/components/*`):
- `PageHeader`, `EyebrowLabel`, `MonoId`, `DecorBlob`, `EmptyState`, `StatusPill`, `LoadingSpinner`/`FullPageSpinner`, `LanguageSwitcher`, `OfflineBanner`, `NotFound`, `RouteErrorBoundary`, `ErrorBoundary` (`AppErrorBoundary`)

## Error Handling & Resilience

**Three-layer error handling:**
1. **App boundary** — `AppErrorBoundary` (react-error-boundary) wraps everything. Last resort.
2. **Route boundary** — `RouteErrorBoundary` attached to every lazy route via `lazyRoute()`. Renders branded fallback with reload + dashboard CTAs. Detects 404 via `isRouteErrorResponse`.
3. **Mutation/query level** — toasts via `notify`, inline form errors via `setServerErrors`.

**OfflineBanner** — uses `useOnline` hook (navigator.onLine + online/offline events). Shows fixed-top warning + fires one-time toast on transition.

**Rate limit (429)** — interceptor parses `Retry-After` header. Map keys `system.rate_limited` and `system.rate_limited_with_retry`.

**404 page** — `NotFound` component with branded design, navigation CTAs to dashboard + login. Wired as the catch-all `path: "*"` in router.

## Testing Strategy

**Layers:**

| Layer | Tool | Coverage |
|---|---|---|
| Unit | Vitest | Pure functions: `cn`, `role`, `format`, `hash`, Zod schemas |
| Component | Vitest + RTL | Render, interactions, form validation |
| Integration | Vitest + MSW | Feature flows with mocked /api |
| E2E | Playwright | Auth flow, public routes, a11y smoke |

**Current count: 66 tests** across 6 spec files.

**MSW handlers** in `src/test/msw/handlers.ts` mock all `/api/*` endpoints with envelope shape. Add new handlers when adding new API hooks.

**TestProviders** (`src/test/TestProviders.tsx`) wraps RTL renders with QueryClient (retry disabled), I18nextProvider, MemoryRouter.

**File API polyfill:** jsdom doesn't implement `File.prototype.arrayBuffer`. `setup.ts` polyfills it from `Blob.prototype.arrayBuffer`. The hash module uses `FileReader` for broad compatibility.

**Playwright** runs against `localhost:5173` by default. Set `E2E_BASE_URL` for staging. Configures `chromium` and `mobile` (Pixel 5) projects. `@axe-core/playwright` filters for critical/serious violations only.

## Coding Conventions

**Naming:**
- Component file: `PascalCase.tsx` (e.g. `UserList.tsx`)
- Hook file: `camelCase.ts` starting with `use` (e.g. `useGoogleLogin.ts`)
- Util file: `kebab-case.ts` or single-word `lowercase.ts` (e.g. `cn.ts`, `format.ts`)
- Component: PascalCase named export
- Hook: `useX` named export
- Type/interface: PascalCase (e.g. `interface UserDTO`)
- Constant: `SCREAMING_SNAKE_CASE` (e.g. `ROLE_LEVEL`, `STRICT_E164`)

**Exports:**
- **Named exports only.** No default exports anywhere. The router's `lazyRoute()` helper takes the export name as a string to support this.

**TypeScript:**
- Strict mode + `verbatimModuleSyntax: true` — use `import type` for type-only imports
- No `any` (enforced by ESLint)
- Use `as const` enums via const-object pattern (see `Role` in `shared/auth/role.ts`)

**ESLint key rules** (in `eslint.config.js`):
- `react-refresh/only-export-components`
- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/consistent-type-imports: error`
- `@typescript-eslint/no-unused-vars` (ignore `_` prefix)
- `no-console: warn` (allow `warn`/`error`)

**Prettier:**
- printWidth 100, semi true, trailingComma all, doubleQuote
- `prettier-plugin-tailwindcss` auto-sorts Tailwind classes

## When Adding a New Feature

Step-by-step checklist for adding a new domain feature (e.g., `feature/audit-log/`):

1. Create folder structure:
   ```
   feature/<name>/
     api/
       keys.ts            # query keys
       use<Name>s.ts      # list query
       use<Name>.ts       # detail query
       useCreate<Name>.ts # create mutation
     components/          # presentational components
     schemas/<name>.ts    # Zod schemas mirroring Go Ozzo
     <Name>List.tsx
     <Name>Detail.tsx
     index.ts             # named re-exports of public API
   ```
2. Mirror backend Ozzo rules in Zod schemas. Cover: required fields, max lengths, format regexes, enum values, batch size limits.
3. Create TanStack Query hooks. Reuse the `notify`/`isApiError`/`setServerErrors` patterns.
4. Add response codes to `@shared/api/codes.ts`. Mirror entries from `CredChain_Golang/domain/codes.go`.
5. Add locale keys to BOTH `src/shared/i18n/en.json` and `id.json`. Run `npm run check-locales` to verify sync with backend.
6. Add MSW handlers in `src/test/msw/handlers.ts` for the new endpoints.
7. Wire the route in `src/app/router.tsx` using `lazyRoute(() => import("..."), "ExportName")`.
8. Add nav entry to `Sidebar.tsx` if user-facing. Filter by role using `NAV_ITEMS.minRole`.
9. Add Vitest tests:
   - Schema tests (deeply, all edge cases)
   - Component test using `TestProviders` wrapper
10. If user-facing: add Playwright E2E in `e2e/`.
11. Run full verification: `npm run lint && npm run build && npm run test && npm run check-locales`.

## Common Pitfalls (DO NOT DO)

- `export default function ComponentName()` — use named export
- `bg-[#hexcode]` — define in `@theme` and use the token
- `feature/X` importing from `feature/Y` — share via `shared/`
- Direct `import axios` — use `@shared/api/client`
- Direct deep imports from lucide-react paths — use bare named imports
- Role hierarchy logic outside `@shared/auth/role.ts`
- `window.confirm` / `window.alert` — use shadcn `useConfirm` hook
- `useState` for forms — use React Hook Form
- Hardcoded English strings in JSX — use `t("key")` and add to both locale files
- `bg-blue-600` for brand-bearing elements — use `navy` or `gold` token
- Persisting tokens to Zustand or localStorage — backend uses httpOnly cookies
- Reading `import.meta.env` directly — use typed `env` from `@shared/lib/env`
- Manual `toast.success(...)` — use `notify.success(key)` so messages go through i18n
- Concatenated classNames via template strings — use `cn()` so tailwind-merge dedupes
- `console.log` in committed code (ESLint warns; only `console.warn`/`error` allowed)

## Backend Coordination Items (still pending)

These are documented in `DESIGN_SYSTEM.md` §22.2 and require Go-team agreement before production:

1. `/api/auth/google` must `Set-Cookie: access_token` and `refresh_token` (HttpOnly, Secure, SameSite=Strict). Currently the backend returns tokens in the body — frontend ignores them but the cookie must be set for axios `withCredentials: true` to work.
2. CORS: `Access-Control-Allow-Credentials: true` and explicit origin (not `*`).
3. Validation error response shape: `{ code: 400001, errors: { fieldName: messageKey } }` — confirm field path format (dot-notation for nested? `users[0].email`?).
4. `Retry-After` header on 429 responses (frontend reads it).
5. Confirm `/api/users/self/email` accepts the same Google ID token format as login (audience claim handling).
6. CSRF protection: with httpOnly cookies + `SameSite=Strict`, dedicated CSRF token may not be needed. Confirm with backend security review.

## Note on AGENTS.md

Unlike the root `/AGENTS.md` (which is uncommitted by design — it spans multiple repos), **this file IS committed** to the `CredChain_React` repo. It supersedes any general AI instructions and should be updated whenever:

- A new architectural pattern is adopted
- A new dependency is added or removed
- The folder structure changes
- A backend coordination item is resolved
- A new common pitfall is discovered
- A new shared component or hook is added

Pair updates here with corresponding updates in `DESIGN_SYSTEM.md` (§22.5 changelog).

## See Also

- `DESIGN_SYSTEM.md` — full visual + engineering specification
- `README.md` — quick-start for human contributors
- `../AGENTS.md` (uncommitted, root) — repo-wide reference for multi-package work
- `../CredChain_Golang/AGENTS.md` — backend contract reference
