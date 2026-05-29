import { toast } from "sonner";
import { i18n } from "@shared/i18n/config";

/**
 * Toast convention. All UI notifications go through this helper so messages
 * are i18n-resolved and styling stays consistent.
 */
export const notify = {
  success(key: string, options?: { description?: string }) {
    toast.success(i18n.t(key), options);
  },
  error(key: string, options?: { description?: string }) {
    toast.error(i18n.t(key), options);
  },
  info(key: string, options?: { description?: string }) {
    toast.info(i18n.t(key), options);
  },
  warning(key: string, options?: { description?: string }) {
    toast.warning(i18n.t(key), options);
  },
};
