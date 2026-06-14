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
  200142: "auth.forbidden",
  400100: "auth.unauthorized",
  400101: "auth.token.invalid",
  400102: "auth.token.expired",
  400103: "auth.login.failed",

  // User (30 + 00-09)
  300100: "user.fetch.success",
  300140: "user.fetch.not_found",
  300200: "user.store.success",
  300241: "user.store.email_duplicate_in_batch",
  300242: "user.store.email_duplicate",
  300243: "user.store.wallet_generation_failed",
  300244: "user.store.blockchain_sync_failed",
  300245: "user.store.super_admin_forbidden",
  300246: "user.store.admin_create_admin_forbidden",
  300300: "user.profile.success",
  300400: "user.email_update.success",
  300440: "user.email.conflict",
  300441: "user.email.mismatched_id_token",
  300442: "user.email.invalid_id_token",
  300500: "user.role_update.success",
  300541: "user.update.admin_to_admin_forbidden",
  300542: "user.update.below_admin_forbidden",
  300543: "user.update.same_role_skipped",
  300544: "user.update.super_admin_promotion_forbidden",
  300545: "user.role.blockchain_sync_failed",
  300546: "user.update.self_target_forbidden",
  300547: "user.update.role_trashed_forbidden",
  300700: "user.delete.success",
  300741: "user.delete.admin_forbidden",
  300742: "user.delete.blockchain_sync_failed",
  300743: "user.delete.self_target_forbidden",
  300800: "user.update.success",
  300841: "user.update.not_found",
  300842: "user.update.admin_to_admin_forbidden",
  300843: "user.update.super_admin_forbidden",
  300844: "user.update.self_forbidden",
  300845: "user.update.blockchain_sync_failed",
  300846: "user.update.trashed_forbidden",
  300847: "user.update.self_email_forbidden",
  300900: "user.restore.success",
  300941: "user.restore.below_admin_forbidden",
  300942: "user.restore.self_target_forbidden",
  300943: "user.restore.super_admin_target_forbidden",
  300944: "user.restore.not_trashed_forbidden",
  300945: "user.restore.blockchain_sync_failed",

  // Transfer Super Admin (30 + 06)
  300600: "user.transfer.success",
  300641: "user.transfer.self_target_forbidden",
  300642: "user.transfer.target_not_found",
  300643: "user.transfer.target_trashed_forbidden",
  300645: "user.transfer.blockchain_sync_failed",

  // Credential (10/30/40 + 03)
  100300: "credential.fetch.success",
  100301: "credential.issue.success",
  100302: "credential.revoke.success",
  100303: "credential.verify.success",
  400240: "credential.issue.forbidden",
  300301: "credential.revoke.forbidden",
  400300: "credential.fetch.not_found",
  400301: "credential.verify.hash_mismatch",
  400302: "credential.verify.revoked",
};

export function codeToMessageKey(code?: number): string {
  if (!code) return "system.internal_error";
  return CODE_TO_MESSAGE_KEY[code] ?? "system.internal_error";
}
