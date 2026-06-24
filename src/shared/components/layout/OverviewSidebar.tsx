import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, LogOut, X } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { useStore } from "@app/store";
import { canAccess } from "@shared/auth/role";
import { useLogout } from "@feature/auth/api/useLogout";
import { useConfirm } from "@ui/confirm-dialog";
import { NAV_ITEMS } from "@shared/components/layout/nav-items";

interface OverviewSidebarProps {
  onClose?: () => void;
}

export function OverviewSidebar({ onClose }: OverviewSidebarProps) {
  const user = useStore((s) => s.user);
  const logout = useLogout();
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
    if (ok) logout.mutate();
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.inSidebar) return false;
    if (item.exactRole) return user?.role === item.exactRole;
    if (item.minRole) return canAccess(user?.role, item.minRole);
    return true;
  });

  return (
    <>
      <div className="flex h-full flex-col bg-navy text-gray-300">
        {/* Logo */}
        <div className="relative flex flex-col items-center justify-center pt-10 pb-8">
          <ShieldCheck className="mb-2 h-12 w-12 text-gold" aria-hidden="true" />
          <span className="font-display text-2xl font-bold tracking-tight text-gold">
            CredChain
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white sm:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="mt-2 flex-1 space-y-1 px-4" aria-label="Main navigation">
          {visibleItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/overview"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-xl border-l-[3px] px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "border-gold bg-surface/15 text-surface shadow-sm"
                    : "border-transparent hover:bg-surface/5 hover:text-surface",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 shrink-0",
                      isActive ? "text-gold" : "text-gray-400",
                    )}
                    aria-hidden="true"
                  />
                  {t(item.i18nKey)}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="safe-area-bottom mb-8 px-4">
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="group flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 hover:text-surface"
          >
            <LogOut
              className="mr-3 h-5 w-5 shrink-0 text-gray-400 group-hover:text-surface"
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
