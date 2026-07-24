# Task 3 Report: Guest Flow Spec

## Status: Done (with caveats)

## Commits

```
e2e/guest-flow.spec.ts  (new)
e2e/screenshots/guest-flow/  (new)
e2e/auth.spec.ts  (deleted)
e2e/public.spec.ts  (deleted)
```

## Test Results

```
9 passed, 3 failed (chromium, 6.4s)
```

| Test | Status |
|---|---|
| landing page renders without auth | ✅ PASS |
| not-found page renders for unknown routes | ✅ PASS |
| verify credential page renders without auth | ✅ PASS |
| verify credential form renders with input and submit button | ✅ PASS |
| verify credential form shows verify button | ✅ PASS |
| help page renders without auth | ✅ PASS |
| about page renders without auth and shows version | ✅ PASS |
| language switcher changes page language | ✅ PASS |
| unauthenticated user redirected from /overview to /login | ✅ PASS |
| holder cannot access issuer-only /users route | ❌ FAIL (no .auth/holder.json) |
| issuer cannot access admin-only /users/create route | ❌ FAIL (no .auth/issuer.json) |
| admin cannot see transfer-super-admin option on user list | ❌ FAIL (no .auth/admin.json) |

## Concerns

1. **3 role escalation tests fail** because `e2e/.auth/{holder,issuer,admin}.json` do not exist. These require a prior E2E auth setup step (Task 1 or Task 2).
2. **Spec deviates from brief** — the VerifyCredential component uses file upload (not credential ID text input), and the app defaults to Indonesian locale (`id`). Test selectors updated to match actual DOM and locale (locale-agnostic regexes, file-dropzone button assertions).
3. **`assert` deprecation warning** — Node.js warns that `assert: { type: "json" }` in import statements is deprecated; should use `with: { type: "json" }` instead. No behavioral impact.
