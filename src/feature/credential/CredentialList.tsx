import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Ban, FileBadge, Search } from "lucide-react";
import { useCredentials } from "./api/useCredentials";
import { useRevokeCredentials } from "./api/useRevokeCredentials";
import { useStore } from "@app/store";
import { Role, canAccessAny } from "@shared/auth/role";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";

import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { RoleGate } from "@shared/auth/guards";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Input } from "@ui/input";
import { Skeleton } from "@ui/skeleton";
import { useConfirm } from "@ui/confirm-dialog";
import { PaginationBar } from "@shared/components/PaginationBar";

import { CredentialCard } from "./components/CredentialCard";

const PAGE_SIZE = 30;

export function CredentialList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebouncedValue(search, 300);

  const currentUser = useStore((s) => s.user);
  const canIssue = canAccessAny(currentUser?.role, [Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]);

  const { data, isLoading, isError } = useCredentials({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const revoke = useRevokeCredentials();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const credentials = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isEmpty = !isLoading && credentials.length === 0;

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkRevoke = async () => {
    const ok = await confirm({
      title: t("cred.revoke.confirmTitle", { count: selectedIds.size }),
      description: t("cred.revoke.confirmBody"),
      confirmLabel: t("cred.revoke.confirmAction"),
      tone: "destructive",
    });
    if (!ok) return;

    revoke.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={t("cred.list.title")}
        description={t("cred.list.description")}
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <RoleGate allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkRevoke}
                  disabled={revoke.isPending}
                >
                  <Ban className="h-4 w-4" />
                  {t("cred.list.revokeSelectedCount", { count: selectedIds.size })}
                </Button>
              )}
              <Button asChild variant="gold">
                <Link to="/credentials/issue">
                  <FileBadge className="h-4 w-4" />
                  {t("cred.list.issueCta")}
                </Link>
              </Button>
            </RoleGate>
          </div>
        }
      />

      <Card className="p-0">
        <div className="flex items-center justify-between gap-4 border-b border-gray-50 p-4 sm:p-6">
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              leadingIcon={Search}
              placeholder={t("cred.list.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              aria-label={t("cred.list.searchAriaLabel")}
            />
          </div>
          {!isLoading && (
            <span className="text-xs font-bold tracking-wider whitespace-nowrap text-gray-400 uppercase">
              {t("cred.list.count", { count: total })}
            </span>
          )}
        </div>

        <div className="bg-gray-50/30 p-4 sm:p-6">
          {isError ? (
            <div className="p-12 text-center text-sm text-error">{t("cred.list.error")}</div>
          ) : isEmpty ? (
            <EmptyState
              icon={FileBadge}
              title={
                debouncedSearch
                  ? t("cred.list.empty.search.title")
                  : t("cred.list.empty.none.title")
              }
              description={
                debouncedSearch ? t("cred.list.empty.search.body") : t("cred.list.empty.none.body")
              }
              className="rounded-none border-0 bg-transparent shadow-none"
            />
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((cred) => (
                <CredentialCard
                  key={cred.id}
                  credential={cred}
                  selectable={canIssue}
                  isSelected={selectedIds.has(cred.id)}
                  onSelect={() => toggleSelection(cred.id)}
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            isLoading={isLoading}
          >
            <span className="text-sm text-gray-500">
              {t("cred.list.pagination.page", { page, total: totalPages })}
            </span>
          </PaginationBar>
        )}
      </Card>

      {confirmDialog}
    </div>
  );
}
