import { ShieldCheck, Users, FileBadge, User } from "lucide-react";
import { PageHeader } from "@shared/components/PageHeader";
import { Card } from "@ui/card";
import { DecorBlob } from "@shared/components/DecorBlob";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";

declare const __APP_VERSION__: string;

export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="About CredChain"
        description="Trust-minimized credentials, anchored on-chain."
      />
      <Card className="p-6 sm:p-8 relative overflow-hidden">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative z-10 space-y-8">
          <div>
            <h3 className="font-display text-2xl font-bold text-navy mb-2">
              What is CredChain?
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              CredChain is a decentralized credential platform that issues and
              verifies professional credentials on-chain. Every credential is
              tamper-proof, soulbound to its owner, and verifiable without
              trusting a single central authority.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-navy mb-4">
              Roles
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: ShieldCheck,
                  label: "Super Admin",
                  desc: "Bootstrapped by the platform operator. Owns the system. Only one exists.",
                  iconClass: "text-error",
                },
                {
                  icon: Users,
                  label: "Admin",
                  desc: "Manages users and settings. Can promote members to credential publishers.",
                  iconClass: "text-navy",
                },
                {
                  icon: FileBadge,
                  label: "Issuer",
                  desc: "Issues, revokes, and verifies credentials.",
                  iconClass: "text-gold",
                },
                {
                  icon: User,
                  label: "Holder",
                  desc: "Receives credentials and manages their own profile.",
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
              Built with React, Tailwind CSS, and blockchain technology.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
