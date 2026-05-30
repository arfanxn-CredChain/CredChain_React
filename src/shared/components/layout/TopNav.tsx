import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, ShieldCheck, Search, UserCircle, User, Mail, LogOut } from "lucide-react";
import { useStore } from "@app/store";
import { formatRole } from "@shared/auth/role";
import { useLogout } from "@feature/auth/api/useLogout";
import { useConfirm } from "@ui/confirm-dialog";
import { useNavSearch } from "@shared/hooks/useNavSearch";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { ThemeToggle } from "@shared/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const user = useStore((s) => s.user);
  const logout = useLogout();
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const searchResults = useNavSearch(searchQuery);
  const showDropdown = searchQuery.length > 0;

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

  return (
    <>
      <header className="bg-navy lg:bg-transparent px-4 sm:px-8 py-4 lg:py-5 flex items-center justify-between shadow-md lg:shadow-none z-10 relative safe-area-top no-print">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="sm:hidden text-surface hover:text-gold transition-colors p-1"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <ShieldCheck className="h-8 w-8 text-gold lg:hidden" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-navy hidden lg:block tracking-tight">
          {t("nav.overview")}
        </h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:flex relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              role="searchbox"
              className="block w-64 pl-10 pr-3 py-2 border border-gray-200 lg:border-none rounded-full bg-white lg:bg-black/20 text-navy lg:text-gray-300 placeholder-gray-400 lg:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold text-sm shadow-sm"
              placeholder={t("nav.searchPlaceholder")}
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchQuery("");
                if (e.key === "Enter" && searchResults.length > 0) {
                  navigate(searchResults[0].href);
                  setSearchQuery("");
                }
              }}
              onBlur={() => setTimeout(() => setSearchQuery(""), 150)}
            />
            {showDropdown && searchResults.length > 0 && (
              <div
                role="menu"
                className="absolute left-0 right-0 top-full mt-1 z-50 w-64 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              >
                {searchResults.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    role="menuitem"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(item.href);
                      setSearchQuery("");
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent"
                  >
                    <item.icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {t(item.i18nKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <ThemeToggle />
        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl p-1"
              aria-label="User menu"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-surface lg:text-navy">
                  {user?.name?.split(" ")[0] ?? user?.email?.split("@")[0]}
                </div>
                <div className="text-xs text-gray-300 lg:text-gray-500 capitalize">
                  {user?.role ? formatRole(user.role) : ""}
                </div>
              </div>
              <UserCircle className="h-10 w-10 text-surface lg:text-navy" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel inset>
              <div className="font-bold text-navy truncate">{user?.name ?? "Account"}</div>
              <div className="text-xs text-gray-400 font-normal truncate">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link to="/account/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {t("nav.profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link to="/account/email" className="flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {t("user.email.update.title")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onClick={handleLogout}
              disabled={logout.isPending}
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {logout.isPending ? t("auth.logout.signingOut") : t("auth.logout.confirm.action")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    {dialog}
    </>
  );
}
