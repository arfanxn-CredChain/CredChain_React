# Profile Dropdown Layout Shift & Duplicate Focus Indicator Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the navbar from shifting horizontally when the profile dropdown opens/closes, and replace the doubled-up focus indicators (gold rectangle + gold ring) with a single clean circular ring that fires only on keyboard focus.

**Architecture:**
- Fix 1: Set `modal={false}` on the profile `<DropdownMenu>` so Radix's `react-remove-scroll` no longer removes the page scrollbar (which was widening the layout and shifting the navbar).
- Fix 2: Override the global `:focus-visible` gold outline on the trigger button with a Tailwind arbitrary-value `outline:none` so only the avatar's circular ring shows. Keep focus-return intact (Option 2: keyboard-only ring, no a11y tradeoff).

**Tech Stack:** React 19, Radix UI DropdownMenu, Tailwind CSS v4, TypeScript 5.9

---

## Root Causes

1. **Horizontal navbar shift on open/close** — The profile `<DropdownMenu>` runs in Radix modal mode by default. On open, `react-remove-scroll` removes the page scrollbar to lock scrolling, widening the layout; on close it restores. Our custom inner scroll container (`main` with `overflow-y-scroll [scrollbar-gutter:stable]`) is not compensated, so the shift is visible in the navbar.

2. **Gold rectangle + gold ring after close** — When the menu closes, Radix returns focus to the trigger button, firing `:focus-visible`. Two indicators fire simultaneously:
   - The avatar's `group-focus-visible:ring-gold` → circular ring (intended).
   - The global base rule in `src/styles/index.css:84-88` (`:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; border-radius: 4px; }`) → rounded rectangle around the whole button. The existing `focus-visible:outline-none` Tailwind utility loses to this base-layer rule.

---

## Task 1: Disable modal scroll-lock on the profile dropdown

**Files:**
- Modify: `src/shared/components/layout/TopNav.tsx`

- [ ] **Step 1: Locate the profile DropdownMenu root**

The opening tag is currently:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button
      className="group flex items-center gap-3 rounded-xl p-1 focus-visible:outline-none"
      aria-label="User menu"
    >
```

- [ ] **Step 2: Add `modal={false}` to the root**

Change `<DropdownMenu>` to:

```tsx
<DropdownMenu modal={false}>
```

This disables Radix's scroll-lock. The page scrollbar stays present on open, so the layout width never changes and the navbar does not shift. Click-outside dismissal still works.

---

## Task 2: Remove the gold rectangle, keep only the avatar ring

**Files:**
- Modify: `src/shared/components/layout/TopNav.tsx`

- [ ] **Step 1: Override the global focus outline on the trigger button**

The current button className is:

```tsx
className="group flex items-center gap-3 rounded-xl p-1 focus-visible:outline-none"
```

Replace `focus-visible:outline-none` with the Tailwind v4 arbitrary-value form, which emits `outline: none !important` and beats the `index.css` base rule:

```tsx
className="group flex items-center gap-3 rounded-xl p-1 focus-visible:[outline:none]"
```

- [ ] **Step 2: Confirm the avatar ring is unchanged**

The avatar keeps its existing className (no edit needed):

```tsx
<UserAvatar
  user={user}
  size="md"
  className="ring-2 ring-surface transition-shadow group-focus-visible:ring-gold sm:ring-gray-200"
/>
```

This circular ring is now the sole focus indicator. It fires only on `:focus-visible` (keyboard), never on mouse click. Focus-return after close is intentionally preserved (Option 2 — no `onCloseAutoFocus` override), so the ring briefly appears when closing via Escape/Enter, which is correct keyboard accessibility behavior.

---

## Task 3: Verification

- [ ] **Step 1: Format**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
npx prettier --write src/shared/components/layout/TopNav.tsx
```

Expected: file formatted (or unchanged).

- [ ] **Step 2: Lint**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run lint
```

Expected: no errors. The pre-existing `UserEditDrawer.tsx` warning is acceptable.

- [ ] **Step 3: Build**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run build
```

Expected: clean build, no errors.

- [ ] **Step 4: Manual checks**

1. Click the profile avatar → dropdown opens → navbar stays in place (no horizontal shift), scrollbar still visible.
2. Click outside / pick a menu item → dropdown closes → navbar stays in place, no gold rectangle, no avatar ring.
3. Tab to the avatar with the keyboard → clean gold circular ring, no rectangle.
4. Press Escape with menu open → menu closes, focus returns to avatar, gold ring appears (expected keyboard-only behavior).

- [ ] **Step 5: Commit**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
git add src/shared/components/layout/TopNav.tsx docs/superpowers/plans/2026-06-09-profile-dropdown-layout-shift-and-focus.md
git commit -m "fix: profile dropdown layout shift + duplicate focus indicators"
```
