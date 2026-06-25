# Spec: Overview Recent Activity "View all" Links

## Goal
Update the **Recently Revoked** "View all credentials" link in the Overview Recent Activity card to navigate to the credential list with the revoked status filter pre-selected.

## Out of Scope
- No changes to the **Recently Issued** link (`/credentials` is already correct because the credential list defaults to active status and `-issued_at` sort).
- No changes to the **New User** link (`/users` is already correct because the user list defaults to `-updated_at` sort).
- No new i18n keys, no API changes, no visual/layout changes.

## Behavior

| Section | Link target |
|---|---|
| Recently Issued | `/credentials` (unchanged) |
| Recently Revoked | `/credentials?status=revoked` |
| New User | `/users` (unchanged) |

The credential list page already defaults to the newest-first sort for revoked credentials (`-revoked_at`), so no explicit `sort` parameter is required.

## Implementation

### Files to modify
1. `src/feature/overview/Overview.tsx` — change the `to` prop of the revoked-credentials `RecentSectionFooter`.
2. `src/feature/overview/Overview.test.tsx` — add an assertion that the revoked "View all credentials" link points to `/credentials?status=revoked`.

### Verification
- `npm run test -- src/feature/overview/Overview.test.tsx`
- `npm run build`
- `npm run check-locales`
- Commit and push to `credchain-react/master`
