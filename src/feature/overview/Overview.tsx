import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  User,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { useOverview } from "./api/useOverview";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { DecorBlob } from "@shared/components/DecorBlob";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { CopyInlineButton } from "@shared/components/CopyInlineButton";
import { UserContactBlock } from "@shared/components/UserContactBlock";
import { Card } from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { cn } from "@shared/lib/cn";
import { DateFilterMenu } from "./components/DateFilterMenu";
import type {
  OverviewRecentCredential,
  OverviewRecentUser,
  UserDTO,
  OverviewCredentialCounts,
  OverviewUserCounts,
  OverviewRecents,
  OverviewChainDetails,
} from "@shared/types/api";

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
  compact?: boolean;
  className?: string;
}

function StatItem({ value, label, accent, note, compact, className }: StatItemProps) {
  const isAccent = accent === "gold";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border",
        compact ? "h-28 p-4" : "h-40 p-6",
        isAccent
          ? "border-gold/20 bg-gold/10 shadow-sm shadow-gold/10"
          : "border-gray-100 bg-surface shadow-sm",
        className,
      )}
    >
      <span
        className={cn(
          "font-display font-extrabold tracking-tight text-navy",
          compact ? "text-3xl" : "text-4xl",
        )}
      >
        {value.toLocaleString()}
      </span>
      <span
        className={cn(
          "mt-2 text-center font-bold tracking-wider text-gray-400 uppercase",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
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

function StatSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-surface shadow-sm",
        compact ? "h-28 p-4" : "h-40 p-6",
      )}
    >
      <Skeleton className={cn("rounded-lg", compact ? "h-8 w-16" : "h-10 w-20")} />
      <Skeleton className={cn("rounded-md", compact ? "h-3 w-20" : "h-4 w-24")} />
    </div>
  );
}

/* ── recent section ── */

interface RecentSectionProps {
  title: string;
  icon: LucideIcon;
  tone?: "gold" | "error" | "navy" | "green";
  children: React.ReactNode;
}

const toneBlock = {
  gold: "bg-gold/10 text-gold",
  error: "bg-error/10 text-error",
  navy: "bg-navy/10 text-navy",
  green: "bg-green-100 text-green-700",
};

function RecentSection({ title, icon: Icon, tone = "gold", children }: RecentSectionProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className={cn("rounded-lg p-1.5", toneBlock[tone])}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <h4 className="flex-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
          {title}
        </h4>
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
  const navigate = useNavigate();
  const isRevoked = variant === "revoked";
  const actor = isRevoked ? cred.revoker : cred.issuer;
  const actorPrefix = isRevoked ? "revoker" : "issuer";
  const time = isRevoked && cred.revoked_at ? relativeTime(cred.revoked_at, t) : relativeTime(cred.issued_at, t);

  const handleClick = () => navigate(`/credentials/${cred.id}`);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group -mx-2 cursor-pointer rounded-lg border-t border-gray-100 px-2 py-3 transition-colors first:border-t-0 hover:bg-gray-50/70 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">
            {cred.name || t("overview.recents.noName")}
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <MonoId value={cred.id} mode="id" />
            <CopyInlineButton
              value={cred.id}
              ariaLabel={t("cred.copy.credentialId")}
              className="shrink-0"
            />
          </div>
          {cred.holder && (
            <div className="mt-2">
              <UserContactBlock
                user={cred.holder as UserDTO}
                fallbackId={cred.holder.id}
                copyPrefix="holder"
                labelType="full"
                blockLinks
              />
            </div>
          )}
          {actor && (
            <div className="mt-2">
              <UserContactBlock
                user={actor as UserDTO}
                fallbackId={actor.id}
                copyPrefix={actorPrefix}
                labelType="compact"
                tone={isRevoked ? "error" : "default"}
                blockLinks
              />
            </div>
          )}
        </div>
        <time
          dateTime={isRevoked && cred.revoked_at ? cred.revoked_at : cred.issued_at}
          className="mt-0.5 shrink-0 text-xs text-gray-400"
        >
          {time}
        </time>
      </div>
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
  const navigate = useNavigate();
  const handleClick = () => navigate(`/users/${user.id}`);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group -mx-2 flex cursor-pointer items-start gap-4 rounded-lg border-t border-gray-100 px-2 py-3 transition-colors first:border-t-0 hover:bg-gray-50/70 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
    >
      <div className="min-w-0 flex-1">
        <UserContactBlock
          user={user as UserDTO}
          fallbackId={user.id}
          copyPrefix="user"
          labelType="full"
          blockLinks
        >
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <span>{t("overview.recents.joined", { date: formatDate(user.created_at) })}</span>
          </div>
        </UserContactBlock>
      </div>
      <time dateTime={user.created_at} className="mt-0.5 shrink-0 text-xs text-gray-400">
        {relativeTime(user.created_at, t)}
      </time>
    </div>
  );
}

/* ── cards ── */

function CredentialCountsCard({
  counts,
  compact,
}: {
  counts: OverviewCredentialCounts;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card className="relative overflow-hidden p-6 shadow-lg ring-1 shadow-gold/20 ring-gold/10 sm:p-8">
      <DecorBlob tone="gold" position="top-right" size="lg" />
      <div className="relative z-10">
        <EyebrowLabel tone="navy" className="mb-6">
          {t("overview.credentialCounts")}
        </EyebrowLabel>
        <div
          className={cn(
            "grid",
            compact
              ? "grid-cols-2 gap-4"
              : "grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5",
          )}
        >
          <StatItem
            value={counts.active}
            label={t("overview.counts.active")}
            accent="gold"
            compact={compact}
            className={compact ? "col-span-2" : undefined}
          />
          <StatItem
            value={counts.total}
            label={t("overview.counts.total")}
            compact={compact}
          />
          <StatItem
            value={counts.revoked}
            label={t("overview.counts.revoked")}
            compact={compact}
          />
          <StatItem
            value={counts.pending}
            label={t("overview.counts.pending")}
            compact={compact}
          />
          <StatItem
            value={counts.failed}
            label={t("overview.counts.failed")}
            compact={compact}
          />
        </div>
      </div>
    </Card>
  );
}

function UserCountsCard({ counts }: { counts: OverviewUserCounts }) {
  const { t } = useTranslation();
  return (
    <Card className="relative overflow-hidden p-6 shadow-lg ring-1 shadow-gold/20 ring-gold/10 sm:p-8">
      <DecorBlob tone="gold" position="top-right" size="lg" />
      <div className="relative z-10">
        <EyebrowLabel tone="navy" className="mb-6">
          {t("overview.userCounts")}
        </EyebrowLabel>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatItem value={counts.total} label={t("overview.counts.total")} />
          <StatItem value={counts.holder} label={t("overview.counts.holder")} />
          <StatItem value={counts.issuer} label={t("overview.counts.issuer")} />
          <StatItem value={counts.admin} label={t("overview.counts.admin")} />
          <StatItem
            value={counts.super_admin}
            label={t("overview.counts.superAdmin")}
            note={t("overview.superAdminAlwaysOne")}
          />
          <StatItem
            value={counts.active}
            label={t("overview.counts.activeUsers")}
            accent="gold"
          />
          <StatItem value={counts.trashed} label={t("overview.counts.trashed")} />
        </div>
      </div>
    </Card>
  );
}

function RecentActivityCard({
  recents,
  showUsers = false,
}: {
  recents: OverviewRecents;
  showUsers?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card className="p-6 sm:p-8">
      <EyebrowLabel tone="navy" className="mb-6">
        {t("overview.recents")}
      </EyebrowLabel>
      <div className="space-y-6">
        <RecentSection
          title={t("overview.recents.activeCredentials")}
          icon={ShieldCheck}
          tone="green"
        >
          {recents.active_credentials.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400 italic">
              {t("overview.recents.empty")}
            </p>
          ) : (
            <>
              {recents.active_credentials.slice(0, 1).map((cred) => (
                <CredentialRow
                  key={cred.id}
                  cred={cred}
                  variant="active"
                  t={t}
                />
              ))}
              <div className="mt-3 flex justify-end">
                <Link
                  to="/credentials"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                >
                  {t("overview.recents.viewAllCredentials")}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </>
          )}
        </RecentSection>

        <RecentSection
          title={t("overview.recents.revokedCredentials")}
          icon={ShieldAlert}
          tone="error"
        >
          {recents.revoked_credentials.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400 italic">
              {t("overview.recents.empty")}
            </p>
          ) : (
            <>
              {recents.revoked_credentials.slice(0, 1).map((cred) => (
                <CredentialRow
                  key={cred.id}
                  cred={cred}
                  variant="revoked"
                  t={t}
                />
              ))}
              <div className="mt-3 flex justify-end">
                <Link
                  to="/credentials"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                >
                  {t("overview.recents.viewAllCredentials")}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </>
          )}
        </RecentSection>

        {showUsers && recents.stored_users && recents.stored_users.length > 0 && (
          <RecentSection
            title={t("overview.recents.storedUsers")}
            icon={User}
            tone="navy"
          >
            {recents.stored_users.slice(0, 1).map((u) => (
              <UserRow key={u.id} user={u} t={t} />
            ))}
            <div className="mt-3 flex justify-end">
              <Link
                to="/users"
                className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                {t("overview.recents.viewAllUsers")}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </RecentSection>
        )}
      </div>
    </Card>
  );
}

function ChainInfoCard({ details }: { details: OverviewChainDetails }) {
  const { t } = useTranslation();
  return (
    <Card className="relative overflow-hidden p-6 shadow-lg ring-1 shadow-gold/20 ring-gold/10 sm:p-8">
      <DecorBlob tone="gold" position="top-right" size="lg" />
      <div className="relative z-10">
        <EyebrowLabel tone="navy" className="mb-6">
          {t("overview.chainDetails")}
        </EyebrowLabel>
        <dl className="grid grid-cols-1 gap-6">
          <div>
            <EyebrowLabel
              as="dt"
              className="flex items-center gap-1.5"
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              {t("overview.chainDetails.authorityContract")}
            </EyebrowLabel>
            <dd className="flex items-center gap-2">
              <MonoId
                value={details.authority_contract}
                mode="address"
                className="text-sm text-navy"
              />
              <CopyInlineButton
                value={details.authority_contract}
                ariaLabel={t("overview.chainDetails.copyAuthority")}
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
            <dd className="flex items-center gap-2">
              <MonoId
                value={details.registry_contract}
                mode="address"
                className="text-sm text-navy"
              />
              <CopyInlineButton
                value={details.registry_contract}
                ariaLabel={t("overview.chainDetails.copyRegistry")}
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
              {details.last_block === 0
                ? t("overview.chainDetails.unavailable")
                : details.last_block.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
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
        user?.role === Role.HOLDER ? (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <CredentialCountsCard counts={data.credential_counts} compact />
            <RecentActivityCard recents={data.recents} />
          </div>
        ) : (
          <div className="space-y-6">
            <CredentialCountsCard counts={data.credential_counts} compact />
            {data.user_counts && <UserCountsCard counts={data.user_counts} />}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
              <RecentActivityCard recents={data.recents} showUsers />
              {data.chain_details && <ChainInfoCard details={data.chain_details} />}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
