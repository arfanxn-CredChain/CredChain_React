# Overview Page Design

> `GET /api/overview` frontend page + full "dashboard" → "overview" rename across the entire React app.

## Backend Contract

**Endpoint:** `GET /api/overview` — authenticated, role-conditional response.

**Issuer+ response shape:**
```json
{
  "code": 100100,
  "data": {
    "credential_counts": { "total": 500, "active": 450, "revoked": 40, "pending": 10, "failed": 3 },
    "user_counts": { "total": 150, "holder": 120, "issuer": 20, "admin": 8, "super_admin": 1, "active": 145, "trashed": 5 },
    "recents": {
      "active_credentials": [
        { "id": "01J...", "name": "Bachelor's Degree", "holder": {"id": "01J...", "name": "John", "email": "john@example.com"}, "issuer": {"id": "01J...", "name": "UI", "email": "admin@ui.ac.id"}, "issued_at": "2026-06-20T10:00:00Z" }
      ],
      "revoked_credentials": [
        { "id": "01J...", "name": "Diploma", "holder": {"id": "01J...", "name": "Jane", "email": "jane@example.com"}, "revoker": {"id": "01J...", "name": "Admin", "email": "admin@example.com"}, "issued_at": "2026-04-01T00:00:00Z", "revoked_at": "2026-06-19T08:00:00Z" }
      ],
      "stored_users": [
        { "id": "01J...", "name": "Jane", "email": "jane@example.com", "role": "holder", "created_at": "2026-06-18T00:00:00Z" }
      ]
    },
    "chain_details": { "authority_contract": "0x9A...", "registry_contract": "0x8B...", "last_block": 12345678 }
  }
}
```

**Holder response shape** — `user_counts`, `chain_details`, and `recents.stored_users` absent (omitempty, never null). `recents.active_credentials[].holder` also absent (redundant — the holder is the authenticated user).

**Response codes:** `100100` (success), `100150` (internal error). Category `10` (system).

**Date filter:** `GET /api/overview?filters=date..2026-01-01,2026-06-30` — optional, standard QueryRequest BETWEEN syntax.

## Rename Scope: Everything

All occurrences of "dashboard" / "Dashboard" in the codebase renamed to "overview" / "Overview". This includes:

| Old | New | Category |
|---|---|---|
| `feature/dashboard/` | `feature/overview/` | folder |
| `Dashboard.tsx` | `Overview.tsx` | page component |
| `DashboardLayout` | `OverviewLayout` | layout component |
| `DashboardSidebar` | `OverviewSidebar` | layout component |
| `NavbarDashboard` | `NavbarOverview` | layout component |
| `/dashboard` route | `/overview` | router, guards, hooks, nav, errors |
| `dashboardSidebarOpen` | `overviewSidebarOpen` | Zustand store (getter + setter + toggle) |
| `dashboard.*` i18n | `overview.*` or replaced | en.json + id.json |
| `landing.cta.dashboard` | `landing.cta.overview` | i18n |
| `not_found.goDashboard` | `not_found.goOverview` | i18n |
| `error_boundary.goDashboard` | `error_boundary.goOverview` | i18n |
| `LayoutDashboard` icon import | stays (lucide icon name unchanged) | nav-items |

## Component Architecture

```
src/feature/overview/
  Overview.tsx           — page component (replaces Dashboard.tsx)
  Settings.tsx           — moves from feature/dashboard/ (same file, new path)
  api/
    keys.ts              — overviewKeys.all()
    useOverview.ts       — TanStack Query hook, single fetch
  Overview.test.tsx      — component tests
  api/useOverview.test.ts — hook tests
```

### Overview.tsx Component Tree

```
Overview()
├── useStore() → user (name, role)
├── useTranslation()
├── useOverview() → { data, isLoading, isError, refetch }
├── canAccessAny(user.role, [ISSUER, ADMIN, SUPER_ADMIN])
│
├── <PageHeader title={t("overview.welcome")} description={t("overview.description")} />
│
├── [Loading] → 3 Skeleton cards (counts grid + recents card + chain card)
├── [Error]   → <EmptyState icon={AlertTriangle} title/description/action={Retry btn} />
│
├── Section 1: Credential Counts (always)
│   └── <Card>
│       ├── <CardHeader title="Credentials" />
│       └── <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
│           └── <StatItem> ×5 (total, active, revoked, pending, failed)
│
├── Section 2: User Counts (RoleGate: Issuer+)
│   └── <Card>
│       ├── <CardHeader title="Users" />
│       └── <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
│           └── <StatItem> ×7 (total, holder, issuer, admin, super_admin, active, trashed)
│           └── Super Admin stat: <span className="text-xs text-gray-400 italic ml-1">(always 1)</span>
│
├── Section 3: Recent Activity (always)
│   └── <Card>
│       ├── <CardHeader title="Recent Activity" />
│       ├── Sub: Recently Issued — 5 items, each: name + issuer + date
│       ├── Sub: Recently Revoked — 5 items, each: name + revoker + dates
│       └── Sub: New Users — 5 items (shown only if data.recents.stored_users exists)
│           └── each: name + role + date
│       └── Empty sub-section → "No activity" italic text
│
├── Section 4: Chain Info (RoleGate: Issuer+)
│   └── <Card>
│       ├── <CardHeader title="Chain Info" />
│       └── <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
│           └── <DetailRow> ×3 (authority, registry, last block)
│           └── last_block = 0 → "Unavailable" text
```

### State Matrix

| State | Behavior |
|---|---|
| **Loading** | 3 `<Skeleton>` cards matching stat grid + recents card + chain card shapes. No PageHeader skeleton. |
| **Error** | `<EmptyState icon={AlertTriangle} title={t("overview.error.title")} description={t("overview.error.body")} action={<Button onClick={refetch}>Retry</Button>} />` |
| **Empty (fresh)** | All counts = 0 (valid), recents lists show "No recent activity" italic text. No special EmptyState. |
| **Holder** | Sections 2 and 4 hidden via `<RoleGate>`. `recents.stored_users` absent → subsection not rendered. `active_credentials[].holder` absent → don't render holder name. |
| **Issuer+** | All 4 sections visible. Super Admin always 1 (informational). |
| **Chain RPC down** | `last_block = 0` → show `t("overview.chainDetails.unavailable")` instead of number. |

### Visual Design (DESIGN_SYSTEM.md tokens)

**StatItem:**
```html
<div className="rounded-xl border border-gray-100 bg-base p-4 text-center">
  <div className="font-display text-2xl font-bold text-navy">{value}</div>
  <div className="mt-1 text-xs font-sans text-gray-500">{label}</div>
</div>
```
- `font-display` (Fraunces) for numbers, `font-sans` (DM Sans) for labels
- `bg-base` (#F8FAFC) so stat items are subtly tinted from the Card's `bg-surface` (#FFFFFF)
- `rounded-xl` (12px) — slightly less than Card's `rounded-2xl` (16px) for nested visual hierarchy

**Recent Activity Items:**
```html
<div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
  {icon}  <!-- FileBadge for creds, User for users -->
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-navy truncate">{name}</p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
  <time className="shrink-0 text-xs text-gray-400">{relativeDate}</time>
</div>
```
- Subtitle for active cred: "by {issuer} · {date}"
- Subtitle for revoked cred: "by {revoker} · revoked {date}"
- Subtitle for new users: "{role} · joined {date}"
- `truncate` for long names
- Relative time ("2 days ago") or formatted date fallback

**Empty sub-section in recents:**
```html
<p className="py-6 text-center text-sm text-gray-400 italic">{t("overview.recents.empty")}</p>
```

## TypeScript Types

Added to `src/shared/types/api.ts`:

```ts
export interface OverviewCredentialCounts {
  total: number;
  active: number;
  revoked: number;
  pending: number;
  failed: number;
}

export interface OverviewUserCounts {
  total: number;
  holder: number;
  issuer: number;
  admin: number;
  super_admin: number;
  active: number;
  trashed: number;
}

export interface OverviewChainDetails {
  authority_contract: string;
  registry_contract: string;
  last_block: number;
}

export interface OverviewRecentCredential {
  id: string;
  name: string;
  holder?: { id: string; name: string; email: string };
  issuer?: { id: string; name: string; email: string };
  revoker?: { id: string; name: string; email: string };
  issued_at: string;
  revoked_at?: string;
}

export interface OverviewRecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface OverviewRecents {
  active_credentials: OverviewRecentCredential[];
  revoked_credentials: OverviewRecentCredential[];
  stored_users?: OverviewRecentUser[];
}

export interface OverviewDTO {
  credential_counts: OverviewCredentialCounts;
  user_counts?: OverviewUserCounts;
  recents: OverviewRecents;
  chain_details?: OverviewChainDetails;
}
```

## API Codes

Added to `src/shared/api/codes.ts` under System (10) block:

```ts
100100: "overview.success",
100150: "overview.internal_error",
```

## Query Hook

```ts
// feature/overview/api/keys.ts
export const overviewKeys = {
  all: () => ["overview"] as const,
};

// feature/overview/api/useOverview.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { OverviewDTO } from "@shared/types/api";
import { overviewKeys } from "./keys";

export function useOverview() {
  return useQuery({
    queryKey: overviewKeys.all(),
    queryFn: async () => {
      const response = await api.get<OverviewDTO>("/overview");
      return response.data;
    },
  });
}
```

Uses default staleTime (5 min) from queryClient — dashboard data doesn't need real-time refresh. No pagination, no load-more.

## i18n Keys

### Replaced (old → new)

| Old Key | New Key | en Value |
|---|---|---|
| `dashboard.welcome` | `overview.welcome` | "Welcome, {{name}}" |
| `dashboard.fallbackName` | `overview.fallbackName` | "there" |
| `dashboard.overview` | `overview.description` | "Platform overview and recent activity." |
| `dashboard.comingSoon.title` | *(deleted)* | — |
| `dashboard.comingSoon.body` | *(deleted)* | — |
| `landing.cta.dashboard` | `landing.cta.overview` | "Go to Overview" |
| `not_found.goDashboard` | `not_found.goOverview` | "Back to Overview" |
| `error_boundary.goDashboard` | `error_boundary.goOverview` | "Overview" |

### New Keys

| Key | en | id |
|---|---|---|
| `overview.success` | "Overview loaded" | "Ringkasan dimuat" |
| `overview.internal_error` | "Failed to load overview" | "Gagal memuat ringkasan" |
| `overview.credentialCounts` | "Credentials" | "Kredensial" |
| `overview.counts.total` | "Total" | "Total" |
| `overview.counts.active` | "Active" | "Aktif" |
| `overview.counts.revoked` | "Revoked" | "Dicabut" |
| `overview.counts.pending` | "Pending" | "Tertunda" |
| `overview.counts.failed` | "Failed" | "Gagal" |
| `overview.userCounts` | "Users" | "Pengguna" |
| `overview.counts.holder` | "Holders" | "Pemegang" |
| `overview.counts.issuer` | "Issuers" | "Penerbit" |
| `overview.counts.admin` | "Admins" | "Admin" |
| `overview.counts.superAdmin` | "Super Admin" | "Super Admin" |
| `overview.counts.activeUsers` | "Active" | "Aktif" |
| `overview.counts.trashed` | "Trashed" | "Terhapus" |
| `overview.superAdminAlwaysOne` | "Always 1" | "Selalu 1" |
| `overview.recents` | "Recent Activity" | "Aktivitas Terbaru" |
| `overview.recents.activeCredentials` | "Recently Issued" | "Baru Diterbitkan" |
| `overview.recents.revokedCredentials` | "Recently Revoked" | "Baru Dicabut" |
| `overview.recents.storedUsers` | "New Users" | "Pengguna Baru" |
| `overview.recents.empty` | "No recent activity" | "Tidak ada aktivitas" |
| `overview.recents.issuedBy` | "by {{issuer}}" | "oleh {{issuer}}" |
| `overview.recents.revokedBy` | "by {{revoker}}" | "oleh {{revoker}}" |
| `overview.recents.joined` | "joined {{date}}" | "bergabung {{date}}" |
| `overview.recents.noName` | "Unnamed" | "Tanpa nama" |
| `overview.chainDetails` | "Chain Info" | "Info Rantai" |
| `overview.chainDetails.authorityContract` | "Authority Contract" | "Kontrak Otoritas" |
| `overview.chainDetails.registryContract` | "Registry Contract" | "Kontrak Registri" |
| `overview.chainDetails.lastBlock` | "Last Block" | "Blok Terakhir" |
| `overview.chainDetails.unavailable` | "Unavailable" | "Tidak tersedia" |
| `overview.relativeTime.seconds` | "just now" | "baru saja" |
| `overview.relativeTime.minutes` | "{{n}}m ago" | "{{n}}m lalu" |
| `overview.relativeTime.hours` | "{{n}}h ago" | "{{n}}j lalu" |
| `overview.relativeTime.days` | "{{n}}d ago" | "{{n}}h lalu" |
| `overview.relativeTime.weeks` | "{{n}}w ago" | "{{n}}m lalu" |
| `overview.error.title` | "Something went wrong" | "Terjadi kesalahan" |
| `overview.error.body` | "Could not load the overview." | "Tidak dapat memuat ringkasan." |
| `overview.error.retry` | "Retry" | "Coba lagi" |
| `overview.loading` | "Loading overview..." | "Memuat ringkasan..." |
| `nav.overview` | *(unchanged)* | "Ringkasan" |
| `landing.cta.overview` | "Go to Overview" | "Ke Ringkasan" |

## Nav Items Update

In `nav-items.ts`, the overview/dashboard item:
```ts
{
  href: "/overview",
  i18nKey: "nav.overview",
  icon: LayoutDashboard,
  minRole: Role.HOLDER,
  inSidebar: true,
},
```
- `href` changes from `/dashboard` to `/overview`
- `minRole` changes from `Role.ISSUER` to `Role.HOLDER` — all authenticated users see it
- `i18nKey` remains `"nav.overview"` (already correct)
- `icon` import name stays `LayoutDashboard` (lucide icon, not a "dashboard" term)

## Route Update

In `router.tsx`:
```tsx
import { OverviewLayout } from "@shared/components/layout/OverviewLayout";

// Protected routes
{
  element: <ProtectedRoute />,
  children: [
    {
      element: <OverviewLayout />,
      children: [
        {
          path: "/overview",
          ...lazyRoute(() => import("@feature/overview/Overview"), "Overview"),
        },
        // ... other routes
        {
          path: "/settings",
          ...lazyRoute(() => import("@feature/overview/Settings"), "Settings"),
        },
      ],
    },
  ],
}
```

## Guard Updates

In `guards.tsx`:
- `ProtectedRoute` fallback: `"/dashboard"` → `"/overview"`
- `PublicRoute` redirect: `from ?? "/dashboard"` → `from ?? "/overview"`

## Router File Name Changes

| Old File | New File |
|---|---|
| `shared/components/layout/DashboardLayout.tsx` | `shared/components/layout/OverviewLayout.tsx` |
| `shared/components/layout/DashboardSidebar.tsx` | `shared/components/layout/OverviewSidebar.tsx` |
| `shared/components/layout/NavbarDashboard.tsx` | `shared/components/layout/NavbarOverview.tsx` |
| `shared/components/layout/DashboardSidebar.test.tsx` | `shared/components/layout/OverviewSidebar.test.tsx` |
| `shared/components/layout/NavbarDashboard.test.tsx` | `shared/components/layout/NavbarOverview.test.tsx` |

## Test Updates

All test files referencing `/dashboard` or `Dashboard` must be updated:

| File | Changes |
|---|---|
| `shared/components/NotFound.test.tsx` | `/dashboard` → `/overview`, "Back to Dashboard" → "Back to Overview" |
| `shared/components/RouteErrorBoundary.test.tsx` | `/dashboard` → `/overview`, "Dashboard" → "Overview" |
| `shared/components/PageHeader.test.tsx` | `"/dashboard"` → `"/overview"` |
| `shared/components/BackLink.test.tsx` | All `/dashboard` → `/overview` |
| `shared/hooks/useSmartBack.test.ts` | All `/dashboard` → `/overview` |
| `shared/hooks/useNavSearch.test.ts` | `/dashboard` → `/overview`, "dasbor" → "ringkasan" |
| New: `feature/overview/Overview.test.tsx` | New test file |
| New: `feature/overview/api/useOverview.test.ts` | New test file |

## MSW Handler

Add to `src/test/msw/handlers.ts`:

```ts
http.get("*/api/overview", () => {
  return HttpResponse.json({
    code: 100100,
    data: {
      credential_counts: { total: 500, active: 450, revoked: 40, pending: 10, failed: 3 },
      user_counts: { total: 150, holder: 120, issuer: 20, admin: 8, super_admin: 1, active: 145, trashed: 5 },
      recents: {
        active_credentials: [
          { id: "01J1", name: "Bachelor's Degree", holder: { id: "01H1", name: "John", email: "john@example.com" }, issuer: { id: "01I1", name: "UI", email: "admin@ui.ac.id" }, issued_at: "2026-06-20T10:00:00Z" },
        ],
        revoked_credentials: [
          { id: "01J2", name: "Diploma", holder: { id: "01H2", name: "Jane", email: "jane@example.com" }, revoker: { id: "01R1", name: "Admin", email: "admin@example.com" }, issued_at: "2026-04-01T00:00:00Z", revoked_at: "2026-06-19T08:00:00Z" },
        ],
        stored_users: [
          { id: "01H3", name: "Jane", email: "jane@example.com", role: "holder", created_at: "2026-06-18T00:00:00Z" },
        ],
      },
      chain_details: { authority_contract: "0x9A5f...", registry_contract: "0x8B3c...", last_block: 12345678 },
    },
  });
}),
```

## Verification

All must pass:
```bash
cd CredChain_React
npm run lint
npm run build
npm run test
npm run check-locales
```
