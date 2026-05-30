import { Moon, Sun, Monitor } from "lucide-react";
import { useStore } from "@app/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { cn } from "@shared/lib/cn";

type Theme = "light" | "dark" | "system";

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const THEME_ICONS: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

interface ThemeToggleProps {
  variant?: "dark" | "light";
}

export function ThemeToggle({ variant = "light" }: ThemeToggleProps) {
  const theme = useStore((s) => s.theme) as Theme;
  const setTheme = useStore((s) => s.setTheme);
  const CurrentIcon = THEME_ICONS[theme];

  const triggerColor =
    variant === "dark" ? "text-surface hover:text-gold" : "text-navy hover:text-gold";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center justify-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-1",
          triggerColor,
        )}
        aria-label="Change theme"
      >
        <CurrentIcon className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              theme === value && "font-bold",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </span>
            {theme === value && <span className="text-xs text-gray-400">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
