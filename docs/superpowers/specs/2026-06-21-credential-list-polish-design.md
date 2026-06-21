# Credential List Polish & Pagination Redesign — Design Spec

**Date:** 2026-06-21
**Scope:** `CredentialList`, `UserList`, `PaginationBar`, shared components
**Status:** Awaiting implementation plan

---

## 1. Goal

Polish credential and user list UIs: reposition counts, replace page-based pagination with "Load More" batching, add credential filter/sort controls, extend search coverage, cap batch selection, and ensure full i18n support.

---

## 2. Task 1: Count Position & Label

### 2.1 Credential list

Move the total count from the top bar (next to search) to the bottom, inside the pagination footer area, matching the UserList pattern.

**Current** (`CredentialList.tsx:209-213`):

```tsx
{!isLoading && (
  <span className="text-xs font-bold tracking-wider whitespace-nowrap text-gray-400 uppercase">
    {t("cred.list.count", { count: total })}
  </span>
)}
```

**Target:** Removed from the top bar. Moved to the footer area (inside `LoadMoreBar`, see Task 2).

Locale change: `cred.list.count` currently renders "X records" / "X data". Change to "X Credentials" / "X Kredensial":

```json
// en.json
"cred.list.count_one": "{{count}} Credential",
"cred.list.count_other": "{{count}} Credentials"

// id.json
"cred.list.count_one": "{{count}} Kredensial",
"cred.list.count_other": "{{count}} Kredensial"
```

### 2.2 User list

The user list count (`user.pagination.showing`) already sits in the footer. Keep its position, keep its label ("users"/"pengguna").

---

## 3. Task 2: Load More Pagination

### 3.1 Data model

Replace page-number-based navigation with cumulative client-side accumulation. Each "Load More" click fetches the next batch of 50 items and appends them to the visible list.

**New hook: `useLoadMore`** (`src/shared/hooks/useLoadMore.ts`)

```ts
interface UseLoadMoreResult<T> {
  items: T[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

function useLoadMore<T>(
  queryKey: QueryKey,
  queryFn: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
): UseLoadMoreResult<T>
```

Internally: maintains `currentPage` state (starts at 1). `loadMore()` increments page and fires a new query. Results are accumulated via `useQuery` with `select` merging previous pages. `hasMore` derived from `page < last_page` in the latest response.

### 3.2 New component: `LoadMoreBar`

Replace `PaginationBar` component with `LoadMoreBar` (`src/shared/components/LoadMoreBar.tsx`):

```tsx
interface LoadMoreBarProps {
  total: number;
  loadedCount: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  countLabel: string; // i18n-translated, e.g. "X Credentials"
}
```

Renders: count label on the left, "Load More" button on the right. Button disabled when `!hasMore || isLoading`. Shows spinner when loading.

### 3.3 CredentialList changes

- Replace `useCredentials` with `useLoadMore<CredentialDTO>` wrapping the same API call.
- Remove `page`, `totalPages` state. Remove `PAGE_SIZE` constant (batch size is 50, fixed in hook).
- Remove `PaginationBar` import, add `LoadMoreBar`.
- Remove top-bar count span (moved into LoadMoreBar).
- Keep debounced search, selectedIds, bulk mode logic unchanged.

### 3.4 UserList changes

- Replace `useUsers` with `useLoadMore<UserDTO>`.
- Remove `useUserListParams` dependency on `page`, `limit` for pagination (keep search/sort/filter/role/status params).
- Remove `PageSizeMenu` component and `limit` from URL params.
- Remove `PaginationBar` import, add `LoadMoreBar`.
- `PAGE_RESET_KEYS` no longer includes `limit`.

### 3.5 URL params

- `page` param removed from URL (load more is stateful, not URL-driven).
- `limit` param removed (fixed at 50).
- `search`, `sort`, `status`, `role` params remain URL-driven and reset accumulated pages on change.

---

## 4. Task 3: Batch Selection Cap at 100

### 4.1 CredentialList changes

In `toggleSelection`:

```ts
const MAX_SELECTION = 100;

const toggleSelection = (id: string) => {
  const next = new Set(selectedIds);
  if (next.has(id)) {
    next.delete(id);
  } else {
    if (next.size >= MAX_SELECTION) {
      notify.warning("cred.card.selectionCapReached");
      return;
    }
    next.add(id);
  }
  setSelectedIds(next);
};
```

### 4.2 CredentialCard changes

New prop:

```ts
interface CredentialCardProps {
  credential: CredentialDTO;
  isSelected?: boolean;
  selectionMode?: "revoke" | "reextract" | null;
  onSelect?: () => void;
  selectDisabled?: boolean; // NEW
}
```

When `selectDisabled` is true:
- Card cursor becomes `cursor-not-allowed`
- Checkbox shows `cursor-not-allowed opacity-30` (same as ineligible state)
- Card click in selection mode does nothing (already handled by `isSelectable` logic)

### 4.3 CredentialList passes selectDisabled

```tsx
const selectionFull = selectedIds.size >= 100;

<CredentialCard
  selectDisabled={!isSelectable || (selectionFull && !selectedIds.has(cred.id))}
  ...
/>
```

The `isSelectable` check already handles ineligibility. The cap check adds:

```tsx
const isSelectable = /* existing logic */;
const selectionFull = selectedIds.size >= 100;
const selectDisabled = !isSelectable || (selectionFull && !selectedIds.has(cred.id));
```

### 4.4 i18n key

```json
// en.json
"cred.card.selectionCapReached": "Maximum of 100 credentials selected. Deselect some to add more."

// id.json
"cred.card.selectionCapReached": "Maksimal 100 kredensial dipilih. Batalkan pilihan untuk menambah."
```

---

## 5. Task 4: Filter & Sort Controls

### 5.1 New component: `CredentialStatusFilterMenu`

Place in `src/feature/credential/components/CredentialStatusFilterMenu.tsx`. Follows same pattern as `RoleFilterMenu` / `StatusFilterMenu`.

**Filter options and backend filters:**

| Label | Key | Filters sent to backend |
|---|---|---|
| All | `all` | (none) |
| Active | `active` | `revoked_at_`, `extract_status!=failed` |
| Revoked | `revoked` | `revoked_at!_`, `extract_status!=failed` |
| Pending | `pending` | `extract_status=pending` |
| Failed | `failed` | `extract_status=failed` |

Default: `active`. Active is chosen over All so the list is immediately useful (most credentials are active).

Trigger button shows: `"Status: Active"` format, matching user list filter pattern.

The `extract_status` filter require the backend handoff to be completed first (adding it to the filter allowlist).

### 5.2 New component: `CredentialSortMenu`

Place in `src/feature/credential/components/CredentialSortMenu.tsx`.

**Sort options:**

| Label | Key | Sort string (filter=Revoked) | Sort string (other filters) |
|---|---|---|---|
| Newest | `newest` | `-revoked_at` | `-issued_at` |
| Oldest | `oldest` | `revoked_at` | `issued_at` |
| Name A→Z | `nameAZ` | `name` | `name` |
| Name Z→A | `nameZA` | `-name` | `-name` |

Default: `newest`. The sort field dynamically switches based on the active status filter: when filter is "revoked", sort by `revoked_at`; otherwise sort by `issued_at`.

Trigger button shows: `"Sort: Newest"` format.

### 5.3 CredentialList integration

Top bar layout — filter and sort sit alongside search, same row, matching the UserList pattern:

```
[Search input (flex-1)]                    [Status ▼] [Sort ▼]
```

The mode buttons (Revoke, Re-extract, Issue New) remain in the PageHeader action slot. On mobile, `flex flex-col gap-3 md:flex-row md:items-center md:gap-4` — same responsive pattern as UserList.

### 5.4 URL params

New URL params for credentials:
- `cred_status`: `"all" | "active" | "revoked" | "pending" | "failed"` (default `"active"`)
- `cred_sort`: `"newest" | "oldest" | "nameAZ" | "nameZA"` (default `"newest"`)

Filter and sort changes reset the accumulated page state (clear items, reset to page 1).

### 5.5 Backend gap note

Status filters `active`, `revoked`, `pending`, `failed` depend on `extract_status` being in the backend filter allowlist. Until the backend handoff is completed, only `all` produces correct results. The UI components are built assuming the backend change is in place.

---

## 6. Task 5: Extended Search

### 6.1 Search placeholder

Update locale key `cred.list.searchPlaceholder`:

```json
// en.json
"cred.list.searchPlaceholder": "Search by name, ID, token, hash, holder, issuer, and revoker"

// id.json
"cred.list.searchPlaceholder": "Cari berdasarkan nama, ID, token, hash, pemegang, penerbit, dan pembatal"
```

### 6.2 Backend dependency

The actual field expansion (credential ID, token_id, file_hash, issuer.*, revoker.*) is handled in the backend handoff. No frontend search logic changes — the same `search` query parameter is sent. The frontend just updates the placeholder text to reflect what fields are searchable.

---

## 7. Task 6: i18n Keys

### 7.1 New keys

| Key | en | id |
|---|---|---|
| `cred.list.count_one` | `{{count}} Credential` | `{{count}} Kredensial` |
| `cred.list.count_other` | `{{count}} Credentials` | `{{count}} Kredensial` |
| `cred.list.searchPlaceholder` | `Search by name, ID, token, hash, holder, issuer, and revoker` | `Cari berdasarkan nama, ID, token, hash, pemegang, penerbit, dan pembatal` |
| `cred.filter.status` | `Status` | `Status` |
| `cred.filter.all` | `All` | `Semua` |
| `cred.filter.active` | `Active` | `Aktif` |
| `cred.filter.revoked` | `Revoked` | `Dicabut` |
| `cred.filter.pending` | `Pending` | `Tertunda` |
| `cred.filter.failed` | `Failed` | `Gagal` |
| `cred.sort.label` | `Sort` | `Urutkan` |
| `cred.sort.newest` | `Newest` | `Terbaru` |
| `cred.sort.oldest` | `Oldest` | `Terlama` |
| `cred.sort.nameAZ` | `Name A→Z` | `Nama A→Z` |
| `cred.sort.nameZA` | `Name Z→A` | `Nama Z→A` |
| `cred.card.selectionCapReached` | `Maximum of 100 credentials selected. Deselect some to add more.` | `Maksimal 100 kredensial dipilih. Batalkan pilihan untuk menambah.` |
| `common.loadMore` | `Load More` | `Muat Lebih Banyak` |

### 7.2 Updated keys

| Key | Old en | New en |
|---|---|---|
| `cred.list.count` | `{{count}} credentials` | `{{count}} Credentials` |
| `cred.list.searchPlaceholder` | `Search credentials...` | `Search by name, ID, token, hash, holder, issuer, and revoker` |

### 7.3 Removed keys

| Key | Reason |
|---|---|
| `common.previous` | Pagination replaced by load more |
| `common.next` | Pagination replaced by load more |
| `cred.list.pagination.page` | Pagination replaced by load more |
| `user.pagination.showing` | Replaced by simpler count label |

New user list count key to replace `user.pagination.showing`:

| Key | en | id |
|---|---|---|
| `user.list.footerCount` | `{{count}} Users` | `{{count}} Pengguna` |

---

## 8. Component Tree (Post-Change)

```
CredentialList
├── PageHeader
│   └── action: RoleGate > renderActions()
│       ├── DEFAULT: [Revoke] [Re-extract] [Issue New]
│       ├── REVOKE: [Cancel] [Revoke (N)]
│       └── REEXTRACT: [Cancel] [Re-extract (N)]
├── Card
│   ├── Top bar: [Search input] [StatusFilter ▼] [Sort ▼]
│   │            (same row, matching UserList layout)
│   ├── Grid: CredentialCard[]
│   └── LoadMoreBar (total count + Load More button)

UserList
├── PageHeader
├── Card
│   ├── Top bar: [Search input] [Role ▼] [Status ▼] [Sort ▼]
│   ├── Table: rows
│   └── LoadMoreBar (total count + Load More button)
```

---

## 9. Files to Touch

| File | Action | Purpose |
|---|---|---|
| `src/shared/hooks/useLoadMore.ts` | **Create** | Cumulative pagination hook |
| `src/shared/components/LoadMoreBar.tsx` | **Create** | Footer with count + load more button |
| `src/shared/components/LoadMoreBar.test.tsx` | **Create** | Tests |
| `src/feature/credential/components/CredentialStatusFilterMenu.tsx` | **Create** | Status filter dropdown |
| `src/feature/credential/components/CredentialSortMenu.tsx` | **Create** | Sort dropdown |
| `src/feature/credential/CredentialList.tsx` | **Modify** | Load more, filter/sort, count position, selection cap |
| `src/feature/credential/components/CredentialCard.tsx` | **Modify** | selectDisabled prop |
| `src/feature/credential/components/CredentialCard.test.tsx` | **Modify** | selectDisabled tests |
| `src/feature/user/UserList.tsx` | **Modify** | Load more, remove page-size, count position |
| `src/feature/user/hooks/useUserListParams.ts` | **Modify** | Remove page/limit params |
| `src/feature/user/components/PageSizeMenu.tsx` | **Delete** | Replaced by fixed batch size |
| `src/shared/components/PaginationBar.tsx` | **Delete** | Replaced by LoadMoreBar |
| `src/shared/i18n/en.json` | **Modify** | New/updated keys |
| `src/shared/i18n/id.json` | **Modify** | New/updated keys |

---

## 10. Out of Scope

- Search backend changes (separate Go handoff)
- Filter backend changes (separate Go handoff)
- MyCredentials page (not mentioned in tasks)
- CredentialDetail, CredentialIssue, VerifyCredential pages
- Playwright E2E tests
- Removing `useUserListParams.test.tsx` test file (tests adjust for removed page/limit params)

---

## 11. Self-Review

- Placeholder scan: none
- Internal consistency: `useLoadMore` hook decouples accumulation from API fetching. `LoadMoreBar` replaces `PaginationBar` on both lists. Filter/sort components follow existing dropdown menu pattern.
- Scope: 7 tasks, 12 files touched. No new architectural patterns — all components follow existing conventions.
- Ambiguity: `useLoadMore` `select` merging — explicitly described as merging previous page items with new page items via `select` option in `useQuery`. Clear that page reset clears accumulated items.
- Backend dependency: filter and search tasks marked as dependent on Go handoff. UI components are built assuming the backend changes are live.
