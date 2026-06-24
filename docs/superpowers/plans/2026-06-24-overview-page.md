# Overview Page + Full Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `GET /api/overview` frontend page with role-conditional data display and rename every "dashboard" reference in the codebase to "overview".

**Architecture:** Two phases. **Phase 1 (Foundation):** Create all new files — API types, response codes, TanStack Query hook, i18n keys, MSW handler, and the new `Overview.tsx` page component with `DateRangeFilter`. These are additive and don't break compilation. **Phase 2 (Rename):** Mass rename 20+ files — `dashboard` → `overview` across imports, filenames, routes, i18n keys, store state, guards, layout components, and tests. Done as a single atomic commit.

**Tech Stack:** React 19, TypeScript 5.9, TanStack Query 5, Zustand 5, Tailwind CSS v4, react-i18next, react-router-dom v7, Vitest + RTL + MSW.

---

## File Structure Map

### Created (Phase 1)
```
src/feature/overview/api/keys.ts            — overviewKeys.all()
src/feature/overview/api/useOverview.ts     — TanStack Query hook
src/feature/overview/api/useOverview.test.ts — hook tests
src/feature/overview/Overview.tsx           — page component (replaces Dashboard.tsx)
src/feature/overview/Overview.test.tsx      — page component tests
```

### Modified (Phase 1 — additive)
```
src/shared/types/api.ts                     — add OverviewDTO + sub-types
src/shared/api/codes.ts                     — add 100100, 100150
src/shared/i18n/en.json                     — add overview.* keys
src/shared/i18n/id.json                     — add overview.* keys
src/test/msw/handlers.ts                    — add GET /api/overview handler
```

### Renamed (Phase 2 — git mv)
```
src/feature/dashboard/Dashboard.tsx         → src/feature/overview/Overview.tsx (overwritten by Phase 1)
src/feature/dashboard/Settings.tsx          → src/feature/overview/Settings.tsx
src/shared/components/layout/DashboardLayout.tsx      → OverviewLayout.tsx
src/shared/components/layout/DashboardSidebar.tsx     → OverviewSidebar.tsx
src/shared/components/layout/NavbarDashboard.tsx      → NavbarOverview.tsx
src/shared/components/layout/DashboardSidebar.test.tsx → OverviewSidebar.test.tsx
src/shared/components/layout/NavbarDashboard.test.tsx  → NavbarOverview.test.tsx
```

### Modified (Phase 2 — import/string updates)
```
src/shared/components/layout/AdaptiveLayout.tsx       — import DashboardLayout → OverviewLayout
src/app/router.tsx                                    — import paths, route paths
src/app/store/index.ts                                — dashboardSidebarOpen → overviewSidebarOpen
src/shared/components/layout/nav-items.ts             — href, minRole
src/shared/auth/guards.tsx                            — /dashboard → /overview
src/shared/hooks/useSmartBack.ts                      — /dashboard → /overview
src/shared/components/NotFound.tsx                    — /dashboard → /overview, i18n key
src/shared/components/RouteErrorBoundary.tsx          — /dashboard → /overview, i18n key
src/shared/components/PageHeader.tsx                  — comment only
src/feature/auth/api/useGoogleLogin.ts                — navigate("/dashboard") → "/overview"
src/feature/landing/Landing.tsx                       — /dashboard → /overview, i18n key
src/shared/i18n/en.json                               — rename dashboard.* → overview.*, delete comingSoon, rename landing.*, not_found.*, error_boundary.*
src/shared/i18n/id.json                               — same as en.json
src/shared/components/NotFound.test.tsx               — /dashboard → /overview, string updates
src/shared/components/RouteErrorBoundary.test.tsx     — /dashboard → /overview, string updates
src/shared/components/PageHeader.test.tsx             — /dashboard → /overview
src/shared/components/BackLink.test.tsx               — /dashboard → /overview
src/shared/hooks/useSmartBack.test.ts                 — /dashboard → /overview
src/shared/hooks/useNavSearch.test.ts                 — /dashboard → /overview, "dasbor" → "ringkasan"
src/shared/components/layout/NavbarDashboard.test.tsx  → renamed to NavbarOverview.test.tsx + import update
src/shared/components/layout/DashboardSidebar.test.tsx → renamed to OverviewSidebar.test.tsx + import update
src/shared/hooks/useScrollToTop.ts                     — comment only
```

---

## Phase 1: Foundation (Additive — no breakage)

### Task 1: Add API types to `src/shared/types/api.ts`

**Files:**
- Modify: `src/shared/types/api.ts` (append after line 96)

- [ ] **Step 1: Append overview DTO types**

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

- [ ] **Step 2: Commit**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
git add src/shared/types/api.ts
git commit -m "feat: add overview DTO types"
```

---

### Task 2: Add API response codes to `src/shared/api/codes.ts`

**Files:**
- Modify: `src/shared/api/codes.ts` (after line 13, inside the System block)

- [ ] **Step 1: Add the overview codes after line 13 (`100040` entry)**

The new code block should be inserted after the existing system codes:

```ts
  // Overview (10 + 01)
  100100: "overview.success",
  100150: "overview.internal_error",
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/codes.ts
git commit -m "feat: add overview response codes to code map"
```

---

### Task 3: Create query key factory `src/feature/overview/api/keys.ts`

**Files:**
- Create: `src/feature/overview/api/keys.ts`

- [ ] **Step 1: Create directory and write keys file**

```bash
mkdir -p /Users/arfanxn/Developments/credchain/CredChain_React/src/feature/overview/api
```

```ts
export const overviewKeys = {
  all: (filters?: string[]) => ["overview", { filters }] as const,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/feature/overview/api/keys.ts
git commit -m "feat: add overview query key factory"
```

---

### Task 4: Create `useOverview` hook + tests

**Files:**
- Create: `src/feature/overview/api/useOverview.ts`
- Create: `src/feature/overview/api/useOverview.test.ts`

- [ ] **Step 1: Write the hook test first**

```ts
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { TestProviders } from "@/test/TestProviders";
import { useOverview } from "./useOverview";
import type { OverviewDTO } from "@shared/types/api";

const mockData: OverviewDTO = {
  credential_counts: { total: 10, active: 8, revoked: 2, pending: 0, failed: 0 },
  user_counts: { total: 5, holder: 3, issuer: 1, admin: 1, super_admin: 0, active: 5, trashed: 0 },
  recents: {
    active_credentials: [
      { id: "c1", name: "Degree", issuer: { id: "i1", name: "UI", email: "ui@test.com" }, issued_at: "2026-06-20T10:00:00Z" },
    ],
    revoked_credentials: [],
    stored_users: [],
  },
  chain_details: { authority_contract: "0x9A", registry_contract: "0x8B", last_block: 100 },
};

const server = setupServer(
  http.get("*/api/overview", () => HttpResponse.json({ code: 100100, data: mockData })),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useOverview", () => {
  it("returns overview data on success", async () => {
    const { result } = renderHook(() => useOverview(), { wrapper: TestProviders });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("returns error on server failure", async () => {
    server.use(http.get("*/api/overview", () => HttpResponse.json({ code: 100150, message: "error" }, { status: 500 })));
    const { result } = renderHook(() => useOverview(), { wrapper: TestProviders });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("passes filters to query params", async () => {
    let capturedParams: URLSearchParams | null = null;
    server.use(http.get("*/api/overview", ({ request }) => {
      capturedParams = new URL(request.url).searchParams;
      return HttpResponse.json({ code: 100100, data: mockData });
    }));
    const { result } = renderHook(
      () => useOverview({ filters: ["date..2026-01-01,2026-06-30"] }),
      { wrapper: TestProviders },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedParams?.getAll("filters")).toEqual(["date..2026-01-01,2026-06-30"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
npx vitest run src/feature/overview/api/useOverview.test.ts
```

Expected: FAIL — module `./useOverview` not found.

- [ ] **Step 3: Write the hook implementation**

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { OverviewDTO } from "@shared/types/api";
import { overviewKeys } from "./keys";

export interface UseOverviewParams {
  filters?: string[];
}

export function useOverview(params?: UseOverviewParams) {
  return useQuery({
    queryKey: overviewKeys.all(params?.filters),
    queryFn: async () => {
      const q: Record<string, unknown> = {};
      if (params?.filters && params.filters.length > 0) {
        q.filters = params.filters;
      }
      const response = await api.get<OverviewDTO>("/overview", { params: q });
      return response.data;
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/feature/overview/api/useOverview.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/feature/overview/api/useOverview.ts src/feature/overview/api/useOverview.test.ts
git commit -m "feat: add useOverview TanStack Query hook"
```

---

### Task 5: Add MSW handler for `/api/overview`

**Files:**
- Modify: `src/test/msw/handlers.ts` (after line 417, before the closing `];`)

- [ ] **Step 1: Add overview handler before the closing `];` on line 418**

Insert this handler after the verify handler (line 417):

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
        chain_details: { authority_contract: "0x9A5f", registry_contract: "0x8B3c", last_block: 12345678 },
      },
    });
  }),
```

- [ ] **Step 2: Commit**

```bash
git add src/test/msw/handlers.ts
git commit -m "feat: add MSW handler for GET /api/overview"
```

---

### Task 6: Add new i18n keys to both locale files

**Files:**
- Modify: `src/shared/i18n/en.json`
- Modify: `src/shared/i18n/id.json`

This task adds only the **new** overview keys. The `dashboard.*` keys remain (they get renamed in Phase 2).

- [ ] **Step 1: Add overview keys to en.json (before the closing `}` at line 801)**

Insert before the final `}`:

```json
  "overview.success": "Overview loaded",
  "overview.internal_error": "Failed to load overview",
  "overview.welcome": "Welcome, {{name}}",
  "overview.fallbackName": "there",
  "overview.description": "Platform overview and recent activity.",
  "overview.credentialCounts": "Credentials",
  "overview.counts.total": "Total",
  "overview.counts.active": "Active",
  "overview.counts.revoked": "Revoked",
  "overview.counts.pending": "Pending",
  "overview.counts.failed": "Failed",
  "overview.userCounts": "Users",
  "overview.counts.holder": "Holders",
  "overview.counts.issuer": "Issuers",
  "overview.counts.admin": "Admins",
  "overview.counts.superAdmin": "Super Admin",
  "overview.counts.activeUsers": "Active",
  "overview.counts.trashed": "Trashed",
  "overview.superAdminAlwaysOne": "Always 1",
  "overview.recents": "Recent Activity",
  "overview.recents.activeCredentials": "Recently Issued",
  "overview.recents.revokedCredentials": "Recently Revoked",
  "overview.recents.storedUsers": "New Users",
  "overview.recents.empty": "No recent activity",
  "overview.recents.issuedBy": "by {{issuer}}",
  "overview.recents.revokedBy": "by {{revoker}}",
  "overview.recents.joined": "joined {{date}}",
  "overview.recents.noName": "Unnamed",
  "overview.chainDetails": "Chain Info",
  "overview.chainDetails.authorityContract": "Authority Contract",
  "overview.chainDetails.registryContract": "Registry Contract",
  "overview.chainDetails.lastBlock": "Last Block",
  "overview.chainDetails.unavailable": "Unavailable",
  "overview.relativeTime.seconds": "just now",
  "overview.relativeTime.minutes": "{{n}}m ago",
  "overview.relativeTime.hours": "{{n}}h ago",
  "overview.relativeTime.days": "{{n}}d ago",
  "overview.relativeTime.weeks": "{{n}}w ago",
  "overview.error.title": "Something went wrong",
  "overview.error.body": "Could not load the overview.",
  "overview.error.retry": "Retry",
  "overview.loading": "Loading overview...",
  "overview.dateFilter.from": "From",
  "overview.dateFilter.to": "To",
  "overview.dateFilter.clear": "Clear"
```

- [ ] **Step 2: Add overview keys to id.json (before the closing `}` at line 800)**

Insert before the final `}`:

```json
  "overview.success": "Ringkasan dimuat",
  "overview.internal_error": "Gagal memuat ringkasan",
  "overview.welcome": "Selamat datang, {{name}}",
  "overview.fallbackName": "di sana",
  "overview.description": "Ikhtisar platform dan aktivitas terkini.",
  "overview.credentialCounts": "Kredensial",
  "overview.counts.total": "Total",
  "overview.counts.active": "Aktif",
  "overview.counts.revoked": "Dicabut",
  "overview.counts.pending": "Tertunda",
  "overview.counts.failed": "Gagal",
  "overview.userCounts": "Pengguna",
  "overview.counts.holder": "Pemegang",
  "overview.counts.issuer": "Penerbit",
  "overview.counts.admin": "Admin",
  "overview.counts.superAdmin": "Super Admin",
  "overview.counts.activeUsers": "Aktif",
  "overview.counts.trashed": "Terhapus",
  "overview.superAdminAlwaysOne": "Selalu 1",
  "overview.recents": "Aktivitas Terbaru",
  "overview.recents.activeCredentials": "Baru Diterbitkan",
  "overview.recents.revokedCredentials": "Baru Dicabut",
  "overview.recents.storedUsers": "Pengguna Baru",
  "overview.recents.empty": "Tidak ada aktivitas",
  "overview.recents.issuedBy": "oleh {{issuer}}",
  "overview.recents.revokedBy": "oleh {{revoker}}",
  "overview.recents.joined": "bergabung {{date}}",
  "overview.recents.noName": "Tanpa nama",
  "overview.chainDetails": "Info Rantai",
  "overview.chainDetails.authorityContract": "Kontrak Otoritas",
  "overview.chainDetails.registryContract": "Kontrak Registri",
  "overview.chainDetails.lastBlock": "Blok Terakhir",
  "overview.chainDetails.unavailable": "Tidak tersedia",
  "overview.relativeTime.seconds": "baru saja",
  "overview.relativeTime.minutes": "{{n}}m lalu",
  "overview.relativeTime.hours": "{{n}}j lalu",
  "overview.relativeTime.days": "{{n}}h lalu",
  "overview.relativeTime.weeks": "{{n}}m lalu",
  "overview.error.title": "Terjadi kesalahan",
  "overview.error.body": "Tidak dapat memuat ringkasan.",
  "overview.error.retry": "Coba lagi",
  "overview.loading": "Memuat ringkasan...",
  "overview.dateFilter.from": "Dari",
  "overview.dateFilter.to": "Sampai",
  "overview.dateFilter.clear": "Hapus"
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/i18n/en.json src/shared/i18n/id.json
git commit -m "feat: add overview i18n keys"
```

---

### Task 7: Create Overview.tsx page component + tests

**Files:**
- Create: `src/feature/overview/Overview.tsx`
- Create: `src/feature/overview/Overview.test.tsx`

- [ ] **Step 1: Write the component test first**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { useStore } from "@app/store";
import { makeUser } from "@/test/fixtures";
import { Role } from "@shared/auth/role";
import { Overview } from "./Overview";

function renderOverview() {
  return render(<Overview />, { wrapper: TestProviders });
}

describe("Overview", () => {
  beforeEach(() => {
    useStore.setState({ isAuthenticated: true, user: null });
  });

  it("renders PageHeader with user name", async () => {
    useStore.setState({ user: makeUser({ name: "Arfan", role: Role.ISSUER }) });
    renderOverview();
    await waitFor(() => expect(screen.getByText("Welcome, Arfan")).toBeDefined());
  });

  it("renders credential counts", async () => {
    useStore.setState({ user: makeUser({ role: Role.HOLDER }) });
    renderOverview();
    await waitFor(() => {
      expect(screen.getByText("Credentials")).toBeDefined();
      expect(screen.getByText("500")).toBeDefined();
    });
  });

  it("renders user counts for Issuer+", async () => {
    useStore.setState({ user: makeUser({ role: Role.ISSUER }) });
    renderOverview();
    await waitFor(() => {
      expect(screen.getByText("Users")).toBeDefined();
      expect(screen.getByText("Holders")).toBeDefined();
    });
  });

  it("hides user counts for Holder", async () => {
    useStore.setState({ user: makeUser({ role: Role.HOLDER }) });
    renderOverview();
    await waitFor(() => expect(screen.getByText("Credentials")).toBeDefined());
    expect(screen.queryByText("Users")).toBeNull();
  });

  it("renders chain details for Issuer+", async () => {
    useStore.setState({ user: makeUser({ role: Role.ISSUER }) });
    renderOverview();
    await waitFor(() => {
      expect(screen.getByText("Chain Info")).toBeDefined();
    });
  });

  it("hides chain details for Holder", async () => {
    useStore.setState({ user: makeUser({ role: Role.HOLDER }) });
    renderOverview();
    await waitFor(() => expect(screen.getByText("Credentials")).toBeDefined());
    expect(screen.queryByText("Chain Info")).toBeNull();
  });

  it("shows super admin always-one note for Issuer+", async () => {
    useStore.setState({ user: makeUser({ role: Role.ISSUER }) });
    renderOverview();
    await waitFor(() => {
      expect(screen.getByText("Always 1")).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/feature/overview/Overview.test.tsx
```

Expected: FAIL — module `./Overview` not found.

- [ ] **Step 3: Write the Overview.tsx page component**

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { FileBadge, User, AlertTriangle } from "lucide-react";
import { useStore } from "@app/store";
import { Role, canAccessAny } from "@shared/auth/role";
import { RoleGate } from "@shared/auth/guards";
import { useOverview } from "./api/useOverview";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { DetailRow } from "@shared/components/DetailRow";
import { Card, CardHeader, CardTitle } from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@shared/lib/cn";

function StatItem({ value, label, note }: { value: number; label: string; note?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-base p-4 text-center">
      <div className="font-display text-2xl font-bold text-navy">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs font-sans text-gray-500">
        {label}
        {note && <span className="ml-1 text-gray-400 italic">{note}</span>}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function relativeTime(iso: string, t: ReturnType<typeof useTranslation>["t"]): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return t("overview.relativeTime.seconds");
  if (minutes < 60) return t("overview.relativeTime.minutes", { n: minutes });
  if (hours < 24) return t("overview.relativeTime.hours", { n: hours });
  if (days < 7) return t("overview.relativeTime.days", { n: days });
  return t("overview.relativeTime.weeks", { n: weeks });
}

export function Overview() {
  const user = useStore((s) => s.user);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isIssuerPlus = canAccessAny(user?.role, [Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]);

  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "");
  const debouncedFrom = useDebouncedValue(dateFrom, 300);
  const debouncedTo = useDebouncedValue(dateTo, 300);

  const filters: string[] = [];
  if (debouncedFrom && debouncedTo) {
    filters.push(`date..${debouncedFrom},${debouncedTo}`);
  } else if (debouncedFrom) {
    filters.push(`date..${debouncedFrom},`);
  } else if (debouncedTo) {
    filters.push(`date..,${debouncedTo}`);
  }

  const { data, isLoading, isError, refetch } = useOverview(
    filters.length > 0 ? { filters } : undefined,
  );

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (from) next.set("dateFrom", from);
      else next.delete("dateFrom");
      if (to) next.set("dateTo", to);
      else next.delete("dateTo");
      return next;
    });
  };

  const handleClearDates = () => {
    setDateFrom("");
    setDateTo("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("dateFrom");
      next.delete("dateTo");
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={t("overview.welcome", {
          name: user?.name?.split(" ")[0] ?? t("overview.fallbackName"),
        })}
        description={t("overview.description")}
        action={
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{t("overview.dateFilter.from")}</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateChange(e.target.value, dateTo)}
                className="w-36"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{t("overview.dateFilter.to")}</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                className="w-36"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={handleClearDates} className="mb-0.5">
                {t("overview.dateFilter.clear")}
              </Button>
            )}
          </div>
        }
      />

      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title={t("overview.error.title")}
          description={t("overview.error.body")}
          action={
            <Button variant="primary" onClick={() => refetch()}>
              {t("overview.error.retry")}
            </Button>
          }
        />
      ) : isLoading ? (
        <>
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </>
      ) : data ? (
        <>
          {/* Section 1: Credential Counts */}
          <Card>
            <CardHeader>
              <CardTitle>{t("overview.credentialCounts")}</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4 px-6 pb-6 sm:grid-cols-3 lg:grid-cols-5 sm:px-8 sm:pb-8">
              <StatItem value={data.credential_counts.total} label={t("overview.counts.total")} />
              <StatItem value={data.credential_counts.active} label={t("overview.counts.active")} />
              <StatItem value={data.credential_counts.revoked} label={t("overview.counts.revoked")} />
              <StatItem value={data.credential_counts.pending} label={t("overview.counts.pending")} />
              <StatItem value={data.credential_counts.failed} label={t("overview.counts.failed")} />
            </div>
          </Card>

          {/* Section 2: User Counts (Issuer+) */}
          <RoleGate allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}>
            {data.user_counts && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("overview.userCounts")}</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-2 gap-4 px-6 pb-6 sm:grid-cols-3 lg:grid-cols-4 sm:px-8 sm:pb-8">
                  <StatItem value={data.user_counts.total} label={t("overview.counts.total")} />
                  <StatItem value={data.user_counts.holder} label={t("overview.counts.holder")} />
                  <StatItem value={data.user_counts.issuer} label={t("overview.counts.issuer")} />
                  <StatItem value={data.user_counts.admin} label={t("overview.counts.admin")} />
                  <StatItem
                    value={data.user_counts.super_admin}
                    label={t("overview.counts.superAdmin")}
                    note={t("overview.superAdminAlwaysOne")}
                  />
                  <StatItem value={data.user_counts.active} label={t("overview.counts.activeUsers")} />
                  <StatItem value={data.user_counts.trashed} label={t("overview.counts.trashed")} />
                </div>
              </Card>
            )}
          </RoleGate>

          {/* Section 3: Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{t("overview.recents")}</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-6">
              <div>
                <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("overview.recents.activeCredentials")}
                </h4>
                {data.recents.active_credentials.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400 italic">
                    {t("overview.recents.empty")}
                  </p>
                ) : (
                  data.recents.active_credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-center gap-3 border-b border-gray-50 py-3 last:border-0"
                    >
                      <FileBadge className="h-5 w-5 shrink-0 text-gray-300" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">
                          {cred.name || t("overview.recents.noName")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cred.holder
                            ? `${cred.holder.name} · `
                            : ""}
                          {t("overview.recents.issuedBy", {
                            issuer: cred.issuer?.name ?? t("overview.recents.noName"),
                          })}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-gray-400">
                        {relativeTime(cred.issued_at, t)}
                      </time>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("overview.recents.revokedCredentials")}
                </h4>
                {data.recents.revoked_credentials.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400 italic">
                    {t("overview.recents.empty")}
                  </p>
                ) : (
                  data.recents.revoked_credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-center gap-3 border-b border-gray-50 py-3 last:border-0"
                    >
                      <FileBadge className="h-5 w-5 shrink-0 text-gray-300" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">
                          {cred.name || t("overview.recents.noName")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cred.holder
                            ? `${cred.holder.name} · `
                            : ""}
                          {t("overview.recents.revokedBy", {
                            revoker: cred.revoker?.name ?? t("overview.recents.noName"),
                          })}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-gray-400">
                        {cred.revoked_at ? relativeTime(cred.revoked_at, t) : ""}
                      </time>
                    </div>
                  ))
                )}
              </div>

              {data.recents.stored_users && data.recents.stored_users.length > 0 && (
                <div>
                  <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    {t("overview.recents.storedUsers")}
                  </h4>
                  {data.recents.stored_users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 border-b border-gray-50 py-3 last:border-0"
                    >
                      <User className="h-5 w-5 shrink-0 text-gray-300" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">
                          {u.name || t("overview.recents.noName")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {u.role} · {t("overview.recents.joined", { date: formatDate(u.created_at) })}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-gray-400">
                        {relativeTime(u.created_at, t)}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Section 4: Chain Info (Issuer+) */}
          <RoleGate allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}>
            {data.chain_details && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("overview.chainDetails")}</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
                  <DetailRow
                    label={t("overview.chainDetails.authorityContract")}
                    value={
                      <code className="text-xs font-mono text-navy">
                        {data.chain_details.authority_contract}
                      </code>
                    }
                  />
                  <DetailRow
                    label={t("overview.chainDetails.registryContract")}
                    value={
                      <code className="text-xs font-mono text-navy">
                        {data.chain_details.registry_contract}
                      </code>
                    }
                  />
                  <DetailRow
                    label={t("overview.chainDetails.lastBlock")}
                    value={
                      data.chain_details.last_block === 0
                        ? t("overview.chainDetails.unavailable")
                        : data.chain_details.last_block.toLocaleString()
                    }
                  />
                </div>
              </Card>
            )}
          </RoleGate>
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/feature/overview/Overview.test.tsx
```

Expected: 7 tests PASS. (The test uses MSW mock data which returns `name: "John"` but the component shows name from Zustand store, not from the overview data — the MSW mock response includes the data. Tests should pass because MSW provides the full mock overview response via `handlers.ts`).

- [ ] **Step 5: Run full test suite to ensure no regressions**

```bash
npx vitest run
```

Make sure all existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add src/feature/overview/Overview.tsx src/feature/overview/Overview.test.tsx
git commit -m "feat: implement overview page with stat cards, recents, and chain info"
```

---

## Phase 2: Rename "dashboard" → "overview" (Atomic commit)

All Phase 2 changes should be done together. The app may not compile between individual renames, so commit incrementally within this phase but run verification only at the end.

---

### Task 8: Rename layout component files (git mv)

**Files:**
- Rename: `src/shared/components/layout/DashboardLayout.tsx` → `OverviewLayout.tsx`
- Rename: `src/shared/components/layout/DashboardSidebar.tsx` → `OverviewSidebar.tsx`
- Rename: `src/shared/components/layout/NavbarDashboard.tsx` → `NavbarOverview.tsx`
- Rename: `src/shared/components/layout/DashboardSidebar.test.tsx` → `OverviewSidebar.test.tsx`
- Rename: `src/shared/components/layout/NavbarDashboard.test.tsx` → `NavbarOverview.test.tsx`

- [ ] **Step 1: Rename with git mv**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
git mv src/shared/components/layout/DashboardLayout.tsx src/shared/components/layout/OverviewLayout.tsx
git mv src/shared/components/layout/DashboardSidebar.tsx src/shared/components/layout/OverviewSidebar.tsx
git mv src/shared/components/layout/NavbarDashboard.tsx src/shared/components/layout/NavbarOverview.tsx
git mv src/shared/components/layout/DashboardSidebar.test.tsx src/shared/components/layout/OverviewSidebar.test.tsx
git mv src/shared/components/layout/NavbarDashboard.test.tsx src/shared/components/layout/NavbarOverview.test.tsx
```

- [ ] **Step 2: Update internal references in renamed layout files**

In `OverviewLayout.tsx` (line 5-6): `DashboardSidebar` → `OverviewSidebar`, `NavbarDashboard` → `NavbarOverview`, `DashboardLayout` → `OverviewLayout`:

```tsx
import { OverviewSidebar } from "./OverviewSidebar";
import { NavbarOverview } from "./NavbarOverview";

export function OverviewLayout() {
```

In `OverviewSidebar.tsx` (line 11, 15): `DashboardSidebarProps` → `OverviewSidebarProps`, `DashboardSidebar` → `OverviewSidebar`:

```tsx
interface OverviewSidebarProps {
  onClose?: () => void;
}

export function OverviewSidebar({ onClose }: OverviewSidebarProps) {
```

Also in `OverviewSidebar.tsx` line 65: `end={item.href === "/dashboard"}` → `end={item.href === "/overview"}`:

```tsx
end={item.href === "/overview"}
```

In `NavbarOverview.tsx` (lines 22, 26): `NavbarDashboardProps` → `NavbarOverviewProps`, `NavbarDashboard` → `NavbarOverview`:

```tsx
interface NavbarOverviewProps {
  onMenuClick: () => void;
}

export function NavbarOverview({ onMenuClick }: NavbarOverviewProps) {
```

- [ ] **Step 3: Update test file imports**

In `OverviewSidebar.test.tsx` line 5: `import { DashboardSidebar } from "./DashboardSidebar";` → `import { OverviewSidebar } from "./OverviewSidebar";`

In `OverviewSidebar.test.tsx` (lines 16-17): `function renderDashboardSidebar()` → `function renderOverviewSidebar()`, `<DashboardSidebar />` → `<OverviewSidebar />`

In `OverviewSidebar.test.tsx` line 20: `describe("DashboardSidebar logout confirmation"` → `describe("OverviewSidebar logout confirmation"`

In `OverviewSidebar.test.tsx` lines 31, 38, 47: `renderDashboardSidebar()` → `renderOverviewSidebar()`

In `NavbarOverview.test.tsx` line 5: `import { NavbarDashboard } from "./NavbarDashboard";` → `import { NavbarOverview } from "./NavbarOverview";`

In `NavbarOverview.test.tsx` line 17: `<NavbarDashboard onMenuClick={() => {}} />` → `<NavbarOverview onMenuClick={() => {}} />`

In `NavbarOverview.test.tsx` line 20: `describe("NavbarDashboard logout confirmation"` → `describe("NavbarOverview logout confirmation"`

In `NavbarOverview.test.tsx` line 39: `describe("NavbarDashboard search"` → `describe("NavbarOverview search"`

- [ ] **Step 4: Commit layout renames**

```bash
git add src/shared/components/layout/
git commit -m "refactor: rename DashboardLayout/DashboardSidebar/NavbarDashboard to Overview*"
```

---

### Task 9: Update all consumers of renamed layout components

**Files:**
- Modify: `src/shared/components/layout/AdaptiveLayout.tsx:2-2` (import)
- Modify: `src/app/router.tsx:4` (import)
- Modify: `src/app/router.tsx:81` (element usage)
- Modify: `src/app/router.tsx:85-86` (route path + lazy import)
- Modify: `src/app/router.tsx:141` (Settings lazy import)

- [ ] **Step 1: Update AdaptiveLayout.tsx**

Line 2: `import { DashboardLayout } from "./DashboardLayout";` → `import { OverviewLayout } from "./OverviewLayout";`

Line 7: `<DashboardLayout />` → `<OverviewLayout />`

- [ ] **Step 2: Update router.tsx**

Line 4: `import { DashboardLayout } from "@shared/components/layout/DashboardLayout";` → `import { OverviewLayout } from "@shared/components/layout/OverviewLayout";`

Line 81: `element: <DashboardLayout />,` → `element: <OverviewLayout />,`

Line 85: `path: "/dashboard",` → `path: "/overview",`

Line 86: `...lazyRoute(() => import("@feature/dashboard/Dashboard"), "Dashboard"),` → `...lazyRoute(() => import("@feature/overview/Overview"), "Overview"),`

Line 141: `...lazyRoute(() => import("@feature/dashboard/Settings"), "Settings"),` → `...lazyRoute(() => import("@feature/overview/Settings"), "Settings"),`

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/layout/AdaptiveLayout.tsx src/app/router.tsx
git commit -m "refactor: update layout consumers for Overview rename"
```

---

### Task 10: Update store state names

**Files:**
- Modify: `src/app/store/index.ts`

- [ ] **Step 1: Rename store properties**

```ts
// Lines 13-16: dashboardSidebarOpen → overviewSidebarOpen
overviewSidebarOpen: boolean;
setOverviewSidebarOpen: (open: boolean) => void;
toggleOverviewSidebar: () => void;

// Lines 32-35:
overviewSidebarOpen: false,
setOverviewSidebarOpen: (open) => set({ overviewSidebarOpen: open }),
toggleOverviewSidebar: () => set((s) => ({ overviewSidebarOpen: !s.overviewSidebarOpen })),
```

- [ ] **Step 2: Commit**

```bash
git add src/app/store/index.ts
git commit -m "refactor: rename dashboardSidebarOpen to overviewSidebarOpen in store"
```

---

### Task 11: Update nav-items.ts

**Files:**
- Modify: `src/shared/components/layout/nav-items.ts`

- [ ] **Step 1: Update the overview nav item**

Line 16: `href: "/dashboard",` → `href: "/overview",`

Line 19: `minRole: Role.ISSUER,` → `minRole: Role.HOLDER,`

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/layout/nav-items.ts
git commit -m "refactor: update nav-items overview entry (route + minRole)"
```

---

### Task 12: Update guards

**Files:**
- Modify: `src/shared/auth/guards.tsx`

- [ ] **Step 1: Update ProtectedRoute and PublicRoute**

Line 19: `const fallback = user.role === Role.HOLDER ? "/credentials/self" : "/dashboard";` → `"/overview"`

Line 32: `return <Navigate to={from ?? "/dashboard"} replace />;` → `"/overview"`

- [ ] **Step 2: Commit**

```bash
git add src/shared/auth/guards.tsx
git commit -m "refactor: update guard redirects /dashboard → /overview"
```

---

### Task 13: Update hooks

**Files:**
- Modify: `src/shared/hooks/useSmartBack.ts` (lines 9, 15, 31, 38)
- Modify: `src/shared/hooks/useScrollToTop.ts` (line 9 — comment only)

- [ ] **Step 1: Update useSmartBack.ts**

Line 9: `/dashboard` → `/overview`
Line 15: `/dashboard` → `/overview`
Line 31: `navigate(isAuthenticated ? "/dashboard" : "/");` → `navigate(isAuthenticated ? "/overview" : "/");`
Line 38: `navigate(isAuthenticated ? "/dashboard" : "/");` → `navigate(isAuthenticated ? "/overview" : "/");`

- [ ] **Step 2: Update useScrollToTop.ts**

Line 9: comment only — `DashboardLayout` → `OverviewLayout`

- [ ] **Step 3: Commit**

```bash
git add src/shared/hooks/useSmartBack.ts src/shared/hooks/useScrollToTop.ts
git commit -m "refactor: update hooks /dashboard → /overview"
```

---

### Task 14: Update shared components

**Files:**
- Modify: `src/shared/components/NotFound.tsx` (line 30, 32)
- Modify: `src/shared/components/RouteErrorBoundary.tsx` (line 26, 28)
- Modify: `src/shared/components/PageHeader.tsx` (line 11 — comment only)

- [ ] **Step 1: Update NotFound.tsx**

Line 30: `<Link to="/dashboard">` → `<Link to="/overview">`

Line 32: `{t("not_found.goDashboard")}` → `{t("not_found.goOverview")}`

- [ ] **Step 2: Update RouteErrorBoundary.tsx**

Line 26: `<Link to="/dashboard">` → `<Link to="/overview">`

Line 28: `{t("error_boundary.goDashboard")}` → `{t("error_boundary.goOverview")}`

- [ ] **Step 3: Update PageHeader.tsx**

Line 11: comment `\`/dashboard\`` → `\`/overview\``

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/NotFound.tsx src/shared/components/RouteErrorBoundary.tsx src/shared/components/PageHeader.tsx
git commit -m "refactor: update shared components /dashboard → /overview"
```

---

### Task 15: Update feature files

**Files:**
- Modify: `src/feature/auth/api/useGoogleLogin.ts` (line 27)
- Modify: `src/feature/landing/Landing.tsx` (lines 156-157)

- [ ] **Step 1: Update useGoogleLogin.ts**

Line 27: `navigate("/dashboard");` → `navigate("/overview");`

- [ ] **Step 2: Update Landing.tsx**

Line 156: `const primaryHref = isAuthenticated ? "/dashboard" : "/login";` → `"/overview"`

Line 157: `const primaryLabel = isAuthenticated ? t("landing.cta.dashboard") : t("landing.cta.signIn");` → `t("landing.cta.overview")`

- [ ] **Step 3: Commit**

```bash
git add src/feature/auth/api/useGoogleLogin.ts src/feature/landing/Landing.tsx
git commit -m "refactor: update feature files /dashboard → /overview"
```

---

### Task 16: Move feature/dashboard/ folder to feature/overview/

**Files:**
- Rename: `src/feature/dashboard/Settings.tsx` → `src/feature/overview/Settings.tsx`

Note: `Overview.tsx` was already created in Phase 1 at `src/feature/overview/Overview.tsx`. The old `Dashboard.tsx` at `src/feature/dashboard/Dashboard.tsx` will be deleted since it's been replaced. We only need to move `Settings.tsx`.

- [ ] **Step 1: Delete old Dashboard.tsx and move Settings.tsx**

```bash
git rm src/feature/dashboard/Dashboard.tsx
git mv src/feature/dashboard/Settings.tsx src/feature/overview/Settings.tsx
```

- [ ] **Step 2: Remove empty dashboard directory if it's empty**

```bash
rmdir src/feature/dashboard 2>/dev/null || true
```

- [ ] **Step 3: Verify Settings.tsx doesn't reference dashboard**

Check Settings.tsx for any `dashboard` references. Looking at the file, it only uses `settings.*` i18n keys and `useStore` — no dashboard references.

- [ ] **Step 4: Commit**

```bash
git add src/feature/dashboard/ src/feature/overview/Settings.tsx
git commit -m "refactor: move Settings.tsx and delete old Dashboard.tsx"
```

---

### Task 17: Update i18n keys — rename dashboard.* → overview.*

**Files:**
- Modify: `src/shared/i18n/en.json`
- Modify: `src/shared/i18n/id.json`

- [ ] **Step 1: Update en.json**

Changes in en.json:

1. Rename keys (update key names, keep values):
   - `"dashboard.welcome"` → `"overview.welcome"` (already exists from Phase 1 — delete the `dashboard.welcome` entry)
   - `"dashboard.fallbackName"` → `"overview.fallbackName"` (already exists — delete old)
   - `"dashboard.overview"` → `"overview.description"` (already exists — delete old)

2. Delete keys:
   - `"dashboard.comingSoon.title"` (line 176)
   - `"dashboard.comingSoon.body"` (line 177)

3. Rename keys (update key names, tweak values):
   - `"landing.cta.dashboard": "Go to Dashboard"` → `"landing.cta.overview": "Go to Overview"`
   - `"not_found.goDashboard": "Back to Dashboard"` → `"not_found.goOverview": "Back to Overview"`
   - `"error_boundary.goDashboard": "Dashboard"` → `"error_boundary.goOverview": "Overview"`

4. Update settings description (line 190):
   - `"dashboard and notifications"` → `"overview and notifications"` (inside `settings.language.body` value)

5. Update auth signin subtitle (line 290):
   - `"platform dashboard"` → `"platform overview"` (inside `auth.signin.subtitle` value)

6. Delete old `dashboard.*` keys that were replaced by `overview.*`:
   - `"dashboard.welcome"`, `"dashboard.fallbackName"`, `"dashboard.overview"`

- [ ] **Step 2: Update id.json**

Same changes as en.json, with Indonesian values:

1. Delete `"dashboard.comingSoon.title"` and `"dashboard.comingSoon.body"`
2. Delete old `"dashboard.welcome"`, `"dashboard.fallbackName"`, `"dashboard.overview"`
3. `"landing.cta.dashboard": "Ke Dasbor"` → `"landing.cta.overview": "Ke Ringkasan"`
4. `"not_found.goDashboard": "Kembali ke Dasbor"` → `"not_found.goOverview": "Kembali ke Ringkasan"`
5. `"error_boundary.goDashboard": "Dasbor"` → `"error_boundary.goOverview": "Ringkasan"`
6. Update `settings.language.body` value: `"dasbor dan notifikasi"` → `"ringkasan dan notifikasi"`
7. Update `auth.signin.subtitle` value: `"dasbor platform"` → `"ringkasan platform"`

- [ ] **Step 3: Commit**

```bash
git add src/shared/i18n/en.json src/shared/i18n/id.json
git commit -m "refactor: rename dashboard i18n keys to overview"
```

---

### Task 18: Update test files

**Files:**
- Modify: `src/shared/components/NotFound.test.tsx`
- Modify: `src/shared/components/RouteErrorBoundary.test.tsx`
- Modify: `src/shared/components/PageHeader.test.tsx`
- Modify: `src/shared/components/BackLink.test.tsx`
- Modify: `src/shared/hooks/useSmartBack.test.ts`
- Modify: `src/shared/hooks/useNavSearch.test.ts`

- [ ] **Step 1: Update NotFound.test.tsx**

Line 29: `it("renders Dashboard CTA button"` → `it("renders Overview CTA button"`
Line 31: `screen.getByRole("link", { name: /Back to Dashboard/ })` → `/Back to Overview/`

- [ ] **Step 2: Update RouteErrorBoundary.test.tsx**

Line 71: `it("renders Dashboard link"` → `it("renders Overview link"`
Line 74: `screen.findByRole("link", { name: "Dashboard" })` → `"Overview"`

- [ ] **Step 3: Update PageHeader.test.tsx**

Line 55: `expect(navigateMock).toHaveBeenCalledWith("/dashboard");` → `"/overview"`

- [ ] **Step 4: Update BackLink.test.tsx**

Line 47: `it("falls back to /dashboard when authenticated"` → `/overview`
Line 52: `expect(navigateMock).toHaveBeenCalledWith("/dashboard");` → `"/overview"`
Line 65: `locationState = { from: { pathname: "/dashboard" } };` → `"/overview"`
Line 73: `it("redirects to /dashboard when on login"` → `"/overview"`
Line 75: `locationState = { from: { pathname: "/dashboard" } };` → `"/overview"`
Line 79: `expect(navigateMock).toHaveBeenCalledWith("/dashboard");` → `"/overview"`

- [ ] **Step 5: Update useSmartBack.test.ts**

Line 38: `it("falls back to /dashboard when authenticated"` → `/overview`
Line 43: `expect(navigateMock).toHaveBeenCalledWith("/dashboard");` → `"/overview"`
Line 65: `locationState = { from: { pathname: "/dashboard" } };` → `"/overview"`
Line 73: `it("redirects to /dashboard when on login"` → `"/overview"`
Line 75: `locationState = { from: { pathname: "/dashboard" } };` → `"/overview"`
Line 79: `expect(navigateMock).toHaveBeenCalledWith("/dashboard");` → `"/overview"`

- [ ] **Step 6: Update useNavSearch.test.ts**

Line 50: `expect(hrefs).toContain("/dashboard");` → `"/overview"`
Line 65: `expect(hrefs).not.toContain("/dashboard");` → `"/overview"`
Line 96: `expect(hrefs).not.toContain("/dashboard");` → `"/overview"`
Line 118: `it("matches Indonesian label 'dasbor' for dashboard"` → `"'ringkasan' for overview"`
Line 124: `expect(result.current.map((i) => i.href)).toContain("/dashboard");` → `"/overview"`

- [ ] **Step 7: Commit**

```bash
git add src/shared/components/NotFound.test.tsx src/shared/components/RouteErrorBoundary.test.tsx src/shared/components/PageHeader.test.tsx src/shared/components/BackLink.test.tsx src/shared/hooks/useSmartBack.test.ts src/shared/hooks/useNavSearch.test.ts
git commit -m "test: update tests /dashboard → /overview"
```

---

### Task 19: Full verification

- [ ] **Step 1: Run lint**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
npm run lint
```

Expected: PASS (0 errors).

- [ ] **Step 2: Run type-check + build**

```bash
npm run build
```

Expected: TypeScript compilation succeeds, Vite build completes.

- [ ] **Step 3: Run all tests**

```bash
npm run test
```

Expected: All 426+ existing tests pass + new overview tests.

- [ ] **Step 4: Run locale check**

```bash
npm run check-locales
```

Expected: PASS — no key drift between frontend and backend locales.

- [ ] **Step 5: Final commit if any lint/build fixes were needed**

```bash
git add -A
git commit -m "chore: final verification fixes"
```

---

### Task 20: Push to master

- [ ] **Step 1: Push**

```bash
git push origin master
```

Only push after all verification steps pass. Per AGENTS.md: push directly to master (no branches).

