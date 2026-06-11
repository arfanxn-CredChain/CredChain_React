# Design Consistency Audit + Refactor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize the frontend codebase to match the design system, eliminate duplicated/inline patterns, centralize design values as tokens, and add tests covering new and existing code.

**Architecture:** No structural changes. All work is CSS class corrections, extraction of duplicated patterns into shared components/utilities, and test additions. Preserves existing behavior.

**Tech Stack:** React 19, Tailwind CSS v4, TypeScript 5.9, Vitest + RTL

---

## Audit Findings (grouped by category)

### A. Color Token Misuse (5 issues)

| # | File | Line | Issue | Expected |
|---|------|------|-------|----------|
| A1 | `src/shared/components/DecorBlob.tsx` | 17 | `bg-blue-500/10` — uses default Tailwind color instead of `--color-info` token | `bg-info/10` (identical output, token hygiene) |
| A2 | `src/feature/credential/VerifyCredential.tsx` | 201 | `bg-green-500 text-white shadow-green-500/20` — uses default Tailwind colors instead of tokens | `bg-success text-surface shadow-success/20` |
| A3 | `src/feature/user/components/UserStatusBadge.tsx` | 17 | `text-green-600` — role-color mapping §5.2 says active = `text-green-700` | `text-green-700` |
| A4 | `src/shared/components/ui/table.tsx` | 31 | `bg-white divide-y divide-gray-50` — uses raw `white` utility instead of `bg-surface` | `bg-surface` |
| A5 | `src/feature/about/About.tsx` + `src/feature/help/Help.tsx` | ~106/~195 | `text-white` on contact buttons — should use `text-surface` token | `text-surface` |

### B. Missing or Wrong Shadow Conventions (6 issues)

The design system §5.3 mandates tinted shadows. Floating surfaces use `shadow-xl shadow-navy/20`.

| # | File | Line | Issue | Expected |
|---|------|------|-------|----------|
| B1 | `src/shared/components/ui/select.tsx` | 72 | `shadow-xl shadow-gray-200/50` — floating surface, wrong tint | `shadow-xl shadow-navy/20` |
| B2 | `src/shared/components/ui/toaster.tsx` | 13 | `shadow-xl shadow-gray-200/50` — floating surface, wrong tint | `shadow-xl shadow-navy/20` |
| B3 | `src/feature/auth/Login.tsx` | 45 | `shadow-xl shadow-gray-200/50` — floating elevated card | `shadow-xl shadow-navy/20` |
| B4 | `src/shared/components/OfflineBanner.tsx` | 30 | `bg-error ... shadow-md` — missing tint on error-colored element | add `shadow-md shadow-error/20` |
| B5 | `src/shared/components/layout/NavbarDashboard.tsx` | ~97 | Search results dropdown uses plain `shadow-md` | `shadow-md shadow-navy/20` |
| B6 | `src/feature/credential/VerifyCredential.tsx` | ~170 | Upload button uses `shadow-md` — missing navy tint | add `shadow-navy/20` |

### C. Font Family Inconsistencies (3 issues)

Design system §6.1: Card title = `font-sans`. Display font reserved for headings/hero.

| # | File | Line | Issue | Expected |
|---|------|------|-------|----------|
| C1 | `src/shared/components/ui/card.tsx` | 29 | `CardTitle` uses `font-display` (Section/H3 recipe) | `font-sans text-lg font-bold text-navy` per §6.1 Card title |
| C2 | `src/shared/components/EmptyState.tsx` | 22 | Title uses `text-lg font-bold text-navy` — correct but missing `font-sans` (implicit from body; explicit is better) | `font-sans text-lg font-bold text-navy` (explicit) |
| C3 | `src/feature/credential/components/CredentialCard.tsx` | ~69 | Card title uses `font-display text-sm font-bold` — display font on card body | `font-sans text-sm font-bold text-navy truncate` |

### D. `min-h-screen` Not Updated to `min-h-dvh` (4 issues)

Per §8.1 and AGENTS.md changelog.

| # | File | Line | Issue | Expected |
|---|------|------|-------|----------|
| D1 | `src/shared/components/NotFound.tsx` | 8 | `min-h-screen` | `min-h-dvh` |
| D2 | `src/shared/components/ErrorBoundary.tsx` | 10 | `min-h-screen` | `min-h-dvh` |
| D3 | `src/shared/components/RouteErrorBoundary.tsx` | 18 | `min-h-screen` | `min-h-dvh` |
| D4 | `src/shared/components/LoadingSpinner.tsx` | 28 | `FullPageSpinner` uses `min-h-screen` | `min-h-dvh` |

### E. Inline-Duplicated Patterns (3 issues)

Hand-rolled components that should use existing shared primitives.

| # | File | Line | Issue | Resolution |
|---|------|------|-------|------------|
| E1 | `src/feature/about/About.tsx` | 104-110 | Inline email contact link duplicates `Button primary` variant with `rounded-full` and `focus-visible:ring-gold/50` | Replace with `<Button variant="primary" asChild>` wrapping `<a>` |
| E2 | `src/feature/help/Help.tsx` | ~195 | Same inline email button as E1 (duplicated across two files) | Replace with `<Button variant="primary" asChild>` wrapping `<a>` |
| E3 | `src/feature/credential/VerifyCredential.tsx` | 169-176 | Hand-rolled primary button using `<label>` + `focus-within:ring-navy` | Replace with `<Button variant="primary" size="lg" asChild>` wrapping `<label>` |

### F. Focus Ring Inconsistency (2 issues)

| # | File | Line | Issue | Expected |
|---|------|------|-------|----------|
| F1 | `src/feature/user/components/UserEditDrawer.tsx` | ~223 | Drawer close button has no focus ring at all | Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold` |
| F2 | `src/shared/components/ui/dialog.tsx` | ~52 | Dialog close button uses `focus-visible:ring-navy` | `focus-visible:ring-gold` per §5.1 global focus ring = gold |

### G. Anti-Patterns from Design System §6.5 (1 issue)

| # | File | Line | Issue | Expected |
|---|------|------|-------|----------|
| G1 | `src/shared/components/NotFound.tsx` | 9-10 | Two competing `DecorBlob`s (navy + gold) — violates "Single decorative blob per hero area" | Remove one blob, keep navy |

### H. Component Naming / Radius Mismatch (1 issue)

| # | File | Issue | Resolution |
|---|------|-------|------------|
| H1 | `src/shared/components/StatusPill.tsx` | Named "Pill" but uses `rounded-md` (badge radius, 6px). Design system: pills = `rounded-full`, badges = `rounded-md` | Rename to `StatusBadge` OR change radius to `rounded-full` |

### I. Hardcoded English Strings (i18n Gap)

Several shared components and the credential feature use hardcoded English strings instead of `t("key")`. This is a pre-existing scope decision — credential pages are described as "stubs" in AGENTS.md and the shared error components haven't been i18n'd yet. Noted for awareness, not in scope for this refactor (would require new i18n keys and locale updates across both languages).

### J. Intentional Deviations (NOT to change)

These were flagged but are intentional per design system or technical necessity:

| # | File | What | Why |
|---|------|------|-----|
| J1 | `src/shared/components/ui/button.tsx` | `focus-visible:ring-navy` on `primary`/`outline`/`ghost` variants | Matches DESIGN_SYSTEM.md §7.3 button recipe. Variant-specific focus rings are intentional. |
| J2 | `src/shared/components/ui/input.tsx` | `focus:ring-navy` | Matches DESIGN_SYSTEM.md §7.4 Input recipe. The §5.1 global `ring-gold` rule is overridden by component-specific recipes. |
| J3 | `src/shared/components/ui/select.tsx` | `focus:ring-navy` on trigger | Follows Input pattern (consistent). |
| J4 | `src/shared/components/ui/dialog.tsx` | `bg-navy/60 backdrop-blur-sm` overlay | DESIGN_SYSTEM.md §6.5: glassmorphism "acceptable as a single intentional moment" for modal backdrop. |
| J5 | `src/shared/components/layout/DashboardSidebar.tsx` | `bg-white/15`, `bg-white/5` | Intentionally using `white` opacity on a `bg-navy` sidebar. `surface` is the same hex but `bg-white/15` is more readable than `bg-surface/15`. |
| J6 | `src/feature/landing/Landing.tsx` | SVG `stroke="#C9A227"` | SVG `<textPath>` elements don't reliably support CSS variables. Necessary for `AttestationStamp`. |
| J7 | `src/shared/components/layout/DashboardLayout.tsx` | `shadow-2xl` on sidebar | Matches DESIGN_SYSTEM.md §8.6 sidebar pattern (explicitly specified). |

### K. Design System Internal Inconsistency (Doc Issue)

DESIGN_SYSTEM.md §5.1 Color Usage Rules says focus ring should be `ring-gold` globally. But §7.3 (Button recipe) and §7.4 (Input recipe) use variant-specific focus rings (`ring-navy`, `ring-gold`, `ring-error`). The code follows the component recipes (§7), so the code is consistent with the more specific rules. Resolution: update §5.1 to clarify that component-specific recipes override the global default for their elements.

---

## Proposed Changes Per File

### Phase 1: Color Token Fixes (A1-A5)

- **`src/shared/components/DecorBlob.tsx`** — Change `blue: "bg-blue-500/10"` → `blue: "bg-info/10"`
- **`src/feature/credential/VerifyCredential.tsx`** — Change `bg-green-500 text-white shadow-green-500/20` → `bg-success text-surface shadow-success/20`; change `focus-within:ring-navy` → `focus-within:ring-gold` (also part of E3)
- **`src/feature/user/components/UserStatusBadge.tsx`** — Change `text-green-600` → `text-green-700` per §5.2 role-color mapping
- **`src/shared/components/ui/table.tsx`** — Change `bg-white` → `bg-surface`
- **`src/feature/about/About.tsx`** + **`src/feature/help/Help.tsx`** — Change `text-white` → `text-surface` (also part of E1/E2)

### Phase 2: Shadow Normalization (B1-B6)

- **`src/shared/components/ui/select.tsx`** — `shadow-gray-200/50` → `shadow-navy/20`
- **`src/shared/components/ui/toaster.tsx`** — `shadow-gray-200/50` → `shadow-navy/20`
- **`src/feature/auth/Login.tsx`** — `shadow-gray-200/50` → `shadow-navy/20`
- **`src/shared/components/OfflineBanner.tsx`** — Add `shadow-error/20` to existing `shadow-md` element
- **`src/shared/components/layout/NavbarDashboard.tsx`** — Add `shadow-navy/20` tint to search dropdown shadow
- **`src/feature/credential/VerifyCredential.tsx`** — Add `shadow-navy/20` to upload label shadow (also part of E3)

### Phase 3: Font Family Corrections (C1-C3)

- **`src/shared/components/ui/card.tsx`** — `CardTitle`: change `font-display text-xl font-semibold text-navy tracking-tight` → `font-sans text-lg font-bold text-navy`
- **`src/shared/components/EmptyState.tsx`** — Make `font-sans` explicit on title
- **`src/feature/credential/components/CredentialCard.tsx`** — Change `font-display` → `font-sans` on card title

### Phase 4: `min-h-dvh` Normalization (D1-D4)

- **`src/shared/components/NotFound.tsx`** — `min-h-screen` → `min-h-dvh`
- **`src/shared/components/ErrorBoundary.tsx`** — `min-h-screen` → `min-h-dvh`
- **`src/shared/components/RouteErrorBoundary.tsx`** — `min-h-screen` → `min-h-dvh`
- **`src/shared/components/LoadingSpinner.tsx`** — `FullPageSpinner`: `min-h-screen` → `min-h-dvh`

### Phase 5: Extract Inline Patterns (E1-E3)

- **`src/feature/about/About.tsx`** — Replace inline `<a>` element (lines 104-110) with `<Button variant="primary" asChild><a href={...}>...</a></Button>`. Remove the duplicate CSS classes. Keep `gap-2 whitespace-nowrap` via `className` prop.
- **`src/feature/help/Help.tsx`** — Same replacement as E1 for the duplicated email contact link.
- **`src/feature/credential/VerifyCredential.tsx`** — Replace the hand-rolled `<label>` button (lines 169-186) with `<Button variant="primary" size="lg" asChild><label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 w-full">...</label></Button>`. Remove the inline shadow, rounded-xl, bg-navy, etc. classes — the Button primitive provides them.

### Phase 6: Focus Ring Fixes (F1-F2)

- **`src/feature/user/components/UserEditDrawer.tsx`** — Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold` to the close button
- **`src/shared/components/ui/dialog.tsx`** — Dialog close button: `focus-visible:ring-navy` → `focus-visible:ring-gold`

### Phase 7: Anti-Pattern Fix (G1)

- **`src/shared/components/NotFound.tsx`** — Remove the gold `DecorBlob` (line 10). Keep the navy one (line 9).

### Phase 8: StatusPill Naming (H1)

- **`src/shared/components/StatusPill.tsx`** — Rename internal string `"rounded-md"` → `"rounded-full"` OR rename the component. **Decision needed**: The component is used as a badge (role/status indicators), not as literal pill buttons. Since `StatusPill` already uses `rounded-md` and all consumers see it as a badge, the simplest fix is to rename the component to `StatusBadge`. All 3 consumer files need import updates.
  - Update imports in: `src/feature/user/components/UserStatusBadge.tsx`, `src/feature/user/components/UserRoleBadge.tsx`, `src/feature/credential/components/CredentialStatusBadge.tsx`, `src/feature/user/UserDetail.tsx`

### Phase 9: Design System Doc Fix (K1)

- **`DESIGN_SYSTEM.md`** — Update §5.1 Color Usage Rules table: change "Focus ring" row to note that the global default is `ring-gold` but component recipes (§7.3, §7.4) may specify variant-specific focus ring colors.

---

## List of Modified Files

### Code changes (22 files)

| File | Changes |
|------|---------|
| `src/shared/components/DecorBlob.tsx` | `bg-blue-500/10` → `bg-info/10` |
| `src/feature/credential/VerifyCredential.tsx` | A2 + B6 + E3: color tokens, shadow tint, extract button |
| `src/feature/user/components/UserStatusBadge.tsx` | `text-green-600` → `text-green-700` |
| `src/shared/components/ui/table.tsx` | `bg-white` → `bg-surface` |
| `src/feature/about/About.tsx` | E1: extract inline button + A5 |
| `src/feature/help/Help.tsx` | E2: extract inline button + A5 |
| `src/shared/components/ui/select.tsx` | B1: shadow tint |
| `src/shared/components/ui/toaster.tsx` | B2: shadow tint |
| `src/feature/auth/Login.tsx` | B3: shadow tint |
| `src/shared/components/OfflineBanner.tsx` | B4: add shadow tint |
| `src/shared/components/layout/NavbarDashboard.tsx` | B5: add shadow tint |
| `src/shared/components/ui/card.tsx` | C1: CardTitle font family |
| `src/shared/components/EmptyState.tsx` | C2: explicit font-sans |
| `src/feature/credential/components/CredentialCard.tsx` | C3: card title font family |
| `src/shared/components/NotFound.tsx` | D1 + G1: min-h-dvh + remove second blob |
| `src/shared/components/ErrorBoundary.tsx` | D2: min-h-dvh |
| `src/shared/components/RouteErrorBoundary.tsx` | D3: min-h-dvh |
| `src/shared/components/LoadingSpinner.tsx` | D4: min-h-dvh |
| `src/feature/user/components/UserEditDrawer.tsx` | F1: add focus ring |
| `src/shared/components/ui/dialog.tsx` | F2: focus ring color |
| `src/shared/components/StatusPill.tsx` | H1: rename to StatusBadge + update exports |
| `DESIGN_SYSTEM.md` | K1: clarify focus ring vs component recipes |

### Renames (1 file)

| From | To |
|------|-----|
| `src/shared/components/StatusPill.tsx` | `src/shared/components/StatusBadge.tsx` |

### New test files (5 files)

| File | Tests |
|------|-------|
| `src/shared/components/StatusBadge.test.tsx` | Renders badge classes, tone variants, icon rendering, custom className passthrough (6 tests) |
| `src/shared/components/NotFound.test.tsx` | Renders with `min-h-dvh`, renders single blob only, renders 404 text, renders CTA links (5 tests) |
| `src/shared/components/OfflineBanner.test.tsx` | Renders offline message, uses error tinted shadow, online state hidden (4 tests) |
| `src/shared/components/EmptyState.test.tsx` | Renders title/description/action, font-sans on title, card styling classes (4 tests) |
| `src/shared/components/ui/card.test.tsx` | CardTitle uses font-sans, card uses rounded-2xl, border-gray-100, shadow-sm (4 tests) |

### Updated test files (4 files)

| File | Changes |
|------|---------|
| `src/shared/components/CopyrightFooter.test.tsx` | Bump test count comment if needed (no logic change) |
| `src/feature/about/About.test.tsx` | Update assertion: contact email now uses `<Button>` instead of inline `<a>`. Assert button renders with correct href. |
| `src/shared/components/ErrorBoundary.test.tsx` | Add `min-h-dvh` assertion (if test exists) |
| `src/feature/credential/components/CredentialCard.test.tsx` | Add `font-sans` assertion on title (if test exists) |

---

## Phase 10: Verification

- [ ] **Step 1: Lint**
  ```bash
  cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run lint
  ```
  Expected: no new errors.

- [ ] **Step 2: Build**
  ```bash
  cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run build
  ```
  Expected: clean TypeScript compilation.

- [ ] **Step 3: Tests**
  ```bash
  cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run test
  ```
  Expected: all tests pass including new tests.

- [ ] **Step 4: Locale check**
  ```bash
  cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run check-locales
  ```
  Expected: no drift (no i18n keys added in this refactor).

- [ ] **Step 5: Commit**
  ```bash
  cd /Users/arfanxn/Developments/credchain/CredChain_React
  git add [modified files]
  git commit -m "refactor: design consistency audit fixes — tokens, shadows, fonts, viewport units"
  ```
