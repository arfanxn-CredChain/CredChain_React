# CredChain React - Design System & Engineering Specification

> For AI assistants and engineers building CredChain_React/. This document is the single source of truth for the production frontend. It supersedes CredChain_React_Demo/ (reference only - do not import from it).

Status: Draft v1.4 | Last updated: 2026-06-10 | Related: ../AGENTS.md, ../CredChain_Golang/

---

## Table of Contents

1. Purpose & Audience
2. Product Context
3. Tech Stack
4. Project Architecture
5. Design Tokens
6. Typography
7. Component Recipes
8. Layout System
9. State Management
10. API Integration Layer
11. Authentication Flow
12. Routing & Authorization
13. Forms & Validation
14. Internationalization
15. Error Handling
16. Accessibility
17. Testing Strategy
18. Performance & Build
19. Coding Conventions
20. Migration Notes from Demo
21. AI Development Prompts
22. Open Questions / Decision Log

---

## 1. Purpose & Audience

This document defines how CredChain's production React frontend is built, styled, and extended. It targets:

- Engineers writing new features and maintaining the codebase
- AI assistants (Claude, GPT, Copilot, opencode) generating components, screens, and integrations
- Designers translating Figma decisions into tokens and recipes
- Reviewers auditing PRs against established patterns

The aesthetic is locked: premium decentralized credential platform - navy + gold, modern fintech with blockchain cues. Architecture, tokens, and recipes below are the authoritative reference.

---

## 2. Product Context

CredChain is a decentralized credential platform. The role hierarchy (same in Go backend and Solidity contracts):

| Role       | Level | On-chain | Capabilities                                            |
| ---------- | ----- | -------- | ------------------------------------------------------- |
| SuperAdmin | 4     | yes      | Manages Admins; only one; bootstrapped via Go CLI only  |
| Admin      | 3     | yes      | Manages users, settings; can promote to Issuer          |
| Issuer     | 2     | yes      | Issues, revokes, verifies credentials                   |
| Holder     | 1     | yes      | Receives credentials, manages own profile               |
| None       | 0     | yes      | On-chain revocation target only - never persisted in DB |

Frontend surfaces:

- Public: credential public verification page (no auth required)
- Auth: Google OAuth login only (no email/password)
- Dashboard: role-aware shell with sidebar; gates Admin/Issuer/Holder views

Backend contract (see ../CredChain_Golang/AGENTS.md):

- All routes under /api
- Response envelope: { code: number, message: string, data?: T }
- 6-digit response codes (AABBCC): category 10/20/30/40, feature, status
- Locales: en, id - frontend keys must match backend message keys
- Auth: Google OAuth only -> access (JWT, stateless) + refresh (DB-rotated) tokens
- Rate limits: login 300/min, refresh 200/min, logout 100/min, API 1200/min

---

## 3. Tech Stack

| Layer         | Choice                                 | Version   | Rationale                                                        |
| ------------- | -------------------------------------- | --------- | ---------------------------------------------------------------- |
| Language      | TypeScript                             | ~5.9      | Strict mode; end-to-end type safety with Zod                     |
| Framework     | React                                  | ^19       | Demo already on 19; ecosystem alignment                          |
| Build         | Vite                                   | ^7        | Fast HMR, native ESM, Tailwind v4 plugin                         |
| Styling       | Tailwind CSS v4                        | ^4.2      | @theme directive, no tailwind.config.js                          |
| UI primitives | shadcn/ui + Radix UI                   | latest    | Copy-paste source on Radix; owned in-repo, accessible by default |
| Icons         | lucide-react                           | latest    | Single icon source; matches demo                                 |
| Routing       | React Router                           | ^7        | Data router with lazy routes                                     |
| Server state  | TanStack Query                         | ^5        | Caching, refetch, optimistic updates, mutations                  |
| HTTP client   | axios                                  | ^1        | Interceptors for auth + envelope unwrapping                      |
| Client state  | Zustand                                | ^5        | Auth, UI, ephemeral state                                        |
| Forms         | React Hook Form                        | ^7        | Performance; batch/dynamic forms                                 |
| Validation    | Zod                                    | ^3        | Mirrors Go Ozzo rules; type inference                            |
| i18n          | i18next + react-i18next                | ^23 / ^14 | Mature, ICU-style, lazy bundles, matches go-i18n keys            |
| Auth (OAuth)  | @react-oauth/google                    | ^0.12     | Google Sign-In button, ID token retrieval                        |
| Toasts        | sonner                                 | ^1.5      | Headless, Tailwind-friendly                                      |
| Class utils   | clsx + tailwind-merge                  | ^2 / ^3   | cn() helper                                                      |
| Drawer        | vaul                                   | ^1.1      | Content drawer (admin user edit); NOT used for sidebar nav       |
| Tests         | Vitest + Testing Library               | ^3 / ^16  | Vite-native, Jest-compatible API                                 |
| API mocking   | MSW                                    | ^2        | Service worker fetch interception                                |
| E2E           | Playwright                             | ^1        | Cross-browser, trace viewer                                      |
| Lint          | ESLint + typescript-eslint             | ^9 / ^8   | Same as demo                                                     |
| Format        | Prettier + prettier-plugin-tailwindcss | ^3 / ^0.6 | Auto-sort Tailwind classes                                       |
| Git hooks     | husky + lint-staged                    | ^9 / ^15  | Pre-commit format/lint                                           |

### Why shadcn/ui over hand-rolled

The demo hand-rolls everything (selects, modals via window.confirm, no popovers). Production needs accessible select dropdowns, dialogs, command palettes, dropdown menus, toasts, tabs - building all of that from scratch is months of work and an accessibility liability. shadcn/ui gives us Radix primitives (WAI-ARIA compliant, keyboard navigation, focus traps) as source files in our repo that we restyle to our tokens. We own the code; we don't depend on a versioned package. This is the 2026 default for Tailwind apps.

**Components installed in `src/shared/components/ui/` (12 primitives):** badge, button, card, confirm-dialog, dialog, dropdown-menu, input, label, select, skeleton, table, toaster.

All shadcn components live in `src/shared/components/ui/` and are restyled to use our tokens (`navy`, `gold`, `error`) before any feature code consumes them. The `vaul` `Drawer` primitive is used outside `ui/` by `feature/user/components/UserEditDrawer.tsx` for the admin batch-edit flow; it is the only content drawer in the app and is **not** used for sidebar navigation (the mobile sidebar is hand-rolled — see §8.7).

---

## 4. Project Architecture

### 4.1 Folder Structure

Feature-driven, evolved from the demo:

```
CredChain_React/
  public/
  e2e/                  # Playwright specs (auth, public, a11y)
  scripts/
    check-locales-sync.mjs
  src/
    app/                  # cross-cutting app wiring
      App.tsx              # mounts Providers → SessionHydrator → RouterProvider
      providers.tsx        # QueryClient + I18n + GoogleOAuth + AppErrorBoundary + OfflineBanner + Toaster
      router.tsx           # createBrowserRouter (lazy via lazyRoute() helper)
      SessionHydrator.tsx  # GET /users/self on mount; syncs i18n with Zustand locale
      store/
        index.ts           # combined auth + UI slices in one file (with persist middleware)
    feature/                 # one folder per business domain
      auth/
        api/                 # useGoogleLogin, useLogout
        Login.tsx
        index.ts
      user/
        api/                 # 11 hooks + keys.ts (useUsers, useUser, useUserSelf,
                             #   useCreateUsers, useUpdateUsers, useUpdateUserRoles,
                             #   useUpdateSelfProfile, useUpdateSelfEmail,
                             #   useDeleteUsers, useRestoreUsers, useTransferSuperAdmin)
        components/          # MetaEditor, RoleFilterMenu, SortMenu,
                             # UserCreateRow, UserEditDrawer (vaul), UserRoleBadge, UserStatusBadge
        hooks/               # useUserListParams
        lib/                 # meta
        schemas/             # user (Zod)
        UserList.tsx / UserDetail.tsx / UserCreate.tsx
        UserSelfProfile.tsx / UserSelfEmail.tsx
      credential/
        api/                 # 6 hooks + keys.ts (useCredentials, useCredential,
                             #   useMyCredentials, useIssueCredentials,
                             #   useRevokeCredentials, useVerifyCredential)
        components/          # CredentialCard, CredentialIssueRow, CredentialStatusBadge
        schemas/             # credential (Zod)
        CredentialList.tsx / CredentialDetail.tsx / CredentialIssue.tsx
        MyCredentials.tsx / VerifyCredential.tsx
      dashboard/
        Dashboard.tsx
        Settings.tsx
      landing/
        Landing.tsx          # self-wraps SplitLayout, route: "/"
        index.ts
      about/  About.tsx + index.ts
      help/   Help.tsx + index.ts
    shared/
      api/
        client.ts            # axios instance + interceptors (refresh dedup, X-Retry, 429 mapping)
        codes.ts             # backend response codes -> i18n keys
        envelope.ts          # ApiResponse<T>, ApiError, isApiError
        query-client.ts      # TanStack QueryClient config
      auth/
        role.ts              # Role const object, ROLE_LEVEL, canAccess, canAccessAny, formatRole
        guards.tsx           # ProtectedRoute, PublicRoute, RoleGate
      components/
        ui/                  # 12 shadcn primitives (sole Radix import location)
                             # badge, button, card, confirm-dialog, dialog,
                             # dropdown-menu, input, label, select, skeleton, table, toaster
        layout/
          AdaptiveLayout.tsx # renders DashboardLayout if authed, PublicLayout otherwise
          DashboardLayout.tsx
          PublicLayout.tsx
          SplitLayout.tsx    # 50/50 navy+light; used by Landing + Login
          DashboardSidebar.tsx
          NavbarDashboard.tsx
          NavbarPublic.tsx
          nav-items.ts       # NAV_ITEMS with minRole + exactRole + inSidebar flags
        BackLink.tsx
        CopyrightFooter.tsx
        DecorBlob.tsx
        EmptyState.tsx
        CopyInlineButton.tsx
        ErrorBoundary.tsx    # AppErrorBoundary
        EyebrowLabel.tsx
        LanguageSwitcher.tsx
        LoadingSpinner.tsx   # + FullPageSpinner
        MonoId.tsx
        NotFound.tsx
        OfflineBanner.tsx
        PageHeader.tsx
        RouteErrorBoundary.tsx
        StatusPill.tsx
        UserAvatar.tsx
      hooks/                 # useDebouncedValue, useNavSearch, useOnline, useT
      i18n/
        config.ts
        en.json              # mirrors backend locales/en.json
        id.json              # mirrors backend locales/id.json
      lib/                   # cn, env, format, forms, hash, jwt, notify
      types/
        api.ts               # UserDTO, AuthResponseDTO, CredentialDTO, PaginatedResponse, PaginationParams
    styles/
      index.css              # Tailwind v4 entry + @theme tokens + base + utilities
    test/                    # setup.ts, fixtures.ts, msw/{handlers,server}.ts, TestProviders.tsx
    main.tsx
    vite-env.d.ts
  .env.example / .env.test   # .env.test committed, used by Vitest
  components.json            # shadcn/ui config
  eslint.config.js
  index.html
  package.json
  prettier.config.js
  tsconfig.json + tsconfig.app.json + tsconfig.node.json
  vite.config.ts / vitest.config.ts / playwright.config.ts
  README.md
  AGENTS.md
  DESIGN_SYSTEM.md           # this file
```

### 4.2 Module Boundary Rules

1. `feature/<X>` may import from `shared/` - never the reverse.
2. `feature/<X>` may NOT import from `feature/<Y>` - share via `shared/` if needed.
3. `shared/components/ui/` (shadcn) is the only place where Radix imports live.
4. `shared/api/` is the only place that imports `axios` directly.
5. `app/` wires everything; do not put business logic here.
6. Avoid re-export barrels in deep paths to prevent circular imports; feature folders may have a single top-level `index.ts`.

### 4.3 Path Aliases

Define in `tsconfig.app.json` and `vite.config.ts`:

```json
{
  "paths": {
    "@/*": ["src/*"],
    "@app/*": ["src/app/*"],
    "@feature/*": ["src/feature/*"],
    "@shared/*": ["src/shared/*"],
    "@ui/*": ["src/shared/components/ui/*"]
  }
}
```

Import order (enforced by ESLint `import/order`):

1. node/react builtins
2. third-party packages
3. `@app/*`
4. `@feature/*`
5. `@shared/*` / `@ui/*`
6. relative imports
7. side-effect imports (CSS) last

---

## 5. Design Tokens

All tokens live in `src/styles/index.css` under `@theme`. No hex codes in components - always use token names.

```css
/* src/styles/index.css */
@import "tailwindcss";

@theme {
  /* === BRAND COLORS === */
  --color-navy: #0f172a; /* primary brand, text, sidebar */
  --color-gold: #c9a227; /* accent, premium CTAs, focus ring */
  --color-base: #f8fafc; /* app background */
  --color-surface: #ffffff; /* card / elevated surface */
  --color-error: #b91c1c; /* destructive, revoked state */

  /* === EXTENDED NEUTRALS === */
  --color-gray-50: #f8fafc;
  --color-gray-100: #f1f5f9;
  --color-gray-200: #e2e8f0;
  --color-gray-300: #cbd5e1;
  --color-gray-400: #94a3b8;
  --color-gray-500: #64748b;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1e293b;
  --color-gray-900: #0f172a;

  /* === SEMANTIC ALIASES (used by shadcn/ui) === */
  --color-primary: var(--color-navy);
  --color-primary-foreground: var(--color-surface);
  --color-secondary: var(--color-gold);
  --color-secondary-foreground: var(--color-navy);
  --color-destructive: var(--color-error);
  --color-destructive-foreground: var(--color-surface);
  --color-muted: var(--color-gray-100);
  --color-muted-foreground: var(--color-gray-500);
  --color-accent: var(--color-gray-100);
  --color-accent-foreground: var(--color-gray-800);
  --color-border: var(--color-gray-200);
  --color-input: var(--color-gray-200);
  --color-ring: var(--color-gold);
  --color-background: var(--color-base);
  --color-popover: var(--color-surface);
  --color-popover-foreground: var(--color-gray-900);
  --color-card: var(--color-surface);
  --color-card-foreground: var(--color-gray-900);

  /* === STATUS COLORS === */
  --color-success: #10b981; /* emerald-500 */
  --color-info: #3b82f6; /* blue-500 */
  --color-warning: #f59e0b; /* amber-500 */

  /* === BORDER RADIUS === */
  --radius-xs: 0.125rem; /* 2px  - tiny badges */
  --radius-sm: 0.25rem; /* 4px  - small elements */
  --radius-md: 0.375rem; /* 6px  - default shadcn */
  --radius-lg: 0.5rem; /* 8px  */
  --radius-xl: 0.75rem; /* 12px - inputs, buttons */
  --radius-2xl: 1rem; /* 16px - cards, panels */
  --radius-3xl: 1.5rem; /* 24px - mobile header */
  --radius-full: 9999px; /* pills, avatars */

  /* === FONT FAMILY === */
  --font-sans: "DM Sans", system-ui, sans-serif;
  --font-display: "Fraunces", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* === SIDEBAR === */
  --sidebar-width: 18rem; /* 288px = w-72 */
}

/* === BASE LAYER === */
body {
  @apply bg-base font-sans text-navy antialiased;
}
```

### 5.1 Color Usage Rules

| Context                             | Token to use                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| Page background                     | `bg-base`                                                                                  |
| Card / panel background             | `bg-surface`                                                                               |
| Primary CTA background              | `bg-navy`                                                                                  |
| Premium / positive CTA              | `bg-gold`                                                                                  |
| Destructive action                  | `bg-error`                                                                                 |
| Body text                           | `text-navy`                                                                                |
| Muted / helper text                 | `text-gray-500`                                                                            |
| Eyebrow / meta labels               | `text-gray-400`                                                                            |
| Mono identifiers                    | `text-gray-500` (or `text-gray-600`)                                                       |
| Card border                         | `border-gray-100`                                                                          |
| Input border                        | `border-gray-200`                                                                          |
| Focus ring                          | `ring-gold` (via `focus:ring-2 focus:ring-gold`)                                           |
| DashboardSidebar background         | `bg-navy`                                                                                  |
| DashboardSidebar text               | `text-gray-300` (inactive), `text-surface` (active)                                        |
| Brand mark (shield icon + wordmark) | `text-gold` — always, on every chrome (DashboardSidebar, PublicLayout, mobile NavbarDashboard) |
| DashboardLayout desktop top area    | transparent over page background; no static title — each page renders its own `PageHeader` |
| NavbarDashboard search input (resting) | `bg-gray-50 text-navy placeholder-gray-400 border-gray-200 rounded-full`                   |
| NavbarDashboard search input (focus) | `bg-white ring-2 ring-gold border-transparent`                                             |

### 5.2 Role-Color Mapping

Used consistently in badges, pills, and icon blocks:

| Role                | Background     | Text             |
| ------------------- | -------------- | ---------------- |
| super_admin         | `bg-error/10`  | `text-error`     |
| admin               | `bg-navy/10`   | `text-navy`      |
| issuer              | `bg-gold/20`   | `text-navy`      |
| holder              | `bg-gray-100`  | `text-gray-600`  |
| active status       | `bg-green-100` | `text-green-700` |
| revoked / suspended | `bg-error/10`  | `text-error`     |

### 5.3 Tinted Shadow Convention

Signature demo pattern - use on brand-colored cards and primary buttons:

```
bg-gold  -> shadow-lg shadow-gold/20
bg-navy  -> shadow-md shadow-navy/20
bg-error -> shadow-lg shadow-error/20
```

**Floating surfaces (popovers, dropdowns, tooltips):** Use `shadow-xl shadow-navy/20`. The navy tint blends into dark backgrounds (where a gray-tinted shadow reads as a white smudge) and gives a subtle premium elevation on light backgrounds. Codified in `dropdown-menu.tsx` for `DropdownMenuContent` and `DropdownMenuSubContent`.

**Scroll-lock / layout-shift guard:** `<html>` reserves the scrollbar gutter via `scrollbar-gutter: stable` (`styles/index.css`). Radix overlays that mount `react-remove-scroll` (`Select`, `Dialog`) lock the `<body>` with `data-scroll-locked` and inject `padding-right`/`margin-right` equal to the scrollbar width — which double-counts against the already-stable gutter and shifts the page ~12px on open/close. Two guards keep this stable: (1) `@ui/dropdown-menu` `DropdownMenu` defaults `modal={false}` (its Radix version supports the prop, so it skips scroll-lock entirely); (2) `@radix-ui/react-select@2.2.6` has **no** `modal` prop and always locks, so a global rule neutralizes the injected offsets: `body[data-scroll-locked] { margin-right: 0 !important; padding-right: 0 !important; }`. Never reintroduce per-element scrollbar-width padding to "fix" dropdown shift — the gutter is already stable.

---

## 6. Typography

The design commits to a **distinctive editorial pairing**: `Fraunces` (optical serif) for display + `DM Sans` (refined geometric sans) for body + `JetBrains Mono` for identifiers. All free via Google Fonts. This deliberately avoids the generic Inter/Roboto/system-ui pattern that signals "AI-generated startup".

### 6.0 Font Loading

Load in `index.html` with `font-display: swap` and preconnect for performance:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800;9..144,900&family=JetBrains+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

Apply via `@theme` tokens (Section 5) so Tailwind `font-sans`, `font-display`, `font-mono` utilities resolve correctly. Body defaults to `font-sans`:

```css
body {
  @apply bg-base font-sans text-navy antialiased;
  font-feature-settings: "ss01", "ss02", "cv11"; /* DM Sans stylistic alternates */
}
```

Fraunces uses optical sizing (`opsz`) — at large display sizes (28px+) it renders with more contrast and personality; at small sizes it would feel awkward, which is why it is reserved for headings only.

### 6.1 Type Scale

> For the design philosophy behind these choices, see Section 6.5 Visual Language Principles.

| Tier            | Tailwind                                                               | Use case                               |
| --------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| Hero            | `font-display text-4xl md:text-5xl font-extrabold tracking-tight`      | Auth landing, public verification page |
| Page title (H2) | `font-display text-2xl md:text-3xl font-bold text-navy tracking-tight` | All page titles                        |
| Section (H3)    | `font-display text-xl font-semibold text-navy tracking-tight`          | Card section headers                   |
| Card title      | `font-sans text-lg font-bold text-navy`                                | Credential cards, settings             |
| Stat value      | `font-display text-4xl font-extrabold tracking-tight`                  | Dashboard metrics                      |
| Body            | `font-sans text-sm text-navy`                                          | Default body                           |
| Label           | `font-sans text-sm font-semibold text-gray-700`                        | Form labels                            |
| Eyebrow         | `font-sans text-xs font-bold uppercase tracking-wider text-gray-400`   | Meta labels above values               |
| Status pill     | `font-sans text-xs font-bold uppercase tracking-wider`                 | Badge text                             |
| Helper          | `font-sans text-xs text-gray-500`                                      | Subtitles, muted helper text           |
| Mono            | `font-mono text-xs`                                                    | Hashes, IDs, addresses                 |

**Pairing rules:**

- Display font (`font-display` / Fraunces) is reserved for **headings, hero text, and prominent stat values only**. Never use it for body, labels, or buttons.
- Body font (`font-sans` / DM Sans) carries everything else — buttons, inputs, labels, helper text, body paragraphs.
- Mono (`font-mono` / JetBrains Mono) is exclusively for cryptographic identifiers, addresses, and hash values.
- Never mix three fonts in one component cluster. Headings + body is the maximum pairing within a single card.

### 6.2 Heading Component

Wrap heading patterns in a `PageHeader` component to avoid drift:

```tsx
// shared/components/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, description, action, onBack }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Go back"
            className="h-8 w-8 shrink-0 sm:h-10 sm:w-10 text-gray-400 hover:text-navy hover:bg-white rounded-full"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        )}
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-navy">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}
```

**Responsive icon-button rule.** Shared headers that host icon-only controls (back, close, overflow) scale their hit-area with the viewport: `h-8 w-8` on mobile, `h-10 w-10` at `sm+`, with the inner icon stepping `w-4 → w-5`. This keeps touch targets proportional to the surrounding type ramp on phones and tablets, instead of dominating the header at fixed `h-10 w-10`. Apply the same pattern to other shared icon buttons placed alongside title text.

### 6.2.1 BackLink Component

`BackLink` (`shared/components/BackLink.tsx`) is the standalone "Back" affordance placed at the top of a page's content (above `PageHeader`). It is distinct from `PageHeader`'s `onBack` icon button — use `BackLink` when the page wants a labelled text link rather than an inline icon next to a title.

Behavior:

- Navigates to the previous in-app URL via `navigate(-1)` when prior history exists (`location.key !== "default"`).
- Falls back to `/dashboard` when authenticated, `/` when not, when there is no prior history (e.g. deep-linked or fresh tab).
- Renders an `ArrowLeft` icon + `t("common.back")` label in `text-gray-500 hover:text-navy` with a gold focus ring.

Placement:

- On `AdaptiveLayout` / `PublicLayout` / `DashboardLayout` pages (Help, About, Profile, Update Email), drop `<BackLink />` as the first child of the page's `space-y-6` wrapper — the page rhythm provides spacing, so no margin prop is needed.
- On `SplitLayout` pages (Login), content is vertically centered with no `<main>` padding, so pass an explicit margin: `<BackLink className="mb-6" />`.

### 6.3 Eyebrow Label Component

The demo uses this pattern 30+ times - extract it:

```tsx
// shared/components/EyebrowLabel.tsx
export function EyebrowLabel({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "navy";
}) {
  const colorClass = tone === "navy" ? "text-navy" : "text-gray-400";
  return (
    <dt className={`text-xs font-bold ${colorClass} mb-1 tracking-wider uppercase`}>{children}</dt>
  );
}
```

### 6.4 Mono Identifier Component

```tsx
// shared/components/MonoId.tsx
export function MonoId({
  value,
  mode = "truncate",
  className,
}: {
  value: string;
  mode?: "truncate" | "address" | "full";
  className?: string;
}) {
  const display =
    mode === "full"
      ? value
      : mode === "address"
        ? `${value.slice(0, 10)}...${value.slice(-4)}`
        : `${value.slice(0, 16)}...`;
  return <span className={`font-mono text-xs text-gray-500 ${className ?? ""}`}>{display}</span>;
}
```

### 6.5 Visual Language Principles

The design system commits to a specific aesthetic position. These principles guard against drift toward generic AI-generated UI.

#### Aesthetic Position

**Confident restraint with editorial gravitas.** The reference points are Linear, Stripe, Mercury, and Coinbase Institutional - premium SaaS dashboards that feel authoritative without being austere. The blockchain layer adds typographic weight (mono identifiers, generous numerals) and material seriousness (tinted shadows, deep navy). NOT maximalist. NOT generic startup. NOT skeuomorphic.

#### Signature Moves to Preserve

These are the things that make CredChain visually distinct. Touch them only with intent.

1. **Navy + gold pairing** - Never substitute purple gradients, blue-to-cyan washes, or rainbow accents. The palette is the brand. The brand mark cluster (shield icon + "CredChain" wordmark) always renders in `text-gold` regardless of background — `DashboardSidebar`, `PublicLayout` header (`NavbarPublic`), and mobile `NavbarDashboard` shield all use `text-gold`. Never `text-surface` for the wordmark.
2. **Tinted colored shadows** - `shadow-md shadow-navy/20`, `shadow-lg shadow-gold/20`, `shadow-error/20` under brand-colored elements. This is the signature material treatment.
3. **Single decorative blob per hero area** - One soft radial gradient, never multiple competing blobs. Restraint is the move.
4. **Mono-font identifiers** - Every hash, address, and ID renders in `font-mono`. This is the blockchain visual cue. Never sans-serif a hash.
5. **Eyebrow labels** - `text-xs font-bold uppercase tracking-wider text-gray-400` precedes data values. Editorial typographic device.
6. **Generous rounded-2xl on cards** - Default to `rounded-2xl` (16px) for content cards. Avoid `rounded-md` (6px) on anything larger than a button - it reads as default Bootstrap.
7. **Display serif for headings** - Fraunces optical-size headings. Sans-serif headings would lose the editorial weight.
8. **Asymmetric stat cards on dashboard** - One gold card sits among neutral cards. The chromatic anchor draws the eye. Never four identical cards.

#### Anti-Patterns (Forbidden)

These signal AI-generated UI and are explicitly prohibited:

1. **Purple-to-blue gradients on white** - The most overused AI cliche.
2. **Glassmorphism / frosted-glass everywhere** - Acceptable only as a single intentional moment, never as a default surface treatment.
3. **Symmetric perfect-grid layouts** - Four identical metric cards in a row signals a template, not a designed interface.
4. **Default `shadow-md` on every card** - Use `shadow-sm` for resting cards. Reserve heavier shadows for elevation moments.
5. **Skeuomorphic blockchain imagery** - No 3D chain links, no gear icons for settings, no padlock for security. Use type and color.
6. **Bootstrap-style alerts and badges** - `bg-yellow-100 text-yellow-800 border-yellow-300` is the default-Bootstrap fingerprint. Use the role-color mapping in Section 5.2 instead.
7. **Default Tailwind colors for brand-bearing elements** - Buttons, headers, navigation must use `navy` or `gold`. `bg-blue-600` is forbidden.
8. **System-ui fonts** - Settled in 6.0. Always Fraunces + DM Sans + JetBrains Mono.
9. **Rounded-full on rectangular cards** - Pills are rounded-full. Cards are rounded-2xl. Don't blur the line.
10. **Generic stock illustrations** - No isometric people, no abstract crypto art, no Storyset/unDraw imagery.

#### Density Philosophy

Density choice depends on screen purpose:

| Surface             | Density             | Treatment                                                  |
| ------------------- | ------------------- | ---------------------------------------------------------- |
| Auth / hero         | Generous whitespace | `py-12` to `py-20`, large display type, single blob        |
| Public verification | Medium              | Editorial layout, focus on the claim being verified        |
| Dashboard overview  | Medium-high         | Stat cards at `h-40`, controlled grid, room to breathe     |
| List / table views  | High                | `py-4` rows, `text-sm`, scannable density                  |
| Form views          | Medium              | `py-3` inputs, `space-y-6` between sections, never cramped |
| Detail views        | Medium              | Two-column on desktop, eyebrow + value pattern             |

**Rule:** Never let a list view feel like a hero, and never let a hero feel like a database admin tool.

#### Asymmetry and Grid-Breaking

The demo's dashboard splits 2:1 (`lg:col-span-2`) and inserts a single gold card among three neutrals. Continue this pattern - **deliberate imbalance signals design intent**. Grid-breaking moves to use sparingly:

- One card in a metric row carries the brand color (gold or navy)
- A decorative blob extends slightly past a card edge (`-translate-y-12 translate-x-12`)
- Hero areas use vertical stacking on the visible side, horizontal on the affordance side
- Empty states center their content even when the surrounding layout is left-aligned

Do not break the grid on data tables, list rows, or form fields - density flows on those surfaces.

---

## 7. Component Recipes

The nine signature patterns from the demo, formalized as reusable components or `cn()` recipes.

### 7.1 cn() Helper (foundation)

```ts
// shared/lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

All conditional/composed classNames go through `cn()`. Never concatenate Tailwind classes with template strings.

### 7.2 Card Recipe

The foundational container for content panels:

```
bg-surface rounded-2xl shadow-sm border border-gray-100
```

Codify in shadcn `card.tsx`:

```tsx
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-gray-100 bg-surface shadow-sm", className)}
      {...props}
    />
  );
}
```

### 7.3 Primary CTA (navy)

```
including shadow tint and hover translate on trailing icon
```

shadcn `button.tsx` variant `primary`:

```tsx
const buttonVariants = cva(
  "inline-flex justify-center items-center font-bold transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none group",
  {
    variants: {
      variant: {
        primary: "bg-navy text-surface shadow-md shadow-navy/20 hover:bg-navy/90 focus:ring-navy",
        gold: "bg-gold text-navy shadow-md shadow-gold/20 hover:bg-gold/90 focus:ring-gold",
        destructive:
          "bg-error text-surface shadow-md shadow-error/20 hover:bg-error/90 focus:ring-error",
        outline: "border border-gray-200 bg-surface text-navy hover:bg-gray-50 focus:ring-navy",
        ghost: "text-navy hover:bg-gray-100 focus:ring-navy",
        dashed:
          "border-2 border-dashed border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-sm",
        icon: "p-2",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
```

Usage with trailing icon hover-slide:

```tsx
<Button>
  Sign in to Dashboard
  <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
</Button>
```

### 7.4 Icon-Prefixed Input

Build on top of shadcn `input.tsx` with a `leadingIcon` prop:

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: LucideIcon;
  trailingAction?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leadingIcon: Icon, trailingAction, className, ...props }, ref) => (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "block w-full rounded-xl border border-gray-200 py-3 pr-3 shadow-sm",
          "bg-gray-50 text-navy placeholder-gray-400",
          "focus:border-transparent focus:bg-white focus:ring-2 focus:ring-navy focus:outline-none",
          "transition-all sm:text-sm",
          Icon ? "pl-10" : "pl-4",
          trailingAction ? "pr-10" : "",
          className,
        )}
        {...props}
      />
      {trailingAction && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">{trailingAction}</div>
      )}
    </div>
  ),
);
```

### 7.5 Status Pill

```tsx
// shared/components/StatusPill.tsx
const toneClasses = {
  navy: "bg-navy/10 text-navy",
  gold: "bg-gold/20 text-navy",
  error: "bg-error/10 text-error",
  green: "bg-green-100 text-green-700",
  gray: "bg-gray-100 text-gray-600",
};

export function StatusPill({
  tone,
  children,
  icon: Icon,
}: {
  tone: keyof typeof toneClasses;
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase",
        toneClasses[tone],
      )}
    >
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </span>
  );
}
```

### 7.6 Decorative Blob

```tsx
// shared/components/DecorBlob.tsx
export function DecorBlob({
  tone = "gold",
  position = "top-right",
  size = "lg",
}: {
  tone?: "gold" | "navy" | "blue" | "error";
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size?: "md" | "lg" | "xl";
}) {
  const toneClass = {
    gold: "bg-gold/10",
    navy: "bg-navy/10",
    blue: "bg-blue-500/10",
    error: "bg-error/10",
  }[tone];

  const positionClass = {
    "top-right": "top-0 right-0 -translate-y-12 translate-x-12",
    "top-left": "top-0 left-0 -translate-y-12 -translate-x-12",
    "bottom-right": "bottom-0 right-0 translate-y-24 translate-x-12",
    "bottom-left": "bottom-0 left-0 translate-y-24 -translate-x-12",
  }[position];

  const sizeClass = {
    md: "w-32 h-32 blur-2xl",
    lg: "w-64 h-64 blur-3xl",
    xl: "w-96 h-96 blur-3xl",
  }[size];

  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-full",
        toneClass,
        positionClass,
        sizeClass,
      )}
    />
  );
}
```

### 7.7 Tinted Icon Block

Used in dashboard activity feeds, credential cards, role indicators:

```tsx
export function TintedIcon({
  icon: Icon,
  tone = "navy",
  size = "md",
}: {
  icon: LucideIcon;
  tone?: "navy" | "gold" | "error" | "green";
  size?: "sm" | "md" | "lg";
}) {
  const toneMap = {
    navy: "bg-navy/5 text-navy",
    gold: "bg-gold/10 text-navy",
    error: "bg-error/10 text-error",
    green: "bg-green-100 text-green-600",
  };
  const sizeMap = {
    sm: "p-2 rounded-lg [&>svg]:w-4 [&>svg]:h-4",
    md: "p-3 rounded-xl [&>svg]:w-6 [&>svg]:h-6",
    lg: "h-12 w-12 rounded-xl flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6",
  };
  return (
    <div className={cn("inline-flex items-center justify-center", toneMap[tone], sizeMap[size])}>
      <Icon />
    </div>
  );
}
```

### 7.8 Empty State

```tsx
// shared/components/EmptyState.tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-surface p-12 text-center shadow-sm">
      <Icon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
      <h3 className="mb-2 text-lg font-bold text-navy">{title}</h3>
      {description && <p className="mb-6 text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  );
}
```

### 7.9 Confirm Dialog (replaces window.confirm)

The demo uses `window.confirm` which is jarring on mobile and can't be styled. Production uses shadcn `dialog` + a `useConfirm` hook in `@ui/confirm-dialog`:

```tsx
// shadcn/ui/confirm-dialog.tsx — useConfirm()
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    resolve?: (v: boolean) => void;
    opts?: ConfirmOptions;
  }>({ open: false });

  const confirm = (opts: ConfirmOptions) =>
    new Promise<boolean>((resolve) => setState({ open: true, resolve, opts }));

  const dialog = (
    <Dialog open={state.open} onOpenChange={(o) => !o && state.resolve?.(false)}>
      {/* renders state.opts.title / description / confirmLabel / tone */}
    </Dialog>
  );

  return { confirm, dialog };
}
```

Usage — note `dialog` (lowercase) must be rendered alongside the trigger:

```tsx
const { confirm, dialog } = useConfirm();
const handleDelete = async () => {
  const ok = await confirm({
    title: t("user.delete.confirm.title"),
    description: t("user.delete.confirm.body"),
    confirmLabel: t("user.delete.confirm.action"),
    cancelLabel: t("common.cancel"),
    tone: "destructive",
  });
  if (ok) deleteUser.mutate(id);
};

return (
  <>
    <Button onClick={handleDelete}>Delete</Button>
    {dialog}
  </>
);
```

---

## 8. Layout System

### 8.1 Three Layout Shells

| Layout            | Used by                   | Pattern                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PublicLayout`    | `/credentials/verify/:id` | Navy header (`min-h-[64px]` flat, no `sm:` breakpoint) with **gold brand mark** + gold underline, white card body, `<CopyrightFooter />` strip (transparent background — see §8.1.1). Container is `min-h-dvh` (NOT `min-h-screen`) so the footer stays anchored to the *visible* viewport on mobile — `100vh` over-counts on mobile browsers (chrome collapse/expand) and pushes the footer below the fold or under the bottom bar. `<main>` padding `px-4 pt-4 pb-12 sm:px-8` mirrors `DashboardLayout` so unauthed Help/About sit identically to their authed counterparts.                                                                                                                                                                                                                                                                                                                  |
| `SplitLayout`     | `/` (Landing), `/login`   | Fixed 100dvh — no scrollbars. Outer container and right panel both use `h-dvh overflow-hidden`. Mobile: 33/67 vertical split — navy brand band `h-[33dvh]` with `flex items-center justify-center` to center brand content; white content area `flex-1` fills remaining 67dvh. Desktop: 50/50 horizontal split with navy brand panel left + light content right, gold + blue `<DecorBlob>`s. Mobile: navy band on top + content below, no blobs (too cramped). `AttestationStamp` now accepts a `className` prop for responsive sizing; mobile brand band renders it with `max-w-[min(160px,18vh)]` to scale down on short screens instead of hiding. Landing content vertically centered (`flex items-center justify-center`). Login content top-aligned on mobile (`justify-start`) and centered on desktop (`lg:justify-center`). Login `<BackLink>` uses `self-start` to align left within the card. Language switcher floats top-right on desktop (light variant), inside the navy band on mobile (dark variant). No copyright footer (Landing/Login are conversion surfaces). Landing/Login content refactored to viewport-relative units: `py-[2dvh]`, `space-y-[1.5dvh]`, card padding `p-6 sm:p-8`. Forced `min-h-[Xlh]` removed from headings and subtitles so content can shrink to fit short viewports. |
| `DashboardLayout` | All authenticated routes  | Fixed navy sidebar (`w-72`) with **gold brand mark cluster**, transparent top navbar (`min-h-[64px]` flat, no `sm:` breakpoint), scrollable `main` (`overflow-y-scroll [scrollbar-gutter:stable]` so route-switches with differing content heights don't reflow the navbar). On every route change, `useScrollToTop()` resets both the window scroller and the `#main` overflow container to the top so the next page never opens mid-scroll inherited from the previous one. Mobile: hand-rolled CSS-transform slide (`-translate-x-full` ↔ `translate-x-0`) with `bg-navy/80` click backdrop. `<main>` padding `px-4 pt-4 pb-12 sm:px-8`. No copyright footer (authenticated chrome; brand presence is the sidebar).                                                                                                                                                                                                                                 |
| `AdaptiveLayout`  | `/help`, `/about`         | Renders `DashboardLayout` if `isAuthenticated`, `PublicLayout` otherwise. Because both layouts use identical `<main>` padding (`px-4 pt-4 pb-12 sm:px-8`) and matching header heights, unauthed and authed Help/About pages render identically — the only delta is the copyright strip, which appears only on the unauthenticated `PublicLayout` branch.                                                                                                                                                                                                                                                                                                                                                                 |

#### Copyright Footer

The `<CopyrightFooter />` shared component (`@shared/components/CopyrightFooter.tsx`) is the only place that renders the copyright line. **Always consume it via the component — never inline the `<footer>` element.** It:

- Renders `© {year} · CredChain · All rights reserved` with `{year}` pulled from `new Date().getFullYear()` at render time (no hardcoded year).
- Uses `font-sans` (DM Sans) at `text-xs` in `text-gray-400`. Copyright text is functional/legal copy — `font-display` (Fraunces) is reserved for headings and would feel out of place at this size; `font-mono` (JetBrains Mono) is reserved for cryptographic identifiers. Neither belongs in a copyright strip.
- Carries `bg-transparent` (not `bg-surface`) so the page's `bg-base` (#F8FAFC) shows through. The previous `bg-surface` (#FFFFFF) created a visible "white void" between short content and the footer — the two colors are only ~3% apart in lightness, so on most screens the footer area looked like a separate section from the page background. Transparent background eliminates this contrast entirely; the footer becomes a line of muted text floating in the page's continuous background.
- Carries `safe-area-bottom` (iOS home indicator padding) and `no-print` (hidden when printing) classes.
- Has `mt-auto` baked in so it pins to the bottom of any flex-column container with `min-h-dvh` and a `flex-1` main slot.
- Accepts a `className` prop for layout-level overrides.

**Where it appears:** only on `PublicLayout` and the unauthenticated branch of `AdaptiveLayout` (Help, About). It does NOT appear on `DashboardLayout` (authenticated chrome) or `SplitLayout` (Landing, Login — conversion surfaces).

### 8.2 Container Widths

| Width          | Tailwind                   | Use case                          |
| -------------- | -------------------------- | --------------------------------- |
| Form / detail  | `max-w-md`                 | Auth card                         |
| Detail view    | `max-w-3xl`                | UserDetail, single-record screens |
| Settings       | `max-w-4xl`                | Settings, verification            |
| Verification   | `max-w-3xl` to `max-w-4xl` | VerifyCredential (public)         |
| Batch forms    | `max-w-6xl`                | UserCreate, CredentialIssue       |
| Lists / tables | `max-w-7xl`                | UserList, CredentialList          |

All containers center via `mx-auto`.

### 8.3 Vertical Rhythm

| Class       | Use                           |
| ----------- | ----------------------------- |
| `space-y-6` | Page-level rhythm (default)   |
| `space-y-4` | Sub-section spacing           |
| `space-y-8` | Generous form section spacing |
| `space-y-1` | Label + input pair            |
| `space-y-2` | Tight clusters                |

### 8.4 Card Padding

| Use              | Padding                       |
| ---------------- | ----------------------------- |
| Standard card    | `p-6`                         |
| Prominent form   | `p-6 sm:p-8` or `p-6 sm:p-10` |
| Compact pill row | `p-4 sm:p-6`                  |

### 8.5 Grid Patterns

| Pattern                 | Tailwind                                                        |
| ----------------------- | --------------------------------------------------------------- |
| Stat cards (4-up)       | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`          |
| Credential cards (3-up) | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`          |
| Dashboard split         | `grid grid-cols-1 lg:grid-cols-3 gap-6` (main: `lg:col-span-2`) |
| Form fields (3-up)      | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`          |
| Form fields (2-up)      | `grid grid-cols-1 md:grid-cols-2 gap-6`                         |

### 8.6 Dashboard Sidebar Pattern

```tsx
// shared/components/layout/DashboardSidebar.tsx
<aside
  className={cn(
    "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy text-gray-300 shadow-2xl transition-transform duration-300 sm:static sm:flex-shrink-0 sm:translate-x-0",
    open ? "translate-x-0" : "-translate-x-full",
  )}
>
  {/* Logo cluster — both icon and wordmark in gold */}
  <div className="flex flex-col items-center pt-10 pb-8">
    <ShieldCheck className="mb-2 h-12 w-12 text-gold" aria-hidden="true" />
    <span className="font-display text-2xl font-bold tracking-tight text-gold">CredChain</span>
  </div>
  {/* Nav items - role-filtered via canAccess() helper */}
  {/* Mt-auto logout button */}
</aside>
```

Nav items use `NavLink` with active state styling. The active state must read clearly at every screen size (mobile drawer + desktop sidebar share this one component), so it pairs a **gold left-accent bar** with a brighter background and a gold icon. Inactive items carry a transparent left border of the same width to prevent layout shift on activation:

```tsx
className={({ isActive }) => cn(
  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all border-l-[3px]",
  isActive
    ? "border-gold bg-white/15 text-surface shadow-sm"
    : "border-transparent hover:bg-white/5 hover:text-surface"
)}
```

The icon color follows the active state via the `children` render prop (`isActive ? "text-gold" : "text-gray-400"`). `NavLink` auto-applies `aria-current="page"` to the active link — no manual ARIA needed.

### 8.7 Mobile Drawer

**As-built:** the mobile sidebar is hand-rolled in `DashboardLayout.tsx`, not a shadcn `Sheet`. The `<aside>` is fixed-position and slides via CSS transform, toggled by a `dashboardSidebarOpen` local state (the store state is reserved for cross-component coordination, currently unused); a `bg-navy/80` backdrop (`sm:hidden`) closes it on click. `DashboardSidebar` accepts an `onClose` prop that renders a close (`X`) button and dismisses the drawer on nav-item click.

```tsx
// DashboardLayout.tsx (abbreviated)
<aside
  className={cn(
    "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transition-transform duration-300",
    "sm:sticky sm:top-0 sm:h-screen sm:flex-shrink-0 sm:translate-x-0",
    dashboardSidebarOpen ? "translate-x-0" : "-translate-x-full",
  )}
>
  <DashboardSidebar onClose={() => setDashboardSidebarOpen(false)} />
</aside>
```

> A shadcn `Sheet` was originally specced for this but never adopted — the hand-rolled transform is the live implementation. The `vaul` `Drawer` primitive _is_ installed, but it is reserved for **content** drawers (e.g. `UserEditDrawer`, the admin batch-edit panel), not navigation.

### 8.8 Responsive Breakpoints

> For comprehensive responsive guidance (touch targets, safe areas, mobile keyboards, container queries, print, dark mode), see Section 8.9 Responsive Design.

Mobile-first using Tailwind defaults:

| Breakpoint | Min width | Used for                                |
| ---------- | --------- | --------------------------------------- |
| `sm:`      | 640px     | Tables visible, side-by-side rows       |
| `md:`      | 768px     | 2-column grids, search bar visibility   |
| `lg:`      | 1024px    | Sidebar (DashboardSidebar) visible, split auth, 4-up grids |
| `xl:`      | 1280px    | (rarely used) ultra-wide refinements    |

### 8.9 Responsive Design

Responsive is not just breakpoints. This section consolidates everything required for the app to feel native on phones, comfortable on tablets, and authoritative on desktop.

#### Mobile-First Methodology

All component styles default to mobile. Add complexity at larger breakpoints, never the reverse:

```tsx
// CORRECT - mobile is the base, desktop layers on
<div className="flex flex-col gap-4 md:flex-row md:gap-6">

// WRONG - desktop is base, mobile is afterthought
<div className="flex flex-row gap-6 max-md:flex-col max-md:gap-4">
```

#### Viewport Meta

In `index.html`, support iOS safe areas:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

`viewport-fit=cover` enables `env(safe-area-inset-*)` to expose notch/home-indicator insets.

#### Touch Targets

Every interactive element on touch devices must be at minimum **44x44px** (Apple HIG) and ideally **48x48px** (Material). Tailwind sizing for buttons:

| Use case              | Class                                | Resulting size             |
| --------------------- | ------------------------------------ | -------------------------- |
| Primary CTA           | `px-6 py-3 text-sm`                  | 48px tall                  |
| Secondary             | `px-4 py-2 text-sm`                  | 40px - tablet/desktop only |
| Icon button (mobile)  | `p-3` (12px on each side, 24px icon) | 48px square                |
| Icon button (desktop) | `p-2` (8px on each side, 24px icon)  | 40px square                |

`DashboardSidebar` nav items already meet target with `px-4 py-3`. Form inputs at `py-3` produce 48px - keep that on mobile, never compress to `py-2`.

#### Safe-Area Insets

Apply to elements that touch the viewport edges on iOS:

```css
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
.safe-area-x {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

Apply to:

- `PublicLayout` footer
- `DashboardLayout` mobile top nav (when navy bar reaches edge)
- Mobile sidebar `Sheet` content
- Bottom-sheet dialogs (when added)
- Toast container (sonner provides this, but verify on iOS)

**Cascade gotcha:** `safe-area-top` (and `-bottom`/`-x`) sets `padding-top: env(safe-area-inset-top)` directly. When co-located with Tailwind's `py-*` utilities on the same element, `safe-area-top` overrides the `padding-top` from `py-*` (CSS utilities-layer source order), leaving the element with `padding-top: 0` on devices without a notch. Apply `safe-area-top` to a dedicated zero-height spacer `<div>` _inside_ the element instead of co-locating it with `py-*`. Pattern in use: `NavbarDashboard.tsx`.

#### Mobile Keyboard Hints

Guide the on-screen keyboard with the right semantics:

```tsx
<input type="email"   inputMode="email"   autoComplete="email"        autoCapitalize="off" />
<input type="tel"     inputMode="tel"     autoComplete="tel"          />
<input type="text"    inputMode="numeric" autoComplete="one-time-code" /> {/* OTP */}
<input type="search"  inputMode="search"  enterKeyHint="search"        />
<input type="url"     inputMode="url"     autoComplete="url"          autoCapitalize="off" />
```

`enterKeyHint` controls the return-key label: `enter`, `done`, `go`, `next`, `previous`, `search`, `send`.

#### Reduced Motion

Respect `prefers-reduced-motion`. The decorative blob is the most aggressive animation candidate; disable for users who opt out:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

Honor it in JS too:

```ts
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

#### Container Queries

Use for components that should respond to **their parent container's width**, not the viewport. Useful for cards that appear in different contexts (sidebar list vs main grid):

```css
.credential-card {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 320px) {
  .credential-card .meta {
    display: flex;
  }
}
```

In Tailwind v4 via the `@container` plugin or `[@container]` arbitrary variants. Reserve for genuinely reusable components - viewport breakpoints handle most cases.

#### Tablet Treatment (768-1024px)

The `md:` to `lg:` range needs explicit decisions:

| Element          | md (tablet portrait)  | lg (tablet landscape / desktop) |
| ---------------- | --------------------- | ------------------------------- |
| DashboardSidebar          | Mobile drawer (Sheet) | Fixed `w-72`                    |
| Navigation       | Hamburger menu        | Fixed sidebar                   |
| Stat cards       | 2-up grid             | 4-up grid                       |
| Credential cards | 2-up                  | 3-up                            |
| Form fields      | 2-up where logical    | 3-up where logical              |
| Auth screen      | Stacked               | Split-screen                    |
| Detail views     | Single column         | Two-column with side panel      |

#### Print Styles

The public credential verification page must print cleanly (employers, registrars):

```css
@media print {
  .no-print {
    display: none;
  }
  .print-only {
    display: block;
  }
  body {
    background: white;
    color: black;
  }
  .navy-card {
    background: white;
    color: black;
    border: 2px solid black;
  }
  a::after {
    content: " (" attr(href) ")";
    font-size: 0.875em;
    color: #666;
  }
  .credential-hash {
    word-break: break-all;
  }
}
```

Apply `.no-print` to: nav, footer, action buttons, decorative blobs.
Apply `.print-only` to: a print header with verification timestamp + URL.

#### Orientation

Mobile auth screen in landscape can feel cramped. Consider:

```tsx
<div className="flex min-h-screen flex-col landscape:flex-row">
  {/* Branding panel: top in portrait, left in landscape */}
</div>
```

Not every screen needs orientation handling - reserve for full-screen experiences (auth, public verification). Lists and forms should scroll naturally.

#### Mobile UX Patterns

| Pattern            | When to use                          | Implementation                                              |
| ------------------ | ------------------------------------ | ----------------------------------------------------------- |
| Side sheet         | Navigation (mobile sidebar)          | shadcn `Sheet side="left"`                                  |
| Bottom sheet       | Actions / filters / detail preview   | shadcn `Drawer` (Vaul-based)                                |
| Full-screen dialog | Multi-step flows on mobile           | shadcn `Dialog` with `h-screen` override at `sm:max-w-none` |
| Pull-to-refresh    | List views on mobile only            | Defer to Phase 2 unless requested                           |
| Swipe-to-delete    | Soft-delete in user/credential lists | Defer to Phase 2                                            |
| Long-press menu    | Context actions on cards             | Defer to Phase 2; right-click handles desktop               |

#### Dark Mode Hooks (Phase 2)

The token structure already supports dark mode. When prioritized, add to `styles/index.css`:

```css
@layer base {
  :root.dark {
    --color-base: #0f172a;
    --color-surface: #1e293b;
    --color-navy: #f8fafc; /* invert: text becomes light */
    /* ... rest of overrides ... */
  }
}
```

Toggle by adding/removing `.dark` on `<html>`. Persist choice via `useStore.theme`. shadcn/ui components consume the same tokens, so they reskin automatically.

#### Verification Checklist

Before shipping any new screen:

- [ ] Renders correctly at 375px (iPhone SE), 768px (iPad portrait), 1024px (iPad landscape), 1440px (desktop)
- [ ] All interactive elements >= 44x44px on touch
- [ ] No horizontal scrollbars at any breakpoint
- [ ] Safe-area insets honored on iOS
- [ ] Reduced motion gracefully degrades animations
- [ ] Mobile keyboard shows correct type for each input
- [ ] Tested at 200% browser zoom (accessibility requirement)
- [ ] Print preview is legible (for verification page)

---

## 9. State Management

### 9.1 Two-Layer Model

| Layer        | Tool           | What lives here                                       |
| ------------ | -------------- | ----------------------------------------------------- |
| Server state | TanStack Query | All API data: users, credentials, auth responses      |
| Client state | Zustand        | Current user session, UI state (sidebar open, locale) |

Never put server data in Zustand. Never put auth session in TanStack Query cache.

### 9.2 Zustand Store

The store is a **single file** (`app/store/index.ts`) combining an auth slice and a UI slice, wrapped in `persist`. Default locale is `"id"`. Only `user`, `isAuthenticated`, and `locale` are persisted (`partialize`) — never tokens, never `sidebarOpen`.

```ts
// app/store/index.ts (abbreviated)
interface AuthSlice {
  user: UserDTO | null;
  isAuthenticated: boolean;
  setUser: (user: UserDTO) => void;
  clearUser: () => void;
}

interface UiSlice {
  dashboardSidebarOpen: boolean;
  locale: "en" | "id";
  setDashboardSidebarOpen: (open: boolean) => void;
  toggleDashboardSidebar: () => void;
  setLocale: (locale: "en" | "id") => void;
}

export const useStore = create<AuthSlice & UiSlice>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),

      dashboardSidebarOpen: false,
      locale: "id",
      setDashboardSidebarOpen: (open) => set({ dashboardSidebarOpen: open }),
      toggleDashboardSidebar: () => set((s) => ({ dashboardSidebarOpen: !s.dashboardSidebarOpen })),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "credchain-store",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, locale: s.locale }),
    },
  ),
);
```

### 9.3 TanStack Query Conventions

```ts
// shared/api/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 10, // 10 min
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status === 401) return false;
        if (isApiError(error) && error.status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      onError: (error) => {
        toast.error(resolveErrorMessage(error));
      },
    },
  },
});
```

Query key conventions:

```ts
export const userKeys = {
  all: () => ["users"] as const,
  list: (params?: UserListParams) => ["users", "list", params] as const,
  detail: (id: string) => ["users", "detail", id] as const,
  self: () => ["users", "self"] as const,
};

export const credentialKeys = {
  all: () => ["credentials"] as const,
  list: (params?: CredentialListParams) => ["credentials", "list", params] as const,
  detail: (id: string) => ["credentials", "detail", id] as const,
  mine: () => ["credentials", "mine"] as const,
};
```

### 9.4 Mutation Pattern

All mutations follow this shape:

```ts
// feature/user/api/useDeleteUsers.ts
export function useDeleteUsers() {
  return useMutation({
    mutationFn: (ids: string[]) => api.delete("/users/batch", { data: { ids } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      toast.success(t("user.delete.success"));
    },
  });
}
```

---

## 10. API Integration Layer

### 10.1 Axios Instance

```ts
// shared/api/client.ts
export const api = axios.create({
  baseURL: env.apiBaseUrl, // VITE_API_BASE_URL ?? "/api"
  withCredentials: true, // sends httpOnly cookies
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: { indexes: null }, // repeated params without [] brackets (Gin-friendly)
});
```

The client also exposes `configureAuthHandler(fn)` and `configureLocaleResolver(fn)` setters so the auth-failure redirect and the `Accept-Language` value can be wired from `app/` without `shared/` importing from `app/` (keeps the boundary rule intact).

### 10.2 Response Envelope & Interceptors

Every backend response is `{ code, message, data? }`. The request interceptor stamps `Accept-Language`; the response interceptor unwraps the envelope; the error interceptor handles silent refresh, 429, and `ApiError` wrapping:

```ts
// shared/api/client.ts (abbreviated)
api.interceptors.request.use((config) => {
  config.headers["Accept-Language"] = resolveLocale(); // from Zustand locale
  return config;
});

let refreshInFlight: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => response.data?.data ?? response.data, // unwrap envelope
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const config = error.config;

    // 401 → single deduplicated silent refresh, then retry once with X-Retry: 1
    const isAuthPath = /\/auth\/(refresh|google|logout)/.test(config?.url ?? "");
    if (status === 401 && !isAuthPath && config?.headers?.["X-Retry"] !== "1") {
      try {
        refreshInFlight ??= api.post("/auth/refresh");
        await refreshInFlight;
        return api.request({ ...config, headers: { ...config!.headers, "X-Retry": "1" } });
      } catch {
        onAuthFailure(); // clears Zustand + navigates to /login
        return Promise.reject(error);
      } finally {
        refreshInFlight = null;
      }
    }

    // 429 → rate-limit message keys (with/without Retry-After)
    if (status === 429) {
      const retryAfter = error.response?.headers["retry-after"];
      const key = retryAfter ? "system.rate_limited_with_retry" : "system.rate_limited";
      return Promise.reject(new ApiError(status, error.response?.data?.code, key, error));
    }

    const messageKey = codeToMessageKey(error.response?.data?.code);
    return Promise.reject(new ApiError(status, error.response?.data?.code, messageKey, error));
  },
);
```

### 10.3 ApiError Type

```ts
// shared/api/envelope.ts
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export class ApiError extends Error {
  constructor(
    public status: number | undefined,
    public code: number | undefined,
    public messageKey: string,
    public cause: AxiosError,
  ) {
    super(messageKey);
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
```

### 10.4 Backend Code -> i18n Key Mapping

Mirror the backend's `CodeToMessageKey` map from `infrastructure/http/responder/mapper.go`:

```ts
// shared/api/codes.ts
export const CODE_TO_MESSAGE_KEY: Record<number, string> = {
  // System
  100000: "system.success",
  400000: "system.internal_error",
  400001: "system.validation",
  // Auth
  100100: "auth.login.success",
  400100: "auth.login.failed",
  400101: "auth.token.invalid",
  400102: "auth.token.expired",
  300100: "auth.forbidden",
  // User
  100200: "user.fetch.success",
  100201: "user.store.success",
  400200: "user.fetch.not_found",
  400201: "user.store.email_duplicate",
  // ... mirror all codes from domain/codes.go
};

export function codeToMessageKey(code?: number): string {
  if (!code) return "system.internal_error";
  return CODE_TO_MESSAGE_KEY[code] ?? "system.internal_error";
}
```

Keep this file in sync with `CredChain_Golang/domain/codes.go`. When the backend adds a new code, add it here and in both locale files.

### 10.5 Pagination

Backend returns `{ data: T[], total, page, page_size }`. Use a typed hook:

```ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
```

---

## 11. Authentication Flow

### 11.1 Token Storage Strategy

**httpOnly cookies set by backend** — immune to XSS token theft, CSRF mitigated via `SameSite=Strict`. This is **implemented** on both sides as of the current backend (`CredChain_Golang`, see its `AGENTS.md`):

- `/api/auth/google` returns the user envelope and sets two `Set-Cookie` headers:
  - `access_token` (HttpOnly, Secure, `Path=/api`, `SameSite=Strict`)
  - `refresh_token` (HttpOnly, Secure, `Path=/api/auth`, `SameSite=Strict`)
- `/api/auth/refresh` rotates both cookies on success.
- `/api/auth/logout` clears both cookies.
- CORS is configured with `Access-Control-Allow-Credentials: true` and an explicit origin (never `*`); the Go router panics at startup if `GIN_CORS_ALLOW_ORIGINS=*` while credentials are enabled.

The frontend never reads or writes tokens. Axios sends them automatically via `withCredentials: true`. The token fields in `/api/auth/google` and `/api/auth/refresh` response bodies (`access_token`, `refresh_token`, `*_expires_in`) are still part of the wire format (`response.Auth` mirrored as `AuthResponseDTO`) but ignored in the cookie strategy.

### 11.2 Google OAuth Flow

```tsx
// app/providers.tsx
<GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

```tsx
// feature/auth/components/GoogleButton.tsx
import { GoogleLogin } from "@react-oauth/google";

export function GoogleButton() {
  const login = useGoogleLogin();
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          login.mutate({ id_token: credentialResponse.credential });
        }
      }}
      onError={() => toast.error(t("auth.login.failed"))}
      theme="outline"
      size="large"
      width="100%"
    />
  );
}
```

```ts
// feature/auth/api/useGoogleLogin.ts
export function useGoogleLogin() {
  const setUser = useStore((s) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: { id_token: string }) => api.post<AuthResponse>("/auth/google", payload),
    onSuccess: (data) => {
      // data.access_token / data.refresh_token are NOT used here -
      // backend already set httpOnly cookies. We only persist user.
      setUser(data.user);
      navigate("/dashboard");
    },
  });
}
```

### 11.3 Silent Refresh

Handled in the axios response interceptor (Section 10.2). When any request returns 401, the interceptor calls `/api/auth/refresh` once, then retries the original request. On refresh failure, clears Zustand session and redirects to `/login`.

This means React components never deal with token rotation manually.

### 11.4 Logout

```ts
export function useLogout() {
  const clearUser = useStore((s) => s.clearUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => {
      // Always clear, even on failure
      clearUser();
      queryClient.clear();
      navigate("/login");
    },
  });
}
```

### 11.5 Hydrating Session on App Load

On app start, hit `/api/users/self` to detect a valid session (cookies present + valid):

```tsx
// app/providers.tsx
function SessionHydrator({ children }: { children: React.ReactNode }) {
  const setUser = useStore((s) => s.setUser);
  const clearUser = useStore((s) => s.clearUser);

  const { isLoading } = useQuery({
    queryKey: userKeys.self(),
    queryFn: () => api.get<UserDTO>("/users/self"),
    retry: false,
    onSuccess: (user) => setUser(user),
    onError: () => clearUser(),
  });

  if (isLoading) return <FullPageSpinner />;
  return <>{children}</>;
}
```

### 11.6 Email Update with Google Reauth

The backend's `PUT /api/users/self/email` requires a fresh Google ID token:

```tsx
// feature/user/UserSelfEmail.tsx
const { google } = useGoogleOneTapLogin({
  /* ... */
});
const updateEmail = useMutation({
  mutationFn: (payload: { email: string; id_token: string }) =>
    api.put("/users/self/email", payload),
});

const handleSubmit = async (newEmail: string) => {
  // 1. Re-prompt Google for fresh ID token
  const credential = await requestFreshGoogleToken();
  // 2. Send to backend with new email
  await updateEmail.mutateAsync({ email: newEmail, id_token: credential });
};
```

---

## 12. Routing & Authorization

### 12.1 Role Hierarchy (Single Source of Truth)

Extract from the demo's duplicated logic into a single utility:

```ts
// shared/auth/role.ts
export const Role = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ISSUER: "issuer",
  HOLDER: "holder",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_LEVEL: Record<Role, number> = {
  [Role.HOLDER]: 1,
  [Role.ISSUER]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPER_ADMIN]: 4,
};

export function canAccess(userRole: Role | undefined, minRole: Role): boolean {
  if (!userRole) return false;
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole];
}

export function canAccessAny(userRole: Role | undefined, allowed: Role[]): boolean {
  if (!userRole) return false;
  const minLevel = Math.min(...allowed.map((r) => ROLE_LEVEL[r]));
  return ROLE_LEVEL[userRole] >= minLevel;
}
```

### 12.2 Route Guards

```tsx
// shared/auth/guards.tsx
export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { user, isAuthenticated } = useStore((s) => s);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !canAccessAny(user?.role, allowedRoles)) {
    const fallback = user?.role === Role.HOLDER ? "/credentials/self" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated } = useStore((s) => s);
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";
  return isAuthenticated ? <Navigate to={from} replace /> : <Outlet />;
}

export function RoleGate({
  allowed,
  children,
  fallback = null,
}: {
  allowed: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useStore((s) => s);
  return canAccessAny(user?.role, allowed) ? <>{children}</> : <>{fallback}</>;
}
```

### 12.3 Lazy Routes

```tsx
// app/router.tsx
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/credentials/verify/:credentialId",
        lazy: () => import("@feature/credential/VerifyCredential"),
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: "/login", lazy: () => import("@feature/auth/Login") }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", lazy: () => import("@feature/dashboard/Dashboard") },
          { path: "/credentials/self", lazy: () => import("@feature/credential/MyCredentials") },
          {
            element: <ProtectedRoute allowedRoles={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]} />,
            children: [
              { path: "/users", lazy: () => import("@feature/user/UserList") },
              { path: "/users/:id", lazy: () => import("@feature/user/UserDetail") },
              { path: "/credentials", lazy: () => import("@feature/credential/CredentialList") },
              {
                path: "/credentials/issue",
                lazy: () => import("@feature/credential/CredentialIssue"),
              },
              {
                path: "/credentials/:id",
                lazy: () => import("@feature/credential/CredentialDetail"),
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]} />,
            children: [
              { path: "/users/create", lazy: () => import("@feature/user/UserCreate") },
              { path: "/settings", lazy: () => import("@feature/dashboard/Settings") },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
```

### 12.4 In-Component Authorization

Use `RoleGate` for inline UI gating (e.g., showing/hiding action buttons):

```tsx
<RoleGate allowed={[Role.ADMIN, Role.SUPER_ADMIN]}>
  <Button variant="destructive" onClick={handleDelete}>
    Delete
  </Button>
</RoleGate>
```

---

## 13. Forms & Validation

### 13.1 Schema-First with Zod

Mirror backend Ozzo rules from `feature/user/user_request.go`:

```ts
// feature/user/schemas/user.ts
import { z } from "zod";

const strictE164 = /^\+[1-9]\d{6,14}$/;

export const userStoreSchema = z.object({
  name: z.string().min(1).max(256),
  number: z.string().max(256).optional(),
  phone_number: z.string().regex(strictE164).max(19).optional(),
  email: z.string().email().max(256),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  meta: z.record(z.unknown()).optional(),
  role: z.enum([Role.HOLDER, Role.ISSUER, Role.ADMIN]),
});

export type UserStoreInput = z.infer<typeof userStoreSchema>;

export const userBatchStoreSchema = z.object({
  users: z.array(userStoreSchema).min(1).max(100),
});
```

### 13.2 React Hook Form + shadcn Form

```tsx
// feature/user/UserCreate.tsx
const form = useForm<UserBatchStoreInput>({
  resolver: zodResolver(userBatchStoreSchema),
  defaultValues: { users: [defaultUser()] },
});

const { fields, append, remove } = useFieldArray({ control: form.control, name: "users" });

const createUsers = useMutation({
  mutationFn: (data: UserBatchStoreInput) => api.post("/users/batch", data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all() });
    toast.success(t("user.store.success"));
    navigate("/users");
  },
});

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit((data) => createUsers.mutate(data))}>
      {fields.map((field, idx) => (
        <UserRow key={field.id} index={idx} onRemove={() => remove(idx)} />
      ))}
      <Button type="button" variant="dashed" onClick={() => append(defaultUser())}>
        Add another entity
      </Button>
      <Button type="submit" variant="primary" disabled={createUsers.isPending}>
        Register Entities
      </Button>
    </form>
  </Form>
);
```

### 13.3 Field Component

shadcn `form.tsx` provides `<FormField>` + `<FormControl>` + `<FormMessage>`. Wrap into a project-specific `<TextField>` for the icon-prefixed input pattern:

```tsx
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  leadingIcon,
  placeholder,
  type = "text",
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  leadingIcon?: LucideIcon;
  placeholder?: string;
  type?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className="text-sm font-semibold text-gray-700">{label}</FormLabel>
          <FormControl>
            <Input leadingIcon={leadingIcon} placeholder={placeholder} type={type} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

### 13.4 Server-Side Validation Errors

Backend returns `400` with `code: 400001` (validation) and per-field details. Map to RHF errors:

```ts
import { setServerErrors } from "@shared/lib/forms";

const createUsers = useMutation({
  mutationFn: ...,
  onError: (error: ApiError) => {
    if (error.code === 400001 && error.cause.response?.data.errors) {
      setServerErrors(form, error.cause.response.data.errors);
    } else {
      toast.error(t(error.messageKey));
    }
  },
});
```

---

## 14. Internationalization

### 14.1 i18next Setup

```ts
// shared/i18n/config.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import id from "./id.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: navigator.language.startsWith("id") ? "id" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
});
```

### 14.2 Locale Files

Must be **exact mirrors** of backend `locales/en.json` and `locales/id.json`. Any mismatch causes missing translation warnings.

Use a script to verify sync (run in CI or precommit):

```bash
# scripts/check-locales-sync.mjs
import enFe from "../src/shared/i18n/en.json" assert { type: "json" };
import enBe from "../../CredChain_Golang/locales/en.json" assert { type: "json" };

const feKeys = new Set(Object.keys(enFe));
const beKeys = new Set(Object.keys(enBe));

const missing = [...beKeys].filter((k) => !feKeys.has(k));
const extra   = [...feKeys].filter((k) => !beKeys.has(k));

if (missing.length || extra.length) {
  console.error("Locale drift detected:", { missing, extra });
  process.exit(1);
}
```

### 14.3 Translation Hook

```tsx
import { useTranslation } from "react-i18next";

export function MyComponent() {
  const { t } = useTranslation();
  return <p>{t("user.fetch.success")}</p>;
}
```

### 14.4 Language Switcher

Lives in `NavbarDashboard` and `NavbarPublic`. Persists choice to `useStore.locale`:

```tsx
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLocale = useStore((s) => s.setLocale);

  const change = (lng: "en" | "id") => {
    void i18n.changeLanguage(lng);
    setLocale(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm font-medium text-navy">
        {i18n.language === "id" ? "ID" : "EN"}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => change("en")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => change("id")}>Bahasa Indonesia</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 14.5 Backend Locale Header

Send `Accept-Language` from frontend so backend `I18nMiddleware` matches:

```ts
api.interceptors.request.use((config) => {
  const locale = useStore.getState().locale;
  config.headers["Accept-Language"] = locale;
  return config;
});
```

### 14.6 Indonesian Translation Conventions

Locked decisions for `id.json` — do not revert without a design review:

| Key                         | English              | Indonesian               | Rationale                                                 |
| --------------------------- | -------------------- | ------------------------ | --------------------------------------------------------- |
| `nav.overview`              | Overview             | **Dasbor**               | "Ikhtisar" is too archaic for a product dashboard context |
| `nav.users`                 | Users                | Pengguna                 | Standard Indonesian for users                             |
| `nav.credentials`           | Credentials          | Kredensial               | Direct loanword, widely understood                        |
| `nav.settings`              | Settings             | Pengaturan               | Standard Indonesian                                       |
| `dashboard.welcome`         | Welcome, {{name}}    | Selamat datang, {{name}} | Formal greeting, appropriate for a professional platform  |
| `user.list.count_one/other` | {{count}} user/users | {{count}} pengguna       | "Entitas" was rejected — too abstract for end users       |

**Default locale is Indonesian (`id`).** The persisted locale is read from localStorage before i18next initializes, so users never see a flash of English on first load.

**Global nav search is bilingual.** `useNavSearch` matches the query against both `en` and `id` labels simultaneously using `i18n.getFixedT("en")` and `i18n.getFixedT("id")`. Typing "dasbor" finds Dashboard on an English-locale session; typing "overview" finds it on an Indonesian-locale session. The search input placeholder stays localized to the active locale.

---

## 15. Error Handling

### 15.1 Error Surfaces

| Error type                 | UI surface                | Resolution                |
| -------------------------- | ------------------------- | ------------------------- |
| Validation (`code 400001`) | Inline form field error   | Fix input                 |
| Auth (`status 401`)        | Silent refresh + redirect | Auto                      |
| Forbidden (`status 403`)   | Toast + route fallback    | Sign in as different user |
| Not Found (`status 404`)   | Empty state on page       | Navigate back             |
| Server (5xx)               | Toast                     | Retry button              |
| Network                    | Toast                     | Retry button              |
| Boundary crash             | Full-page ErrorBoundary   | Reload                    |

### 15.2 ErrorBoundary

Use `react-error-boundary` (small, well-maintained):

```tsx
// shared/components/ErrorBoundary.tsx
import { ErrorBoundary as REB } from "react-error-boundary";

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <REB
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="flex min-h-screen items-center justify-center p-6">
          <Card className="max-w-md p-8 text-center">
            <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-error" />
            <h2 className="mb-2 text-2xl font-bold text-navy">Something broke</h2>
            <p className="mb-6 text-sm text-gray-500">{error.message}</p>
            <Button onClick={resetErrorBoundary}>Try again</Button>
          </Card>
        </div>
      )}
      onError={(error) => console.error("App boundary:", error)}
    >
      {children}
    </REB>
  );
}
```

### 15.3 Toast Conventions

```ts
// shared/lib/notify.ts
import { toast } from "sonner";

export const notify = {
  success: (key: string, opts?: { description?: string }) => toast.success(i18n.t(key), opts),
  error: (key: string, opts?: { description?: string }) => toast.error(i18n.t(key), opts),
  info: (key: string, opts?: { description?: string }) => toast.info(i18n.t(key), opts),
};
```

Mutation success/error always passes through `notify`:

```ts
onSuccess: () => notify.success("user.store.success"),
onError: (e: ApiError) => notify.error(e.messageKey),
```

### 15.4 Inline Validation Errors

shadcn `<FormMessage />` automatically reads from RHF state. Backend validation errors should be mapped onto the form:

```ts
// shared/lib/forms.ts
export function setServerErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  errors: Record<string, string>,
) {
  Object.entries(errors).forEach(([path, key]) => {
    form.setError(path as Path<T>, {
      type: "server",
      message: i18n.t(key),
    });
  });
}
```

---

## 16. Accessibility

### 16.1 Non-Negotiables

1. All interactive elements reachable via keyboard (Tab, Shift-Tab, Enter, Space)
2. Visible focus indicator on every focusable element (`:focus-visible`)
3. Modals trap focus and return it to the trigger on close
4. Form fields paired with explicit `<label>` (or `aria-labelledby`)
5. Icons-only buttons carry `aria-label`
6. Color contrast >= 4.5:1 for body text, 3:1 for large text
7. Color is never the sole signal (always pair with icon or text)
8. Live regions for async updates (`aria-live="polite"` for toasts, `assertive` for errors)

### 16.2 Pattern Compliance

| Element              | shadcn coverage               | Manual work                        |
| -------------------- | ----------------------------- | ---------------------------------- |
| Dialog / AlertDialog | Focus trap, ESC, return focus | Set `aria-describedby` for body    |
| DropdownMenu         | Keyboard nav, ARIA            | Provide accessible trigger label   |
| Select               | Combobox semantics            | Pair with `<Label>`                |
| Tabs                 | Roving tabindex               | Use `<TabsList>` + `<TabsTrigger>` |
| Toast (sonner)       | `aria-live="polite"`          | Avoid critical-only-color states   |
| Tooltip              | `aria-describedby`            | Avoid as the only label            |

### 16.3 Focus Ring

Never disable. Use `focus-visible:` so mouse users don't see rings, keyboard users do:

```css
@layer base {
  :focus {
    outline: none;
  }
  :focus-visible {
    outline: 2px solid var(--color-gold);
    outline-offset: 2px;
  }
}
```

### 16.4 Skip Link

```tsx
<a
  href="#main"
  className="sr-only rounded-xl bg-navy px-4 py-2 text-surface focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
>
  Skip to main content
</a>
```

### 16.5 Testing

Unit/integration:

```tsx
// In RTL
userEvent.tab();
expect(document.activeElement).toBe(screen.getByLabelText(/email/i));
expect(screen.getByRole("alert")).toHaveTextContent(/invalid/i);
```

E2E with axe-core:

```ts
import AxeBuilder from "@axe-core/playwright";

test("login page has no a11y violations", async ({ page }) => {
  await page.goto("/login");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

---

## 17. Testing Strategy

### 17.1 Test Layers

| Layer       | Tool         | What to test                                          |
| ----------- | ------------ | ----------------------------------------------------- |
| Unit        | Vitest       | Pure functions: cn(), role utils, format, Zod schemas |
| Component   | Vitest + RTL | Rendering, user interactions, form validation         |
| Integration | Vitest + MSW | Feature flows with mocked API                         |
| E2E         | Playwright   | Critical paths against real backend (staging)         |

### 17.2 Vitest Config

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["src/shared/components/ui/**", "src/test/**"],
    },
  },
});
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";
import { server } from "./msw/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 17.3 MSW Handlers

```ts
// src/test/msw/handlers.ts
import { http, HttpResponse } from "msw";
import { mockUsers, mockCredentials } from "../fixtures";

export const handlers = [
  http.get("/api/users", () =>
    HttpResponse.json({
      code: 100200,
      message: "OK",
      data: { data: mockUsers, total: mockUsers.length, page: 1, page_size: 10 },
    }),
  ),
  http.get("/api/users/self", () =>
    HttpResponse.json({ code: 100200, message: "OK", data: mockUsers[0] }),
  ),
  http.post("/api/auth/google", () =>
    HttpResponse.json({ code: 100100, message: "OK", data: { user: mockUsers[0] } }),
  ),
  http.post("/api/auth/logout", () => HttpResponse.json({ code: 100000, message: "OK" })),
];
```

### 17.4 Component Test Pattern

```tsx
// feature/user/UserList.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserList } from "./UserList";
import { TestProviders } from "@/test/TestProviders";

function renderUserList() {
  return render(<UserList />, { wrapper: TestProviders });
}

test("renders user table with data", async () => {
  renderUserList();
  await waitFor(() => {
    expect(screen.getByText("Platform Admin")).toBeInTheDocument();
  });
});

test("filters users by search term", async () => {
  renderUserList();
  await waitFor(() => screen.getByPlaceholderText(/search/i));
  await userEvent.type(screen.getByPlaceholderText(/search/i), "admin");
  expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
});
```

```tsx
// src/test/TestProviders.tsx
export function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  );
}
```

### 17.5 Zod Schema Tests

```ts
// feature/user/schemas/user.test.ts
import { userStoreSchema } from "./user";

test("rejects invalid phone", () => {
  const result = userStoreSchema.safeParse({
    email: "a@b.com",
    role: "holder",
    phone_number: "08123",
  });
  expect(result.success).toBe(false);
  expect(result.error?.issues[0].path).toContain("phone_number");
});

test("accepts valid E164 phone", () => {
  const result = userStoreSchema.safeParse({
    email: "a@b.com",
    role: "holder",
    phone_number: "+6281234567890",
  });
  expect(result.success).toBe(true);
});
```

### 17.6 Playwright E2E

```ts
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
```

```ts
// e2e/auth.spec.ts
test("redirects unauthenticated user to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login");
});
```

---

## 18. Performance & Build

### 18.1 Code Splitting

Lazy-load every route via React Router's `lazy:` (already shown in 12.3). Vite produces one chunk per route.

### 18.2 Vite Config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@feature": path.resolve(__dirname, "./src/feature"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@ui": path.resolve(__dirname, "./src/shared/components/ui"),
    },
  },
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query", "axios"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "ui-vendor": ["lucide-react", "sonner", "clsx", "tailwind-merge"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### 18.3 Icon Tree-Shaking

lucide-react auto tree-shakes when imported by name. Always:

```ts
// CORRECT
import { ShieldCheck } from "lucide-react";

// WRONG - imports everything
import * as Icons from "lucide-react";
```

### 18.4 Image Strategy

- Use SVG icons (lucide-react) over raster
- For static images, use `?url` Vite import or `public/` folder
- Lazy-load below-the-fold images with `loading="lazy"`

### 18.5 Bundle Budget

| Chunk                        | Target      |
| ---------------------------- | ----------- |
| Initial (login + auth shell) | < 150 kB gz |
| Per-route chunk              | < 50 kB gz  |
| Total app                    | < 500 kB gz |

Monitor via `npx vite-bundle-visualizer` or `rollup-plugin-visualizer`.

### 18.6 Production Optimizations

- Brotli compression (handled by hosting platform or nginx)
- Cache `assets/*` for 1 year (Vite hashes filenames)
- Cache `index.html` for 0 seconds (must always re-fetch)
- HTTP/2 server push for critical CSS

---

## 19. Coding Conventions

### 19.1 Naming

| Kind             | Convention                         | Example                      |
| ---------------- | ---------------------------------- | ---------------------------- |
| Component file   | `PascalCase.tsx`                   | `UserList.tsx`               |
| Hook file        | `camelCase.ts` starting with `use` | `useGoogleLogin.ts`          |
| Util file        | `kebab-case.ts`                    | `format-date.ts`             |
| Type file        | `kebab-case.ts`                    | `api-types.ts`               |
| Component        | PascalCase named export            | `export function UserList()` |
| Hook             | `useX` named export                | `export function useUsers()` |
| Type / interface | PascalCase                         | `interface UserDTO`          |
| Constant         | `SCREAMING_SNAKE_CASE`             | `const MAX_BATCH_SIZE = 100` |
| Function         | `camelCase`                        | `function formatHash()`      |

### 19.2 Exports

- **Named exports only** for components, hooks, utilities
- No default exports anywhere
- Feature `index.ts` re-exports the feature's public surface only

```ts
// feature/user/index.ts
export { UserList } from "./UserList";
export { UserDetail } from "./UserDetail";
export { UserCreate } from "./UserCreate";
export * from "./schemas/user";
// internal helpers NOT re-exported
```

### 19.3 Component Structure

```tsx
// 1. Imports (sorted: builtins, vendor, @app, @feature, @shared, relative)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@ui/button";
import { Card } from "@shared/components/Card";
import { useUsers } from "./api/useUsers";

// 2. Types
interface UserListProps {
  initialFilter?: string;
}

// 3. Component (named export)
export function UserList({ initialFilter = "" }: UserListProps) {
  // 3a. Hooks at top
  const [filter, setFilter] = useState(initialFilter);
  const { data, isLoading } = useUsers({ search: filter });

  // 3b. Derived values
  const filteredCount = data?.data.length ?? 0;

  // 3c. Handlers
  const handleClear = () => setFilter("");

  // 3d. Early returns
  if (isLoading) return <SkeletonList />;

  // 3e. Main render
  return <Card>{/* ... */}</Card>;
}

// 4. Sub-components (if small + only-used-here)
function SkeletonList() {
  return <div className="animate-pulse">{/* ... */}</div>;
}
```

### 19.4 className Composition

Always through `cn()`. Never template-string concatenation:

```tsx
// CORRECT
className={cn(
  "px-4 py-2 rounded-xl font-bold",
  isActive ? "bg-navy text-surface" : "text-gray-500",
  disabled && "opacity-50 pointer-events-none",
  className
)}

// WRONG - tailwind-merge can't dedupe
className={`px-4 py-2 ${isActive ? "bg-navy" : ""} ${className}`}
```

### 19.5 Comments

- Comment **why**, not **what**
- TODO: include owner and ticket: `// TODO(arfan, CRED-123): use proper retry`
- Avoid commented-out code - delete it (git remembers)

### 19.6 ESLint Rules

Key rules to enforce (in `eslint.config.js`):

```js
rules: {
  "react/jsx-no-leaked-render": "error",        // catch {value && <X/>} bugs
  "react/no-unstable-nested-components": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/consistent-type-imports": "error",
  "import/order": ["error", { /* alphabetize, groups */ }],
  "import/no-default-export": "error",
  "no-console": ["warn", { allow: ["warn", "error"] }],
}
```

### 19.7 Prettier Config

```js
// prettier.config.js
export default {
  printWidth: 100,
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  plugins: ["prettier-plugin-tailwindcss"],
};
```

### 19.8 Git

- Branch name: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`
- Commit prefix: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Squash on merge
- PRs require: build pass, tests pass, lint pass, locale-sync pass

---

## 20. Migration Notes from Demo

**Decision:** Hard migration. `CredChain_React_Demo/` is reference only. The new `CredChain_React/` is greenfield. Do not import or copy from the demo - reproduce only the design intent.

### 20.1 What Carries Over

| From demo                                                   | To production                                |
| ----------------------------------------------------------- | -------------------------------------------- |
| Color tokens (navy, gold, base, surface, error)             | Same (extended in @theme)                    |
| Component recipes (card, CTA, input, pill, eyebrow)         | Reified as named components                  |
| Layout shells (3 layouts)                                   | Same shape, hardened with shadcn primitives  |
| Routing structure                                           | Same paths, lazy-loaded, single role-utility |
| Role hierarchy logic                                        | Single source: `shared/auth/role.ts`         |
| Feature folders                                             | Same                                         |
| `lucide-react` icons                                        | Same                                         |
| Form structures (batch user create, batch credential issue) | Same UX, RHF + Zod-driven                    |

### 20.2 What Gets Replaced

| Demo                                             | Production                                 |
| ------------------------------------------------ | ------------------------------------------ |
| Mock Zustand store with seed data                | TanStack Query against real `/api`         |
| Hand-rolled `<select>`                           | shadcn `<Select>`                          |
| `window.confirm`                                 | shadcn `<AlertDialog>` + `useConfirm`      |
| Plain `useState` forms                           | RHF + Zod                                  |
| Demo account dropdown                            | Google OAuth button                        |
| `password123` readonly input                     | Removed entirely                           |
| Hardcoded `bg-[#F4F7F6]`                         | Token-based                                |
| Duplicated `roleHierarchy` map                   | `shared/auth/role.ts`                      |
| `App.css` (Vite scaffold)                        | Deleted                                    |
| Empty `shared/{api,component,hook,util}` folders | Populated per Section 4                    |
| Inline `clsx` everywhere                         | `cn()` helper (`shared/lib/cn.ts`)         |
| Raw `bg-blue-100 text-blue-800` role badge       | Token-based via `<StatusPill tone="navy">` |

### 20.3 What Gets Deleted

- `App.css` (dead Vite scaffold)
- `password123` readonly input
- Demo account dropdown UI
- Mock seed data (`MOCK_USERS`, `MOCK_CREDENTIALS`)
- `walletAddress` hand-generation in UserCreate (backend handles wallet creation now)
- `firstName`/`lastName` split (backend uses single `name` field)

### 20.4 Backend Contract Differences

The demo's DTO doesn't match the real backend. Production must use:

| Demo field              | Backend field                          |
| ----------------------- | -------------------------------------- |
| `firstName`, `lastName` | `name` (single string)                 |
| `phone`                 | `phone_number` (E.164 format)          |
| `walletAddress`         | Backend manages, not exposed in create |
| `status`                | (not in backend response)              |
| (none)                  | `number` (employee/student ID)         |
| (none)                  | `birth_date` (YYYY-MM-DD)              |
| (none)                  | `meta` (arbitrary JSON object)         |
| (none)                  | `deleted_at` (soft delete)             |

Mirror `response.User` from `infrastructure/http/response/user.go` exactly:

```ts
// shared/types/api.ts
export interface UserDTO {
  id: string;
  name: string | null;
  number: string | null;
  phone_number: string | null;
  email: string;
  birth_date: string | null; // YYYY-MM-DD
  role: Role;
  meta: Record<string, unknown> | null;
  wallet_address: string; // 0x...
  created_at: string; // ISO 8601
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthResponse extends UserDTO {
  // The backend returns user fields inline + tokens
  access_token: string;
  refresh_token: string;
  access_token_expires_in: number;
  refresh_token_expires_in: number;
  token_type: "Bearer";
}
```

Note: backend's `response.Auth` has `User` embedded with `json:",inline"` — fields appear at the top level of the JSON body alongside the token fields. Although our cookie strategy means tokens are not consumed by the frontend, types match the wire format.

### 20.5 Missing-from-Demo Surfaces

Production must add:

- `/users/self/profile` (PUT) - update own profile
- `/users/self/email` (PUT) - update own email with Google reauth
- Pagination + sort + search query params on list endpoints
- Rate limit handling (429 toasts: "Too many attempts, try again in X seconds")
- Soft-deleted user filter (default hides deleted, admin toggle to show)
- Multi-language (id/en) toggle

### 20.6 New Layout Pieces

- `LanguageSwitcher` in NavbarDashboard (and NavbarPublic)
- User menu dropdown (replace static avatar with shadcn `DropdownMenu`)
- Search command palette (shadcn `Command` triggered by Cmd+K) - optional Phase 2
- Notifications bell (real-time toast feed) - optional Phase 2

### 20.7 Feature Cutover Order (suggested)

1. Bootstrap project + design tokens + shadcn base
2. Auth flow (login, refresh interceptor, session hydrator)
3. Dashboard shell (layouts, sidebar, top nav, role guards)
4. User feature (list, detail, create batch, self profile)
5. Credential feature (list, detail, issue, my credentials, public verify)
6. Settings + i18n switcher
7. Polish: loading states, empty states, error pages, toasts
8. E2E tests against staging

---

## 21. AI Development Prompts

These prompts are designed to be used with the `frontend-design` skill or any AI assistant working on this codebase.

### 21.1 AGENTS.md for CredChain_React

Create `CredChain_React/AGENTS.md` with the following content when bootstrapping the project:

```
# CredChain React - Agent Instructions

## Critical Commands

npm run dev          # Start dev server (Vite, port 5173)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest (unit + component + integration)
npm run test:e2e     # Playwright E2E
npm run check-locales # Verify locale sync with backend

## Architecture

See DESIGN_SYSTEM.md for full reference. Key rules:
- Feature folders under src/feature/ - never cross-import between features
- All API calls via TanStack Query hooks in feature/*/api/
- All tokens via @theme in styles/index.css - no raw hex codes
- All classNames via cn() helper - no template string concatenation
- shadcn/ui components in shared/components/ui/ - restyle to tokens before use
- Role logic only in shared/auth/role.ts
- No default exports anywhere

## Design System

Palette: navy (#0F172A), gold (#C9A227), base (#F8FAFC), surface (#FFFFFF), error (#B91C1C)
Radius: rounded-xl (inputs/buttons), rounded-2xl (cards)
Shadows: tinted - shadow-navy/20, shadow-gold/20, shadow-error/20
Typography: system-ui, no web fonts
Icons: lucide-react only, named imports only
```

### 21.2 Component Generation Prompt

Use this when asking an AI to build a new component:

```
Build a [ComponentName] component for CredChain React.

Design system rules:
- Palette: navy (#0F172A) primary, gold (#C9A227) accent, error (#B91C1C) destructive
- Cards: bg-surface rounded-2xl shadow-sm border border-gray-100
- Buttons: rounded-xl font-bold, primary=bg-navy text-surface shadow-md shadow-navy/20
- Inputs: rounded-xl border-gray-200 bg-gray-50 focus:ring-2 focus:ring-navy focus:bg-white
- Status pills: inline-flex rounded-md text-xs font-bold uppercase tracking-wider
- Eyebrow labels: text-xs font-bold uppercase tracking-wider text-gray-400
- Mono IDs: font-mono text-xs text-gray-500
- All classNames via cn() from shared/lib/cn.ts
- Icons from lucide-react, named imports only
- No default exports
- TypeScript strict, named export

Component requirements:
[describe what the component does]
```

### 21.3 Feature Scaffolding Prompt

Use this when adding a new feature domain:

```
Scaffold a new feature folder for CredChain React: feature/[name]/

Create these files following existing patterns in feature/user/:
- api/use[Name]s.ts       (TanStack Query list hook)
- api/use[Name].ts        (TanStack Query detail hook)
- api/useCreate[Name].ts  (useMutation for POST)
- schemas/[name].ts       (Zod schema mirroring Go Ozzo rules)
- components/[Name]Card.tsx
- [Name]List.tsx
- [Name]Detail.tsx
- index.ts                (named re-exports only)

Backend endpoint: [describe the API endpoint]
DTO fields: [list fields from backend response]
Role access: [which roles can access]
```

### 21.4 Backend Integration Prompt

Use this when wiring a new API endpoint:

```
Wire the [METHOD] /api/[path] endpoint into CredChain React.

Backend contract:
- Response envelope: { code: number, message: string, data?: T }
- Success code: [code]
- Error codes: [list codes]
- Request body: [describe fields]
- Response data: [describe shape]

Create:
1. Zod schema in feature/[name]/schemas/[name].ts mirroring Go Ozzo rules
2. TanStack Query hook in feature/[name]/api/use[Action][Name].ts
3. Add response code mappings to shared/api/codes.ts
4. Add locale keys to shared/i18n/en.json and shared/i18n/id.json
5. Wire into the relevant screen component

Follow patterns in feature/user/api/useCreateUsers.ts.
```

### 21.5 Design System Audit Prompt

Use this when reviewing a component for design system compliance:

```
Audit this CredChain React component for design system compliance.

Check for:
1. Raw hex codes (should use token names)
2. classNames not using cn() helper
3. Hardcoded colors not in @theme (e.g. bg-[#F4F7F6])
4. window.confirm or window.alert (replace with useConfirm)
5. Default exports (should be named exports)
6. Direct axios imports (should use shared/api/client.ts)
7. Role logic outside shared/auth/role.ts
8. Cross-feature imports (feature/X importing from feature/Y)
9. Missing aria-label on icon-only buttons
10. Missing focus:ring on interactive elements

For each violation, show the line and the correct fix.
```

---

## 22. Open Questions / Decision Log

### 22.1 Decided

| Decision       | Choice                             | Rationale                                                       |
| -------------- | ---------------------------------- | --------------------------------------------------------------- |
| Doc location   | `CredChain_React/DESIGN_SYSTEM.md` | Co-located with package; Go and Solidity repos can xref         |
| UI primitives  | shadcn/ui + Radix UI               | Owned in-repo, accessible by default, 2026 default for Tailwind |
| Server state   | TanStack Query + axios             | Industry standard, handles caching/refetch/mutations            |
| Forms          | React Hook Form + Zod              | Best DX for batch/dynamic forms, Zod mirrors Ozzo               |
| Token storage  | httpOnly cookies (backend-set)     | XSS-immune, SameSite=Strict for CSRF                            |
| i18n           | i18next + react-i18next            | Mature, ICU-style, matches backend go-i18n keys                 |
| Demo migration | Hard - greenfield                  | Demo DTOs do not match real backend                             |
| AI prompts     | Section 21                         | Component, feature, backend integration, audit prompts          |

### 22.2 Open Questions for Backend

1. **Cookie strategy on `/api/auth/google`** - Backend currently returns tokens in response body. Coordinate change to set httpOnly cookies + omit tokens from body. CORS must allow credentials.
2. **CSRF token endpoint** - With cookies, do we need a `/api/csrf-token` endpoint, or rely on SameSite=Strict alone?
3. **`/api/users/self/email` Google reauth** - Does backend accept the same Google ID token format as login? Audience claim?
4. **Pagination response shape** - Confirm `{ data, total, page, page_size }` (snake_case) is final.
5. **Validation error shape** - When backend returns `code: 400001`, what is the exact `errors` field shape? `{ field: messageKey }` or `{ field: { code, message } }`?
6. **Rate limit headers** - Does backend return `Retry-After` or `X-RateLimit-Reset` so frontend can show "try again in X seconds"?

### 22.3 Open Questions for Frontend

1. **Search/sort/filter params** - URL-state driven (use `useSearchParams`) or local state? URL recommended.
2. **Empty `meta` field UX** - JSON editor vs key-value input grid?
3. **Date display locale** - `Intl.DateTimeFormat` with user locale, or fixed format?
4. **Mobile-only screens** - Do any flows need mobile-only UX (camera-based credential scanning)?
5. **Dark mode** - Future consideration. Token structure already supports it via `:root.dark` overrides.
6. **Real-time updates** - WebSocket from backend for credential issuance notifications? Phase 2.
7. **Public verification page UX** - QR code support? File drag-and-drop?

### 22.4 Phase 2 Considerations

Deferred for initial release:

- Cmd+K command palette (`shadcn/ui` Command primitive)
- Notifications bell with real-time feed
- Dark mode toggle
- Bulk import users from CSV/Excel
- Credential template builder UI
- On-chain transaction viewer in user/credential detail pages
- Audit log viewer (Admin+)
- Multi-tenant theming via `--color-primary` override

### 22.5 Document Maintenance

This document should be updated whenever:

- A new design token is added
- A new component recipe emerges
- The backend contract changes (new endpoint, new response code, new field)
- A new architectural pattern is adopted
- An open question is resolved

Keep `Last updated` at the top current. Reviewers should reject PRs that introduce new patterns without documenting them here.

#### Changelog

| Version | Date       | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-05-29 | Initial draft. Sections 1-22 + Appendix A.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| v1.1    | 2026-05-29 | Typography migrated from system-ui to Fraunces + DM Sans + JetBrains Mono. Added Section 6.5 Visual Language Principles. Added Section 8.9 Responsive Design (touch targets, safe areas, mobile keyboards, reduced motion, container queries, tablet, print, orientation, dark mode hooks).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| v1.2    | 2026-05-31 | Dark mode removed from spec to match codebase (light-only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| v1.3    | 2026-06-09 | As-built reconciliation pass. Design philosophy (§5 tokens, §6 typography, §6.5 visual language, §8.9 responsive) preserved verbatim — those still describe the intended design faithfully. Architectural sections updated to match codebase: §3 tech versions synced and `ethers` row removed; §3 install list replaced with the 12 actual primitives; §4.1 folder structure rewritten as as-built (single `store/index.ts`, `feature/landing/`, `AdaptiveLayout` + `SplitLayout`, no `AuthLayout`/`interceptors.ts`/`useConfirm.ts`); §7.9 `useConfirm` rewritten to match the real `{confirm, dialog}` shape in `@ui/confirm-dialog`; §8.1 layout shells table updated; **§8.7 mobile drawer rewritten** (hand-rolled CSS-transform `<aside>`, never adopted shadcn `Sheet`; `vaul` reserved for content drawers); §9.2 store consolidated to single-file shape with `partialize` + Indonesian default; §10.1/§10.2 axios example updated with `paramsSerializer`, `Accept-Language`, `refreshInFlight` dedup, `X-Retry: 1`, and 429 handling; §11.1 token strategy moved from "backend coordination required" to "implemented" (Go side ships cookies). |
| v1.4    | 2026-06-10 | `SplitLayout` forced to exactly 100dvh with no scrollbars. §8.1 table updated: outer container and right panel use `h-dvh overflow-hidden`; mobile brand band uses `h-[33dvh] flex items-center justify-center`; content area `flex-1` fills remaining 67dvh with `min-h-0 overflow-hidden`. `AttestationStamp` now accepts `className` prop for responsive sizing; mobile brand band renders it with `max-w-[min(160px,18vh)]` instead of hiding. Landing content vertically centered (`flex items-center justify-center`); Login content top-aligned on mobile (`justify-start`) and centered on desktop (`lg:justify-center`). Login `<BackLink>` uses `self-start` for left alignment. Landing/Login content refactored to viewport-relative units (`py-[2dvh]`, `space-y-[1.5dvh]`, card padding `p-6 sm:p-8`). Removed forced `min-h-[Xlh]` from headings/subtitles so content shrinks to fit short viewports. Added `SplitLayout.test.tsx` (5 tests). |

---

## Appendix A: Quick Reference Card

```
COLOR TOKENS
  navy    #0F172A   primary, sidebar, body text
  gold    #C9A227   accent, premium CTAs, focus ring
  base    #F8FAFC   page background
  surface #FFFFFF   card background
  error   #B91C1C   destructive, revoked

RADIUS
  rounded-xl    inputs, buttons
  rounded-2xl   cards, panels
  rounded-md    badges, pills
  rounded-full  avatars, search bars

SHADOWS
  shadow-sm                default cards
  shadow-md shadow-navy/20 primary buttons
  shadow-lg shadow-gold/20 gold buttons / metric cards
  shadow-xl                auth card

TYPOGRAPHY
  Hero            text-4xl font-extrabold tracking-tight
  Page title      text-2xl font-bold text-navy tracking-tight
  Card title      text-lg font-bold text-navy
  Body            text-sm
  Label           text-sm font-semibold text-gray-700
  Eyebrow         text-xs font-bold uppercase tracking-wider text-gray-400
  Mono            font-mono text-xs text-gray-500

CONTAINERS
  max-w-md   auth card
  max-w-3xl  detail views
  max-w-4xl  settings, verification
  max-w-6xl  batch forms
  max-w-7xl  list/table views

VERTICAL RHYTHM
  space-y-6   page-level (default)
  space-y-4   sub-section
  space-y-1   label + input pair
```

---

_End of design system specification._
