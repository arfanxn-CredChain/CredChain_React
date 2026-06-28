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
    <div className="flex flex-col items-center gap-6 text-center">
      <ShieldCheck className="h-24 w-24 text-gold drop-shadow-xl" aria-hidden="true" />
      <div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-surface md:text-5xl">
          <Trans
            i18nKey="auth.welcome.title"
            components={{ brand: <span className="text-gold" /> }}
          />
        </h1>
      </div>
    </div>
  );

  const mobileBrand = (
    <div className="rounded-b-3xl px-6 py-[2dvh] text-center shadow-md">
      <ShieldCheck className="mx-auto mb-3 h-16 w-16 text-gold drop-shadow-md" aria-hidden="true" />
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-gold">CredChain</h2>
    </div>
  );

  return (
    <SplitLayout brandSlot={desktopBrand} mobileBrandSlot={mobileBrand}>
      <div className="flex h-full w-full flex-col items-center justify-start py-[2dvh] lg:justify-center lg:py-0">
        <div className="flex w-full max-w-[min(448px,90vw)] flex-col">
          <BackLink className="mb-[2dvh]" />

          <div className="rounded-2xl border border-gray-100 bg-surface p-6 shadow-xl shadow-navy/20 sm:p-8">
            <h3 className="mb-2 font-display text-2xl font-bold tracking-tight text-navy">
              {t("auth.signin.title")}
            </h3>
            <p className="mb-[2dvh] text-sm text-gray-500">{t("auth.signin.subtitle")}</p>

            <div className="space-y-5">
              <div className="flex w-full justify-center">
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

              <div className="border-t border-gray-100 pt-4">
                <p className="text-center font-mono text-xs leading-relaxed text-gray-400">
                  {t("auth.signin.terms")}
                </p>
              </div>
            </div>
          </div>
          <p className="safe-area-bottom mt-[2dvh] text-center text-sm font-medium text-gray-500">
            {t("auth.welcome.securedBy")}
          </p>
        </div>
      </div>
    </SplitLayout>
  );
}
