import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore } from "@app/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { cn } from "@shared/lib/cn";

const LOCALES = [
  { code: "en" as const, label: "English", short: "EN" },
  { code: "id" as const, label: "Bahasa Indonesia", short: "ID" },
];

interface LanguageSwitcherProps {
  variant?: "dark" | "light";
}

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const setLocale = useStore((s) => s.setLocale);
  const currentLocale = useStore((s) => s.locale);

  const change = (lng: "en" | "id") => {
    void i18n.changeLanguage(lng);
    setLocale(lng);
  };

  const triggerColor =
    variant === "dark" ? "text-surface hover:text-gold" : "text-navy hover:text-gold";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-semibold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-1",
          triggerColor,
        )}
        aria-label="Change language"
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
        {LOCALES.find((l) => l.code === currentLocale)?.short ?? "EN"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => change(locale.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currentLocale === locale.code && "font-bold",
            )}
          >
            {locale.label}
            <span className="text-xs font-mono text-gray-400">{locale.short}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
