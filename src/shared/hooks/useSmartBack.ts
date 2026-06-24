import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@app/store";

/**
 * Returns a smart back-navigation handler that:
 * - Goes back in browser history when prior history exists
 *   (`location.key !== "default"` means this is not the entry route)
 * - Falls back to `/overview` (authenticated) or `/` (unauthenticated)
 *   when there is no history (e.g., page was refreshed or opened in a new tab)
 * - Special-cases `/login`: when arrived via a `ProtectedRoute` redirect
 *   (`location.state?.from` is set), avoids a `navigate(-1)` that would land
 *   on `/login` itself (the history entry was `replace`d by the guard, so
 *   backing up to the previous stack frame can loop back to the same page).
 *   In that case, navigates to `/overview` (authenticated) or `/` (landing).
 *
 * Use this anywhere a "back" affordance is needed so all back buttons
 * behave consistently across the app.
 */
export function useSmartBack(): () => void {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const arrivedViaProtectedRedirect =
      location.pathname === "/login" &&
      (location.state as { from?: { pathname: string } } | null)?.from;

    if (arrivedViaProtectedRedirect) {
      navigate(isAuthenticated ? "/overview" : "/");
      return;
    }

    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? "/overview" : "/");
    }
  }, [isAuthenticated, navigate, location.key, location.pathname, location.state]);
}
