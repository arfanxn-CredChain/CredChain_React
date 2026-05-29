/**
 * Backend domain code (AABBCC) -> i18n message key mapping.
 * Mirrors CredChain_Golang/infrastructure/http/responder/mapper.go.
 *
 * Keep this file in sync with the backend's CodeToMessageKey map.
 * When the backend adds a new code, add it here and in both locale files.
 */

export const CODE_TO_MESSAGE_KEY: Record<number, string> = {
  // System (10/40 + 00)
  100000: "system.success",
  400000: "system.internal_error",
  400001: "system.validation",

  // Auth (10/40 + 01)
  100100: "auth.login.success",
  100101: "auth.refresh.success",
  100102: "auth.logout.success",
  300100: "auth.forbidden",
  400100: "auth.unauthorized",
  400101: "auth.token.invalid",
  400102: "auth.token.expired",
  400103: "auth.login.failed",

  // User (10/30/40 + 02)
  100200: "user.fetch.success",
  100201: "user.store.success",
  100202: "user.update.success",
  100203: "user.delete.success",
  100204: "user.role_update.success",
  100205: "user.email_update.success",
  300540: "user.update.role_forbidden",
  300541: "user.update.admin_to_admin_forbidden",
  300542: "user.update.same_role_skipped",
  300543: "user.update.below_admin_forbidden",
  300544: "user.update.super_admin_promotion_forbidden",
  300545: "user.update.admin_promotion_forbidden",
  300546: "user.update.self_target_forbidden",
  300547: "user.update.role_trashed_forbidden",
  300742: "user.delete.admin_forbidden",
  300743: "user.delete.self_target_forbidden",
  300846: "user.update.trashed_forbidden",
  400200: "user.fetch.not_found",
  400201: "user.store.email_duplicate",
  400202: "user.email.invalid_id_token",
  400203: "user.email.mismatched_id_token",
  400204: "user.email.conflict",
  400205: "user.role.blockchain_sync_failed",

  // Credential (10/30/40 + 03)
  100300: "credential.fetch.success",
  100301: "credential.issue.success",
  100302: "credential.revoke.success",
  100303: "credential.verify.success",
  300300: "credential.issue.forbidden",
  300301: "credential.revoke.forbidden",
  400300: "credential.fetch.not_found",
  400301: "credential.verify.hash_mismatch",
  400302: "credential.verify.revoked",
};

export function codeToMessageKey(code?: number): string {
  if (!code) return "system.internal_error";
  return CODE_TO_MESSAGE_KEY[code] ?? "system.internal_error";
}
