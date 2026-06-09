# CredChain React - Agent Instructions

Production frontend for the CredChain decentralized credential platform. React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS v4 SPA. Communicates with the Go backend over `/api` via httpOnly cookies. Manages user sessions, credential workflows, and role-gated admin interfaces.

This file is the authoritative reference for AI assistants and engineers working in `CredChain_React/`. For the full visual + engineering specification, see `DESIGN_SYSTEM.md`.

## Repo Position

Sibling to `CredChain_Golang/` (Go backend), `CredChain_Solidity/` (smart contracts), and `CredChain_Python/` (AI service).

- **`CredChain_Golang/`:** sole HTTP endpoint. All routes live under `/api`. Backend sets httpOnly cookies (`access_token`, `refresh_token`) that axios sends automatically.
- **`CredChain_Solidity/`:** frontend never talks to contracts directly. All on-chain operations go through the Go API.
- **`CredChain_Python/`:** frontend never talks to the AI service. All OCR/extraction flows go through the Go API.
- **`CredChain_React_Demo/`:** deprecated sibling — never import from or reference it.

## Critical Commands

```bash
npm install                   # one-time, after cloning
npm run dev                   # Vite dev server on :5173 (proxies /api → :8080)
npm run build                 # tsc -b && vite build (strict TypeScript; must pass before push)
npm run preview               # serve production build locally
npm run lint                  # ESLint
npm run format                # Prettier write
npm run format:check          # Prettier check (CI)
npm run test                  # Vitest run
npm run test:watch            # Vitest watch mode
npm run test:coverage         # Vitest with v8 coverage
npm run test:e2e              # Playwright tests (auth, public, a11y) — requires :5173
npm run check-locales         # verify en.json/id.json sync with backend locales/
```

**Env setup:** copy `.env.example` to `.env.local` and fill `VITE_GOOGLE_CLIENT_ID`. Tests use `.env.test` (committed, placeholder values).

**Required env vars** (validated at startup in `src/shared/lib/env.ts`):

| Var                     | Required | Default                 | Purpose                                                     |
| ----------------------- | -------- | ----------------------- | ----------------------------------------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | **yes**  | —                       | fatal if missing (thrown by `env.ts` at module load)        |
| `VITE_API_BASE_URL`     | no       | `/api`                  | base URL for axios                                          |
| `VITE_API_PROXY`        | no       | `http://localhost:8080` | dev-server proxy target for `/api` (Vite only, not bundled) |
| `VITE_APP_ENV`          | no       | `development`           | `development` / `staging` / `production`                    |
| `VITE_SUPPORT_EMAIL`    | no       | `support@credchain.app` | contact address shown on Help & About pages                 |

Engine note: tested on Node 20.x; `package.json` does not pin `engines`.

A `prepare` script wires `husky`; commits trigger `lint-staged` (Prettier on `*.{ts,tsx,css,json,md}`, ESLint `--fix` on `*.{ts,tsx}`). No CI pipeline is configured.

## Environment Setup

```bash
cp .env.example .env.local
# Fill VITE_GOOGLE_CLIENT_ID in .env.local
npm install
npm run dev
```

For testing: `.env.test` is committed and contains placeholder values. Tests do not require a running backend (MSW mocks all `/api/*` calls).

## Project Architecture

```
CredChain_React/
  public/
  e2e/                         # Playwright specs (auth, public, a11y)
    auth.spec.ts
    public.spec.ts
    a11y.spec.ts
  scripts/
    check-locales-sync.mjs     # verifies en.json/id.json sync with ../CredChain_Golang/locales/
  src/
    app/                       # cross-cutting wiring (no business logic)
      App.tsx                  # RouterProvider mount
      providers.tsx            # QueryClient + I18n + GoogleOAuth + ErrorBoundary + OfflineBanner + Toaster
      router.tsx               # createBrowserRouter with lazyRoute() helper
      SessionHydrator.tsx      # validates session via GET /users/self, syncs i18n with Zustand locale
      store/index.ts           # Zustand: auth + UI slices combined (persist middleware)
    feature/                   # one folder per business domain
      auth/                    # Login + api/ (useGoogleLogin, useLogout)
      user/                    # UserCreate, UserDetail, UserList, UserSelfEmail, UserSelfProfile
                               # + api/ (11 hooks: useCreateUsers, useDeleteUsers, useRestoreUsers,
                               #         useTransferSuperAdmin, useUpdateSelfEmail, useUpdateSelfProfile,
                               #         useUpdateUserRoles, useUpdateUsers, useUser, useUsers, useUserSelf)
                               # + components/ (CopyInlineButton, MetaEditor, RoleFilterMenu, SortMenu,
                               #                UserCreateRow, UserEditDrawer, UserRoleBadge, UserStatusBadge)
                               # + hooks/ (useUserListParams) + lib/ (meta) + schemas/ (user)
      credential/              # CredentialDetail, CredentialIssue, CredentialList, MyCredentials,
                               # VerifyCredential + api/ (6 hooks + keys.ts) + components/ + schemas/
      dashboard/               # Dashboard + Settings
      landing/                 # Landing (self-wraps SplitLayout; route: /)
      about/                   # About
      help/                    # Help
    shared/
      api/                     # client.ts + codes.ts + envelope.ts + query-client.ts
      auth/                    # role.ts + guards.tsx
      components/              # 14 shared components
        ui/                    # 12 shadcn-style primitives (sole Radix import location)
        layout/                # AdaptiveLayout, DashboardLayout, PublicLayout, SplitLayout,
                               # Sidebar, TopNav, nav-items.ts
      hooks/                   # useDebouncedValue, useNavSearch, useOnline, useT
      i18n/                    # config.ts + en.json + id.json
      lib/                     # cn, env, format, forms, hash, jwt, notify
      types/api.ts             # DTO mirrors (UserDTO, AuthResponseDTO, CredentialDTO, PaginatedResponse)
    styles/index.css           # Tailwind v4 @theme tokens + base + utilities
    test/                      # setup.ts, fixtures.ts, msw/{handlers.ts,server.ts}, TestProviders.tsx
  .env.example / .env.test     # .env.test committed, used by Vitest
  components.json              # shadcn/ui config
  DESIGN_SYSTEM.md             # full visual + engineering spec (87.9K)
  AGENTS.md                    # this file
  README.md
  eslint.config.js / prettier.config.js
  tsconfig.json + tsconfig.app.json + tsconfig.node.json
  vite.config.ts / vitest.config.ts / playwright.config.ts
  package.json
```

## Key Patterns & Conventions

### Module Boundary Rules (HARD)

1. `feature/<X>` may import from `shared/` — **never the reverse**
2. `feature/<X>` may **NOT** import from `feature/<Y>` — share via `shared/` if needed
3. `shared/components/ui/` is the **only** place where Radix primitives are imported
4. `shared/api/client.ts` is the **only** place where axios is imported directly
5. `app/` wires everything; do not put business logic here
6. Avoid deep barrel re-exports; feature folders may have a single top-level `index.ts`

### Path Aliases

Configured in `tsconfig.app.json` + `vite.config.ts` + `vitest.config.ts`:

| Alias        | Resolves to                  |
| ------------ | ---------------------------- |
| `@/*`        | `src/*`                      |
| `@app/*`     | `src/app/*`                  |
| `@feature/*` | `src/feature/*`              |
| `@shared/*`  | `src/shared/*`               |
| `@ui/*`      | `src/shared/components/ui/*` |

### Design System Tokens

Palette (from `src/styles/index.css` `@theme` block):

- `navy` `#0F172A` — primary brand, body text, sidebar
- `gold` `#C9A227` — accent, premium CTAs, focus ring
- `base` `#F8FAFC` — page background
- `surface` `#FFFFFF` — card / elevated surface
- `error` `#B91C1C` — destructive, revoked state
- Extended `gray-50..900`, semantic aliases (primary, secondary, muted), status (success/info/warning)

Typography (Google Fonts, loaded in `index.html`):

- `font-display` → Fraunces (serif) — headings, hero, stat values
- `font-sans` → DM Sans (geometric) — body, buttons, inputs, labels
- `font-mono` → JetBrains Mono — hashes, IDs, addresses

Radius defaults: `rounded-xl` (inputs/buttons), `rounded-2xl` (cards), `rounded-md` (badges), `rounded-full` (pills/avatars).

Tinted shadows (signature): `shadow-md shadow-navy/20`, `shadow-lg shadow-gold/20`, `shadow-error/20` under brand-colored elements.

`<DecorBlob>` — single soft radial gradient per hero area, never multiple competing blobs.

See `DESIGN_SYSTEM.md` Section 6.5 for the full visual language principles (anti-patterns, density philosophy, asymmetry rules).

### State Management (TanStack Query + Zustand)

**Two-layer model — never mix:**

| Layer        | Tool               | What lives here                                   |
| ------------ | ------------------ | ------------------------------------------------- |
| Server state | TanStack Query     | All API data: users, credentials, paginated lists |
| Client state | Zustand `useStore` | Current user session, UI (sidebar, locale)        |

`useStore` is persisted to localStorage via `persist` middleware. Only `user`, `isAuthenticated`, and `locale` are persisted. **Tokens are never persisted** (httpOnly cookies handle them).

Query key conventions (in `feature/*/api/keys.ts`):

```ts
userKeys = { all, list, detail, self };
credentialKeys = { all, list, detail, mine };
```

All mutations invalidate the `all()` key on success.

### API Integration & Axios Interceptors

Single axios instance at `@shared/api/client.ts` with:

- `withCredentials: true` — sends httpOnly cookies automatically
- 30s timeout
- **Request interceptor:** adds `Accept-Language` from Zustand locale
- **Response interceptor:** unwraps `{code, message, data}` envelope → returns just `data`
- **Error interceptor:**
  - 401 → single silent refresh attempt (deduplicated via `refreshInFlight` promise) → retry with `X-Retry: 1` header
  - 429 → maps to `system.rate_limited` or `system.rate_limited_with_retry` if `Retry-After` header present
  - other → wraps in `ApiError` with translated `messageKey`

`ApiError` (`@shared/api/envelope.ts`) carries `status`, `code`, `messageKey`, `fieldErrors`, and original `cause`. Use `isApiError(e)` type guard.

Backend response codes (6-digit `AABBCC`) map to i18n keys via `CODE_TO_MESSAGE_KEY` in `@shared/api/codes.ts`. **Keep in sync with `CredChain_Golang/domain/codes.go`** — when backend adds a code, add it here AND to both locale files.

### Authentication & Silent Refresh

**Flow:** Google OAuth ID token → `POST /api/auth/google` → backend sets httpOnly cookies (access + refresh) → Zustand stores `UserDTO` only (NOT tokens).

**Frontend never reads or writes tokens.** Axios sends them automatically via cookies.

**Silent refresh:** axios interceptor catches 401, calls `POST /api/auth/refresh` once, retries original request. On refresh failure, clears Zustand session and redirects to `/login`.

**Session hydration:** `SessionHydrator` (mounted under `Providers`) calls `GET /users/self` on mount. If 200 → sets user. If 401 → clears session. Renders full-page spinner until first load completes.

**Email update with Google reauth:** `UserSelfEmail` is a 2-step form. Step 1 captures new email. Step 2 prompts Google sign-in for the new address; the resulting ID token is sent to `PUT /users/self/email` along with the email. Backend verifies the token's email matches.

**Logout:** `POST /api/auth/logout` clears cookies, then frontend clears Zustand + Query cache.

### Routing & Lazy Loading

Every route except `/login` is loaded via the `lazyRoute()` helper in `app/router.tsx`. The helper wraps the component in `Suspense` (with `LoadingSpinner` fallback) and attaches `RouteErrorBoundary` automatically. This means **route components must be named exports** — the helper takes the export name as a string.

```ts
lazyRoute(() => import("@feature/user/UserList"), "UserList");
```

`/login` is an **eager** import (`Login` is imported directly, not lazily) since it is the most common cold-start entry.

**Route map** (path → component → guard):

| Path                                | Component          | Guard / min role                    | Shell                    |
| ----------------------------------- | ------------------ | ----------------------------------- | ------------------------ |
| `/`                                 | `Landing`          | none                                | self-wraps `SplitLayout` |
| `/login`                            | `Login` (eager)    | `PublicRoute` (redirects if authed) | self-wraps `SplitLayout` |
| `/credentials/verify/:credentialId` | `VerifyCredential` | none                                | `PublicLayout`           |
| `/help`                             | `Help`             | none                                | `AdaptiveLayout`         |
| `/about`                            | `About`            | none                                | `AdaptiveLayout`         |
| `/dashboard`                        | `Dashboard`        | authenticated                       | `DashboardLayout`        |
| `/credentials/self`                 | `MyCredentials`    | authenticated                       | `DashboardLayout`        |
| `/account/profile`                  | `UserSelfProfile`  | authenticated                       | `DashboardLayout`        |
| `/account/email`                    | `UserSelfEmail`    | authenticated                       | `DashboardLayout`        |
| `/users`                            | `UserList`         | Issuer+                             | `DashboardLayout`        |
| `/users/:id`                        | `UserDetail`       | Issuer+                             | `DashboardLayout`        |
| `/credentials`                      | `CredentialList`   | Issuer+                             | `DashboardLayout`        |
| `/credentials/issue`                | `CredentialIssue`  | Issuer+                             | `DashboardLayout`        |
| `/credentials/:id`                  | `CredentialDetail` | Issuer+                             | `DashboardLayout`        |
| `/users/create`                     | `UserCreate`       | Admin+                              | `DashboardLayout`        |
| `/settings`                         | `Settings`         | Admin+                              | `DashboardLayout`        |
| `*`                                 | `NotFound`         | none                                | —                        |

`AdaptiveLayout` renders `DashboardLayout` when authenticated, `PublicLayout` otherwise. `SplitLayout` is the navy/light split-screen shared by Landing and Login.

### Authorization & Role Guards

**Single source of role logic:** `@shared/auth/role.ts` exports `Role` (a string-valued const object), `ROLE_LEVEL` hierarchy, `canAccess(userRole, minRole)`, `canAccessAny(userRole, allowed[])`, `formatRole`.

```
Role.HOLDER     = "holder"     (level 1)  - receives credentials
Role.ISSUER     = "issuer"     (level 2)  - issues/revokes/verifies
Role.ADMIN      = "admin"      (level 3)  - manages users
Role.SUPER_ADMIN= "super_admin"(level 4)  - bootstrapped via Go CLI only
```

`None(0)` exists only in Solidity/Go (on-chain revocation target) — it is **not** part of the TS `Role` object since the frontend never persists or assigns it.

**Guards** (`@shared/auth/guards.tsx`):

- `ProtectedRoute` — redirects unauthenticated to `/login` (with `state.from`); role-mismatched to `/credentials/self` (HOLDER) or `/dashboard`. Optional `allowedRoles?: Role[]`.
- `PublicRoute` — redirects authenticated away to `state.from ?? /dashboard` (login is public-only)
- `RoleGate` — inline UI gating for show/hide based on role, with optional `fallback`

**Sidebar nav** (`@shared/components/layout/nav-items.ts`): `NAV_ITEMS` carry `minRole` (Issuer+ for dashboard/users/credentials, Admin+ for settings) and `exactRole` (HOLDER-only "My Credentials"). The `inSidebar` flag controls whether an item renders in the sidebar vs. only the global search / profile menu.

### Forms & Validation (RHF + Zod)

**Stack:** React Hook Form + Zod via `@hookform/resolvers/zod`.

**Schemas mirror Go Ozzo rules** (see `feature/*/schemas/`):

- E.164 phone via `STRICT_E164` regex `/^\+[1-9]\d{6,14}$/`
- ISO date via `/^\d{4}-\d{2}-\d{2}$/`
- Email max 256, name 1–256, batch limits 50–100
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
};
```

### Internationalization & Locale Sync

**Locales:** `en` and `id` only, mirroring backend `CredChain_Golang/locales/`.

**Sync verification:** `npm run check-locales` reads both files, flattens keys, and exits 1 if any backend key is missing from frontend. Run in CI or pre-commit.

**Backend code → frontend key:** `CODE_TO_MESSAGE_KEY` map in `@shared/api/codes.ts`. Mirrors `CredChain_Golang/infrastructure/http/responder/mapper.go`. Adding a domain code requires updating: (a) this map, (b) both `locales/{en,id}.json` files, (c) backend's `CodeToMessageKey` and `HttpCodes` maps, (d) backend's locale files.

**Locale state:** `useStore.locale` is the source of truth. `LanguageSwitcher` updates both i18next AND Zustand. `SessionHydrator` syncs `i18next.changeLanguage()` with stored locale on mount. Axios sends `Accept-Language` header so backend serves the matching locale.

**Default locale:** Indonesian (`id`). The persisted locale is read from localStorage in `i18n/config.ts` before i18next initializes, so users never see a flash of English on Indonesian-default pages.

### Component Recipes

**Always use `cn()`** from `@shared/lib/cn` for className composition. Never template-string concatenation:

```tsx
// CORRECT
className={cn("base classes", isActive && "active", className)}

// WRONG — tailwind-merge can't dedupe
className={`base classes ${isActive ? "active" : ""} ${className}`}
```

**Always use `notify`** from `@shared/lib/notify` for toasts. It auto-translates keys via i18n and applies consistent styling. Available: `notify.success`, `notify.error`, `notify.info`, `notify.warning`.

**shadcn primitives** (in `@ui/*` — 12 primitives, the sole Radix import location):

- `Button` — variants: `primary` (navy), `gold`, `destructive`, `outline`, `ghost`, `link`, `dashed`. Sizes: `sm`, `md`, `lg`, `icon`, `icon-mobile`.
- `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter`
- `Input` — accepts `leadingIcon` and `trailingAction` props
- `Label` — Radix-based, supports peer-disabled
- `Select` — full Radix Select with `SelectValue`
- `Dialog` + `ConfirmDialog` + `useConfirm()` hook (NEVER use `window.confirm`); `useConfirm()` returns `{ confirm, dialog }`
- `DropdownMenu` — full Radix DropdownMenu with `destructive` item variant. Use `modal={false}` for chrome-mounted menus (TopNav profile, LanguageSwitcher) to avoid scroll-lock-induced layout shift on open/close.
- `Table` + `TableHeader` + `TableBody` + `TableRow` + `TableHead` + `TableCell`
- `Badge` — tones: navy, gold, error, green, gray
- `Skeleton` — animate-pulse rounded gray box
- `Toaster` — sonner integration with token-styled toasts (hardcoded `theme="light"`)

> The `vaul` `Drawer` primitive is used by `feature/user/components/UserEditDrawer.tsx` (admin batch user edit). It lives in the feature, not in `@ui/`, and is the only content-drawer in the app — the mobile sidebar is NOT a `vaul`/`Sheet` drawer (see Error Handling / layout notes).

**Custom shared components** (`@shared/components/*` — 14):

`BackLink`, `DecorBlob`, `EmptyState`, `ErrorBoundary` (`AppErrorBoundary`), `EyebrowLabel`, `LanguageSwitcher`, `LoadingSpinner` / `FullPageSpinner`, `MonoId`, `NotFound`, `OfflineBanner`, `PageHeader`, `RouteErrorBoundary`, `StatusPill`, `UserAvatar`.

### Error Handling Layers

**Three-layer error handling:**

1. **App boundary** — `AppErrorBoundary` (react-error-boundary) wraps everything. Last resort.
2. **Route boundary** — `RouteErrorBoundary` attached to every lazy route via `lazyRoute()`. Renders branded fallback with reload + dashboard CTAs. Detects 404 via `isRouteErrorResponse`.
3. **Mutation/query level** — toasts via `notify`, inline form errors via `setServerErrors`.

**OfflineBanner** — uses `useOnline` hook (`navigator.onLine` + online/offline events). Shows fixed-top warning + fires one-time toast on transition.

**Rate limit (429)** — interceptor parses `Retry-After` header. Map keys `system.rate_limited` and `system.rate_limited_with_retry`.

**404 page** — `NotFound` component with branded design, navigation CTAs to dashboard + login. Wired as the catch-all `path: "*"` in router.

### Coding Conventions

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

- `printWidth 100`, `semi true`, `trailingComma all`, `doubleQuote`
- `prettier-plugin-tailwindcss` auto-sorts Tailwind classes

### When Adding a New Feature

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
3. Create TanStack Query hooks. Reuse the `notify` / `isApiError` / `setServerErrors` patterns.
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

### Common Pitfalls (DO NOT DO)

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
- `safe-area-top` on the same element as `py-*` — `safe-area-top` overrides `padding-top` (CSS utilities-layer source order). Apply it to a dedicated spacer `<div>` when combined with vertical padding.
- `console.log` in committed code (ESLint warns; only `console.warn`/`error` allowed)

### Backend Coordination Items

Documented in `DESIGN_SYSTEM.md` §22.2. These require Go-team agreement before production:

1. `/api/auth/google` must `Set-Cookie: access_token` and `refresh_token` (HttpOnly, Secure, SameSite=Strict).
2. CORS: `Access-Control-Allow-Credentials: true` and explicit origin (not `*`).
3. Validation error response shape: `{ code: 400001, errors: { fieldName: messageKey } }` — confirm field path format (dot-notation for nested? `users[0].email`?).
4. `Retry-After` header on 429 responses (frontend reads it).
5. Confirm `/api/users/self/email` accepts the same Google ID token format as login (audience claim handling).
6. CSRF protection: with httpOnly cookies + `SameSite=Strict`, dedicated CSRF token may not be needed. Confirm with backend security review.

## Configuration / Env Vars

| Var                     | Required | Default | Purpose                                  |
| ----------------------- | -------- | ------- | ---------------------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | **yes**  | —       | Google OAuth client ID; fatal if missing |
| `VITE_API_BASE_URL`     | no       | `/api`  | base URL for axios                       |
| `VITE_APP_ENV`          | no       | —       | `development` / `staging` / `production` |

All env vars must be prefixed with `VITE_` to be exposed to the browser. Reading `import.meta.env` directly is prohibited — always use the typed `env` export from `@shared/lib/env.ts`.

## Testing

**Layers:**

| Layer       | Tool         | Coverage                                                    |
| ----------- | ------------ | ----------------------------------------------------------- |
| Unit        | Vitest       | Pure functions: `cn`, `role`, `format`, `hash`, Zod schemas |
| Component   | Vitest + RTL | Render, interactions, form validation                       |
| Integration | Vitest + MSW | Feature flows with mocked `/api`                            |
| E2E         | Playwright   | Auth flow, public routes, a11y smoke                        |

**Current count:** **249 unit/component tests across 26 spec files** under `src/`, plus **20 Playwright tests across 3 e2e specs** (`auth.spec.ts`, `public.spec.ts`, `a11y.spec.ts`).

**Coverage** (in `vitest.config.ts`): the `coverage` config uses a **selective `include` allowlist** (NOT global). Per-file thresholds of 90% lines / 85% branches / 90% functions / 90% statements apply only to the curated paths:

```
src/shared/lib/jwt.ts
src/shared/hooks/useNavSearch.ts
src/feature/help/**/*.{ts,tsx}
src/feature/about/**/*.{ts,tsx}
src/shared/components/layout/nav-items.ts
src/shared/i18n/config.ts
```

This is intentional: not all of the codebase is covered to threshold yet. Add new paths to the allowlist as features stabilize. Globally-excluded: `src/shared/components/ui/**`, `src/test/**`, `src/main.tsx`, `src/app/router.tsx`, `**/*.test.{ts,tsx}`, `**/*.d.ts`, config files, `scripts/**`.

**MSW handlers** in `src/test/msw/handlers.ts` mock all `/api/*` endpoints with envelope shape. Add new handlers when adding new API hooks.

**TestProviders** (`src/test/TestProviders.tsx`) wraps RTL renders with `QueryClient` (retry disabled), `I18nextProvider`, `MemoryRouter`.

**File API polyfill:** jsdom doesn't implement `File.prototype.arrayBuffer`. `setup.ts` polyfills it from `Blob.prototype.arrayBuffer`. The hash module uses `FileReader` for broad compatibility.

**Playwright** runs against `localhost:5173` by default. Set `E2E_BASE_URL` for staging. Configures `chromium` and `mobile` (Pixel 5) projects. `@axe-core/playwright` filters for critical/serious violations only.

When adding tests, prefer integration tests via MSW over heavy mocking. Schema tests should cover every required field, every max-length boundary, every enum value, and every regex format constraint.

## Tech Stack

| Layer         | Choice                                        | Version                                              |
| ------------- | --------------------------------------------- | ---------------------------------------------------- |
| Language      | TypeScript                                    | ~5.9.3 strict + verbatimModuleSyntax                 |
| Framework     | React                                         | ^19.2                                                |
| Build         | Vite                                          | ^7.3                                                 |
| Styling       | Tailwind CSS v4                               | ^4.2 (`@theme` directive, no config file)            |
| UI primitives | shadcn/ui + Radix UI                          | various (see `package.json`)                         |
| Icons         | lucide-react                                  | ^0.576 (named imports only)                          |
| Routing       | React Router                                  | ^7.13 (lazy via `lazyRoute()` helper)                |
| Server state  | TanStack Query                                | ^5.59                                                |
| HTTP          | axios                                         | ^1.7 (with interceptors)                             |
| Client state  | Zustand                                       | ^5.0 (with persist middleware)                       |
| Forms         | React Hook Form                               | ^7.53                                                |
| Validation    | Zod                                           | ^3.23                                                |
| i18n          | i18next + react-i18next                       | ^23.16 / ^14.1                                       |
| Auth          | @react-oauth/google                           | ^0.12                                                |
| Avatar        | @dicebear/core + @dicebear/identicon          | ^9.4                                                 |
| Toasts        | sonner                                        | ^1.5 (via `notify` helper)                           |
| Class merge   | clsx + tailwind-merge                         | ^2 / ^3 (via `cn()`)                                 |
| Drawer        | vaul                                          | ^1.1 (used by `UserEditDrawer`; not for sidebar nav) |
| Git hooks     | husky + lint-staged                           | ^9 / ^15                                             |
| Tests         | Vitest ^3 + Testing Library ^16 + MSW ^2.4    |                                                      |
| E2E           | Playwright ^1.48 + @axe-core/playwright ^4.10 |                                                      |

## Cross-Repo Integration

- **`../CredChain_Golang/AGENTS.md`** — sole HTTP backend. Frontend mirrors `domain.Code*` constants from `CredChain_Golang/domain/codes.go` into `@shared/api/codes.ts`. Locale files in `src/shared/i18n/{en,id}.json` are mirrored from `CredChain_Golang/locales/` and verified by `npm run check-locales`.
- **`../CredChain_Solidity/AGENTS.md`** — frontend never talks to contracts directly. Role enum (`None/Holder/Issuer/Admin/SuperAdmin`) is mirrored from `CredentialAuthority.Role` via `@shared/auth/role.ts`.
- **`../CredChain_Python/AGENTS.md`** — frontend never talks to the AI service directly. AI flows (OCR, similarity verdict) come through the Go API. Python owns response code category `50` — these codes propagate untouched and resolve to i18n keys via `CODE_TO_MESSAGE_KEY`.

**Role enum (mirrored in all four repos):** `None(0) → Holder(1) → Issuer(2) → Admin(3) → SuperAdmin(4)`. Same enum in Solidity (`CredentialAuthority.Role`), Go (`domain.Role`), and React (`@shared/auth/role.ts`).

**Response code format (mirrored in all four repos):** 6-digit `AABBCC`. Categories: `10` (system), `20` (auth), `30` (user), `40` (credential), `50` (AI service).

**Cross-repo sync workflow:** when the Go backend adds a new domain code, four files must be updated atomically:

1. `CredChain_Golang/domain/codes.go` — new constant
2. `CredChain_Golang/infrastructure/http/responder/mapper.go` — `CodeToMessageKey` + `HttpCodes`
3. `CredChain_Golang/locales/{en,id}.json` — message templates
4. `CredChain_React/src/shared/api/codes.ts` + `src/shared/i18n/{en,id}.json` — mirror entries

Run `npm run check-locales` from the React repo after step 4 to verify drift is resolved.

## Deployment

**Push to master branch only when build succeeds. Do not create feature branches, bugfix branches, or any other branch types — commit directly to master.**

Before pushing, run the repo's canonical verification command and confirm it passes:

- `CredChain_Golang`: `go test ./... && go vet ./... && gofmt -l .` (last must produce zero output)
- `CredChain_Solidity`: `npx hardhat compile && npx hardhat test`
- `CredChain_Python`: `make lint && make typecheck && make test`
- `CredChain_React`: `npm run lint && npm run build && npm run test && npm run check-locales`

## Change Log

- **2026-05-31 — Dark mode removed.** `ThemeProvider`, `ThemeToggle`, the `theme` slice in Zustand, the `:root.dark` CSS overrides, the `.text-fg` utility, and the no-flash inline script in `index.html` were all deleted. The app now renders only in light mode, faithful to `DESIGN_SYSTEM.md`. `text-navy` replaced every `text-fg` usage. `LanguageSwitcher`'s `variant="dark"` prop remains — it is a _background-aware_ styling switch (for placement on the navy header/sidebar), not a theme switch.
- **2026-06-09 — Help card title typography consistency.** Help Contact card title now uses `font-display` (Fraunces) matching the FAQ card title and the parallel About Contact title. Same fix as the About card; both pages were built from the same template and shared the bug.
- **2026-06-09 — About card title typography consistency.** Contact card title now uses `font-display` (Fraunces) matching all other card titles on the page. Was the only `font-bold`-only title (DM Sans) on the page. No test changes.
- **2026-06-09 — Add landing page CTA to About.** New explore card at bottom of About page with gold pill button linking to `/`. Added i18n keys `about.explore.title/body/action` (en + id). Added test asserting landing link renders with correct href.
- **2026-06-09 — BackLink wiring across pages.** `BackLink` (browser-history back with role-aware fallback to `/dashboard` or `/`) now used on Help, About, Login, Profile, and Update Email pages. Replaced inline `<Link to="/">` / `t("common.backToHome")` with `<BackLink />`. Added `common.back` i18n key ("Back" / "Kembali"), removed `common.backToHome`. Added `BackLink.test.tsx` (4 tests) covering history-back, auth fallback, and unauth fallback.
- **2026-06-09 — Navbar + dropdown polish.** Fixed TopNav vertical centering (separated `safe-area-top` from flex row's `py-*` to avoid CSS utilities-layer cascade override). DashboardLayout `main` now uses `overflow-y-scroll [scrollbar-gutter:stable]` so route-switches with different content heights no longer reflow the navbar. Profile dropdown set to `modal={false}` to avoid scroll-lock layout shifts; trigger button uses `focus-visible:[outline:none]` to defeat the global `:focus-visible` gold outline; focus indicator moved onto the avatar itself via `group-focus-visible:ring-gold` (clean circular ring, keyboard-only). Avatar gets adaptive ring (`ring-surface` on mobile navy header, `ring-gray-200` on desktop light header). Removed the gold `<DecorBlob>` from the mobile navy band in `SplitLayout` (was clipped by `overflow-hidden` and the safe-area gap on notched iOS). Tinted all dropdown shadows `shadow-navy/20` (was `shadow-gray-200/50` which appeared as a white smudge on dark backgrounds).
- **2026-06-09 — Docs resync to as-built.** AGENTS.md + DESIGN_SYSTEM.md reconciled with actual codebase. Major corrections: added `feature/landing/` (was undocumented); replaced `AuthLayout` references with `SplitLayout`/`AdaptiveLayout`; removed `RootRedirect` (deleted), added `BackLink`; shadcn count corrected to 12 primitives (not 13); test count updated to 244 + 20 E2E (was 179); coverage documented as selective allowlist (not global); env-var table extended with `VITE_API_PROXY` and `VITE_SUPPORT_EMAIL`; documented husky/lint-staged pre-commit flow; removed `ethers` from tech stack (unused dep). DESIGN_SYSTEM.md preserve design-philosophy sections intact.
- **2026-06-09 — Responsive polish for create/issue forms + shared header.** `PageHeader` back button now scales with viewport (`h-8 w-8` on mobile → `h-10 w-10` at `sm+`; icon `w-4 h-4` → `w-5 h-5`) so it stops looking oversized on phones/tablets — improves every page that passes `onBack` (UserCreate, UserDetail, UserSelfEmail, CredentialIssue, CredentialDetail). `UserCreateRow` + `CredentialIssueRow` tighten mobile padding (`p-4 sm:p-6`) and grid gaps (`gap-4 sm:gap-6`), bump grid right-padding (`pr-8` → `pr-12`) so the absolute trash button no longer overlaps the rightmost inputs, and shrink the trash button itself on mobile (`h-8 w-8 sm:h-9 sm:w-9`, offset `top-3 right-3 sm:top-4 sm:right-4`). `MetaEditor` key/value rows now stack vertically on `<sm` screens (`grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto]`) instead of cramming two `flex-1` inputs into ~80px each. `CredentialDetail` status card header stacks on mobile (`flex-col sm:flex-row`) so the "Public verification" button no longer squeezes. No new i18n keys, no logic changes — CSS-only, existing tests unaffected.

## See Also

- `DESIGN_SYSTEM.md` — full visual + engineering specification (87.9K)
- `README.md` — quickstart for human contributors
- `package.json` — frozen tech-stack version pins + npm scripts
- `vite.config.ts` — proxy setup, manual chunks, ES2022 target
- `vitest.config.ts` — jsdom env, coverage thresholds, setup files
- `playwright.config.ts` — chromium + mobile projects
- `eslint.config.js` / `prettier.config.js` — formatting + lint rules
- `scripts/check-locales-sync.mjs` — locale drift verification
- `../AGENTS.md` (workspace root, uncommitted) — multi-repo reference
- `../CredChain_Golang/AGENTS.md` — backend contract reference
- `../CredChain_Solidity/AGENTS.md` — smart contract reference
- `../CredChain_Python/AGENTS.md` — AI service reference
