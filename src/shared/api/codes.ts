/**
 * Backend domain code (AABBCC) -> i18n message key mapping.
 * Mirrors CredChain_Golang/infrastructure/http/responder/mapper.go.
 *
 * Keep this file in sync with the backend's CodeToMessageKey map.
 * When the backend adds a new code, add it here and in both locale files.
 */

export const CODE_TO_MESSAGE_KEY: Record<number, string> = {
  // System (10)
  100000: "system.success",
  100050: "system.internal_error",
  100040: "system.validation",

  // Overview (10 + 01)
  100100: "overview.success",
  100150: "overview.internal_error",

  // Auth (20)
  200200: "auth.login.success",
  200140: "auth.unauthorized",
  200141: "auth.token.invalid",
  200142: "auth.forbidden",
  200241: "auth.login.failed",
  200300: "auth.refresh.success",
  200340: "auth.refresh.invalid_token",
  200341: "auth.token.expired",
  200342: "auth.refresh.token_revoked",
  200343: "auth.refresh.user_not_found",
  200350: "auth.refresh.jwt_failed",
  200400: "auth.logout.success",

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

  // Credential (40)
  400100: "credential.fetch.success",
  400140: "credential.fetch.not_found",
  400141: "credential.fetch.validation",
  400200: "credential.issue.success",
  400240: "credential.issue.failed",
  400241: "credential.issue.validation",
  400242: "credential.issue.duplicate_file_hash",
  400243: "credential.issue.holder_not_found",
  400244: "credential.issue.blockchain_sync_failed",
  400245: "credential.issue.storage_failed",
  400246: "credential.issue.hash_failed",
  400300: "credential.revoke.success",
  400340: "credential.revoke.failed",
  400341: "credential.revoke.not_found",
  400342: "credential.revoke.already_revoked",
  400343: "credential.revoke.blockchain_sync_failed",
  400400: "credential.verify.success",
  400440: "credential.verify.failed",
  400441: "credential.verify.validation",
  400442: "credential.verify.extract_not_ready",
  400443: "credential.verify.extract_failed",
  400444: "credential.verify.ai_service_failed",
  400445: "credential.verify.credential_not_found",
  400401: "credential.verify.verdict.authentic",
  400402: "credential.verify.verdict.revoked",
  400403: "credential.verify.verdict.integrity_warning",
  400404: "credential.verify.verdict.tampered",
  400405: "credential.verify.verdict.suspicious",
  400406: "credential.verify.verdict.low_similarity",
  400407: "credential.verify.verdict.not_similar",
  400408: "credential.verify.verdict.no_identifiers",
  400409: "credential.verify.verdict.no_match",
  400410: "credential.verify.verdict.holder_disabled",
  400411: "credential.verify.verdict.issuer_disabled",
  400412: "credential.verify.verdict.party_disabled",
  400500: "credential.reextract.success",
  400540: "credential.reextract.not_found",
  400541: "credential.reextract.not_eligible",
  400600: "credential.file_download.success",
  400640: "credential.file_download.not_found",
  400641: "credential.file_download.forbidden",
  400642: "credential.file_download.decryption_failed",
  400643: "credential.file_download.no_file",
};

export function codeToMessageKey(code?: number): string {
  if (!code) return "system.internal_error";
  return CODE_TO_MESSAGE_KEY[code] ?? "system.internal_error";
}
