import { useState } from "react";
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

import { CredentialCard } from "./components/CredentialCard";

const PAGE_SIZE = 30;

export function CredentialList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebouncedValue(search, 300);

  const currentUser = useStore((s) => s.user);
  const canIssue = canAccessAny(currentUser?.role, [
    Role.ISSUER,
    Role.ADMIN,
    Role.SUPER_ADMIN,
  ]);

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
      title: `Revoke ${selectedIds.size} credential${selectedIds.size === 1 ? "" : "s"}?`,
      description:
        "This action revokes the credential on-chain and cannot be undone. Holders will lose verification.",
      confirmLabel: "Revoke",
      tone: "destructive",
    });
    if (!ok) return;

    revoke.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Credentials Ledger"
        description="Review all issued and revoked verifiable credentials across the network."
        action={
          <div className="flex flex-col sm:flex-row gap-3">
            <RoleGate allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkRevoke}
                  disabled={revoke.isPending}
                >
                  <Ban className="h-4 w-4" />
                  Revoke Selected ({selectedIds.size})
                </Button>
              )}
              <Button asChild variant="gold">
                <Link to="/credentials/issue">
                  <FileBadge className="h-4 w-4" />
                  Issue New
                </Link>
              </Button>
            </RoleGate>
          </div>
        }
      />

      <Card className="p-0">
        <div className="p-4 sm:p-6 border-b border-gray-50 flex justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              leadingIcon={Search}
              placeholder="Search by ID, type, or title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              aria-label="Search credentials"
            />
          </div>
          {!isLoading && (
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              {total.toLocaleString()} record{total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-gray-50/30">
          {isError ? (
            <div className="p-12 text-center text-error text-sm">
              Failed to load credentials. Please try again.
            </div>
          ) : isEmpty ? (
            <EmptyState
              icon={FileBadge}
              title={
                debouncedSearch
                  ? "No credentials match your search"
                  : "No credentials yet"
              }
              description={
                debouncedSearch
                  ? "Try a different search term."
                  : "Issued credentials will appear here."
              }
              className="border-0 shadow-none rounded-none bg-transparent"
            />
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-50">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {confirmDialog}
    </div>
  );
}
