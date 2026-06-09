import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Phone, Save, Copy, Check, Mail } from "lucide-react";
import { useStore } from "@app/store";
import { PageHeader } from "@shared/components/PageHeader";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { UserAvatar } from "@shared/components/UserAvatar";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { DecorBlob } from "@shared/components/DecorBlob";
import { notify } from "@shared/lib/notify";
import { cn } from "@shared/lib/cn";
import { UserRoleBadge } from "./components/UserRoleBadge";
import { useUpdateSelfProfile } from "./api/useUpdateSelfProfile";
import { userSelfProfileSchema, type UserSelfProfileInput } from "./schemas/user";

export function UserSelfProfile() {
  const { t, i18n } = useTranslation();
  const user = useStore((s) => s.user);
  const [copiedField, setCopiedField] = useState<"number" | "wallet" | null>(null);

  const form = useForm<UserSelfProfileInput>({
    resolver: zodResolver(userSelfProfileSchema),
    mode: "onBlur",
    defaultValues: { phone_number: undefined },
  });

  const update = useUpdateSelfProfile(form);

  useEffect(() => {
    if (user) form.reset({ phone_number: user.phone_number ?? undefined });
  }, [user, form]);

  const onSubmit = form.handleSubmit((data) => update.mutate(data));
  const phoneError = form.formState.errors.phone_number?.message;

  const handleCopyWallet = async () => {
    if (!user?.wallet_address) return;
    try {
      await navigator.clipboard.writeText(user.wallet_address);
      setCopiedField("wallet");
      notify.success("profile.wallet.copied");
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      notify.error("system.internal_error");
    }
  };

  const handleCopyNumber = async () => {
    if (!user?.number) return;
    try {
      await navigator.clipboard.writeText(user.number);
      setCopiedField("number");
      notify.success("profile.wallet.copied");
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      notify.error("system.internal_error");
    }
  };

  const formatBirthDate = (iso: string | null | undefined): string | null => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    } catch {
      return iso.slice(0, 10);
    }
  };

  const empty = t("profile.empty");
  const birthDateText = formatBirthDate(user?.birth_date) ?? empty;
  const numberText = user?.number ?? empty;
  const emailText = user?.email ?? empty;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={t("profile.title")} description={t("profile.description")} />

      <Card className="p-6 sm:p-8 relative overflow-hidden shadow-lg shadow-gold/20 ring-1 ring-gold/10">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <UserAvatar user={user} size="xl" />
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h2 className="font-display text-2xl font-bold text-navy tracking-tight">
                {user?.name ?? empty}
              </h2>
              {user?.role && <UserRoleBadge role={user.role} />}
            </div>
            <p className="text-sm text-gray-500 break-all">{emailText}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4">{t("profile.identity.heading")}</EyebrowLabel>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("profile.field.number")}
            </dt>
            <dd className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-bold",
                  user?.number ? "text-navy" : "text-gray-400 font-normal italic",
                )}
              >
                {numberText}
              </span>
              {user?.number && (
                <button
                  type="button"
                  onClick={() => void handleCopyNumber()}
                  aria-label={t("profile.number.copy")}
                  className="p-1 rounded-md text-gray-400 hover:text-navy hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors"
                >
                  {copiedField === "number" ? (
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
              {t("profile.field.birthDate")}
            </dt>
            <dd
              className={cn(
                "text-sm font-bold",
                user?.birth_date ? "text-navy" : "text-gray-400 font-normal italic",
              )}
            >
              {birthDateText}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("profile.field.gender")}
            </dt>
            <dd
              className={cn(
                "text-sm font-bold",
                user?.gender ? "text-navy" : "text-gray-400 font-normal italic",
              )}
            >
              {user?.gender ? t(`user.field.gender.${user.gender}`) : empty}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("profile.field.wallet")}
            </dt>
            <dd className="flex items-center gap-2">
              {user?.wallet_address ? (
                <MonoId value={user.wallet_address} mode="address" className="text-sm text-navy" />
              ) : (
                <span className="text-sm text-gray-400 italic">{empty}</span>
              )}
              {user?.wallet_address && (
                <button
                  type="button"
                  onClick={() => void handleCopyWallet()}
                  aria-label={t("profile.wallet.copy")}
                  className="p-1 rounded-md text-gray-400 hover:text-navy hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors"
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
        <p className="mt-6 text-xs text-gray-400">{t("profile.identity.note")}</p>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4">{t("profile.contact.heading")}</EyebrowLabel>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="phone_number">{t("profile.field.phone")}</Label>
            <Input
              id="phone_number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              leadingIcon={Phone}
              placeholder={t("profile.phone.placeholder")}
              {...form.register("phone_number")}
            />
            {phoneError ? (
              <p className="text-xs text-error mt-1" role="alert">
                {t(phoneError)}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">{t("profile.phone.hint")}</p>
            )}
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={update.isPending || !form.formState.isDirty}
            >
              <Save className="h-4 w-4" />
              {update.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4">{t("profile.account.heading")}</EyebrowLabel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-navy">{t("profile.field.email")}</p>
            <p className="text-sm text-gray-500 break-all">{emailText}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/account/email" className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("profile.updateEmail")}
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
