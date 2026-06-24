import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { FileBadge, User, AlertTriangle } from "lucide-react";
import { useStore } from "@app/store";
import { Role, canAccessAny } from "@shared/auth/role";
import { RoleGate } from "@shared/auth/guards";
import { useOverview } from "./api/useOverview";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { DetailRow } from "@shared/components/DetailRow";
import { Card, CardHeader, CardTitle } from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

interface StatItemProps {
  value: number;
  label: string;
  note?: string;
}

function StatItem({ value, label, note }: StatItemProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-base p-4 text-center">
      <div className="font-display text-2xl font-bold text-navy">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs font-sans text-gray-500">
        {label}
        {note && <span className="ml-1 text-gray-400 italic">{note}</span>}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function relativeTime(
  iso: string,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return t("overview.relativeTime.seconds");
  if (minutes < 60) return t("overview.relativeTime.minutes", { n: minutes });
  if (hours < 24) return t("overview.relativeTime.hours", { n: hours });
  if (days < 7) return t("overview.relativeTime.days", { n: days });
  return t("overview.relativeTime.weeks", { n: weeks });
}

export function Overview() {
  const user = useStore((s) => s.user);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isIssuerPlus = canAccessAny(user?.role, [
    Role.ISSUER,
    Role.ADMIN,
    Role.SUPER_ADMIN,
  ]);

  const [dateFrom, setDateFrom] = useState(
    searchParams.get("dateFrom") ?? "",
  );
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "");
  const debouncedFrom = useDebouncedValue(dateFrom, 300);
  const debouncedTo = useDebouncedValue(dateTo, 300);

  const filters: string[] = [];
  if (debouncedFrom && debouncedTo) {
    filters.push(`date..${debouncedFrom},${debouncedTo}`);
  } else if (debouncedFrom) {
    filters.push(`date..${debouncedFrom},`);
  } else if (debouncedTo) {
    filters.push(`date..,${debouncedTo}`);
  }

  const { data, isLoading, isError, refetch } = useOverview(
    filters.length > 0 ? { filters } : undefined,
  );

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (from) next.set("dateFrom", from);
      else next.delete("dateFrom");
      if (to) next.set("dateTo", to);
      else next.delete("dateTo");
      return next;
    });
  };

  const handleClearDates = () => {
    setDateFrom("");
    setDateTo("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("dateFrom");
      next.delete("dateTo");
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={t("overview.welcome", {
          name: user?.name?.split(" ")[0] ?? t("overview.fallbackName"),
        })}
        description={t("overview.description")}
        action={
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                {t("overview.dateFilter.from")}
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateChange(e.target.value, dateTo)}
                className="w-36"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                {t("overview.dateFilter.to")}
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                className="w-36"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDates}
                className="mb-0.5"
              >
                {t("overview.dateFilter.clear")}
              </Button>
            )}
          </div>
        }
      />

      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title={t("overview.error.title")}
          description={t("overview.error.body")}
          action={
            <Button variant="primary" onClick={() => refetch()}>
              {t("overview.error.retry")}
            </Button>
          }
        />
      ) : isLoading ? (
        <>
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </>
      ) : data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("overview.credentialCounts")}</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4 px-6 pb-6 sm:grid-cols-3 lg:grid-cols-5 sm:px-8 sm:pb-8">
              <StatItem
                value={data.credential_counts.total}
                label={t("overview.counts.total")}
              />
              <StatItem
                value={data.credential_counts.active}
                label={t("overview.counts.active")}
              />
              <StatItem
                value={data.credential_counts.revoked}
                label={t("overview.counts.revoked")}
              />
              <StatItem
                value={data.credential_counts.pending}
                label={t("overview.counts.pending")}
              />
              <StatItem
                value={data.credential_counts.failed}
                label={t("overview.counts.failed")}
              />
            </div>
          </Card>

          <RoleGate
            allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}
          >
            {data.user_counts && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("overview.userCounts")}</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-2 gap-4 px-6 pb-6 sm:grid-cols-3 lg:grid-cols-4 sm:px-8 sm:pb-8">
                  <StatItem
                    value={data.user_counts.total}
                    label={t("overview.counts.total")}
                  />
                  <StatItem
                    value={data.user_counts.holder}
                    label={t("overview.counts.holder")}
                  />
                  <StatItem
                    value={data.user_counts.issuer}
                    label={t("overview.counts.issuer")}
                  />
                  <StatItem
                    value={data.user_counts.admin}
                    label={t("overview.counts.admin")}
                  />
                  <StatItem
                    value={data.user_counts.super_admin}
                    label={t("overview.counts.superAdmin")}
                    note={t("overview.superAdminAlwaysOne")}
                  />
                  <StatItem
                    value={data.user_counts.active}
                    label={t("overview.counts.activeUsers")}
                  />
                  <StatItem
                    value={data.user_counts.trashed}
                    label={t("overview.counts.trashed")}
                  />
                </div>
              </Card>
            )}
          </RoleGate>

          <Card>
            <CardHeader>
              <CardTitle>{t("overview.recents")}</CardTitle>
            </CardHeader>
            <div className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-8">
              <div>
                <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("overview.recents.activeCredentials")}
                </h4>
                {data.recents.active_credentials.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400 italic">
                    {t("overview.recents.empty")}
                  </p>
                ) : (
                  data.recents.active_credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-center gap-3 border-b border-gray-50 py-3 last:border-0"
                    >
                      <FileBadge
                        className="h-5 w-5 shrink-0 text-gray-300"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">
                          {cred.name || t("overview.recents.noName")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cred.holder ? `${cred.holder.name} · ` : ""}
                          {t("overview.recents.issuedBy", {
                            issuer:
                              cred.issuer?.name ?? t("overview.recents.noName"),
                          })}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-gray-400">
                        {relativeTime(cred.issued_at, t)}
                      </time>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("overview.recents.revokedCredentials")}
                </h4>
                {data.recents.revoked_credentials.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400 italic">
                    {t("overview.recents.empty")}
                  </p>
                ) : (
                  data.recents.revoked_credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-center gap-3 border-b border-gray-50 py-3 last:border-0"
                    >
                      <FileBadge
                        className="h-5 w-5 shrink-0 text-gray-300"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">
                          {cred.name || t("overview.recents.noName")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cred.holder ? `${cred.holder.name} · ` : ""}
                          {t("overview.recents.revokedBy", {
                            revoker:
                              cred.revoker?.name ??
                              t("overview.recents.noName"),
                          })}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-gray-400">
                        {cred.revoked_at
                          ? relativeTime(cred.revoked_at, t)
                          : ""}
                      </time>
                    </div>
                  ))
                )}
              </div>

              {data.recents.stored_users &&
                data.recents.stored_users.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                      {t("overview.recents.storedUsers")}
                    </h4>
                    {data.recents.stored_users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 border-b border-gray-50 py-3 last:border-0"
                      >
                        <User
                          className="h-5 w-5 shrink-0 text-gray-300"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-navy">
                            {u.name || t("overview.recents.noName")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {u.role} ·{" "}
                            {t("overview.recents.joined", {
                              date: formatDate(u.created_at),
                            })}
                          </p>
                        </div>
                        <time className="shrink-0 text-xs text-gray-400">
                          {relativeTime(u.created_at, t)}
                        </time>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </Card>

          <RoleGate
            allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}
          >
            {data.chain_details && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("overview.chainDetails")}</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
                  <DetailRow
                    label={t("overview.chainDetails.authorityContract")}
                    value={
                      <code className="font-mono text-xs text-navy">
                        {data.chain_details.authority_contract}
                      </code>
                    }
                  />
                  <DetailRow
                    label={t("overview.chainDetails.registryContract")}
                    value={
                      <code className="font-mono text-xs text-navy">
                        {data.chain_details.registry_contract}
                      </code>
                    }
                  />
                  <DetailRow
                    label={t("overview.chainDetails.lastBlock")}
                    value={
                      data.chain_details.last_block === 0
                        ? t("overview.chainDetails.unavailable")
                        : data.chain_details.last_block.toLocaleString()
                    }
                  />
                </div>
              </Card>
            )}
          </RoleGate>
        </>
      ) : null}
    </div>
  );
}
