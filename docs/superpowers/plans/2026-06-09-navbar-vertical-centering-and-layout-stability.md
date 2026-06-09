# Navbar Vertical Centering and Layout Stability Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two UI issues on the authenticated navbar (TopNav): (1) content not vertically centered due to a CSS cascade conflict with safe-area padding, (2) navbar layout shifts when switching menu items on desktop due to scrollbar appearing/disappearing in the main content area.

**Architecture:**
- Fix 1: Separate the safe-area inset spacer from the flex content row in TopNav so `py-*` padding-top is never overridden by the `safe-area-top` utility.
- Fix 2: Add `overflow-y: scroll` and `scrollbar-gutter: stable` to the main content area in DashboardLayout so the scrollbar track is always reserved, preventing width reflows.

**Tech Stack:** React 19, Tailwind CSS v4, TypeScript 5.9

---

## Task 1: Fix TopNav vertical centering

**Files:**
- Modify: `src/shared/components/layout/TopNav.tsx`

**Root cause:** The `<header>` element in TopNav has both `py-4 sm:py-5` AND `safe-area-top` in the same class list. The `safe-area-top` utility is declared in `@layer utilities` after `@import "tailwindcss"` in `index.css`. CSS source order within a layer determines precedence, so `safe-area-top` wins and sets `padding-top: env(safe-area-inset-top)` — which is `0` on virtually every non-notch device — overriding the intended `1rem`/`1.25rem` from `py-4`/`py-5`. The header ends up with `padding-top: 0` and `padding-bottom: 1rem`, making the flex content appear pulled toward the top.

**Fix:** Lift the flex layout classes off the `<header>` into a separate inner `<div>`. Keep `safe-area-top` on a dedicated zero-height spacer `<div>` immediately inside `<header>`, before the flex row. This way the safe-area padding is additive (it extends the header for notched iOS) and never conflicts with the flex row's `py-*`.

- [ ] **Step 1: Open TopNav.tsx and locate the header opening tag (line 56)**

The current opening of the `<header>` element looks like:

```tsx
<header className="bg-navy sm:bg-transparent px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between shadow-md sm:shadow-none z-10 relative safe-area-top no-print min-h-[64px] sm:min-h-[72px]">
  <div className="flex items-center gap-4">
```

- [ ] **Step 2: Replace the header opening and first child div**

Replace the two lines above with:

```tsx
<header className="bg-navy sm:bg-transparent z-10 relative no-print">
  <div className="safe-area-top" aria-hidden="true" />
  <div className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between shadow-md sm:shadow-none min-h-[64px] sm:min-h-[72px]">
    <div className="flex items-center gap-4">
```

The `safe-area-top` div is the safe-area spacer. On devices without a notch it renders as zero height. On notched iOS it pushes the content row down by the notch height. `py-4`/`py-5` on the inner div is now the sole owner of `padding-top` and will never be overridden.

- [ ] **Step 3: Add the closing tag for the new inner wrapper div**

The current end of the `<header>` block (around line 217-221) looks like:

```tsx
          </DropdownMenu>
        </div>
      </header>
      {dialog}
    </>
```

Add one extra `</div>` to close the new inner wrapper:

```tsx
          </DropdownMenu>
        </div>
      </div>
    </header>
    {dialog}
  </>
```

- [ ] **Step 4: Run TypeScript check**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
npx tsc --noEmit 2>&1 | grep -i "TopNav\|error" | head -20
```

Expected: no errors referencing TopNav.tsx.

---

## Task 2: Fix desktop navbar layout shift

**Files:**
- Modify: `src/shared/components/layout/DashboardLayout.tsx`

**Root cause:** `<main>` has `overflow-auto` with no `scrollbar-gutter` setting. On operating systems that render classic (non-overlay) scrollbars (Windows; macOS with "Always show scrollbars"), switching from a short-content page (no scrollbar) to a tall-content page (scrollbar visible) shrinks the `<main>` element's content width by ~12px. Because `<TopNav>` and `<main>` are siblings in the same `flex-col` container, this reflow is visible as a momentary shift in the TopNav's layout.

**Fix:** Replace `overflow-auto` with `overflow-y-scroll` so the scrollbar track is always present (always-reserved gutter), and add the Tailwind v4 arbitrary property `[scrollbar-gutter:stable]` as a belt-and-suspenders measure. The scrollbar track space never changes regardless of content height.

- [ ] **Step 1: Open DashboardLayout.tsx and locate the main element (lines 37-40)**

Current:

```tsx
        <main
          id="main"
          className="flex-1 overflow-auto px-4 sm:px-8 pb-12 pt-4"
        >
```

- [ ] **Step 2: Replace the main element className**

```tsx
        <main
          id="main"
          className="flex-1 overflow-y-scroll px-4 sm:px-8 pb-12 pt-4 [scrollbar-gutter:stable]"
        >
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
npx tsc --noEmit 2>&1 | grep -i "DashboardLayout\|error" | head -20
```

Expected: no errors referencing DashboardLayout.tsx.

---

## Task 3: Full verification

- [ ] **Step 1: Lint**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run lint
```

Expected: no errors. Warnings about `console.warn`/`console.error` are acceptable.

- [ ] **Step 2: Build**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run build
```

Expected: clean build, no TypeScript or Vite errors.

- [ ] **Step 3: Format check**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React && npm run format:check
```

Expected: all files pass. If any fail, run `npm run format` and re-check.

- [ ] **Step 4: Commit both fixes together**

```bash
cd /Users/arfanxn/Developments/credchain/CredChain_React
git add src/shared/components/layout/TopNav.tsx src/shared/components/layout/DashboardLayout.tsx
git commit -m "fix: navbar vertical centering and desktop layout stability"
```
