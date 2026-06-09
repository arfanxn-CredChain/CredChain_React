import { Mail } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useStore } from "@app/store";
import { PageHeader } from "@shared/components/PageHeader";
import { Card } from "@ui/card";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { useConfirm } from "@ui/confirm-dialog";
import { DecorBlob } from "@shared/components/DecorBlob";
import { decodeJwtPayload } from "@shared/lib/jwt";
import { notify } from "@shared/lib/notify";
import { useUpdateSelfEmail } from "./api/useUpdateSelfEmail";

export function UserSelfEmail() {
  const { t } = useTranslation();
  const user = useStore((s) => s.user);
  const update = useUpdateSelfEmail();
  const { confirm, dialog } = useConfirm();

  const handleGoogleSuccess = async (credential: string) => {
    const decoded = decodeJwtPayload<{ email: string }>(credential);
    if (!decoded?.email) {
      notify.error("user.email.update.googleFailed");
      return;
    }

    const ok = await confirm({
      title: t("user.email.confirm.title"),
      description: t("user.email.confirm.body", { email: decoded.email }),
      confirmLabel: t("user.email.confirm.action"),
      cancelLabel: t("common.cancel"),
    });

    if (ok) {
      update.mutate({ email: decoded.email, id_token: credential });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={t("user.email.update.title")}
        description={t("user.email.update.intro")}
      />

      <Card className="p-6 sm:p-8 relative overflow-hidden shadow-lg shadow-gold/20 ring-1 ring-gold/10">
        <DecorBlob tone="gold" position="top-right" size="lg" />
        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <Label>{t("user.email.current")}</Label>
            <Input
              type="email"
              leadingIcon={Mail}
              value={user?.email ?? ""}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {t("user.email.update.instruction")}
            </p>

            {update.isPending ? (
              <p className="text-sm text-gray-500">{t("user.email.updating")}</p>
            ) : (
              <GoogleLogin
                onSuccess={(res) => res.credential && handleGoogleSuccess(res.credential)}
                onError={() => notify.error("user.email.update.googleFailed")}
                theme="outline"
                size="large"
                shape="pill"
                width="320"
              />
            )}
          </div>
        </div>
      </Card>

      {dialog}
    </div>
  );
}
