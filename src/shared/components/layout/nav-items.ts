import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, FileBadge, Settings, User, HelpCircle, Info } from "lucide-react";
import { Role } from "@shared/auth/role";

export interface NavSearchItem {
  href: string;
  i18nKey: string;
  icon: LucideIcon;
  minRole?: Role;
  exactRole?: Role;
  inSidebar: boolean;
}

export const NAV_ITEMS: NavSearchItem[] = [
  {
    href: "/overview",
    i18nKey: "nav.overview",
    icon: LayoutDashboard,
    minRole: Role.HOLDER,
    inSidebar: true,
  },
  { href: "/users", i18nKey: "nav.users", icon: Users, minRole: Role.ISSUER, inSidebar: true },
  {
    href: "/credentials",
    i18nKey: "nav.credentials",
    icon: FileBadge,
    minRole: Role.ISSUER,
    inSidebar: true,
  },
  {
    href: "/credentials/self",
    i18nKey: "nav.myCredentials",
    icon: FileBadge,
    minRole: Role.HOLDER,
    exactRole: Role.HOLDER,
    inSidebar: true,
  },
  {
    href: "/settings",
    i18nKey: "nav.settings",
    icon: Settings,
    minRole: Role.ADMIN,
    inSidebar: true,
  },
  { href: "/account/profile", i18nKey: "nav.profile", icon: User, inSidebar: false },
  { href: "/help", i18nKey: "nav.help", icon: HelpCircle, inSidebar: false },
  { href: "/about", i18nKey: "nav.about", icon: Info, inSidebar: false },
];
