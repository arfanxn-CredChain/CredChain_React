import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  User,
  AlertTriangle,
  FileBadge,
  Ban,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
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
import { cn } from "@shared/lib/cn";
import { DateFilterMenu } from "./components/DateFilterMenu";
import type { OverviewRecentCredential, OverviewRecentUser } from "@shared/types/api";

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
        "flex h-40 flex-col items-center justify-center rounded-2xl border p-6",
        isAccent
          ? "border-gold/20 bg-gold/10 shadow-sm shadow-gold/10"
          : "border-gray-100 bg-surface shadow-sm",
      )}
    >
      <span className="font-display text-4xl font-extrabold tracking-tight text-navy">
        {value.toLocaleString()}
      </span>
      <span className="mt-2 text-center text-xs font-bold tracking-wider text-gray-400 uppercase">
        {label}
        {note && (
          <span className="ml-1 block font-normal normal-case text-gray-400/70">
            {note}
          </span>
        )}
      </span>
    </div>
  );
}

/* ── skeleton stat ── */

function StatSkeleton() {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-surface p-6 shadow-sm">
      <Skeleton className="h-10 w-20 rounded-lg" />
      <Skeleton className="h-4 w-24 rounded-md" />
    </div>
  );
}

/* ── recent section ── */

interface RecentSectionProps {
  title: string;
  icon: LucideIcon;
  tone?: "gold" | "error" | "navy";
  count: number;
  children: React.ReactNode;
}

const toneBlock = {
  gold: "bg-gold/10 text-gold",
  error: "bg-error/10 text-error",
  navy: "bg-navy/10 text-navy",
};

function RecentSection({ title, icon: Icon, tone = "gold", count, children }: RecentSectionProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className={cn("rounded-lg p-1.5", toneBlock[tone])}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <h4 className="flex-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
          {title}
        </h4>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ── recent rows ── */

function CredentialRow({
  cred,
  variant,
  t,
}: {
  cred: OverviewRecentCredential;
  variant: "active" | "revoked";
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const isRevoked = variant === "revoked";
  const Icon = isRevoked ? Ban : FileBadge;
  const tone = isRevoked ? ("error" as const) : ("gold" as const);
  const actor = isRevoked ? cred.revoker : cred.issuer;
  const key = isRevoked ? "overview.recents.revokedBy" : "overview.recents.issuedBy";
  const time = isRevoked && cred.revoked_at ? relativeTime(cred.revoked_at, t) : relativeTime(cred.issued_at, t);

  return (
    <div className="group -mx-2 flex items-start gap-4 rounded-lg border-t border-gray-100 px-2 py-3 transition-colors first:border-t-0 hover:bg-gray-50/70">
      <div className={cn("mt-0.5 shrink-0 rounded-lg p-1.5", toneBlock[tone])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-navy">
          {cred.name || t("overview.recents.noName")}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {cred.holder ? `${cred.holder.name} · ` : ""}
          {t(key, { [isRevoked ? "revoker" : "issuer"]: actor?.name ?? t("overview.recents.noName") })}
        </p>
      </div>
      <time
        dateTime={isRevoked && cred.revoked_at ? cred.revoked_at : cred.issued_at}
        className="mt-0.5 shrink-0 text-xs text-gray-400"
      >
        {time}
      </time>
    </div>
  );
}

function UserRow({
  user,
  t,
}: {
  user: OverviewRecentUser;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="group -mx-2 flex items-start gap-4 rounded-lg border-t border-gray-100 px-2 py-3 transition-colors first:border-t-0 hover:bg-gray-50/70">
      <div className="mt-0.5 shrink-0 rounded-lg bg-navy/10 p-1.5">
        <User className="h-4 w-4 text-navy" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-navy">
          {user.name || t("overview.recents.noName")}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {t("overview.recents.joined", { date: formatDate(user.created_at) })}
        </p>
      </div>
      <time dateTime={user.created_at} className="mt-0.5 shrink-0 text-xs text-gray-400">
        {relativeTime(user.created_at, t)}
      </time>
    </div>
  );
}

/* ── main page ── */

export function Overview() {
  const user = useStore((s) => s.user);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "");
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={t("overview.welcome", {
          name: user?.name?.split(" ")[0] ?? t("overview.fallbackName"),
        })}
        description={t("overview.description")}
        action={
          <DateFilterMenu
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateChange}
          />
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </>
      ) : data ? (
        <>
          {/* ── credential counts ── */}
          <Card className="relative overflow-hidden p-6 shadow-lg ring-1 shadow-gold/20 ring-gold/10 sm:p-8">
            <DecorBlob tone="gold" position="top-right" size="lg" />
            <div className="relative z-10">
              <EyebrowLabel className="mb-6">
                {t("overview.credentialCounts")}
              </EyebrowLabel>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
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
              <Card className="relative overflow-hidden p-6 shadow-lg ring-1 shadow-gold/20 ring-gold/10 sm:p-8">
                <DecorBlob tone="gold" position="top-right" size="lg" />
                <div className="relative z-10">
                  <EyebrowLabel className="mb-6">
                    {t("overview.userCounts")}
                  </EyebrowLabel>
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
                      accent="gold"
                    />
                    <StatItem
                      value={data.user_counts.trashed}
                      label={t("overview.counts.trashed")}
                    />
                  </div>
                </div>
              </Card>
            )}
          </RoleGate>

          {/* ── recent activity ── */}
          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-6">
              {t("overview.recents")}
            </EyebrowLabel>
            <div className="space-y-8">
              <RecentSection
                title={t("overview.recents.activeCredentials")}
                icon={FileBadge}
                tone="gold"
                count={data.recents.active_credentials.length}
              >
                {data.recents.active_credentials.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400 italic">
                    {t("overview.recents.empty")}
                  </p>
                ) : (
                  data.recents.active_credentials.map((cred) => (
                    <CredentialRow
                      key={cred.id}
                      cred={cred}
                      variant="active"
                      t={t}
                    />
                  ))
                )}
              </RecentSection>

              <RecentSection
                title={t("overview.recents.revokedCredentials")}
                icon={Ban}
                tone="error"
                count={data.recents.revoked_credentials.length}
              >
                {data.recents.revoked_credentials.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400 italic">
                    {t("overview.recents.empty")}
                  </p>
                ) : (
                  data.recents.revoked_credentials.map((cred) => (
                    <CredentialRow
                      key={cred.id}
                      cred={cred}
                      variant="revoked"
                      t={t}
                    />
                  ))
                )}
              </RecentSection>

              {data.recents.stored_users && data.recents.stored_users.length > 0 && (
                <RecentSection
                  title={t("overview.recents.storedUsers")}
                  icon={User}
                  tone="navy"
                  count={data.recents.stored_users.length}
                >
                  {data.recents.stored_users.map((u) => (
                    <UserRow key={u.id} user={u} t={t} />
                  ))}
                </RecentSection>
              )}
            </div>
          </Card>

          {/* ── chain details ── */}
          <RoleGate allowed={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]}>
            {data.chain_details && (
              <Card className="relative overflow-hidden p-6 shadow-lg ring-1 shadow-gold/20 ring-gold/10 sm:p-8">
                <DecorBlob tone="gold" position="top-right" size="lg" />
                <div className="relative z-10">
                  <EyebrowLabel className="mb-6">
                    {t("overview.chainDetails")}
                  </EyebrowLabel>
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <EyebrowLabel
                        as="dt"
                        className="flex items-center gap-1.5"
                      >
                        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("overview.chainDetails.authorityContract")}
                      </EyebrowLabel>
                      <dd>
                        <MonoId
                          value={data.chain_details.authority_contract}
                          mode="address"
                          className="text-sm text-navy"
                        />
                      </dd>
                    </div>
                    <div>
                      <EyebrowLabel
                        as="dt"
                        className="flex items-center gap-1.5"
                      >
                        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("overview.chainDetails.registryContract")}
                      </EyebrowLabel>
                      <dd>
                        <MonoId
                          value={data.chain_details.registry_contract}
                          mode="address"
                          className="text-sm text-navy"
                        />
                      </dd>
                    </div>
                    <div>
                      <EyebrowLabel
                        as="dt"
                        className="flex items-center gap-1.5"
                      >
                        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("overview.chainDetails.lastBlock")}
                      </EyebrowLabel>
                      <dd className="font-display text-2xl font-bold tracking-tight text-navy">
                        {data.chain_details.last_block === 0
                          ? t("overview.chainDetails.unavailable")
                          : data.chain_details.last_block.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Card>
            )}
          </RoleGate>
        </>
      ) : null}
    </div>
  );
}
