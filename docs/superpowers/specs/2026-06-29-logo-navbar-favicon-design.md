# Logo, Navbar & Favicon Design Spec

> **Status:** Draft v1.0 | **Date:** 2026-06-29 | **Related:** AGENTS.md, DESIGN_SYSTEM.md

---

## 1. Overview

Replace the generic `ShieldCheck` lucide-react icon with the official CredChain logo SVG in brand contexts, center the public navbar content at `max-w-6xl`, and set up proper favicon + public assets.

## 2. Requirements

### 2.1 Navbar Layout

**Current:** `NavbarPublic.tsx` inner div uses `max-w-7xl` (1280px).
**Target:** Change to `max-w-6xl` (1152px) so brand + language switcher content is centered and not pushed off-screen on lg screens.

Layout remains: full-width navy background, centered content row.

### 2.2 Logo Replacement (Brand Contexts Only)

Replace `<ShieldCheck>` from lucide-react with `<img src="/logo-icon.svg">` in these brand/logo contexts:

| File | Line(s) | Current | New |
|------|---------|---------|-----|
| `NavbarPublic.tsx` | 10-13 | `<ShieldCheck className="h-6 w-6 text-gold">` | `<img src="/logo-icon.svg" className="h-6 w-6" alt="">` |
| `Login.tsx` | 14 | `<ShieldCheck className="h-24 w-24 text-gold drop-shadow-xl">` | `<img src="/logo-icon.svg" className="h-24 w-24" alt="">` |
| `Login.tsx` | 28 | `<ShieldCheck className="mx-auto mb-3 h-16 w-16 text-gold drop-shadow-md">` | `<img src="/logo-icon.svg" className="mx-auto mb-3 h-16 w-16" alt="">` |
| `Landing.tsx` | 135 | `<ShieldCheck className={cn(shieldSize, shieldColor)} strokeWidth={1.25}>` | `<img src="/logo-icon.svg" className={cn(shieldSize)} alt="">` |
| `OverviewSidebar.tsx` | 44 | `<ShieldCheck className="mb-2 h-12 w-12 text-gold">` | `<img src="/logo-icon.svg" className="mb-2 h-12 w-12" alt="">` |

**Keep ShieldCheck** in status/feature icon contexts (no changes):
- `About.tsx` — feature list icon
- `Help.tsx` — feature list icon
- `Overview.tsx` — stats icon
- `Settings.tsx` — settings icon
- `VerifyCredential.tsx` — verdict icon
- `CredentialList.tsx` — table icon
- `CredentialStatusBadge.tsx` — verified status badge

### 2.3 Login Page Brand Layout

**Current (vertical, desktop):**
```
    [Shield]
  Welcome to
   CredChain
```

**Target (horizontal, desktop lg+):**
```
[Logo] Welcome to
       CredChain
```

- "Welcome to" → white (`text-surface`)
- "CredChain" → gold (`text-gold`)
- Logo → vertically centered between the two text lines
- Use existing `auth.welcome.title` i18n key (no changes needed)

**Mobile:** Keep vertical layout (logo above "CredChain" text).

### 2.4 Favicon & Public Assets

1. Create `CredChain_React/public/` directory
2. Copy `logos/favicon_io/*` → `public/`:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`
   - `site.webmanifest`
3. Copy `logos/logo-icon.svg` → `public/logo-icon.svg`
4. Update `index.html`:
   - Replace `<link rel="icon" type="image/svg+xml" href="/vite.svg" />` with proper favicon links
   - Add apple-touch-icon, theme-color, manifest references

## 3. Logo File Notes

`logo-icon.svg` is a rasterized PNG embedded inside an SVG wrapper (base64-encoded `<image>` tag at 800px). Not true vector. Adequate for target sizes (navbar ~24px, login ~96px, sidebar ~48px, favicon). Will not scale cleanly beyond ~800px.

## 4. Out of Scope

- No i18n key changes (existing `auth.welcome.title` with `<brand>` component works as-is)
- No changes to ShieldCheck usage in status/feature icon contexts
- No new dependencies
- No dark mode considerations (app is light-mode only)

## 5. Verification

After implementation, run:
```bash
npm run lint && npm run build && npm run test && npm run check-locales
```
