import { ShieldCheck, Users, FileBadge, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@shared/components/PageHeader";
import { Card } from "@ui/card";
import { DecorBlob } from "@shared/components/DecorBlob";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";

declare const __APP_VERSION__: string;

export function About() {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
    </div>
  );
}
