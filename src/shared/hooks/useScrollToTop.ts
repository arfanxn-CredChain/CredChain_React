import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reset scroll position to the top on every pathname change.
 *
 * Handles both scroll containers used across the app:
 * - the document/window scroller (PublicLayout, Landing, Login)
 * - the `#main` overflow container (DashboardLayout uses
 *   `overflow-y-scroll` so the window itself never scrolls)
 *
 * React Router's built-in `ScrollRestoration` only manages the document
 * scroller, so it misses the nested `#main` container — this hook covers both.
 */
export function useScrollToTop(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });

    const main = document.getElementById("main");
    if (main) {
      main.scrollTo({ top: 0, left: 0 });
    }
  }, [pathname]);
}
