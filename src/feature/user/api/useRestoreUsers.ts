import { useMutation } from "@tanstack/react-query";
import { notify } from "@shared/lib/notify";

/**
 * STUB: Restore soft-deleted users.
 *
 * The Go backend does not yet expose a restore endpoint. Routes today are:
 *   POST   /users/batch       (create)
 *   PUT    /users/batch       (update)
 *   PUT    /users/batch/role  (role update)
 *   DELETE /users/batch       (soft delete)
 *
 * This hook is a placeholder so the UI can surface a Restore affordance.
 * It shows a "not yet supported" warning instead of calling the API.
 *
 * TODO(backend): Wire to PUT /users/batch/restore (set deleted_at = NULL,
 * re-sync on-chain role) once the endpoint exists, then replace the body
 * below with a real api.put call mirroring useDeleteUsers.
 */
export function useRestoreUsers() {
  return useMutation({
    mutationFn: async (_ids: string[]) => {
      void _ids;
      notify.warning("user.restore.notSupported");
      return null;
    },
  });
}
