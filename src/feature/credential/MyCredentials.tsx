import { useTranslation } from "react-i18next";
import { FileBadge } from "lucide-react";
import { useLoadMore } from "@shared/hooks/useLoadMore";
import { api } from "@shared/api/client";
import type { CredentialDTO } from "@shared/types/api";
import { PageHeader } from "@shared/components/PageHeader";
import { LoadMoreBar } from "@shared/components/LoadMoreBar";
import { EmptyState } from "@shared/components/EmptyState";
import { Skeleton } from "@ui/skeleton";
import { CredentialCard } from "./components/CredentialCard";

export function MyCredentials() {
  const { t } = useTranslation();

  const { items: credentials, total, isLoading, isError, isFetchingNextPage, hasMore, loadMore } =
    useLoadMore<CredentialDTO>(
      ["my-credentials"],
      async (page, limit) => {
        const q: Record<string, unknown> = {};
        q.page = page;
        q.limit = limit;
        q.sorts = ["-issued_at"];
        q.includes = ["holder", "issuer", "revoker"];
        const response = await api.get("/users/self/credentials", { params: q });
        return response.data;
      },
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title={t("cred.mine.title")} description={t("cred.mine.description")} />

      {isError ? (
        <EmptyState
          icon={FileBadge}
          title={t("cred.mine.error.title")}
          description={t("cred.mine.error.body")}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : credentials.length === 0 ? (
        <EmptyState
          icon={FileBadge}
          title={t("cred.mine.empty.title")}
          description={t("cred.mine.empty.body")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {credentials.map((cred) => (
              <CredentialCard key={cred.id} credential={cred} />
            ))}
          </div>
          <LoadMoreBar
            total={total}
            hasMore={hasMore}
            isLoading={isFetchingNextPage}
            onLoadMore={loadMore}
            countLabel={t("cred.mine.count", { count: total })}
          />
        </>
      )}
    </div>
  );
}