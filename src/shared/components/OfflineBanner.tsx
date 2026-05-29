import { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { useOnline } from "@shared/hooks/useOnline";
import { notify } from "@shared/lib/notify";
import { cn } from "@shared/lib/cn";

/**
 * Renders a persistent offline banner at the top of the viewport when
 * the browser is offline, plus fires a one-time toast notification.
 *
 * Mount once near the app root (under Providers) so it watches globally.
 */
export function OfflineBanner() {
  const online = useOnline();

  useEffect(() => {
    if (!online) {
      notify.warning("system.offline");
    }
  }, [online]);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] safe-area-top",
        "bg-error text-surface text-sm font-bold py-2 px-4",
        "flex items-center justify-center gap-2 shadow-md",
      )}
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      You are currently offline. Some actions may fail until connection is restored.
    </div>
  );
}
