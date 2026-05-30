import { useTranslation } from "react-i18next";
import { useStore } from "@app/store";
import { canAccess } from "@shared/auth/role";
import { NAV_ITEMS, type NavSearchItem } from "@shared/components/layout/nav-items";

export function useNavSearch(query: string): NavSearchItem[] {
  const { t } = useTranslation();
  const user = useStore((s) => s.user);
  const normalizedQuery = query.trim().toLowerCase();

  return NAV_ITEMS.filter((item) => {
    if (item.exactRole && user?.role !== item.exactRole) return false;
    if (item.minRole && !canAccess(user?.role, item.minRole)) return false;

    if (!normalizedQuery) return true;
    const label = t(item.i18nKey).toLowerCase();
    return label.includes(normalizedQuery);
  });
}
