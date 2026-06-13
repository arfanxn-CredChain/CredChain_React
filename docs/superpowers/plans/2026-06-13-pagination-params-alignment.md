# PaginationParams → QueryRequest Alignment & Status Filter Bug Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `PaginationParams` TypeScript interface with Go backend `QueryRequest` struct (replace `sort`/`order` pair with `sorts`/`filters` arrays), update all consumers, and fix the Status "All" filter bug.

**Architecture:** Replace the frontend `sort?: string + order?: "asc" | "desc"` pair with `sorts?: string[]` following the backend's `-column`/`column` convention. Move filter-string construction from `useUsers.ts` `buildQuery` into `UserList.tsx` so `useUsers` does a direct pass-through. Add `staleTime: 0` override on the user list query to prevent stale cache from showing wrong filter results.

**Tech Stack:** TypeScript, React 19, TanStack Query v5, React Router v7, lucide-react

---

### Task 1: Update `PaginationParams` interface

**Files:**
- Modify: `src/shared/types/api.ts:74-80`

- [ ] **Step 1: Replace `sort`/`order` fields with `sorts`/`filters`/`includes`**

Replace the existing `PaginationParams` interface:

```ts
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
```

With:

```ts
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sorts?: string[];
  filters?: string[];
  includes?: string[];
}
```

- [ ] **Step 2: Build and check for type errors**

Run: `npx tsc --noEmit 2>&1 | head -40`
Expected: TypeScript errors in files that reference `sort`/`order` on `PaginationParams`. This confirms we've found all consumers. Note the list of files that fail.

---

### Task 2: Update `useUserListParams` to use sort string

**Files:**
- Modify: `src/feature/user/hooks/useUserListParams.ts:1-121`

- [ ] **Step 1: Replace `sort` + `order` with single `sort` string**

Change the `UserListParams` interface (lines 6-14):

```ts
// OLD
export interface UserListParams {
  page: number;
  search: string;
  sort: string;
  order: "asc" | "desc";
  deleted: "all" | "only" | "none";
  role: RoleFilter;
  limit: number;
}
```

```ts
// NEW
export interface UserListParams {
  page: number;
  search: string;
  sort: string;
  deleted: "all" | "only" | "none";
  role: RoleFilter;
  limit: number;
}
```

- [ ] **Step 2: Update `DEFAULTS` (lines 16-24)**

Replace `sort: "created_at"` and `order: "desc"` with:

```ts
const DEFAULTS: UserListParams = {
  page: 1,
  search: "",
  sort: "-created_at",
  deleted: "all",
  role: "all",
  limit: 10,
};
```

- [ ] **Step 3: Update `PAGE_RESET_KEYS` (lines 28-35)**

```ts
// OLD
const PAGE_RESET_KEYS: (keyof UserListParams)[] = [
  "search",
  "sort",
  "order",
  "deleted",
  "role",
  "limit",
];
```

```ts
// NEW - remove "order" since it no longer exists
const PAGE_RESET_KEYS: (keyof UserListParams)[] = [
  "search",
  "sort",
  "deleted",
  "role",
  "limit",
];
```

- [ ] **Step 4: Remove `parseOrder` function (lines 47-49)**

Delete the entire `parseOrder` function:

```ts
// DELETE these 3 lines entirely
function parseOrder(raw: string | null): "asc" | "desc" {
  return raw === "asc" ? "asc" : "desc";
}
```

- [ ] **Step 5: Update `params` object construction (lines 71-79)**

Remove the `order` field:

```ts
// OLD lines 71-79
const params: UserListParams = {
    page: parsePage(searchParams.get("page")),
    search: searchParams.get("search") ?? DEFAULTS.search,
    sort: searchParams.get("sort") ?? DEFAULTS.sort,
    order: parseOrder(searchParams.get("order")),
    deleted: parseDeleted(searchParams.get("deleted")),
    role: parseRole(searchParams.get("role")),
    limit: parseLimit(searchParams.get("limit")),
  };
```

```ts
// NEW - just remove the order line
const params: UserListParams = {
    page: parsePage(searchParams.get("page")),
    search: searchParams.get("search") ?? DEFAULTS.search,
    sort: searchParams.get("sort") ?? DEFAULTS.sort,
    deleted: parseDeleted(searchParams.get("deleted")),
    role: parseRole(searchParams.get("role")),
    limit: parseLimit(searchParams.get("limit")),
  };
```

- [ ] **Step 6: Run tests to verify parse still works**

Run: `npx vitest run src/feature/user/hooks/useUserListParams.test.tsx`
Expected: All tests pass (some may need updating if they reference `order` in URL assertions)

---

### Task 3: Update `SortMenu` to use sort string

**Files:**
- Modify: `src/feature/user/components/SortMenu.tsx:1-57`

- [ ] **Step 1: Replace `sort`/`order` props with single `value` prop**

Change the interface and component signature:

```tsx
// OLD (lines 11-15)
interface SortMenuProps {
  sort: string;
  order: "asc" | "desc";
  onChange: (sort: string, order: "asc" | "desc") => void;
}
```

```tsx
// NEW
interface SortMenuProps {
  value: string;
  onChange: (sortString: string) => void;
}
```

- [ ] **Step 2: Update options to include the sort string directly**

Replace lines 20-26:

```tsx
// OLD
const options: { key: string; sort: string; order: "asc" | "desc"; label: string }[] = [
    { key: "newest", sort: "created_at", order: "desc", label: t("user.sort.option.newest") },
    { key: "oldest", sort: "created_at", order: "asc", label: t("user.sort.option.oldest") },
    { key: "nameAZ", sort: "name", order: "asc", label: t("user.sort.option.nameAZ") },
    { key: "nameZA", sort: "name", order: "desc", label: t("user.sort.option.nameZA") },
    { key: "role", sort: "role", order: "asc", label: t("user.sort.option.role") },
  ];
```

```tsx
// NEW
const options: { key: string; sortString: string; label: string }[] = [
    { key: "newest", sortString: "-created_at", label: t("user.sort.option.newest") },
    { key: "oldest", sortString: "created_at", label: t("user.sort.option.oldest") },
    { key: "nameAZ", sortString: "name", label: t("user.sort.option.nameAZ") },
    { key: "nameZA", sortString: "-name", label: t("user.sort.option.nameZA") },
    { key: "role", sortString: "role", label: t("user.sort.option.role") },
  ];
```

- [ ] **Step 3: Update active option detection and click handler**

Replace lines 28, 41-46, and 47:

```tsx
// OLD line 28
  const activeOption = options.find((opt) => opt.sort === sort && opt.order === order);

// OLD line 42-46
              const active = opt.sort === sort && opt.order === order;
              ...
              onClick={() => onChange(opt.sort, opt.order)}
```

```tsx
// NEW line 28
  const activeOption = options.find((opt) => opt.sortString === value);

// NEW line 42-46  
              const active = opt.sortString === value;
              ...
              onClick={() => onChange(opt.sortString)}
```

- [ ] **Step 4: Run lint to verify**

Run: `npm run lint`
Expected: No new errors

---

### Task 4: Update `useUsers.ts` to use `sorts`/`filters` from `PaginationParams`

**Files:**
- Modify: `src/feature/user/api/useUsers.ts:1-42`

- [ ] **Step 1: Rewrite `useUsers.ts`**

Replace the entire file:

```tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { PaginatedResponse, PaginationParams, UserDTO } from "@shared/types/api";
import { userKeys } from "./keys";

export interface UserListParams extends PaginationParams {}

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const q: Record<string, unknown> = {};
      if (params?.page) q.page = params.page;
      if (params?.limit) q.limit = params.limit;
      if (params?.search) q.search = params.search;
      if (params?.sorts && params.sorts.length) q.sorts = params.sorts;
      if (params?.filters && params.filters.length) q.filters = params.filters;
      if (params?.includes && params.includes.length) q.includes = params.includes;

      const response = await api.get<PaginatedResponse<UserDTO>>("/users", { params: q });
      return response.data;
    },
    staleTime: 0,
  });
}
```

Key changes:
- `UserListParams` no longer has `role`/`deleted` — callers must convert those to filter strings and pass via `filters`
- `buildQuery` function removed — logic is inline in `queryFn`
- `staleTime: 0` to prevent stale cached data when toggling between filters (fixes the Status "All" bug)

- [ ] **Step 2: Update import to remove old `buildQuery` references**

Verify the file has no unused imports. Should only need `useQuery`, `api`, types, and `userKeys`.

---

### Task 5: Update `UserList.tsx` to build sorts and filters arrays

**Files:**
- Modify: `src/feature/user/UserList.tsx:54-80, 109-118`

- [ ] **Step 1: Update `useUsers` call to build sorts and filters**

Replace lines 76-80:

```tsx
// OLD
const { data, isLoading, isError } = useUsers({
    ...params,
    search: debouncedSearch || undefined,
    role: params.role === "all" ? undefined : params.role,
});
```

```tsx
// NEW — build sorts and filters arrays manually
const sortArray = params.sort ? [params.sort] : ["-created_at"];
const filterArray: string[] = [];
if (params.role !== "all") filterArray.push(`role=${params.role}`);
if (params.deleted === "only") filterArray.push("deleted_at!_");
else if (params.deleted === "none") filterArray.push("deleted_at_");

const { data, isLoading, isError } = useUsers({
    page: params.page,
    limit: params.limit,
    search: debouncedSearch || undefined,
    sorts: sortArray,
    filters: filterArray.length > 0 ? filterArray : undefined,
});
```

- [ ] **Step 2: Update `SortMenu` usage (lines 110-113)**

Replace the existing SortMenu JSX that uses `sort`/`order`:

```tsx
// OLD (lines 110-113)
<SortMenu
  sort={params.sort}
  order={params.order}
  onChange={(s, o) => setMany({ sort: s, order: o })}
/>
```

```tsx
// NEW
<SortMenu
  value={params.sort}
  onChange={(sortString) => setParam("sort", sortString)}
/>
```

- [ ] **Step 3: Remove the `setMany` call from SortMenu onChange**

The old code used `setMany({ sort: s, order: o })` because `sort` and `order` were separate. Now with a single `sort` string, `setParam("sort", sortString)` is sufficient. The `setMany` function may still be needed elsewhere — verify it's still used.

Run: `grep -n "setMany" src/feature/user/UserList.tsx`
Expected: Only the `setMany` destructuring on line 56 should remain. If no other usage, remove `setMany` from the destructure.

- [ ] **Step 4: Run lint and typecheck**

Run: `npm run lint 2>&1 && npx tsc --noEmit 2>&1 | head -30`
Expected: No new errors

---

### Task 6: Update `UserList.test.tsx` for sort selector changes

**Files:**
- Modify: `src/feature/user/UserList.test.tsx:122-138`

- [ ] **Step 1: Update sort test if it references `sort=` and `order=` in URL**

Read lines 122-138:

```tsx
// Current test - check if this still passes
it("clicking a sort option updates the URL", async () => {
    const user = userEvent.setup();
    renderUserList();
    await waitFor(() => {
      expect(screen.getByText("Platform Admin")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /sort/i }));
    const item = await screen.findByRole("menuitem", { name: /name a→z/i });
    await user.click(item);
    await waitFor(() => {
      expect(screen.getByTestId("location-search").textContent).toContain("sort=name");
      expect(screen.getByTestId("location-search").textContent).toContain("order=asc");
    });
  });
```

The `order=asc` assertion will fail because `order` param no longer exists. The sort string is now `sort=name` (ascending is implied when no `-` prefix). Update:

```tsx
await waitFor(() => {
  expect(screen.getByTestId("location-search").textContent).toContain("sort=name");
});
```

Remove the `order=asc` expectation line.

- [ ] **Step 2: Check `useUserListParams.test.tsx` for `order` references**

Run: `grep -n "order\|setMany" src/feature/user/hooks/useUserListParams.test.tsx`
If any tests reference `order`, they need updating. Read the test file and update accordingly.

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/feature/user/UserList.test.tsx src/feature/user/hooks/useUserListParams.test.tsx`
Expected: All tests pass

---

### Task 7: Update `useCredentials.ts` for `PaginationParams` change

**Files:**
- Modify: `src/feature/credential/api/useCredentials.ts:1-23`

- [ ] **Step 1: Verify no `sort`/`order` usage**

The `useCredentials` hook passes params directly to axios without building query strings. It only extends `PaginationParams` for the common fields. Since we removed `sort`/`order` from `PaginationParams`, check that `CredentialListParams` doesn't reference them and that `CredentialList.tsx` doesn't pass `sort`/`order`.

Run: `grep -rn "sort\|order" src/feature/credential/CredentialList.tsx`
Expected: No references to `sort`/`order` (only CSS `border` and ordering matches, not sort/order fields)

- [ ] **Step 2: Build and verify**

Run: `npm run build 2>&1`
Expected: Build succeeds with no new TypeScript errors

---

### Task 8: Full verification and commit

- [ ] **Step 1: Run complete verification**

```bash
npm run lint && npm run build && npm run test && npm run check-locales
```

Expected: Everything passes

- [ ] **Step 2: Commit all changes**

```bash
git add -A
git commit -m "refactor: align PaginationParams with backend QueryRequest

Replace sort/order pair with sorts/filters/includes arrays matching
the Go backend QueryRequest struct. Move filter-string construction
from useUsers into UserList for proper separation of concerns.

- PaginationParams: sort+order → sorts, filters, includes (matches QueryRequest)
- useUserListParams: sort+order → single sort string (-created_at convention)
- SortMenu: sort+order props → single value prop with sort string
- useUsers: buildQuery removed, inline pass-through, staleTime:0
- UserList: builds sorts/filters arrays, passes to useUsers
- Fix Status 'All' filter: staleTime:0 prevents stale cache

Type system now matches backend struct field-for-field."
```

- [ ] **Step 3: Push**

```bash
git push
```
