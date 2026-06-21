import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileBadge } from "lucide-react";
import { useMyCredentials } from "./api/useMyCredentials";
import { PageHeader } from "@shared/components/PageHeader";
import { PaginationBar } from "@shared/components/PaginationBar";
import { EmptyState } from "@shared/components/EmptyState";
import { Skeleton } from "@ui/skeleton";
import { CredentialCard } from "./components/CredentialCard";

const PAGE_SIZE = 30;

export function MyCredentials() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMyCredentials({
    page,
    limit: PAGE_SIZE,
    sorts: ["-issued_at"],
    includes: ["holder", "issuer", "revoker"],
  });
  const credentials = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

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
          {totalPages > 1 && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}