import { Globe, ShieldCheck, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore } from "@app/store";
import { Card } from "@ui/card";
import { PageHeader } from "@shared/components/PageHeader";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { CopyInlineButton } from "@shared/components/CopyInlineButton";
import { DecorBlob } from "@shared/components/DecorBlob";
import { UserRoleBadge } from "@shared/components/UserRoleBadge";

export function Settings() {
  const user = useStore((s) => s.user);
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={t("settings.title")} description={t("settings.description")} />

      <Card className="relative overflow-hidden p-6 shadow-lg ring-1 shadow-gold/20 ring-gold/10 sm:p-8">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative z-10">
          <EyebrowLabel className="mb-4">{t("settings.account.heading")}</EyebrowLabel>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                {t("settings.account.name")}
              </dt>
              <dd className="font-display text-2xl font-bold tracking-tight text-navy">
                {user?.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                {t("settings.account.email")}
              </dt>
              <dd className="flex items-center gap-2">
                <span className="text-sm font-bold break-all text-navy">{user?.email}</span>
                {user?.email && (
                  <CopyInlineButton value={user.email} ariaLabel={t("settings.account.copyEmail")} />
                )}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                {t("settings.account.role")}
              </dt>
              <dd>
                {user?.role ? (
                  <UserRoleBadge role={user.role} />
                ) : (
                  <span className="text-sm text-gray-400 italic">{t("common.notSet")}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-400 uppercase">
                <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                {t("settings.account.wallet")}
              </dt>
              <dd className="flex items-center gap-2">
                {user?.wallet_address ? (
                  <MonoId value={user.wallet_address} mode="address" className="text-sm text-navy" />
                ) : (
                  <span className="text-sm text-gray-400 italic">{t("common.notSet")}</span>
                )}
                {user?.wallet_address && (
                  <CopyInlineButton
                    value={user.wallet_address}
                    ariaLabel={t("settings.account.copyWallet")}
                  />
                )}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          {t("settings.language.heading")}
        </EyebrowLabel>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">{t("settings.language.body")}</p>
          <LanguageSwitcher />
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {t("settings.security.heading")}
        </EyebrowLabel>
        <p className="text-sm text-gray-600">{t("settings.security.body")}</p>
      </Card>
    </div>
  );
}
