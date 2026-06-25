# Spec: Overview Page Revision

## Goal
Refine the CredChain React Overview page layout, density, and copy:

- Show only **1** recent issued credential, **1** recent revoked credential, and **1** recently stored user.
- Request `limit=1` from the `/overview` endpoint so the backend can honor it later.
- Replace the “Recently Issued” / “Recently Revoked” section icons with the same iconography used by `CredentialStatusBadge` (`ShieldCheck` for active/issued, `ShieldAlert` for revoked).
- Update Indonesian copy: `Dasbor` → `Ringkasan`, `Ikhtisar` → `Ringkasan` (case-insensitive occurrences).
- Rename “New Users” → “New User” (singular) for the overview recently-stored-user section.
- Prevent cards from stretching vertically to match taller siblings.
- For **Holder** users, place the **Credentials** counts card on the left and **Recent Activity** on the right (lg+), instead of stacked top/bottom.

## Out of Scope
- No changes to the credential row content (name + ID + holder full + issuer/revoker compact + timestamp) from the previous revision.
- No changes to Chain Info card content.
- No backend changes; `limit=1` is sent but currently ignored.

## Wireframes

### Issuer+ — large screen (`lg+`)
```
+----------------------------------------------------------+
| Welcome, Arfan                              [Date range ▼]|
+----------------------------------------------------------+
| Credentials                                              |
| [Active] [Total] [Revoked] [Pending] [Failed]            |
+----------------------------------------------------------+
| Users                                                    |
| [Total] [Holders] [Issuers] [Admins] [SA] [Active] [Trashed]|
+----------------------------------------------------------+
| +---------------------------+ +-------------------------+|
| | Recent Activity           | | Chain Info              ||
| | [✓] Recently Issued       | | [⚙] Authority Contract  ||
| | Bachelor's Degree         | | 0x9A5f... [Copy]        ||
| | 01J1 [Copy]               | |                         ||
| | [holder full]             | | [⚙] Registry Contract   ||
| | [issuer compact]          | | 0x8B3c... [Copy]        ||
| | View all credentials →    | |                         ||
| |                           | | [⚙] Last Block          ||
| | [🚫] Recently Revoked     | | 12,345,678              ||
| | Diploma                   | +-------------------------+|
| | 01J2 [Copy]               |                            |
| | [holder full]             |                            |
| | [revoker compact]         |                            |
| | View all credentials →    |                            |
| |                           |                            |
| | [👤] New User             |                            |
| | [user full + joined date] |                            |
| | View all users →          |                            |
| +---------------------------+ +-------------------------+|
+----------------------------------------------------------+
```

### Holder — large screen (`lg+`)
```
+----------------------------------------------------------+
| Welcome, Arfan                              [Date range ▼]|
+----------------------------------------------------------+
| +---------------------------+ +-------------------------+|
| | Credentials               | | Recent Activity         ||
| |                           | |                         ||
| | [      Active       ]     | | [✓] Recently Issued     ||
| | [Total]    [Revoked]      | | Bachelor's Degree       ||
| | [Pending]  [Failed]       | | 01J1 [Copy]             ||
| |                           | | [holder full]           |
| |                           | | [issuer compact]        |
| |                           | | View all credentials →  |
| |                           | |                         ||
| |                           | | [🚫] Recently Revoked   |
| |                           | | Diploma                 |
| |                           | | 01J2 [Copy]             |
| |                           | | [holder full]           |
| |                           | | [revoker compact]       |
| |                           | | View all credentials →  |
| |                           | |                         ||
| |                           | | [👤] New User           |
| |                           | | [user full + joined date]|
| |                           | | View all users →        |
| +---------------------------+ +-------------------------+|
+----------------------------------------------------------+
```
- The Credentials card uses a compact 2-column stat layout because it is now 50% width.
- Both cards use `items-start` / `self-start` so neither stretches vertically to match the other.

### Mobile (all roles — stacked)
```
+----------------------------------------------------------+
| Welcome, Arfan                              [Date range ▼]|
+----------------------------------------------------------+
| Credentials                                              |
| [Active] [Total] [Revoked] [Pending] [Failed]            |
+----------------------------------------------------------+
| Users (Issuer+ only)                                     |
| ...                                                      |
+----------------------------------------------------------+
| Recent Activity                                          |
| [✓] Recently Issued                                      |
| Bachelor's Degree ...                                    |
| [🚫] Recently Revoked                                    |
| Diploma ...                                              |
| [👤] New User                                            |
| ...                                                      |
+----------------------------------------------------------+
| Chain Info (Issuer+ only)                                |
| ...                                                      |
+----------------------------------------------------------+
```

## Implementation Plan

### Files to modify
1. `src/feature/overview/Overview.tsx`
2. `src/feature/overview/api/useOverview.ts`
3. `src/feature/overview/api/keys.ts`
4. `src/shared/i18n/en.json`
5. `src/shared/i18n/id.json`
6. `src/test/msw/handlers.ts` (trim mock lists to 1 item each, if needed)

### Module boundaries
This revision does **not** introduce any imports from `feature/credential` into `feature/overview`. The issued/revoked section icons are imported directly from `lucide-react` (`ShieldCheck`, `ShieldAlert`) and styled locally to match the tones used by `CredentialStatusBadge`.

### Detailed changes

#### A. Data fetching — `limit=1`
In `useOverview.ts`, always include `limit=1` in the request query:
```ts
const q: Record<string, unknown> = {};
q.limit = 1;
if (params?.filters && params.filters.length > 0) {
  q.filters = params.filters;
}
```
Update `overviewKeys.all` to include `limit: 1` so the cache key remains correct.

#### B. Frontend list caps
Slice all recent lists to the first item:
- `active_credentials.slice(0, 1)`
- `revoked_credentials.slice(0, 1)`
- `stored_users?.slice(0, 1)`

Front-end slicing remains the safety net until the backend honors `limit=1`.

#### C. Section icons
Replace icons passed to `RecentSection`:
- Recently Issued: `FileBadge` → `ShieldCheck`
- Recently Revoked: `Ban` → `ShieldAlert`
- New User: keep `User`

Add a green tone to the local `toneBlock` map:
```ts
green: "bg-green-100 text-green-700",
```

Apply:
- Recently Issued → `tone="green"`
- Recently Revoked → `tone="error"`
- New User → `tone="navy"`

#### D. i18n updates
- `id.json`:
  - `"nav.overview": "Dasbor"` → `"Ringkasan"`
  - `"overview.description": "Ikhtisar platform dan aktivitas terkini."` → `"Ringkasan platform dan aktivitas terkini."`
  - `"auth.signin.subtitle": "Akses dasbor platform dengan akun Google Anda."` → `"Akses ringkasan platform dengan akun Google Anda."`
- `en.json`:
  - `"overview.recents.storedUsers": "New Users"` → `"New User"`

`userCreate.title` ("Register New Users") remains plural.

#### E. Card height / anti-stretch
Apply `items-start` to all grid wrappers that place cards side-by-side, so cards shrink/expand to their own content height.

#### F. Holder layout (`lg+`)
Render Credentials counts card (compact) on the left and Recent Activity on the right:
```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
  <CredentialsCountsCard compact />
  <RecentActivityCard />
</div>
```

Compact Credentials card uses a 2-column stat grid:
```tsx
<div className="grid grid-cols-2 gap-6">
  <div className="col-span-2">
    <StatItem value={active} label={t("overview.counts.active")} accent="gold" />
  </div>
  <StatItem value={total} label={t("overview.counts.total")} />
  <StatItem value={revoked} label={t("overview.counts.revoked")} />
  <StatItem value={pending} label={t("overview.counts.pending")} />
  <StatItem value={failed} label={t("overview.counts.failed")} />
</div>
```

#### G. Issuer+ layout (`lg+`)
Keep full-width top cards, then side-by-side Recent Activity + Chain Info:
```tsx
<CredentialsCountsCard />          {/* full width, 5-column stats */}
<UserCountsCard />                 {/* full width */}
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
  <RecentActivityCard />
  <ChainInfoCard />
</div>
```

#### H. Mobile
All cards stack full-width; no layout changes from current behavior except content density and copy.

### Verification
- `npm run lint`
- `npm run build`
- `npm run test` (505 tests)
- `npm run check-locales`
- Commit and push to `credchain-react/master`
