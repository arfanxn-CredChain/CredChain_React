import { ShieldCheck, Users, FileBadge, User, Mail, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BackLink } from "@shared/components/BackLink";
import { PageHeader } from "@shared/components/PageHeader";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { DecorBlob } from "@shared/components/DecorBlob";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { cn } from "@shared/lib/cn";
import { env } from "@shared/lib/env";

declare const __APP_VERSION__: string;

export function About() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackLink />

      <PageHeader title={t("about.title")} description={t("about.intro")} />
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative z-10 space-y-8">
          <div>
            <h3 className="mb-2 font-display text-2xl font-bold text-navy">
              {t("about.what.title")}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">{t("about.what.body")}</p>
          </div>
          <div>
            <h3 className="mb-4 font-display text-xl font-semibold text-navy">
              {t("about.roles.title")}
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  label: t("about.roles.superAdmin"),
                  desc: t("about.roles.superAdmin.desc"),
                  iconClass: "text-error",
                },
                {
                  icon: Users,
                  label: t("about.roles.admin"),
                  desc: t("about.roles.admin.desc"),
                  iconClass: "text-navy",
                },
                {
                  icon: FileBadge,
                  label: t("about.roles.issuer"),
                  desc: t("about.roles.issuer.desc"),
                  iconClass: "text-gold",
                },
                {
                  icon: User,
                  label: t("about.roles.holder"),
                  desc: t("about.roles.holder.desc"),
                  iconClass: "text-gray-400",
                },
              ].map(({ icon: Icon, label, desc, iconClass }) => (
                <div key={label} className="rounded-xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", iconClass)} aria-hidden="true" />
                    <dt className="font-bold text-navy">{label}</dt>
                  </div>
                  <dd className="text-sm text-gray-500">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <EyebrowLabel tone="muted">Version</EyebrowLabel>
            <p className="mt-1 font-mono text-xs text-gray-500">{__APP_VERSION__}</p>
            <p className="mt-2 text-xs text-gray-400">{t("about.tech")}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-full bg-gold/10 p-2">
              <Mail className="h-5 w-5 text-gold" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold tracking-tight text-navy">
                {t("about.contact.title")}
              </p>
              <p className="mt-1 text-sm text-gray-500">{t("about.contact.body")}</p>
              <EyebrowLabel className="mt-3" tone="muted" as="p">
                {t("about.contact.label")}
              </EyebrowLabel>
            </div>
          </div>
          <Button asChild variant="primary" className="self-start sm:self-auto">
            <a href={`mailto:${env.supportEmail}`}>
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              {env.supportEmail}
            </a>
          </Button>
        </div>
      </Card>

      <Card className="relative overflow-hidden p-6 sm:p-8">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-navy">
              {t("about.explore.title")}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">{t("about.explore.body")}</p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link to="/" className="inline-flex items-center gap-2 whitespace-nowrap">
              {t("about.explore.action")}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
