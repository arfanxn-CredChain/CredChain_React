import { ShieldCheck, Users, FileBadge, User, Mail, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BackLink } from "@shared/components/BackLink";
import { PageHeader } from "@shared/components/PageHeader";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { DecorBlob } from "@shared/components/DecorBlob";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { env } from "@shared/lib/env";

declare const __APP_VERSION__: string;

export function About() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackLink />

      <PageHeader
        title={t("about.title")}
        description={t("about.intro")}
      />
      <Card className="p-6 sm:p-8 relative overflow-hidden">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative z-10 space-y-8">
          <div>
            <h3 className="font-display text-2xl font-bold text-navy mb-2">
              {t("about.what.title")}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("about.what.body")}
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-navy mb-4">
              {t("about.roles.title")}
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div key={label} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
                    <dt className="font-bold text-navy">{label}</dt>
                  </div>
                  <dd className="text-sm text-gray-500">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <EyebrowLabel tone="muted">Version</EyebrowLabel>
            <p className="font-mono text-xs text-gray-500 mt-1">
              {__APP_VERSION__}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {t("about.tech")}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-gold/10 p-2 shrink-0">
              <Mail className="h-5 w-5 text-gold" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-navy tracking-tight">
                {t("about.contact.title")}
              </p>
              <p className="text-sm text-gray-500 mt-1">{t("about.contact.body")}</p>
              <EyebrowLabel className="mt-3" tone="muted" as="p">
                {t("about.contact.label")}
              </EyebrowLabel>
            </div>
          </div>
          <a
            href={`mailto:${env.supportEmail}`}
            className="inline-flex items-center gap-2 self-start rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 whitespace-nowrap sm:self-auto"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            {env.supportEmail}
          </a>
        </div>
      </Card>

      <Card className="p-6 sm:p-8 relative overflow-hidden">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="font-display text-lg font-semibold text-navy tracking-tight">
              {t("about.explore.title")}
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              {t("about.explore.body")}
            </p>
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
