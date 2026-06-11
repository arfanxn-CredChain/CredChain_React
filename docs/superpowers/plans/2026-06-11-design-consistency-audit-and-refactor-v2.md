# Design Consistency Audit & Refactor v2 (Complete)

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit the entire frontend for deviations from `DESIGN_SYSTEM.md` and `AGENTS.md`, then refactor to eliminate inline/duplicated styles, hardcoded values, token violations, and i18n gaps. Add tests covering changed code paths and component states.

**Architecture:** CSS changes on shared primitives, component replacements on feature pages, extraction of duplicated code into shared components/hooks, i18n wiring for all credential pages. No new dependencies. No behavioral changes.

**Tech Stack:** React 19, Tailwind CSS v4, shadcn/ui (Radix), Vitest + RTL, TypeScript 5.9

---

## Audit Findings

### Category A: Focus Ring Inconsistency (HIGH)

**Rule:** `DESIGN_SYSTEM.md` SS5.1 -- Focus ring: `ring-gold` for all interactive elements.

| # | File | Issue | Correct Value |
|---|------|-------|---------------|
| A1 | `src/shared/components/ui/button.tsx:16` | `primary` variant uses `focus-visible:ring-navy` | `focus-visible:ring-gold` |
| A2 | `src/shared/components/ui/button.tsx:21` | `outline` variant uses `focus-visible:ring-navy` | `focus-visible:ring-gold` |
| A3 | `src/shared/components/ui/button.tsx:22` | `ghost` variant uses `focus-visible:ring-navy` | `focus-visible:ring-gold` |
| A4 | `src/shared/components/ui/button.tsx:25` | `dashed` variant uses `focus-visible:ring-navy` | `focus-visible:ring-gold` |
| A5 | `src/shared/components/ui/input.tsx:24` | Input focus uses `focus:ring-navy` | `focus:ring-gold` |
| A6 | `src/shared/components/ui/select.tsx:19` | Select trigger focus uses `focus:ring-navy` | `focus:ring-gold` |
| A7 | `src/shared/components/ui/dialog.tsx:52` | Dialog close button uses `focus-visible:ring-navy` | `focus-visible:ring-gold` |
| A8 | `src/feature/credential/VerifyCredential.tsx:175` | File upload label uses `focus-within:ring-navy` | `focus-within:ring-gold` |
| A9 | `src/feature/user/components/UserEditDrawer.tsx:223` | Drawer close button has no focus ring | Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold` |

**Decision:** Per AGENTS.md changelog 2026-06-09 -- circle-gold is the canonical focus indicator. `gold`, `destructive`, and `link` button variants keep their own ring colors (SS7.3). Only `primary`, `outline`, `ghost`, `dashed` change to `ring-gold`.

### Category B: Floating Surface Shadows (HIGH)

**Rule:** `DESIGN_SYSTEM.md` SS5.3 -- Floating surfaces use `shadow-xl shadow-navy/20`.

| # | File | Issue | Correct Value |
|---|------|-------|---------------|
| B1 | `src/shared/components/ui/select.tsx:72` | `shadow-xl shadow-gray-200/50` | `shadow-xl shadow-navy/20` |
| B2 | `src/shared/components/ui/toaster.tsx:13` | `shadow-xl shadow-gray-200/50` | `shadow-xl shadow-navy/20` |
| B3 | `src/feature/auth/Login.tsx:45` | Login card `shadow-xl shadow-gray-200/50` | `shadow-xl shadow-navy/20` |
| B4 | `src/shared/components/OfflineBanner.tsx:30` | `bg-error ... shadow-md` (no tint) | `shadow-md shadow-error/20` |
| B5 | `src/shared/components/layout/NavbarDashboard.tsx:97` | Search results dropdown `shadow-md` (no tint) | `shadow-md shadow-navy/20` |

### Category C: Font Family Inconsistencies (MEDIUM)

**Rule:** `DESIGN_SYSTEM.md` SS6.1 -- Card title uses `font-sans` (DM Sans). Fraunces reserved for display headings.

| # | File | Issue | Correct Value |
|---|------|-------|---------------|
| C1 | `src/shared/components/ui/card.tsx:29` (CardTitle) | Uses `font-display text-xl font-semibold` | `font-sans text-lg font-bold text-navy` |
| C2 | `src/shared/components/EmptyState.tsx:21` | Uses `font-display` on `<h3>` | `font-sans` |
| C3 | `src/feature/credential/components/CredentialCard.tsx:69` | Uses `font-display text-sm font-bold` | `font-sans text-sm font-bold` |

### Category D: Hardcoded Default Tailwind Colors (MEDIUM)

**Rule:** AGENTS.md "Common Pitfalls" -- `bg-blue-600` for brand elements is forbidden. Use design tokens.

| # | File | Issue | Correct Value |
|---|------|-------|---------------|
| D1 | `src/shared/components/DecorBlob.tsx:17` | `blue` tone uses `bg-blue-500/10` | `bg-info/10` |
| D2 | `src/feature/credential/VerifyCredential.tsx:201` | `bg-green-500 text-white shadow-green-500/20` | `bg-success text-surface shadow-success/20` |
| D3 | `src/feature/user/components/UserStatusBadge.tsx:17` | `text-green-600` | `text-green-700` (per SS5.2 role-color mapping) |

### Category E: Inline/Duplicated Styles -- Replace with Shared Components (HIGH)

| # | File | Issue | Resolution |
|---|------|-------|------------|
| E1 | `src/feature/about/About.tsx:104-110` | Inline `<a>` styled as navy button (`rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white`) | Replace with `<Button variant="primary" asChild><a>`. Preserve `self-start sm:self-auto`. |
| E2 | `src/feature/help/Help.tsx:195` | Identical inline `<a>` button (exact same classes as E1) | Same replacement as E1 |
| E3 | `src/feature/credential/VerifyCredential.tsx:169-176` | Inline `<label>` styled as primary button | Replace with `<Button variant="primary" size="lg" asChild><label>` |
| E4 | `src/feature/user/components/UserStatusBadge.tsx:10-17` | Hand-rolled badge with `text-error` / `text-green-600` spans | Replace with `<StatusPill>` |
| E5 | `src/feature/credential/VerifyCredential.tsx:194-228` | Hand-rolled verification result banner | Replace with `<Card>` + `<StatusPill>` components |
| E6 | `src/feature/credential/components/CredentialCard.tsx:27-34` | Raw div replicating Card styling (`bg-surface rounded-2xl p-5 shadow-sm border`) | Use `<Card>` component with className overrides for revoked/selected states |
| E7 | `src/feature/dashboard/Settings.tsx:17-22` | Raw heading + icon instead of `<PageHeader>` | Replace with `<PageHeader title={...} />` |

### Category F: Viewport Units (`min-h-screen` -> `min-h-dvh`) (HIGH)

| # | File | Issue | Correct Value |
|---|------|-------|---------------|
| F1 | `src/shared/components/NotFound.tsx:8` | `min-h-screen` | `min-h-dvh` |
| F2 | `src/shared/components/ErrorBoundary.tsx:10` | `min-h-screen` | `min-h-dvh` |
| F3 | `src/shared/components/RouteErrorBoundary.tsx:18` | `min-h-screen` | `min-h-dvh` |
| F4 | `src/shared/components/LoadingSpinner.tsx:28` (FullPageSpinner) | `min-h-screen` | `min-h-dvh` |

### Category G: Double DecorBlob Anti-Pattern (MEDIUM)

| # | File | Issue | Resolution |
|---|------|-------|------------|
| G1 | `src/shared/components/NotFound.tsx:9-10` | Two `<DecorBlob>` elements (navy top-right + gold bottom-left) | Keep the navy `xl` one, remove the gold one. |

### Category H: Hardcoded English in Shared Components (MEDIUM)

| # | File | Notes |
|---|------|-------|
| H1 | `src/shared/components/NotFound.tsx:17-26` | "404", "Page not found", description -- route-level, i18n available |
| H2 | `src/shared/components/OfflineBanner.tsx:30` | "You are currently offline..." -- mounts in Providers, i18n available |
| H3 | `src/shared/components/ErrorBoundary.tsx:10-14` | "Something broke" -- mounts above Providers, KEEP hardcoded |
| H4 | `src/shared/components/RouteErrorBoundary.tsx:18` | "Page not found" / "Something went wrong" -- route-level, i18n available |

**Decision:** Add i18n keys for H1, H2, H4. Leave H3 hardcoded.

### Category I: Token Naming Inconsistencies (LOW)

| # | File | Issue | Resolution |
|---|------|-------|------------|
| I1 | `src/shared/components/ui/table.tsx:31` | `bg-white` instead of `bg-surface` | Replace with `bg-surface` |
| I2 | `src/shared/components/layout/DashboardSidebar.tsx:71-72,94` | `bg-white/15`, `bg-white/5` | Replace with `bg-surface/15`, `bg-surface/5` |

### Category J: Template String className (LOW)

| # | File | Issue |
|---|------|-------|
| J1 | `src/feature/landing/Landing.tsx:33` | Template string className `${containerSize} ... ${className ?? ""}` | Replace with `cn()` |

### Category K: UserDetail Max-Width (MEDIUM)

| # | File | Issue | Correct Value |
|---|------|-------|---------------|
| K1 | `src/feature/user/UserDetail.tsx:33` | `max-w-3xl` (content state) | `max-w-4xl` (matches error state at line 21 + AGENTS changelog 2026-06-11) |

### Category M: Credential Feature i18n Gap (HIGH)

**Rule:** AGENTS.md -- "Hardcoded English strings in JSX -- use `t("key")` and add to both locale files." The entire credential feature (10 files) uses hardcoded English throughout, while the user feature uses i18n exclusively.

| # | File | Issue | Count |
|---|------|-------|-------|
| M1 | `src/feature/credential/CredentialList.tsx` | All user-facing strings hardcoded | ~11 strings |
| M2 | `src/feature/credential/CredentialDetail.tsx` | All labels, headings, error text | ~14 strings |
| M3 | `src/feature/credential/CredentialIssue.tsx` | Title, description, buttons | ~4 strings |
| M4 | `src/feature/credential/VerifyCredential.tsx` | Entire page including error, loading, result messages | ~16 strings |
| M5 | `src/feature/credential/MyCredentials.tsx` | Title, description, empty/error states | ~5 strings |
| M6 | `src/feature/credential/components/CredentialCard.tsx` | "View Details", "Holder:", "Issued:", "Expires:", "No description provided.", aria labels | ~8 strings |
| M7 | `src/feature/credential/components/CredentialIssueRow.tsx` | Field labels ("Recipient (holder)", "Credential type", etc.), placeholder text, hint text, "(optional)", hash note | ~15 strings |
| M8 | `src/feature/credential/components/CredentialStatusBadge.tsx` | "Active" / "Revoked" | ~2 strings |
| M9 | `src/feature/user/UserDetail.tsx` | Field labels ("Identity", "Email", "Phone", "Number", "Birth date", "On-chain identity", "Audit", "Metadata", "Created", "Updated", "Deleted", error state) | ~12 strings |
| M10 | `src/feature/user/components/UserStatusBadge.tsx` | "Active" / "Trashed" | ~2 strings |

### Category N: Duplicated Field/FormField Components (MEDIUM)

**Rule:** DRY principle. Three files define identical or near-identical inline components:

| File | Component Name | Diff from base |
|------|---------------|----------------|
| `src/feature/user/components/UserCreateRow.tsx:193-218` | `FormField` | Has `hint` support, uses `(optional)` text inline, uses `t("common.optional")` |
| `src/feature/credential/components/CredentialIssueRow.tsx:144-170` | `Field` | Has `hint` support, uses hardcoded `"(optional)"` text |
| `src/feature/user/components/UserEditDrawer.tsx:312-335` | `Field` | No `hint` support, uses `t("common.optional")` |

**Resolution:** Extract into `src/shared/components/ui/form-field.tsx` with `label`, `hint`, `error`, `optional`, `children` props. Use `t("common.optional")` throughout.

### Category O: Duplicated Detail Row Patterns (LOW)

**Rule:** DRY principle. `<dt>`/`<dd>` pairs with identical styling (`text-xs font-bold text-gray-400 uppercase tracking-wider mb-1` + `text-sm text-navy`) appear in:

| File | Location |
|------|----------|
| `src/feature/user/UserDetail.tsx:70-77,91-113` | Field details + Audit section |
| `src/feature/user/UserSelfProfile.tsx:95-159` | Identity + Contact sections |
| `src/feature/dashboard/Settings.tsx:27-73` | Account details section |
| `src/feature/credential/CredentialDetail.tsx:76-93,134-147` | Subject/Authority + Audit sections |

**Resolution:** Extract `DetailRow` component to `@shared/components/DetailRow` with props: `label`, `value`, `icon?`, `tone?` (default/error for deleted_at).

### Category P: Pagination UI Inconsistency (LOW)

| # | File | Issue |
|---|------|-------|
| P1 | `src/feature/user/UserList.tsx:400-429` | Shows "X to Y of Z records" with prev/next buttons |
| P2 | `src/feature/credential/CredentialList.tsx:166-190` | Shows "Page X of Y" with prev/next buttons |

**Resolution:** Normalize CredentialList pagination to match UserList pattern, or extract a shared `Pagination` component.

### Category Q: Submit Button Variant Inconsistency (LOW)

| # | File | Variant |
|---|------|---------|
| Q1 | `src/feature/user/UserCreate.tsx:82` | `variant="primary"` (navy) |
| Q2 | `src/feature/credential/CredentialIssue.tsx:82` | `variant="gold"` |
| Q3 | `src/feature/user/UserSelfProfile.tsx:189` | `variant="primary"` (navy) |

**Decision:** Both batch-issue and batch-create are the primary action on the page. Standardize on `primary` (navy) per the button recipe SS7.3 which says primary CTA uses `primary` variant.

### Category R: VerifyCredential Spacing (LOW)

| # | File | Issue | Correct Value |
|---|------|-------|---------------|
| R1 | `src/feature/credential/VerifyCredential.tsx:85` | `space-y-8 py-12 px-4 sm:px-6` | `space-y-6` (removing redundant `py-12` since PublicLayout main has `pt-4 pb-12`) |

### Category S: CredentialCard Needs Card Component (MEDIUM)

| # | File | Issue |
|---|------|-------|
| S1 | `src/feature/credential/components/CredentialCard.tsx:27-34` | Duplicates Card's `bg-surface rounded-2xl shadow-sm border` as a raw div. Should use `<Card>` with className overrides for revoked/selected states |

### Category T: Settings Page Missing PageHeader (HIGH)

| # | File | Issue |
|---|------|-------|
| T1 | `src/feature/dashboard/Settings.tsx:17-22` | Uses inline heading + icon instead of `<PageHeader>`. Every other page uses PageHeader for title/description. |

### Intentional Deviations (NOT to be normalized)

1. **Dialog overlay `backdrop-blur-sm`** -- SS6.5 permits glassmorphism as "a single intentional moment." Modal backdrop qualifies.
2. **AttestationStamp SVG hex colors** -- SVGs have limited CSS variable support; `#C9A227` is correct.
3. **DashboardLayout sidebar `shadow-2xl`** -- Design spec SS8.7 explicitly shows `shadow-2xl` for sidebar.
4. **Button variant focus rings** -- `gold`, `destructive`, and `link` variants keep their own ring colors per SS7.3 recipe.
5. **StatusPill `rounded-md` naming** -- Component name is misleading but SS7.5 shows `rounded-md` for StatusPill; behavior is correct.
6. **Landing.tsx raw `<a>` CTAs** -- The about/help links on landing are not primary CTAs and intentionally use subtle styling.

---

## Proposed Changes Per File

### 1. `src/shared/components/ui/button.tsx`
- [ ] A1-A4: Change `focus-visible:ring-navy` -> `focus-visible:ring-gold` on `primary`, `outline`, `ghost`, `dashed` variants
- [ ] Keep `gold`, `destructive`, `link` variant rings unchanged

### 2. `src/shared/components/ui/input.tsx`
- [ ] A5: Change `focus:ring-navy` -> `focus:ring-gold`

### 3. `src/shared/components/ui/select.tsx`
- [ ] A6: Change `focus:ring-navy` -> `focus:ring-gold` on trigger
- [ ] B1: Change `shadow-gray-200/50` -> `shadow-navy/20` on content

### 4. `src/shared/components/ui/toaster.tsx`
- [ ] B2: Change `shadow-gray-200/50` -> `shadow-navy/20` on toast element

### 5. `src/shared/components/ui/card.tsx`
- [ ] C1: Change `CardTitle` from `font-display text-xl font-semibold` -> `font-sans text-lg font-bold`

### 6. `src/shared/components/ui/dialog.tsx`
- [ ] A7: Change `focus-visible:ring-navy` -> `focus-visible:ring-gold` on close button

### 7. `src/shared/components/ui/table.tsx`
- [ ] I1: Change `bg-white` -> `bg-surface`

### 8. `src/shared/components/EmptyState.tsx`
- [ ] C2: Change `<h3>` from `font-display` to `font-sans`

### 9. `src/shared/components/OfflineBanner.tsx`
- [ ] B4: Add `shadow-error/20` tint to existing `shadow-md`
- [ ] H2: Replace hardcoded text with `t("offline.banner")`

### 10. `src/shared/components/NotFound.tsx`
- [ ] F1: Change `min-h-screen` -> `min-h-dvh`
- [ ] G1: Remove one `<DecorBlob>` (keep navy `xl`, remove gold `lg`)
- [ ] H1: Replace hardcoded strings with i18n keys

### 11. `src/shared/components/ErrorBoundary.tsx`
- [ ] F2: Change `min-h-screen` -> `min-h-dvh`

### 12. `src/shared/components/RouteErrorBoundary.tsx`
- [ ] F3: Change `min-h-screen` -> `min-h-dvh`
- [ ] H4: Replace hardcoded strings with i18n keys

### 13. `src/shared/components/LoadingSpinner.tsx`
- [ ] F4: Change `min-h-screen` -> `min-h-dvh` on FullPageSpinner

### 14. `src/shared/components/layout/NavbarDashboard.tsx`
- [ ] B5: Add `shadow-navy/20` tint to search-results dropdown shadow

### 15. `src/shared/components/layout/DashboardSidebar.tsx`
- [ ] I2: Change `bg-white/15` -> `bg-surface/15`, `bg-white/5` -> `bg-surface/5`

### 16. `src/shared/components/DecorBlob.tsx`
- [ ] D1: Change `blue` tone class from `bg-blue-500/10` -> `bg-info/10`

### 17. `src/feature/auth/Login.tsx`
- [ ] B3: Change `shadow-gray-200/50` -> `shadow-navy/20` on login card

### 18. `src/feature/about/About.tsx`
- [ ] E1: Replace inline `<a>` button with `<Button variant="primary" asChild><a>`. Preserve `self-start sm:self-auto`.

### 19. `src/feature/help/Help.tsx`
- [ ] E2: Replace inline `<a>` button with `<Button variant="primary" asChild><a>`.

### 20. `src/feature/user/UserDetail.tsx`
- [ ] K1: Change `max-w-3xl` -> `max-w-4xl` on content state
- [ ] M9: Wire i18n via `useTranslation()` for all hardcoded labels

### 21. `src/feature/user/components/UserStatusBadge.tsx`
- [ ] D3 + E4: Replace hand-rolled span with `<StatusPill tone="...">`. Change `text-green-600` -> `text-green-700`.
- [ ] M10: "Active"/"Trashed" to use i18n keys

### 22. `src/feature/user/components/UserEditDrawer.tsx`
- [ ] A9: Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold` to close button

### 23. `src/feature/user/components/UserCreateRow.tsx`
- [ ] N1: Replace inline `FormField` component with import from `@ui/form-field`

### 24. `src/feature/credential/VerifyCredential.tsx`
- [ ] D2 + E3 + E5: Token colors + inline button -> `<Button>` / `<Card>` + `<StatusPill>`
- [ ] A8: Fix focus ring via Button
- [ ] M4: Wire i18n for all hardcoded strings
- [ ] R1: Change `space-y-8 py-12` -> `space-y-6` (remove redundant padding)

### 25. `src/feature/credential/components/CredentialCard.tsx`
- [ ] C3: Change card title from `font-display` -> `font-sans`
- [ ] S1: Replace raw div with `<Card>` component + className overrides for revoke/select states
- [ ] M6: Wire i18n for all hardcoded strings

### 26. `src/feature/credential/components/CredentialIssueRow.tsx`
- [ ] N2: Replace inline `Field` component with import from `@ui/form-field`
- [ ] M7: Wire i18n for all hardcoded strings

### 27. `src/feature/credential/CredentialList.tsx`
- [ ] M1: Wire i18n for all hardcoded strings
- [ ] P2: Normalize pagination to match UserList pattern ("X to Y of Z" format)
- [ ] Q2: Change submit button from `gold` -> `primary`

### 28. `src/feature/credential/CredentialDetail.tsx`
- [ ] M2: Wire i18n for all hardcoded strings

### 29. `src/feature/credential/CredentialIssue.tsx`
- [ ] M3: Wire i18n for all hardcoded strings
- [ ] Q2: Change submit button from `gold` -> `primary`

### 30. `src/feature/credential/MyCredentials.tsx`
- [ ] M5: Wire i18n for all hardcoded strings

### 31. `src/feature/credential/components/CredentialStatusBadge.tsx`
- [ ] M8: Wire i18n for "Active" / "Revoked" labels

### 32. `src/feature/dashboard/Settings.tsx`
- [ ] T1: Replace inline heading+icon with `<PageHeader title={...} />`

### 33. `src/feature/landing/Landing.tsx`
- [ ] J1: Replace template string className with `cn()`

### 34. `src/shared/components/ui/form-field.tsx` (NEW)
- [ ] Extract `FormField` component from UserCreateRow/CredentialIssueRow/UserEditDrawer patterns
- [ ] Props: `label`, `hint?`, `error?`, `optional?`, `children`
- [ ] Use `t("common.optional")` for optional tag
- [ ] Uses `<Label>`, `<p className="text-xs text-error/text-gray-400 mt-1">` for error/hint

### 35. `src/shared/components/DetailRow.tsx` (NEW)
- [ ] Extract `<dt>`/`<dd>` pair pattern used across UserDetail, UserSelfProfile, Settings, CredentialDetail
- [ ] Props: `label`, `value`, `icon?`, `tone?` (default/error for deleted_at)
- [ ] Handles `text-xs font-bold text-gray-400 uppercase tracking-wider mb-1` dt + `text-sm text-navy` dd

---

## I18n Keys to Add

Add to both `src/shared/i18n/en.json` and `src/shared/i18n/id.json`:

**Shared component keys:**
```json
{
  "offline": {
    "banner": "You are currently offline. Some features may be unavailable."
  },
  "not_found": {
    "code": "404",
    "title": "Page not found",
    "description": "The page you are looking for does not exist or has been moved."
  },
  "error_boundary": {
    "title": "Something went wrong",
    "reload": "Reload page",
    "go_dashboard": "Go to Dashboard"
  }
}
```

**Credential feature keys** (partial list -- full keys discovered during implementation):
```json
{
  "cred": {
    "list": { "title": "Credentials Ledger", "description": "...", "searchPlaceholder": "...", "count": "...", "empty": { "none": { "title": "...", "body": "..." }, "search": { "title": "...", "body": "..." } }, "error": "...", "pagination": { "previous": "...", "next": "...", "page": "..." } },
    "detail": { "title": "Credential Detail", "status": "Status", "issued": "Issued", "expires": "Expires", "publicVerify": "Public verification", "subjectAuthority": "Subject & Authority", "holder": "Holder", "issuer": "Issuer", "description": "Description", "cryptoHash": "Cryptographic Hash", "metadataAttachment": "Metadata Attachment", "audit": "Audit", "created": "Created", "lastUpdated": "Last updated", "notFound": { "title": "...", "body": "..." } },
    "issue": { "title": "Issue Credentials", "description": "...", "addAnother": "Add another record", "submit": "Issue Credentials", "submitting": "Issuing..." },
    "verify": { "title": "Credential Verification", "description": "...", "credentialType": "Credential Type", "blockchainHash": "Blockchain Hash Signature", "issuingAuthority": "Issuing Authority", "dateOfIssuance": "Date of Issuance", "validUntil": "Valid Until", "verifyDoc": "Verify Source Document", "verifyDocDesc": "...", "selectFile": "Select File for Verification", "processing": "Processing...", "verificationDisabled": "Verification Disabled", "revokedDesc": "...", "success": "Verification Successful", "successDesc": "...", "failed": "Verification Failed", "failedDesc": "...", "computedHash": "Computed Local Hash", "notFound": { "title": "...", "body": "..." } },
    "mine": { "title": "My Credentials", "description": "...", "empty": { "title": "...", "body": "..." }, "error": { "title": "...", "body": "..." } },
    "card": { "viewDetails": "View Details", "noDescription": "No description provided.", "holder": "Holder:", "issued": "Issued:", "expires": "Expires:", "select": "Select credential", "deselect": "Deselect credential" },
    "status": { "active": "Active", "revoked": "Revoked" },
    "field": { "recipient": "Recipient (holder)", "type": "Credential type", "title": "Title", "description": "Description", "uri": "Metadata URI", "uriHint": "ipfs:// or https:// link to credential metadata", "validUntil": "Valid until", "optional": "(optional)", "hashNote": "Hash will be computed and committed on-chain when issued.", "selectRecipient": "Select recipient...", "selectType": "Select type...", "noHolders": "No holders found." },
    "revoke": { "confirm": { "title": "...", "body": "...", "action": "Revoke" } }
  },
  "user": {
    "detail": { "identity": "Identity", "email": "Email", "phone": "Phone", "number": "Number", "birthDate": "Birth date", "onChain": "On-chain identity", "audit": "Audit", "metadata": "Metadata", "created": "Created", "updated": "Updated", "deleted": "Deleted", "notFound": { "title": "...", "body": "..." }, "unnamed": "Unnamed entity" },
    "status": { "active": "Active", "trashed": "Trashed" }
  }
}
```

**Settings page key:**
```json
{
  "settings": {
    "title": "Settings"
  }
}
```

---

## New Test Files

### `src/shared/components/ui/Button.test.tsx`
- [ ] Renders all variants with correct classes
- [ ] `primary` variant has `bg-navy`, `text-surface`, `focus-visible:ring-gold`
- [ ] `gold` variant has `bg-gold`, `text-navy`, `focus-visible:ring-gold`
- [ ] `destructive` variant has `bg-error`, `text-surface`, `focus-visible:ring-error`
- [ ] Sizes apply correct padding
- [ ] `asChild` renders child element
- [ ] Disabled state applies `opacity-50 pointer-events-none`

### `src/shared/components/NotFound.test.tsx`
- [ ] Renders "Page not found" heading (via i18n)
- [ ] Has single DecorBlob (not two)
- [ ] Uses `min-h-dvh` not `min-h-screen`
- [ ] Dashboard link renders with correct variant
- [ ] Login link renders with correct variant

### `src/shared/components/OfflineBanner.test.tsx`
- [ ] Renders offline message (via i18n)
- [ ] Has `bg-error` background
- [ ] Has `shadow-error/20` tinted shadow
- [ ] Uses fixed positioning

### `src/shared/components/ErrorBoundary.test.tsx`
- [ ] Renders fallback on error
- [ ] Uses `min-h-dvh` not `min-h-screen`
- [ ] Retry button calls `resetErrorBoundary`

### `src/shared/components/RouteErrorBoundary.test.tsx`
- [ ] Renders error message
- [ ] Uses `min-h-dvh` not `min-h-screen`
- [ ] Detects 404 via `isRouteErrorResponse`

### `src/shared/components/StatusPill.test.tsx`
- [ ] Renders with correct tone classes (navy, gold, error, green, gray)
- [ ] Renders optional icon
- [ ] Has `rounded-md`
- [ ] Applies correct font styling

### `src/shared/components/EmptyState.test.tsx`
- [ ] Renders title with `font-sans` (not `font-display`)
- [ ] Renders optional description
- [ ] Renders optional action slot
- [ ] Uses `rounded-2xl border border-gray-100 bg-surface shadow-sm`

### `src/shared/components/DetailRow.test.tsx` (NEW -- for new component)
- [ ] Renders label and value with correct classes
- [ ] Renders optional icon
- [ ] Renders error tone (error color for deleted_at)
- [ ] Renders default tone (navy color)

### `src/shared/components/ui/FormField.test.tsx` (NEW -- for new component)
- [ ] Renders label + children
- [ ] Renders error message when error prop provided
- [ ] Renders hint text when no error and hint provided
- [ ] Renders "(optional)" tag when optional
- [ ] Does not render error/hint when neither provided

### `src/feature/dashboard/Settings.test.tsx` (if not exists)
- [ ] Uses PageHeader (not raw heading+icon)

---

## Files Modified

| File | Categories | Changes |
|------|-----------|---------|
| `src/shared/components/ui/button.tsx` | A1-A4 | Focus ring -> `ring-gold` on primary/outline/ghost/dashed |
| `src/shared/components/ui/input.tsx` | A5 | Focus ring -> `ring-gold` |
| `src/shared/components/ui/select.tsx` | A6, B1 | Focus ring + shadow tint |
| `src/shared/components/ui/toaster.tsx` | B2 | Shadow tint |
| `src/shared/components/ui/card.tsx` | C1 | CardTitle font family |
| `src/shared/components/ui/dialog.tsx` | A7 | Close button focus ring |
| `src/shared/components/ui/table.tsx` | I1 | `bg-white` -> `bg-surface` |
| `src/shared/components/EmptyState.tsx` | C2 | Title font family |
| `src/shared/components/OfflineBanner.tsx` | B4, H2 | Shadow tint + i18n |
| `src/shared/components/NotFound.tsx` | F1, G1, H1 | dvh, single blob, i18n |
| `src/shared/components/ErrorBoundary.tsx` | F2 | min-h-dvh |
| `src/shared/components/RouteErrorBoundary.tsx` | F3, H4 | dvh + i18n |
| `src/shared/components/LoadingSpinner.tsx` | F4 | FullPageSpinner dvh |
| `src/shared/components/DecorBlob.tsx` | D1 | `bg-blue-500/10` -> `bg-info/10` |
| `src/shared/components/layout/NavbarDashboard.tsx` | B5 | Search dropdown shadow tint |
| `src/shared/components/layout/DashboardSidebar.tsx` | I2 | `bg-white` -> `bg-surface` |
| `src/feature/auth/Login.tsx` | B3 | Card shadow tint |
| `src/feature/about/About.tsx` | E1 | Replace inline button with `<Button>` |
| `src/feature/help/Help.tsx` | E2 | Replace inline button with `<Button>` |
| `src/feature/user/UserDetail.tsx` | K1, M9 | max-w-4xl + i18n |
| `src/feature/user/UserSelfProfile.tsx` | O | Replace dt/dd pairs with DetailRow |
| `src/feature/user/components/UserStatusBadge.tsx` | D3, E4, M10 | Replace with StatusPill + i18n |
| `src/feature/user/components/UserEditDrawer.tsx` | A9, N3 | Focus ring + import FormField from @ui |
| `src/feature/user/components/UserCreateRow.tsx` | N1 | Import FormField from @ui |
| `src/feature/credential/VerifyCredential.tsx` | D2, E3, E5, A8, M4, R1 | Token colors, inline button, i18n, spacing |
| `src/feature/credential/components/CredentialCard.tsx` | C3, S1, M6 | Font family, Card component, i18n |
| `src/feature/credential/components/CredentialIssueRow.tsx` | N2, M7 | FormField import + i18n |
| `src/feature/credential/components/CredentialStatusBadge.tsx` | M8 | i18n |
| `src/feature/credential/CredentialList.tsx` | M1, P2 | i18n, pagination normalization |
| `src/feature/credential/CredentialDetail.tsx` | M2, O | i18n + DetailRow |
| `src/feature/credential/CredentialIssue.tsx` | M3, Q2 | i18n + primary variant |
| `src/feature/credential/MyCredentials.tsx` | M5 | i18n |
| `src/feature/dashboard/Settings.tsx` | T1, O | PageHeader + DetailRow |
| `src/feature/landing/Landing.tsx` | J1 | cn() over template string |
| `src/shared/i18n/en.json` | H1, H2, H4, M1-M10 | New keys |
| `src/shared/i18n/id.json` | H1, H2, H4, M1-M10 | New keys |

## Files Added

| File | Description |
|------|-------------|
| `src/shared/components/ui/form-field.tsx` | Extracted Field/FormField component |
| `src/shared/components/DetailRow.tsx` | Extracted dt/dd detail row component |
| `src/shared/components/ui/Button.test.tsx` | Button variant/state tests |
| `src/shared/components/NotFound.test.tsx` | NotFound component tests |
| `src/shared/components/OfflineBanner.test.tsx` | OfflineBanner component tests |
| `src/shared/components/ErrorBoundary.test.tsx` | AppErrorBoundary tests |
| `src/shared/components/RouteErrorBoundary.test.tsx` | RouteErrorBoundary tests |
| `src/shared/components/StatusPill.test.tsx` | StatusPill tests |
| `src/shared/components/EmptyState.test.tsx` | EmptyState tests |
| `src/shared/components/DetailRow.test.tsx` | DetailRow tests |
| `src/shared/components/ui/FormField.test.tsx` | FormField tests |

---

## Verification

- [ ] `npm run lint` -- zero new errors
- [ ] `npm run build` -- clean build
- [ ] `npm run test` -- all 282+ existing tests pass + new tests pass
- [ ] `npm run format` -- Prettier applied
- [ ] `npm run check-locales` -- locale sync passes
- [ ] Visual review of all changed pages (UserList, CredentialList, CredentialDetail, VerifyCredential, Settings, UserDetail, About, Help, NotFound, ErrorBoundary, OfflineBanner)
