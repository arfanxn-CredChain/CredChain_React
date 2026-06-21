import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Ban, FileBadge, RefreshCw, Search } from "lucide-react";
import { useCredentials } from "./api/useCredentials";
import { useRevokeCredentials } from "./api/useRevokeCredentials";
import { useReExtractCredentials } from "./api/useReExtractCredentials";
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
import type { CredentialDTO } from "@shared/types/api";

const PAGE_SIZE = 30;

type BulkMode = "revoke" | "reextract" | null;

export function CredentialList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState<BulkMode>(null);
  const [sorts] = useState<string[]>(["-issued_at"]);
  const debouncedSearch = useDebouncedValue(search, 300);

  const currentUser = useStore((s) => s.user);
  const canManage = canAccessAny(currentUser?.role, [Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]);

  const { data, isLoading, isError } = useCredentials({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sorts,
    includes: ["holder", "issuer", "revoker"],
  });

  const revoke = useRevokeCredentials();
  const reExtract = useReExtractCredentials();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const credentials = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isEmpty = !isLoading && credentials.length === 0;

  const isRevokable = (cred: CredentialDTO) => cred.revoked_at === null;
  const isReExtractable = (cred: CredentialDTO) => cred.extract_status === "failed";

  const eligibleRevokeIds = Array.from(selectedIds).filter((id) =>
    credentials.some((c) => c.id === id && isRevokable(c)),
  );
  const eligibleReExtractIds = Array.from(selectedIds).filter((id) =>
    credentials.some((c) => c.id === id && isReExtractable(c)),
  );

  const enterMode = (mode: BulkMode) => {
    setBulkMode(mode);
    setSelectedIds(new Set());
  };

  const exitMode = () => {
    setBulkMode(null);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkRevoke = async () => {
    if (eligibleRevokeIds.length === 0) return;

    const ok = await confirm({
      title: t("cred.revoke.confirmTitle", { count: eligibleRevokeIds.length }),
      description: t("cred.revoke.confirmBody"),
      confirmLabel: t("cred.revoke.confirmAction"),
      tone: "destructive",
    });
    if (!ok) return;

    revoke.mutate(eligibleRevokeIds, {
      onSuccess: () => exitMode(),
    });
  };

  const handleBulkReExtract = async () => {
    if (eligibleReExtractIds.length === 0) return;

    const ok = await confirm({
      title: t("cred.reextract.confirmTitle", { count: eligibleReExtractIds.length }),
      description: t("cred.reextract.confirmBody"),
      confirmLabel: t("cred.reextract.confirmAction"),
    });
    if (!ok) return;

    reExtract.mutate(eligibleReExtractIds, {
      onSuccess: () => exitMode(),
    });
  };

  const renderActions = () => {
    if (!canManage) {
      return (
        <Button asChild variant="gold">
          <Link to="/credentials/issue">
            <FileBadge className="h-4 w-4" />
            {t("cred.list.issueCta")}
          </Link>
        </Button>
      );
    }

    if (bulkMode === "revoke") {
      return (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button variant="outline" onClick={exitMode} disabled={revoke.isPending}>
            {t("cred.card.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleBulkRevoke}
            disabled={eligibleRevokeIds.length === 0 || revoke.isPending}
          >
            <Ban className="h-4 w-4" />
            {t("cred.card.revokeSelectedCount", { count: eligibleRevokeIds.length })}
          </Button>
        </div>
      );
    }

    if (bulkMode === "reextract") {
      return (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button variant="outline" onClick={exitMode} disabled={reExtract.isPending}>
            {t("cred.card.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkReExtract}
            disabled={eligibleReExtractIds.length === 0 || reExtract.isPending}
          >
            <RefreshCw className="h-4 w-4" />
            {t("cred.card.reExtractSelectedCount", { count: eligibleReExtractIds.length })}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <Button variant="outline" onClick={() => enterMode("revoke")}>
          <Ban className="h-4 w-4" />
          {t("cred.card.revokeMode")}
        </Button>
        <Button variant="outline" onClick={() => enterMode("reextract")}>
          <RefreshCw className="h-4 w-4" />
          {t("cred.card.reExtractMode")}
        </Button>
        <Button asChild variant="gold" className="w-full sm:w-auto">
          <Link to="/credentials/issue">
            <FileBadge className="h-4 w-4" />
            {t("cred.list.issueCta")}
          </Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={t("cred.list.title")}
        description={t("cred.list.description")}
        action={<RoleGate allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}>{renderActions()}</RoleGate>}
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
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((cred) => (
                <CredentialCard
                  key={cred.id}
                  credential={cred}
                  selectionMode={bulkMode}
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
