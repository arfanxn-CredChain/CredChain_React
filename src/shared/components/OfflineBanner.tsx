import { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        "safe-area-top fixed top-0 right-0 left-0 z-[100]",
        "bg-error px-4 py-2 text-sm font-bold text-surface",
        "flex items-center justify-center gap-2 shadow-md shadow-error/20",
      )}
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      {t("offline.banner")}
    </div>
  );
}
