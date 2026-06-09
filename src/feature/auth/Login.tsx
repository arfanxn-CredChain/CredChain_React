import { GoogleLogin } from "@react-oauth/google";
import { ShieldCheck } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { BackLink } from "@shared/components/BackLink";
import { useGoogleLogin } from "./api/useGoogleLogin";
import { SplitLayout } from "@shared/components/layout/SplitLayout";

export function Login() {
  const { t } = useTranslation();
  const login = useGoogleLogin();

  const desktopBrand = (
    <div className="flex flex-col items-center text-center gap-6">
      <ShieldCheck className="w-24 h-24 text-gold drop-shadow-xl" aria-hidden="true" />
      <div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-surface mb-4 tracking-tight text-balance min-h-[2lh]">
          <Trans
            i18nKey="auth.welcome.title"
            components={{ brand: <span className="text-gold" /> }}
          />
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed text-pretty min-h-[5lh]">
          {t("auth.welcome.tagline")}
        </p>
      </div>
    </div>
  );

  const mobileBrand = (
    <div className="text-center py-10 px-6 shadow-md rounded-b-3xl">
      <ShieldCheck className="w-16 h-16 text-gold mx-auto mb-3 drop-shadow-md" aria-hidden="true" />
      <h2 className="font-display text-3xl font-extrabold text-gold tracking-tight">
          CredChain
        </h2>
      <p className="text-sm text-gray-400 mt-2">{t("auth.welcome.mobileTagline")}</p>
    </div>
  );

  return (
    <SplitLayout brandSlot={desktopBrand} mobileBrandSlot={mobileBrand}>
      <div className="w-full max-w-md px-4 sm:px-6 py-8 lg:py-0">
        <BackLink className="mb-6" />

        <div className="bg-surface rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
          <h3 className="font-display text-2xl font-bold text-navy mb-2 tracking-tight">
            {t("auth.signin.title")}
          </h3>
          <p className="text-gray-500 text-sm mb-8 min-h-[2lh]">
            {t("auth.signin.subtitle")}
          </p>

          <div className="space-y-5">
            <div className="flex justify-center">
              {login.isPending ? (
                <div className="text-sm text-gray-500" role="status">
                  {t("auth.login.success")}...
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      login.mutate({ id_token: credentialResponse.credential });
                    }
                  }}
                  onError={() => {
                    /* handled by useGoogleLogin onError */
                  }}
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="320"
                />
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center font-mono leading-relaxed">
                {t("auth.signin.terms")}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-8 mb-8 text-center text-sm text-gray-500 font-medium safe-area-bottom">
          {t("auth.welcome.securedBy")}
        </p>
      </div>
    </SplitLayout>
  );
}
