# Credential Card Redesign — Design Spec

**Date:** 2026-06-18  
**Scope:** `src/feature/credential/components/CredentialCard.tsx` and surrounding list interactions  
**Status:** Awaiting implementation plan

---

## 1. Goal

Redesign the credential list card so each card exposes the most important credential, holder, issuer, and revoker information at a glance, while remaining scannable in a 1/2/3-column grid. Remove the explicit "View Details" button and make the entire card clickable.

---

## 2. Current State

**File:** `src/feature/credential/components/CredentialCard.tsx`

The existing card shows:

- A tinted icon (`FileBadge` / `ShieldAlert`)
- Credential name + truncated ULID
- `CredentialStatusBadge`
- One holder detail row (raw ID or external label)
- Issued date
- A footer "View Details" link

It does **not** show issuer, revoker, email, phone, wallet, or provide copy actions. It also uses the legacy flat i18n namespace `cred.card.*` while the rest of the credential feature uses the nested `cred.*` namespace.

---

## 3. Design Direction

Adopt a **condensed metadata card** that prioritizes scanability and keeps vertical height reasonable for a multi-column list.

### 3.1 Final Wireframe

```
┌─────────────────────────────────────────────────────┐
│  [lifecycle pill]  [extraction pill - if failed]    │
│                                                     │
│  Bachelor's Degree                                  │
│  CRT-01HX...                             [Copy]     │
│                                                     │
│  [Avatar] Jane Doe • Holder          ← link → user  │
│  ✉ jane@example.com                  [Copy]         │
│  ✆ +6281234567890                    [Copy]         │
│  ⧫ 0x1234...5678                     [Copy]         │
│                                                     │
│  [Avatar] Platform Admin • Issuer    ← link → user  │
│  [Avatar] Trashed Admin • Revoker    ← if revoked   │
│                                                     │
│  Issued Jan 15, 2024                                │
│  Revoked Jun 1, 2024                 ← if revoked   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Revoke Mode Wireframe

```
┌─────────────────────────────────────────────────────┐
│  [Active]                                    [✓]    │
│  Bachelor's Degree                                  │
│  CRT-01HX...                             [Copy]     │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

### 3.3 Re-extract Mode Wireframe

```
┌─────────────────────────────────────────────────────┐
│  [Active] [Extraction Failed]                [✓]    │
│  Bachelor's Degree                                  │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

---

## 4. Component Behavior

| Element | Behavior |
|---|---|
| **Card wrapper** | Clickable → `/credentials/:id`. Hover: `border-gold/50 hover:shadow-md`. Cursor pointer. |
| "View Details" button | Removed. |
| **Selection checkbox** | Shown only in a bulk mode (revoke or re-extract). Positioned top-right of the card. Stops propagation. |
| **Credential name** | `font-sans text-base font-bold text-navy` |
| **Credential ULID** | `MonoId` + `CopyInlineButton` |
| **Lifecycle status pill** | Always shown via `CredentialStatusBadge` (`Active` / `Revoked`). |
| **Extraction status pill** | Shown only when `extract_status !== "succeeded"` (`Pending`, `Extraction Failed`). |
| **Holder block** | Full contact block: `UserAvatar`, name + role label (link), email, phone, wallet. Each field has a copy button. |
| **Issuer block** | Compact: `UserAvatar` + name + role label as a single link to `/users/:issuer_user_id`. |
| **Revoker block** | Same compact style as issuer, rendered only when `revoked_at !== null`, using error tone. |
| **Deleted user indicator** | When `user.deleted_at !== null`, append a `Deleted` status pill next to that user's name. |
| **Dates** | Issued date always shown. Revoked date shown only when revoked. |

### 4.1 Click Targets

- Clicking the **card body** navigates to credential detail.
- Clicking a **user avatar/name/role row** navigates to user detail.
- Clicking a **copy button** copies the value.
- Clicking a **checkbox** toggles selection.

The card wrapper must suppress navigation when the event originates inside an inner interactive element (`<a>`, `<button>`, `[role="button"]`, checkbox).

---

## 5. Bulk Actions — Mode-Based Selection

Replace the current "always-visible checkbox" model with a mode-based flow.

### 5.1 Toolbar States

**Default:**

```
[Revoke] [Re-extract]        [Issue New]
```

**Revoke mode:**

```
[Cancel] [Revoke (0)]
```

**Re-extract mode:**

```
[Cancel] [Re-extract (0)]
```

### 5.2 Rules

- Only one bulk mode is active at a time.
- `[Issue New]` is hidden while a mode is active.
- In revoke mode, checkboxes appear only on credentials where `revoked_at === null`.
- In re-extract mode, checkboxes appear only on credentials where `extract_status === "failed"`.
- The action button shows the selected count and is disabled at 0.
- Cancel exits the mode and clears the selection.

### 5.3 Responsive Toolbar

Desktop: buttons sit in a single row, right-aligned next to the page title.

Mobile: buttons wrap using `flex flex-wrap gap-2`. Primary CTA fills available width on small screens.

```
Desktop:
[Revoke] [Re-extract]               [Issue New]

Mobile:
[Revoke] [Re-extract]
[Issue New]
```

---

## 6. Data Requirements

### 6.1 Includes

`useCredentials` and `useMyCredentials` must request embedded users:

```ts
includes: ["holder", "issuer", "revoker"]
```

The backend already supports this via `?includes=holder,issuer,revoker` and preloads with batched IN-clause queries.

### 6.2 Fallbacks

If `holder`, `issuer`, or `revoker` is `null` (e.g., the list was fetched without includes), fall back to the raw user ID string (`holder_user_id`, `issuer_user_id`, `revoker_user_id`).

---

## 7. Design System Alignment

| Requirement | Implementation |
|---|---|
| Card container | `Card` primitive: `bg-surface rounded-2xl shadow-sm border border-gray-100` |
| Hover state | `hover:border-gold/50 hover:shadow-md` |
| Revoked card | `bg-error/5 border-error/20` |
| Names | `font-sans text-sm` or `text-base font-bold text-navy` |
| Identifiers | `font-mono text-xs text-gray-500` via `MonoId` |
| Eyebrow labels | `EyebrowLabel` pattern for "Issued" / "Revoked" date labels |
| Status pills | `CredentialStatusBadge` → `StatusPill` |
| Copy buttons | `CopyInlineButton` with `common.copied` toast key |
| Avatars | `UserAvatar` |
| Role labels | Derived from `user.role` via `formatRole` or `UserRoleBadge` |
| Focus rings | `focus-visible:ring-gold` on the card wrapper |

---

## 8. Internationalization

### 8.1 New / Updated Keys

```json
{
  "common.copied": "Copied",

  "cred.list.card.issued": "Issued",
  "cred.list.card.revoked": "Revoked",
  "cred.list.card.revokeMode": "Revoke",
  "cred.list.card.reExtractMode": "Re-extract",
  "cred.list.card.cancel": "Cancel",
  "cred.list.card.revokeSelectedCount": "Revoke ({{count}})",
  "cred.list.card.reExtractSelectedCount": "Re-extract ({{count}})",

  "cred.copy.credentialId": "Copy credential ID",
  "cred.copy.holderEmail": "Copy holder email",
  "cred.copy.holderPhone": "Copy holder phone",
  "cred.copy.holderWallet": "Copy holder wallet",
  "cred.copy.issuerEmail": "Copy issuer email",
  "cred.copy.issuerWallet": "Copy issuer wallet",
  "cred.copy.revokerEmail": "Copy revoker email",
  "cred.copy.revokerWallet": "Copy revoker wallet"
}
```

### 8.2 Migration

Remove legacy flat keys from `cred.card.*` namespace in both `en.json` and `id.json`. Run `npm run check-locales` after changes.

---

## 9. Accessibility

- Card wrapper uses `role="link"`, `tabIndex={0}`, and handles `Enter` key.
- Inner links (`/users/:id`) are real `<a>` or `<Link>` elements.
- Copy buttons have explicit `aria-label` keys.
- Selection checkbox has `aria-label` based on selected state.
- Revoked cards include an `aria-label` that announces the revoked status.
- Avoid nested/interleaved links by suppressing card navigation when clicking inner interactive elements.

---

## 10. Out of Scope

- Backend file-download endpoint.
- Real file preview / thumbnail generation.
- File mime icon display on the card.
- Changes to `CredentialDetail` beyond what already exists.
- New user roles or permissions.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Payload size increase from includes | Preloaded in a single batched query per relation; page size remains 30. |
| Nested click targets | Use event-origin check + stopPropagation on children. |
| i18n drift | Add keys to both `en.json` and `id.json`; run `npm run check-locales`. |
| Soft-deleted users | Show a `Deleted` indicator and fall back to raw ID if user object is missing. |
| Mobile density | Compact issuer/revoker rows; full holder block; responsive toolbar. |

---

## 12. Approval

This design is approved as the basis for implementation planning.
