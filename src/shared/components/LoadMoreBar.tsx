import { useTranslation } from "react-i18next";
import { Button } from "@ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreBarProps {
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  countLabel: string;
}

export function LoadMoreBar({
  total: _total,
  hasMore,
  isLoading,
  onLoadMore,
  countLabel,
}: LoadMoreBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 border-t border-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <span className="text-xs text-gray-500 sm:text-sm">{countLabel}</span>
      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={onLoadMore}
          className="sm:self-end"
        >
          {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {t("common.loadMore")}
        </Button>
      )}
    </div>
  );
}
