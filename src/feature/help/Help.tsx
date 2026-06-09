import { useTranslation } from "react-i18next";
import {
  HelpCircle,
  Sparkles,
  FileBadge,
  UserCircle2,
  ShieldCheck,
  ChevronDown,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@shared/components/PageHeader";
import { DecorBlob } from "@shared/components/DecorBlob";
import { Card } from "@ui/card";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { env } from "@shared/lib/env";

interface FaqEntry {
  q: string;
  a: string;
}

interface FaqGroup {
  id: string;
  title: string;
  icon: typeof Sparkles;
  items: FaqEntry[];
}

function FaqItem({ item }: { item: FaqEntry }) {
  return (
    <details className="group border-b border-gray-100 last:border-b-0">
      <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-sm font-bold text-navy outline-none focus-visible:ring-2 focus-visible:ring-gold/40 rounded-md">
        <span className="flex-1">{item.q}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <p className="pb-4 pr-8 text-sm leading-relaxed text-gray-600">{item.a}</p>
    </details>
  );
}

function FaqSection({ group }: { group: FaqGroup }) {
  const Icon = group.icon;
  return (
    <section>
      <EyebrowLabel className="mb-3 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {group.title}
      </EyebrowLabel>
      <div>
        {group.items.map((item, idx) => (
          <FaqItem key={idx} item={item} />
        ))}
      </div>
    </section>
  );
}

export function Help() {
  const { t } = useTranslation();

  const groups: FaqGroup[] = [
    {
      id: "getting-started",
      title: t("help.section.gettingStarted"),
      icon: Sparkles,
      items: [
        {
          q: t("help.faq.gettingStarted.signIn"),
          a: t("help.faq.gettingStarted.signIn.body"),
        },
        {
          q: t("help.faq.gettingStarted.googleAccount"),
          a: t("help.faq.gettingStarted.googleAccount.body"),
        },
        {
          q: t("help.faq.gettingStarted.unrecognizedEmail"),
          a: t("help.faq.gettingStarted.unrecognizedEmail.body"),
        },
      ],
    },
    {
      id: "credentials",
      title: t("help.section.credentials"),
      icon: FileBadge,
      items: [
        {
          q: t("help.faq.credentials.what"),
          a: t("help.faq.credentials.what.body"),
        },
        {
          q: t("help.faq.credentials.verify"),
          a: t("help.faq.credentials.verify.body"),
        },
        {
          q: t("help.faq.credentials.revoke"),
          a: t("help.faq.credentials.revoke.body"),
        },
      ],
    },
    {
      id: "account",
      title: t("help.section.accountRoles"),
      icon: UserCircle2,
      items: [
        {
          q: t("help.faq.account.roleDifference"),
          a: t("help.faq.account.roleDifference.body"),
        },
        {
          q: t("help.faq.account.updateEmail"),
          a: t("help.faq.account.updateEmail.body"),
        },
        {
          q: t("help.faq.account.logout"),
          a: t("help.faq.account.logout.body"),
        },
      ],
    },
    {
      id: "privacy",
      title: t("help.section.privacy"),
      icon: ShieldCheck,
      items: [
        {
          q: t("help.faq.privacy.tokenStorage"),
          a: t("help.faq.privacy.tokenStorage.body"),
        },
        {
          q: t("help.faq.privacy.walletAddress"),
          a: t("help.faq.privacy.walletAddress.body"),
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("common.backToHome")}
      </Link>

      <PageHeader
        title={t("help.title")}
        description={t("help.intro")}
      />

      <Card className="relative p-6 sm:p-8">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative space-y-8">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-gold/10 p-2">
              <HelpCircle className="h-5 w-5 text-gold" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-navy tracking-tight">
                {t("help.faq.title", "Frequently asked questions")}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t(
                  "help.faq.subtitle",
                  "Browse by topic. Click a question to expand its answer.",
                )}
              </p>
            </div>
          </div>

          {groups.map((group) => (
            <FaqSection key={group.id} group={group} />
          ))}
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-navy/5 p-2">
              <ShieldCheck className="h-5 w-5 text-navy" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-navy">{t("help.contact.title")}</p>
              <p className="text-sm text-gray-500 mt-1">
                {t(
                  "help.contact.body",
                  "Reach out to our support team and we'll get back to you within one business day.",
                )}
              </p>
            </div>
          </div>
          <a
            href={`mailto:${env.supportEmail}`}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 whitespace-nowrap"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            {env.supportEmail}
          </a>
        </div>
      </Card>
    </div>
  );
}
