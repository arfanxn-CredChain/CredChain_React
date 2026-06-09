import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, Search, User, Mail, LogOut, HelpCircle, Info } from "lucide-react";
import { useStore } from "@app/store";
import { formatRole } from "@shared/auth/role";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useLogout } from "@feature/auth/api/useLogout";
import { useConfirm } from "@ui/confirm-dialog";
import { useNavSearch } from "@shared/hooks/useNavSearch";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { cn } from "@shared/lib/cn";
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
  const setLocale = useStore((s) => s.setLocale);
  const currentLocale = useStore((s) => s.locale);
  const logout = useLogout();
  const { t, i18n } = useTranslation();
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

  const changeLocale = (lng: "en" | "id") => {
    void i18n.changeLanguage(lng);
    setLocale(lng);
  };

  return (
    <>
      <header className="bg-navy sm:bg-transparent px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between shadow-md sm:shadow-none z-10 relative safe-area-top no-print min-h-[64px] sm:min-h-[72px]">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="sm:hidden text-surface hover:text-gold transition-colors p-1"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
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
                className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-full
                  bg-gray-50 text-navy placeholder-gray-400
                  focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent
                  transition-colors text-sm shadow-sm"
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

        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

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
              {user && <UserAvatar user={user} size="md" />}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel inset>
              <div className="font-bold text-navy truncate normal-case tracking-normal">
                {user?.name ?? "Account"}
              </div>
              <div className="text-xs text-gray-400 font-normal truncate normal-case tracking-normal">
                {user?.email}
              </div>
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
            <DropdownMenuItem asChild>
              <Link to="/help" className="flex items-center gap-2 cursor-pointer">
                <HelpCircle className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {t("nav.help")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/about" className="flex items-center gap-2 cursor-pointer">
                <Info className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {t("nav.about")}
              </Link>
            </DropdownMenuItem>

            <div className="md:hidden">
              <DropdownMenuSeparator />
              <DropdownMenuLabel inset className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t("settings.language.heading")}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  changeLocale("en");
                }}
                className="cursor-pointer"
              >
                <span className={cn("flex-1", currentLocale === "en" && "font-bold")}>English</span>
                <span className="text-xs font-mono text-gray-400">EN</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  changeLocale("id");
                }}
                className="cursor-pointer"
              >
                <span className={cn("flex-1", currentLocale === "id" && "font-bold")}>Bahasa Indonesia</span>
                <span className="text-xs font-mono text-gray-400">ID</span>
              </DropdownMenuItem>
            </div>

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
