import { Settings as SettingsIcon, Globe, ShieldCheck, Wallet } from "lucide-react";
import { useStore } from "@app/store";
import { Card } from "@ui/card";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { formatRole } from "@shared/auth/role";

export function Settings() {
  const user = useStore((s) => s.user);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-gray-200 flex items-center">
        <SettingsIcon className="mr-2 h-6 w-6 text-navy" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold text-navy tracking-tight">
          Platform Settings
        </h2>
      </div>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4">Your Account</EyebrowLabel>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Name
            </dt>
            <dd className="text-sm font-bold text-navy">{user?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Email
            </dt>
            <dd className="text-sm font-bold text-navy break-all">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Role
            </dt>
            <dd className="text-sm font-bold text-navy capitalize">
              {user?.role ? formatRole(user.role) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              Wallet
            </dt>
            <dd>
              <MonoId value={user?.wallet_address ?? ""} mode="address" className="text-sm" />
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          Language
        </EyebrowLabel>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Choose your preferred language for the dashboard and notifications.
          </p>
          <LanguageSwitcher />
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <EyebrowLabel className="mb-4 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Security
        </EyebrowLabel>
        <p className="text-sm text-gray-600">
          Authentication is managed by Google. Sessions use httpOnly cookies and rotate access
          tokens automatically. To sign out, use the user menu in the top right.
        </p>
      </Card>
    </div>
  );
}
