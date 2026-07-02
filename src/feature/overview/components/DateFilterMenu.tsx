import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { cn } from "@shared/lib/cn";

function toISODate(d: Date): string {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function today(): string {
  return toISODate(new Date());
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

function startOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return toISODate(d);
}

type PresetKey = "all" | "last7" | "last30" | "thisMonth" | "custom";

interface Preset {
  key: PresetKey;
  labelKey: string;
  range: [string, string];
}

const PRESETS: Preset[] = [
  { key: "all", labelKey: "overview.dateFilter.all", range: ["", ""] },
  {
    key: "last7",
    labelKey: "overview.dateFilter.last7Days",
    range: [daysAgo(7), today()],
  },
  {
    key: "last30",
    labelKey: "overview.dateFilter.last30Days",
    range: [daysAgo(30), today()],
  },
  {
    key: "thisMonth",
    labelKey: "overview.dateFilter.thisMonth",
    range: [startOfMonth(), today()],
  },
];

interface DateFilterMenuProps {
  dateFrom: string;
  dateTo: string;
  onChange: (from: string, to: string) => void;
}

export function DateFilterMenu({ dateFrom, dateTo, onChange }: DateFilterMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(dateFrom);
  const [customTo, setCustomTo] = useState(dateTo);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setCustomFrom(dateFrom);
      setCustomTo(dateTo);
    }
    setOpen(nextOpen);
  };

  const match = PRESETS.find((p) => p.range[0] === dateFrom && p.range[1] === dateTo);
  const activeKey: PresetKey = match?.key ?? "custom";

  const activeLabel =
    activeKey === "custom"
      ? t("overview.dateFilter.custom")
      : t(match?.labelKey ?? "overview.dateFilter.all");

  const selectPreset = (key: PresetKey) => {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    onChange(preset.range[0], preset.range[1]);
    setOpen(false);
  };

  const applyCustom = () => {
    onChange(customFrom, customTo);
    setOpen(false);
  };

  const clear = () => {
    onChange("", "");
    setOpen(false);
  };

  const inputIdFrom = "overview-date-from";
  const inputIdTo = "overview-date-to";

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <span className="hidden sm:inline">{t("overview.dateFilter.label")}</span>
          <span className="text-gray-500">:</span>
          <span className="max-w-[8rem] truncate">{activeLabel}</span>
          <ChevronDown className="ml-1 h-3 w-3 text-gray-400" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {PRESETS.map((preset) => {
          const active = activeKey === preset.key;
          return (
            <DropdownMenuItem
              key={preset.key}
              onClick={() => selectPreset(preset.key)}
              className="flex items-center justify-between"
            >
              <span className={cn(active && "font-bold text-navy")}>{t(preset.labelKey)}</span>
              {active && <Check className="h-4 w-4 text-gold" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <div className="space-y-3 p-2">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            {t("overview.dateFilter.custom")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor={inputIdFrom} className="block text-xs text-gray-500">
                {t("overview.dateFilter.from")}
              </label>
              <Input
                id={inputIdFrom}
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={inputIdTo} className="block text-xs text-gray-500">
                {t("overview.dateFilter.to")}
              </label>
              <Input
                id={inputIdTo}
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-2 text-xs"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={clear}>
              {t("overview.dateFilter.clear")}
            </Button>
            <Button variant="primary" size="sm" onClick={applyCustom}>
              {t("overview.dateFilter.apply")}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
