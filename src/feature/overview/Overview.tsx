import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { User, AlertTriangle, FileBadge, Ban } from "lucide-react";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { RoleGate } from "@shared/auth/guards";
import { useOverview } from "./api/useOverview";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { DecorBlob } from "@shared/components/DecorBlob";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { Card } from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@shared/lib/cn";

/* ── helpers ── */

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

/* ── stat item ── */

interface StatItemProps {
  value: number;
  label: string;
  accent?: "gold" | "navy";
  note?: string;
}

function StatItem({ value, label, accent, note }: StatItemProps) {
  const isAccent = accent === "gold";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border p-6 h-40",
        isAccent
          ? "border-gold/20 bg-gold/10 shadow-sm shadow-gold/10"
          : "border-gray-100 bg-surface shadow-sm",
      )}
    >
      <span className="font-display text-4xl font-extrabold tracking-tight text-navy">
        {value.toLocaleString()}
      </span>
      <span className="mt-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
        {label}
        {note && <span className="ml-1 normal-case text-gray-400/70 font-normal">{note}</span>}
      </span>
    </div>
  );
}

/* ── skeleton stat ── */

function StatSkeleton() {
  return <Skeleton className="h-40 rounded-2xl" />;
}

/* ── main page ── */

export function Overview() {
  const user = useStore((s) => s.user);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
          <Skeleton className="h-60 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </>
      ) : data ? (
        <>
          {/* ── credential counts ── */}
          <Card className="relative overflow-hidden p-6 shadow-lg ring-1 shadow-gold/20 ring-gold/10 sm:p-8">
            <DecorBlob tone="gold" position="top-right" size="lg" />
            <div className="relative z-10">
              <EyebrowLabel className="mb-6">{t("overview.credentialCounts")}</EyebrowLabel>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatItem
                  value={data.credential_counts.active}
                  label={t("overview.counts.active")}
                  accent="gold"
                />
                <StatItem
                  value={data.credential_counts.total}
                  label={t("overview.counts.total")}
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
            </div>
          </Card>

          {/* ── user counts ── */}
          <RoleGate allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}>
            {data.user_counts && (
              <Card className="p-6 sm:p-8">
                <EyebrowLabel className="mb-6">{t("overview.userCounts")}</EyebrowLabel>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

          {/* ── recent activity ── */}
          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-6">{t("overview.recents")}</EyebrowLabel>
            <div className="space-y-8">
              {/* active creds */}
              <div>
                <h4 className="mb-4 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("overview.recents.activeCredentials")}
                </h4>
                {data.recents.active_credentials.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400 italic">
                    {t("overview.recents.empty")}
                  </p>
                ) : (
                  data.recents.active_credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-start gap-4 border-t border-gray-50 py-3 first:border-t-0"
                    >
                      <div className="mt-0.5 shrink-0 rounded-lg bg-gold/10 p-1.5">
                        <FileBadge className="h-4 w-4 text-gold" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy">
                          {cred.name || t("overview.recents.noName")}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {cred.holder ? `${cred.holder.name} · ` : ""}
                          {t("overview.recents.issuedBy", {
                            issuer: cred.issuer?.name ?? t("overview.recents.noName"),
                          })}
                        </p>
                      </div>
                      <time className="mt-0.5 shrink-0 text-xs text-gray-400">
                        {relativeTime(cred.issued_at, t)}
                      </time>
                    </div>
                  ))
                )}
              </div>

              {/* revoked creds */}
              <div>
                <h4 className="mb-4 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("overview.recents.revokedCredentials")}
                </h4>
                {data.recents.revoked_credentials.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400 italic">
                    {t("overview.recents.empty")}
                  </p>
                ) : (
                  data.recents.revoked_credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-start gap-4 border-t border-gray-50 py-3 first:border-t-0"
                    >
                      <div className="mt-0.5 shrink-0 rounded-lg bg-error/10 p-1.5">
                        <Ban className="h-4 w-4 text-error" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy">
                          {cred.name || t("overview.recents.noName")}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {cred.holder ? `${cred.holder.name} · ` : ""}
                          {t("overview.recents.revokedBy", {
                            revoker: cred.revoker?.name ?? t("overview.recents.noName"),
                          })}
                        </p>
                      </div>
                      <time className="mt-0.5 shrink-0 text-xs text-gray-400">
                        {cred.revoked_at ? relativeTime(cred.revoked_at, t) : ""}
                      </time>
                    </div>
                  ))
                )}
              </div>

              {/* stored users */}
              {data.recents.stored_users && data.recents.stored_users.length > 0 && (
                <div>
                  <h4 className="mb-4 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    {t("overview.recents.storedUsers")}
                  </h4>
                  {data.recents.stored_users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-start gap-4 border-t border-gray-50 py-3 first:border-t-0"
                    >
                      <div className="mt-0.5 shrink-0 rounded-lg bg-navy/10 p-1.5">
                        <User className="h-4 w-4 text-navy" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy">
                          {u.name || t("overview.recents.noName")}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {u.role} · {new Date(u.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <time className="mt-0.5 shrink-0 text-xs text-gray-400">
                        {relativeTime(u.created_at, t)}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* ── chain details ── */}
          <RoleGate allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}>
            {data.chain_details && (
              <Card className="p-6 sm:p-8">
                <EyebrowLabel className="mb-6">{t("overview.chainDetails")}</EyebrowLabel>
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                      {t("overview.chainDetails.authorityContract")}
                    </dt>
                    <dd>
                      <MonoId
                        value={data.chain_details.authority_contract}
                        mode="address"
                        className="text-sm text-navy"
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                      {t("overview.chainDetails.registryContract")}
                    </dt>
                    <dd>
                      <MonoId
                        value={data.chain_details.registry_contract}
                        mode="address"
                        className="text-sm text-navy"
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                      {t("overview.chainDetails.lastBlock")}
                    </dt>
                    <dd className="font-display text-2xl font-bold tracking-tight text-navy">
                      {data.chain_details.last_block === 0
                        ? t("overview.chainDetails.unavailable")
                        : data.chain_details.last_block.toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </Card>
            )}
          </RoleGate>
        </>
      ) : null}
    </div>
  );
}
