import { useState } from "react";
import { Settings as SettingsIcon, Globe, ShieldCheck, Wallet, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore } from "@app/store";
import { Card } from "@ui/card";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { formatRole } from "@shared/auth/role";
import { notify } from "@shared/lib/notify";
import { cn } from "@shared/lib/cn";

export function Settings() {
  const user = useStore((s) => s.user);
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState<"email" | "wallet" | null>(null);

  const handleCopy = async (field: "email" | "wallet", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      notify.success(
        field === "email" ? "settings.account.emailCopied" : "settings.account.walletCopied",
      );
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      notify.error("system.internal_error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-gray-200 flex items-center">
        <SettingsIcon className="mr-2 h-6 w-6 text-navy" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold text-navy tracking-tight">
          {t("settings.title")}
        </h2>
      </div>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4">{t("settings.account.heading")}</EyebrowLabel>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("settings.account.name")}
            </dt>
            <dd className="text-sm font-bold text-navy">{user?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("settings.account.email")}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="text-sm font-bold text-navy break-all">{user?.email}</span>
              {user?.email && (
                <button
                  type="button"
                  onClick={() => void handleCopy("email", user.email!)}
                  aria-label={t("settings.account.copyEmail")}
                  className={cn(
                    "shrink-0 p-1 rounded-md text-gray-400 hover:text-navy hover:bg-gray-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors",
                  )}
                >
                  {copiedField === "email" ? (
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("settings.account.role")}
            </dt>
            <dd className="text-sm font-bold text-navy capitalize">
              {user?.role ? formatRole(user.role) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              {t("settings.account.wallet")}
            </dt>
            <dd className="flex items-center gap-2">
              <MonoId
                value={user?.wallet_address ?? ""}
                mode="address"
                className="text-sm"
              />
              {user?.wallet_address && (
                <button
                  type="button"
                  onClick={() => void handleCopy("wallet", user.wallet_address!)}
                  aria-label={t("settings.account.copyWallet")}
                  className={cn(
                    "shrink-0 p-1 rounded-md text-gray-400 hover:text-navy hover:bg-gray-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors",
                  )}
                >
                  {copiedField === "wallet" ? (
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          {t("settings.language.heading")}
        </EyebrowLabel>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            {t("settings.language.body")}
          </p>
          <LanguageSwitcher />
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {t("settings.security.heading")}
        </EyebrowLabel>
        <p className="text-sm text-gray-600">
          {t("settings.security.body")}
        </p>
      </Card>
    </div>
  );
}
