import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@ui/button";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  children?: ReactNode;
}

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  isLoading = false,
  children,
}: PaginationBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 border-t border-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      {children}
      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          {t("common.previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
