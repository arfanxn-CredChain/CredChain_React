# Spec: Overview Recent Activity Empty States & Date URL

## Goal
Polish the CredChain React Overview page so that empty recent-activity sections disappear entirely, and so the date-range filter uses a single URL query parameter.

Specifically:

- Hide the **Recently Issued**, **Recently Revoked**, and **New User** sub-sections inside **Recent Activity** when they have no items.
- When *all* sub-sections are empty, show a single **"No recent activity"** message at the **Recent Activity card** level.
- Change the Overview URL from `?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD` to a single parameter `?date=..YYYY-MM-DD,YYYY-MM-DD` when a date range is applied.

## Out of Scope
- No changes to the API request format sent to the backend: the frontend still sends `filters=date..YYYY-MM-DD,YYYY-MM-DD` via the existing `useOverview` hook.
- No changes to the date-range picker UI itself (`DateFilterMenu` still receives `from`/`to` strings internally).
- No changes to section titles, icons, row content, or card layout from the previous revision.

## Wireframes

### Recent Activity — all sections have data
```
+---------------------------+
| Recent Activity           |
| [✓] Recently Issued       |
| Bachelor's Degree ...     |
| View all credentials →    |
|                           |
| [🚫] Recently Revoked     |
| Diploma ...               |
| View all credentials →    |
|                           |
| [👤] New User             |
| Jane Doe ...              |
| View all users →          |
+---------------------------+
```

### Recent Activity — some sections empty
Empty sub-sections are completely removed. Only non-empty sections render.

```
+---------------------------+
| Recent Activity           |
| [✓] Recently Issued       |
| Bachelor's Degree ...     |
| View all credentials →    |
|                           |
| [👤] New User             |
| Jane Doe ...              |
| View all users →          |
+---------------------------+
```
(Recently Revoked hidden because it has no data.)

### Recent Activity — completely empty
```
+---------------------------+
| Recent Activity           |
|                           |
|    No recent activity     |
|                           |
+---------------------------+
```
The message is centered inside the card body and reuses the existing `overview.recents.empty` copy ("No recent activity" / "Tidak ada aktivitas").

### URL examples
| State | Old URL | New URL |
|---|---|---|
| No filter | `/overview` | `/overview` |
| Range applied | `/overview?dateFrom=2026-01-01&dateTo=2026-06-30` | `/overview?date=..2026-01-01,2026-06-30` |

## Implementation Plan

### Files to modify
1. `src/feature/overview/Overview.tsx`
2. `src/feature/overview/Overview.test.tsx`

### Detailed changes

#### A. Recent Activity empty-state behavior
In `RecentActivityCard` (`Overview.tsx`):

1. Keep the existing defensive normalization:
   ```ts
   const activeCredentials = recents.active_credentials ?? [];
   const revokedCredentials = recents.revoked_credentials ?? [];
   const storedUsers = recents.stored_users ?? [];
   ```
2. Render **Recently Issued** only when `activeCredentials.length > 0`.
3. Render **Recently Revoked** only when `revokedCredentials.length > 0`.
4. Render **New User** only when `showUsers && storedUsers.length > 0` (already conditional; keep as-is).
5. Compute whether any section will render:
   ```ts
   const hasAnyActivity =
     activeCredentials.length > 0 ||
     revokedCredentials.length > 0 ||
     (showUsers && storedUsers.length > 0);
   ```
6. If `hasAnyActivity` is false, render a single centered empty state inside the card body instead of the sections container:
   ```tsx
   <p className="py-10 text-center text-sm text-gray-400 italic">
     {t("overview.recents.empty")}
   </p>
   ```

#### B. Date-range URL parameter
In `Overview.tsx`:

1. Replace initial state reads from `searchParams.get("dateFrom")` / `searchParams.get("dateTo")` with a single helper:
   ```ts
   function parseDateParam(value: string | null): [string, string] {
     if (!value || !value.startsWith("..")) return ["", ""];
     const parts = value.slice(2).split(",");
     return [parts[0] ?? "", parts[1] ?? ""];
   }
   ```
2. Initialize local state:
   ```ts
   const [dateFrom, setDateFrom] = useState(parseDateParam(searchParams.get("date"))[0]);
   const [dateTo, setDateTo] = useState(parseDateParam(searchParams.get("date"))[1]);
   ```
3. Update `handleDateChange` to write the single `date` param:
   ```ts
   const handleDateChange = (from: string, to: string) => {
     setDateFrom(from);
     setDateTo(to);
     setSearchParams((prev) => {
       const next = new URLSearchParams(prev);
       if (from && to) {
         next.set("date", `..${from},${to}`);
       } else {
         next.delete("date");
       }
       return next;
     });
   };
   ```
4. Keep the existing debounced filter builder that produces `filters: ["date..{from},{to}"]` for the API call. The API contract does not change.
5. Gracefully handle manually edited open-ended URLs (`?date=..2026-01-01,` or `?date=..,2026-06-30`) by parsing the missing side as an empty string. The UI will clear such URLs on the next interaction because `handleDateChange` deletes the param unless both `from` and `to` are present.

#### C. Tests
In `Overview.test.tsx`:

1. Update the existing regression test `"does not crash when the backend omits recent credential arrays"`:
   - Keep the mock returning `recents: {}`.
   - Assert that **"No recent activity"** appears exactly once (card-level empty state).
2. Add a new test `"hides empty recent sections"`:
   - Mock `recents` with only `active_credentials` populated.
   - Assert "Recently Issued" is visible.
   - Assert "Recently Revoked" and "New User" are not present.
3. Add a new test for URL behavior:
   - Render with initial search params `?date=..2026-01-01,2026-06-30`.
   - Assert the mocked API receives `filters=date..2026-01-01,2026-06-30` (via MSW capture) or, more simply, assert that selecting a date preset updates the URL to the new `date=..` format.

### i18n
- Reuse existing key `overview.recents.empty` for the card-level empty state. No new keys required.

### Verification
- `npm run build`
- `npm run test`
- `npm run check-locales`
- Commit and push to `credchain-react/master`
