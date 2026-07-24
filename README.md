# CredChain — React Frontend

Production frontend for the CredChain decentralized credential platform.

## Stack

React 19 · Vite 7 · TypeScript 5.9 · Tailwind CSS v4 · shadcn/ui (14 primitives) · TanStack Query v5 · Zustand v5 · React Router 7 · React Hook Form v7 · Zod v3 · i18next v23 (en + id) · Vitest + RTL + MSW (545 unit tests) · Playwright (20 E2E)

## Quick Start

```bash
cp .env.example .env
# Set VITE_GOOGLE_CLIENT_ID
npm install
npm run dev
```

Dev server proxies `/api` to `http://localhost:8080`. The Go backend must be running.

## Project Structure

```
src/
├── app/              # App shell, providers, router, session, store
├── feature/          # Business domains (about, auth, credential, help, overview, user)
├── shared/           # Cross-feature code (api client, auth guards, components, hooks, i18n, lib, types)
├── styles/           # Tailwind entry + @theme design tokens
└── test/             # Vitest setup, MSW handlers, fixtures
```

## Key Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Unit/component tests |
| `npm run test:e2e` | Playwright E2E tests (guest, holder, issuer, admin, super-admin) — requires :5173 + auth setup¹ |
| `npm run check-locales` | Verify i18n keys match backend |

## Related Docs

- [AGENTS.md](AGENTS.md) — Full architecture, patterns, coding conventions, change log
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Design tokens, typography, component recipes, layout system

> **¹ E2E test setup:** Role-authenticated tests need `e2e/.auth/{role}.json` files. Run `npx tsx e2e/scripts/save-auth.ts` (interactive — prompts for all 4 roles) or `npx tsx e2e/scripts/save-auth.ts <role>` (single role). Opens browser, complete Google OAuth. Guest-flow public page tests work without auth. Set `E2E_BASE_URL` env var to override the default Playwright target (`http://localhost:5173`).
