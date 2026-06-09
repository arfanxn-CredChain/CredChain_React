import { useTranslation } from "react-i18next";
import { useStore } from "@app/store";
import { canAccess } from "@shared/auth/role";
import { NAV_ITEMS, type NavSearchItem } from "@shared/components/layout/nav-items";

export function useNavSearch(query: string): NavSearchItem[] {
  const { i18n } = useTranslation();
  const user = useStore((s) => s.user);
  const normalizedQuery = query.trim().toLowerCase();

  const tEn = i18n.getFixedT("en");
  const tId = i18n.getFixedT("id");

  return NAV_ITEMS.filter((item) => {
    if (item.exactRole && user?.role !== item.exactRole) return false;
    if (item.minRole && !canAccess(user?.role, item.minRole)) return false;

    if (!normalizedQuery) return true;

    const labelEn = tEn(item.i18nKey).toLowerCase();
    const labelId = tId(item.i18nKey).toLowerCase();
    return labelEn.includes(normalizedQuery) || labelId.includes(normalizedQuery);
  });
}
