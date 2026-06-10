import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@ui/button";
import { notify } from "@shared/lib/notify";
import { cn } from "@shared/lib/cn";

interface CopyInlineButtonProps {
  value: string;
  ariaLabel: string;
  className?: string;
}

export function CopyInlineButton({ value, ariaLabel, className }: CopyInlineButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      notify.success("user.copy.copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify.error("system.internal_error");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={copied ? t("user.copy.copied") : ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        void handleCopy();
      }}
      className={cn("h-6 w-6 shrink-0 text-gray-400 hover:text-navy", className)}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}
