import { useTranslation } from "react-i18next";

/**
 * Convenience wrapper around react-i18next.
 * Use this hook everywhere instead of importing useTranslation directly.
 */
export function useT() {
  return useTranslation().t;
}
