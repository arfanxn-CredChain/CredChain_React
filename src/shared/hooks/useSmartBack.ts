import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@app/store";

/**
 * Returns a smart back-navigation handler that:
 * - Goes back in browser history when prior history exists
 *   (`location.key !== "default"` means this is not the entry route)
 * - Falls back to `/dashboard` (authenticated) or `/` (unauthenticated)
 *   when there is no history (e.g., page was refreshed or opened in a new tab)
 *
 * Use this anywhere a "back" affordance is needed so all back buttons
 * behave consistently across the app.
 */
export function useSmartBack(): () => void {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? "/dashboard" : "/");
    }
  }, [isAuthenticated, navigate, location.key]);
}
