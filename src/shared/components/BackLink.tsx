import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "@app/store";
import { cn } from "@shared/lib/cn";

interface BackLinkProps {
  className?: string;
}

export function BackLink({ className }: BackLinkProps) {
  const { t } = useTranslation();
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? "/dashboard" : "/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-gray-500",
        "transition-colors hover:text-navy",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {t("common.back")}
    </button>
  );
}
