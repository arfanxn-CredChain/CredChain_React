# Reflect Backend Service-Level Validation Errors in React Frontend

> **Status:** Draft v1.0 | **Date:** 2026-07-07 | **Related:** `CredChain_Golang/docs/superpowers/specs/2026-07-07-structured-service-validation-errors-design.md`

---

## 1. Overview

The Go backend refactored batch endpoint error handling: service-layer business-validation errors (duplicate emails, holder not found, duplicate file hash) now return Ozzo `validation.Errors` (code `100040`) identical in shape to request-level Ozzo validation errors. The `Credential Issue` endpoint is now all-or-nothing (`SendPartial` deleted). `CodeCredentialIssueFailed` (`400240`) was removed from the backend.

This spec defines the React frontend changes needed to reflect the backend contract.

## 2. Requirements

### 2.1 Add 4 New Ozzo Validation i18n Keys

The backend added 4 validation error codes to `locales/en.json` and `locales/id.json`. The frontend must mirror them.

**Backend keys (reference):**

| Key | English (`en.json`) | Indonesian (`id.json`) |
|-----|---------------------|------------------------|
| `validation_store_email_duplicate_batch` | `Email "{{.field}}" appears multiple times in this batch.` | `Email "{{.field}}" muncul beberapa kali dalam batch ini.` |
| `validation_store_email_duplicate_db` | `Email "{{.field}}" is already registered.` | `Email "{{.field}}" sudah terdaftar.` |
| `validation_issue_holder_not_found` | `Holder user "{{.field}}" was not found.` | `Pemegang "{{.field}}" tidak ditemukan.` |
| `validation_issue_duplicate_file_hash` | `A credential with this file hash already exists.` | `Kredensial dengan hash file ini sudah ada.` |

**Files to edit:**
- `src/shared/i18n/en.json` — add 4 keys in Ozzo validation block (after `validation_file_type_invalid`)
- `src/shared/i18n/id.json` — same

### 2.2 Remove `error_credential_issue_failed` from Locale Files

`CodeCredentialIssueFailed` (`400240`) was deleted from the backend. Remove the corresponding locale entry from both frontend locale files.

**Files to edit:**
- `src/shared/i18n/en.json` — remove `"error_credential_issue_failed": "Failed to issue credential."`
- `src/shared/i18n/id.json` — remove `"error_credential_issue_failed": "Gagal menerbitkan kredensial."`

### 2.3 Remove `CodeCredentialIssueFailed` (400240) from `codes.ts`

Backend deleted `CodeCredentialIssueFailed` from `domain/codes.go`. Remove the corresponding entry from the frontend `CODE_TO_MESSAGE_KEY` map.

**File to edit:**
- `src/shared/api/codes.ts` — remove line `400240: "credential.issue.failed",`

### 2.4 Simplify `useIssueCredentials.ts` — Remove Partial-Success `__envelope` Hack

**Current behavior:** The hook's `mutationFn` extracts `__envelope.errors` from the axios response (a holdover from the `SendPartial` era) and returns `{ data, fieldErrors }`. The `onSuccess` callback checks `fieldErrors` to decide whether to show success or inline validation errors.

**New behavior (all-or-nothing):**
- `mutationFn` — returns `response.data` directly (no `__envelope` extraction)
- `onSuccess` — always shows success toast + invalidates queries
- `onError` — handles `error.fieldErrors` (from the axios interceptor, which already captures `error.response?.data?.errors`) via `setServerErrors` with normalized paths

The `onError` handler is already correct for the new model. Only `mutationFn` and `onSuccess` need changes.

**File to edit:**
- `src/feature/credential/api/useIssueCredentials.ts`

**Changes:**

1. Remove the `__envelope` extraction from `mutationFn`:
   ```ts
   // Before
   const response = await api.post("/credentials/batch/issue", formData, {
     headers: { "Content-Type": "multipart/form-data" },
   });
   const enveloped = response as AxiosResponse<ApiResponse> & {
     __envelope?: { errors?: Record<string, string[]> };
   };
   return {
     data: response.data,
     fieldErrors: enveloped.__envelope?.errors ?? {},
   };

   // After
   const response = await api.post("/credentials/batch/issue", formData, {
     headers: { "Content-Type": "multipart/form-data" },
   });
   return response.data;
   ```

2. Simplify `onSuccess`:
   ```ts
   // Before
   onSuccess: (result: { data: unknown; fieldErrors: Record<string, string[]> }) => {
     void queryClient.invalidateQueries({ queryKey: credentialKeys.all() });
     if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
       if (form) {
         setServerErrors(form, normalizeBatchErrorPaths(result.fieldErrors));
       }
     } else {
       notify.success("credential.issue.success");
     }
   },

   // After
   onSuccess: () => {
     void queryClient.invalidateQueries({ queryKey: credentialKeys.all() });
     notify.success("credential.issue.success");
   },
   ```

3. Remove now-unused imports: `AxiosResponse` type, `ApiResponse` type. (Keep everything else — `normalizeBatchErrorPaths` and `BACKEND_TO_FRONTEND_PATH` are still used in `onError`.)

### 2.5 `useCreateUsers.ts` — No Changes Required

**Why:** The hook already handles the new error model correctly:
- `onError` checks `isApiError(error) && error.fieldErrors` and calls `setServerErrors(form, error.fieldErrors)` — this will correctly handle the new `validation.Errors` with paths like `users.0.email`
- `onSuccess` unconditionally shows `user.store.success` — correct for all-or-nothing
- The axios interceptor already captures `error.response?.data?.errors` into `ApiError.fieldErrors` (see `client.ts:71`)

**Field path compatibility:** Backend Ozzo paths (`users.0.email`, `users.1.email`) match RHF field paths registered in `UserCreateRow.tsx` (e.g., `form.register(\`users.${index}.email\`)`). No path translation needed.

### 2.6 `CredentialIssue.tsx` and `UserCreateRow.tsx` — No Changes Required

- `CredentialIssue.tsx` — component only calls `issue.mutate()` and navigates on success. The `onSuccess` navigation still works (all-or-nothing means success always means the full batch was issued).
- `UserCreateRow.tsx` — field paths match backend Ozzo paths. No changes.

## 3. Field Path Compatibility

Backend Ozzo `validation.Errors` field paths use dot notation matching the Go struct field names:

| Backend Path | RHF Field Path | Match? |
|-------------|----------------|--------|
| `users.0.email` | `users.0.email` | Yes |
| `users.0.name` | `users.0.name` | Yes |
| `credentials.0.holder_user_id` | `credentials.0.holder_user_id` | Yes |
| `credentials.0.file` | `credentials.0.file` | Yes |

The `normalizeBatchErrorPaths` function in `useIssueCredentials.ts` splits paths by `.` and maps PascalCase segments via `BACKEND_TO_FRONTEND_PATH`. Since the new service-layer paths are already lowercase (matching both RHF registration and the backend Go struct field names), no mapping changes are needed. The function is kept for forward compatibility with any future PascalCase path segments.

## 4. Error Flow (End-to-End)

```
Backend returns:
  {"code": 100040, "errors": {"users.0.email": ["Email \"x@y.com\" appears multiple times..."]}}
    │
    ▼
Axios error interceptor (client.ts:71):
  fieldErrors = error.response?.data?.errors
  → new ApiError(status=4xx, code=100040, messageKey="system.validation", fieldErrors={...})
    │
    ▼
useXxx hook onError:
  isApiError(error) && error.fieldErrors && form
  → setServerErrors(form, error.fieldErrors)
  → RHF sets inline errors on fields
    │
    ▼
Or (no fieldErrors — domain error):
  isApiError(error)
  → notify.error(error.messageKey)  // translated toast
```

## 5. Files Touched

| # | File | Change |
|---|------|--------|
| 1 | `src/shared/i18n/en.json` | Add 4 Ozzo validation keys. Remove `error_credential_issue_failed`. |
| 2 | `src/shared/i18n/id.json` | Add 4 Ozzo validation keys. Remove `error_credential_issue_failed`. |
| 3 | `src/shared/api/codes.ts` | Remove `400240: "credential.issue.failed"`. |
| 4 | `src/feature/credential/api/useIssueCredentials.ts` | Remove `__envelope` hack. Simplify `mutationFn` and `onSuccess`. Clean up unused imports. |

## 6. Out of Scope

- No changes to `useCreateUsers.ts`, `CredentialIssue.tsx`, `UserCreateRow.tsx` (already compatible)
- No MSW handler updates needed (handlers already return envelope shape with `errors` field)
- No test updates (existing tests don't test the old partial-success path specifically; the `onError` pattern is already tested via other hooks)
- No new i18n keys beyond the 4 Ozzo validation keys

## 7. Verification

After implementation, run:

```bash
cd CredChain_React
npm run lint && npm run build && npm run test && npm run check-locales
```

**Expected results:**
- `lint` — no errors
- `build` — clean TypeScript compilation
- `test` — all 426 tests pass
- `check-locales` — 0 missing backend keys (4 new keys are now present, `error_credential_issue_failed` was already absent from backend locales)
