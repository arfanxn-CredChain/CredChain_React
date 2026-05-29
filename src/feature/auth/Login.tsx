import { GoogleLogin } from "@react-oauth/google";
import { ShieldCheck } from "lucide-react";
import { useGoogleLogin } from "./api/useGoogleLogin";
import { useT } from "@shared/hooks/useT";

export function Login() {
  const t = useT();
  const login = useGoogleLogin();

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-6 w-6 text-gold" aria-hidden="true" />
        <span className="font-display text-base font-bold text-navy tracking-tight">
          CredChain
        </span>
      </div>

      <h3 className="font-display text-2xl font-bold text-navy mb-2 tracking-tight">
        Sign in
      </h3>
      <p className="text-gray-500 text-sm mb-8">
        Access the platform dashboard with your Google account.
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
            By signing in you agree to CredChain&apos;s terms of service. Authentication is handled
            by Google. Sessions use httpOnly cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
