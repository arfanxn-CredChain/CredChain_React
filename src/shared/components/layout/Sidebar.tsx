import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, LogOut, X } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { useStore } from "@app/store";
import { canAccess, formatRole } from "@shared/auth/role";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useLogout } from "@feature/auth/api/useLogout";
import { useConfirm } from "@ui/confirm-dialog";
import { NAV_ITEMS } from "@shared/components/layout/nav-items";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const user = useStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm({
      title: t("auth.logout.confirm.title"),
      description: t("auth.logout.confirm.body"),
      confirmLabel: t("auth.logout.confirm.action"),
      cancelLabel: t("common.cancel"),
      tone: "destructive",
    });
    if (ok) logout.mutate(undefined, { onSettled: () => navigate("/login") });
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.inSidebar) return false;
    if (item.exactRole) return user?.role === item.exactRole;
    if (item.minRole) return canAccess(user?.role, item.minRole);
    return true;
  });

  return (
    <>
      <div className="flex flex-col h-full bg-navy text-gray-300">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center pt-10 pb-8 relative">
          <ShieldCheck className="h-12 w-12 text-surface mb-2" aria-hidden="true" />
          <span className="font-display text-2xl font-bold tracking-tight text-surface">
            CredChain
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="sm:hidden absolute top-4 right-4 text-gray-400 hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {user && (
          <div className="px-4 mt-2 mb-6 flex items-center gap-3">
            <UserAvatar user={user} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-surface truncate">
                {user.name ?? user.email}
              </div>
              <div className="text-xs text-gray-400 truncate capitalize">
                {formatRole(user.role)}
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-4 mt-2" aria-label="Main navigation">
          {visibleItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all",
                  isActive
                    ? "bg-white/10 text-surface shadow-sm"
                    : "hover:bg-white/5 hover:text-surface",
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              {t(item.i18nKey)}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 mb-8 safe-area-bottom">
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="flex items-center w-full px-4 py-3 text-sm font-medium hover:text-surface hover:bg-white/5 rounded-xl transition-colors group"
          >
            <LogOut
              className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-surface"
              aria-hidden="true"
            />
            {logout.isPending ? t("auth.logout.signingOut") : t("auth.logout.confirm.action")}
          </button>
        </div>
      </div>
      {dialog}
    </>
  );
}
