import { useTranslation } from "react-i18next";
import {
  HelpCircle,
  Sparkles,
  FileBadge,
  UserCircle2,
  ShieldCheck,
  ChevronDown,
  Mail,
} from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { DecorBlob } from "@shared/components/DecorBlob";
import { Card } from "@ui/card";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";

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
      title: "Getting Started",
      icon: Sparkles,
      items: [
        {
          q: t("help.gettingStarted.signIn.q", "How do I sign in to CredChain?"),
          a: t(
            "help.gettingStarted.signIn.a",
            "CredChain uses Google sign-in only. Click 'Continue with Google' on the login page and select the Google profile your administrator registered for you.",
          ),
        },
        {
          q: t("help.gettingStarted.googleAccount.q", "Do I need a specific Google profile?"),
          a: t(
            "help.gettingStarted.googleAccount.a",
            "Any Google profile works, but it must match the email your organization registered. Personal Gmail and Google Workspace logins are both supported.",
          ),
        },
        {
          q: t(
            "help.gettingStarted.unrecognizedEmail.q",
            "My email isn't recognized — what should I do?",
          ),
          a: t(
            "help.gettingStarted.unrecognizedEmail.a",
            "Contact your administrator to confirm your profile was created with the same email you use for Google sign-in.",
          ),
        },
      ],
    },
    {
      id: "credentials",
      title: "Credentials",
      icon: FileBadge,
      items: [
        {
          q: t("help.credentials.what.q", "What is a credential?"),
          a: t(
            "help.credentials.what.a",
            "A credential is a tamper-proof, blockchain-anchored record of an achievement, certification, or attestation issued to a holder. Each credential is a soulbound NFT bound to your wallet.",
          ),
        },
        {
          q: t("help.credentials.verify.q", "How do I verify a credential?"),
          a: t(
            "help.credentials.verify.a",
            "Open 'Verify Credential' from the menu and paste the credential hash. The system checks the on-chain registry and confirms whether it is valid, revoked, or unknown.",
          ),
        },
        {
          q: t("help.credentials.revoke.q", "Can a credential be revoked?"),
          a: t(
            "help.credentials.revoke.a",
            "Yes. Issuers and admins can revoke a credential. Revoked items remain on-chain for audit but are flagged as invalid during verification.",
          ),
        },
      ],
    },
    {
      id: "account",
      title: "Account & Roles",
      icon: UserCircle2,
      items: [
        {
          q: t("help.account.roles.q", "What are the different roles?"),
          a: t(
            "help.account.roles.a",
            "Holder receives a credential. Issuer can issue and revoke a credential. Admin manages users and the issuance pipeline. SuperAdmin has full system control and can promote admins.",
          ),
        },
        {
          q: t("help.account.email.q", "How do I update my email?"),
          a: t(
            "help.account.email.a",
            "Go to Settings → Update Email and sign in with your new Google profile. We verify ownership through Google before updating your record.",
          ),
        },
        {
          q: t("help.account.logout.q", "How do I log out?"),
          a: t(
            "help.account.logout.a",
            "Use the user menu in the top right and choose 'Sign out'. Your session cookies are cleared and refresh tokens are revoked on the server.",
          ),
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: ShieldCheck,
      items: [
        {
          q: t("help.privacy.tokens.q", "Where are my session tokens stored?"),
          a: t(
            "help.privacy.tokens.a",
            "Access and refresh tokens are stored in httpOnly cookies, which JavaScript cannot read. This protects you from XSS-based token theft.",
          ),
        },
        {
          q: t("help.privacy.wallet.q", "Why does my profile have a wallet address?"),
          a: t(
            "help.privacy.wallet.a",
            "Each user has a wallet so issued records can be anchored on-chain. The private key is encrypted server-side and never exposed to the browser.",
          ),
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Help & FAQ"
        description="Quick answers to the most common questions about CredChain."
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
              <p className="font-bold text-navy">Need more help?</p>
              <p className="text-sm text-gray-500 mt-1">
                {t(
                  "help.contact.body",
                  "Reach out to our support team and we'll get back to you within one business day.",
                )}
              </p>
            </div>
          </div>
          <a
            href="mailto:support@credchain.app"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            support@credchain.app
          </a>
        </div>
      </Card>
    </div>
  );
}
