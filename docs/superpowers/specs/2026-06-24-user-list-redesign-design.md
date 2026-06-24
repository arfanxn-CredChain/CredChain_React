# User List Redesign & Consistency Unification

**Date:** 2026-06-24
**Scope:** `CredChain_React/`

## Motivation

Two inconsistencies between the User List page and Credential Card:

1. **UserList shows user attributes without icons** — credential card's `UserContactBlock` uses `Hash`, `Mail`, `Phone`, `Wallet` icons. UserList displays the same data inline with no icons.

2. **`UserContactBlock` is private to `CredentialCard.tsx`** — not reusable. UserList duplicates the pattern manually.

3. **User status badge inconsistency** — `UserContactBlock` uses a custom gray inline `<span>` for trashed users. UserList uses `<UserStatusBadge>` (red `StatusPill` + `XOctagon` icon). Active state also inconsistent (shown in UserList, hidden in CredentialCard).

4. **UserList has 4 columns** (Entity, Role, Wallet/Status, Actions) — too many columns. Data can merge into 2.

5. **`number` field missing from UserList** — shown in credential card's `UserContactBlock` but absent from the user table.

6. **Credential names truncated** — `truncate` class cuts names off at one line. Should allow 2 lines.

## Design

### 1. Shared Component Extraction

#### `UserStatusBadge` → `@shared/components/UserStatusBadge.tsx`

- **Move** from `feature/user/components/` to `@shared/components/`.
- **Simplify:** render only when `deletedAt` is set. Show red `StatusPill` with `XOctagon` icon + "Trashed" text. Active users show nothing.
- No green "Active" badge anywhere — credential cards and user list both show only the trashed state.
- Update import in `UserList.tsx`, `UserDetail.tsx` to new path.
- Delete old file at `feature/user/components/UserStatusBadge.tsx`.

#### `UserContactBlock` → `@shared/components/UserContactBlock.tsx`

- **Extract** the private `UserContactBlock` function from `CredentialCard.tsx` (lines 183–303) into a standalone exported component.
- **Replace** the custom trashed `<span>` pill with `<UserStatusBadge deletedAt={user?.deleted_at} />` (only renders when deleted).
- **Replace** the plain `<span>` role label with `<UserRoleBadge role={user.role} />`, positioned inline with the name (same flex-wrap row as name and trashed badge).
- **Name clamping:** change `truncate` → `line-clamp-2` on the name element.
- **New prop `copyLabelPrefix`** (default `"cred.copy"`): controls the i18n prefix for copy button aria-labels. UserList passes `"user.copy"` so existing `user.copy.email`, `user.copy.phone`, `user.copy.wallet` keys resolve. New key needed: `user.copy.number`.
- Props: `user`, `fallbackId`, `copyPrefix` (used for semantic context, e.g., "holder"/"issuer"), `copyLabelPrefix` (i18n prefix, default `"cred.copy"`), `labelType`, `tone`, `blockLinks`.
- Both `UserList.tsx` and `CredentialCard.tsx` import from `@shared/components/UserContactBlock`.
- **Add `gender`** display to `UserContactBlock` when `labelType="full"` — attribute row with a gender icon from lucide and the translated gender label. Shown only when `user.gender` is present, placed after Phone Number and before Wallet.

#### Attribute order in `UserContactBlock` (labelType="full")

1. Avatar + Name (`line-clamp-2`) + `<UserRoleBadge>` + `<UserStatusBadge>` (trashed only) — all in one `flex-wrap` row
2. `Hash` — Number + copy
3. `Mail` — Email + copy
4. `Phone` — Phone Number + copy
5. Gender icon — Gender label
6. `Wallet` — Truncated address + copy

### 2. User List Table Redesign

#### From 4 columns to 2

| Before | After |
|---|---|
| Entity (User) | User (merged, vertical stack with icons) |
| Role | (merged into User column) |
| Wallet/Status | (merged into User column) |
| Actions | Actions (unchanged) |

#### User column layout

Renders `<UserContactBlock labelType="full" copyLabelPrefix="user.copy">` which produces:

1. **Top row** (`flex-wrap`): Avatar + Name (`line-clamp-2`) + `<UserRoleBadge>` + `<UserStatusBadge>` (trashed only). Badges wrap below name when space is tight.

2. Number row, Email row, Phone row, Gender row, Wallet row — all rendered by `UserContactBlock`.

Below `UserContactBlock`, UserList appends:

3. **Time row** (`Calendar` icon) — "Added/Updated/Trashed X ago" via `relativeTime()`. Rendered by UserList (not `UserContactBlock`), since time is record metadata, not a user attribute.

No manual attribute rendering in UserList — all user identity/contact fields come from the shared `UserContactBlock`.

#### Trashed user styling

- Row: `bg-error/5`
- Name: `text-gray-400 line-through`
- `<UserStatusBadge>` renders red pill

#### Skeleton loading state

Updated to match the new 2-column layout:
- Column 1: skeleton avatar circle + 5 skeleton text lines (name, 3 attributes, time)
- Column 2: small skeleton for action button

#### Actions column

Unchanged. `<DropdownMenu>` with View, Edit/Restore, Transfer SuperAdmin, Delete, Restore items. Visibility governed by `canEditUser`, `canTransferTo`, `canDeleteUser`.

### 3. Credential Name Display

**`CredentialCard.tsx` line 122:**
```tsx
// Before
<h3 className="truncate font-sans text-base font-bold text-navy">{credential.name}</h3>

// After
<h3 className="line-clamp-2 font-sans text-base font-bold text-navy">{credential.name}</h3>
```

Up to 2 lines of the credential name, ellipsis beyond. Short names show fully.

### 4. Name Clamping Consistency

All names use `line-clamp-2`:

| Component | Element | Class |
|---|---|---|
| `CredentialCard` | Credential name (h3) | `line-clamp-2` |
| `UserContactBlock` | User name (Link/span) | `line-clamp-2` |
| `UserList` | User name (via `UserContactBlock`) | `line-clamp-2` |

No `truncate` on any name element. Short names show fully, long names get 2 lines + ellipsis.

### 5. Attribute Icon Map

Single source of truth for which icon represents which attribute:

| Attribute | Icon | Copyable |
|---|---|---|
| Number | `Hash` | Yes |
| Email | `Mail` | Yes |
| Phone Number | `Phone` | Yes |
| Gender | Gender icon from lucide (implementation choice) | No |
| Wallet Address | `Wallet` | Yes |
| Relative Time | `Calendar` | No |

Defined in `UserContactBlock`. Same icons used everywhere.

### 6. Trashed User Behavior

- Trashed badge (red `StatusPill` + `XOctagon`) appears in both UserList and CredentialCard `UserContactBlock`.
- Only shown when `user.deleted_at` is set — never shown for active users.
- Trashed user name gets `line-through` + `text-gray-400`.
- Row gets `bg-error/5` background in UserList.
- Card gets `border-error/20 bg-error/5` in CredentialCard.

## Files Changed

| File | Action |
|---|---|
| `src/feature/user/components/UserStatusBadge.tsx` | **Delete** (moved to shared) |
| `src/shared/components/UserStatusBadge.tsx` | **Create** — moved, simplified to trashed-only |
| `src/shared/components/UserContactBlock.tsx` | **Create** — extracted from CredentialCard, uses UserStatusBadge, adds gender |
| `src/feature/user/UserList.tsx` | **Edit** — 4→2 columns, uses UserContactBlock, removes manual attribute rendering |
| `src/feature/credential/components/CredentialCard.tsx` | **Edit** — imports UserContactBlock from shared, line-clamp-2 on name, removes private definition |
| `src/feature/user/UserDetail.tsx` | **Edit** — update UserStatusBadge import path |

## Verification

```bash
npm run lint && npm run build && npm run test && npm run check-locales
```

All 426 unit/component tests must pass.

**New i18n key required:**
- `user.copy.number` — en: "Copy number", id: "Salin nomor"

All other keys already exist (`user.status.trashed`, `user.copy.email`, `user.copy.phone`, `user.copy.wallet`, `user.field.gender.*`, `user.list.*`, `common.notSet`, `cred.copy.*`).
