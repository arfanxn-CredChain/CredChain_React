import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ShieldCheck } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useStore } from "@app/store";
import { PageHeader } from "@shared/components/PageHeader";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { useUpdateSelfEmail } from "./api/useUpdateSelfEmail";
import { userSelfEmailSchema, type UserSelfEmailInput } from "./schemas/user";
import { cn } from "@shared/lib/cn";

export function UserSelfEmail() {
  const user = useStore((s) => s.user);
  const [step, setStep] = useState<"email" | "verify">("email");
  const [pendingEmail, setPendingEmail] = useState("");

  const form = useForm<UserSelfEmailInput>({
    resolver: zodResolver(userSelfEmailSchema),
    defaultValues: { email: user?.email ?? "", id_token: "" },
    mode: "onBlur",
  });

  const update = useUpdateSelfEmail();
  const errors = form.formState.errors;

  const handleEmailNext = form.handleSubmit((data) => {
    setPendingEmail(data.email);
    setStep("verify");
  });

  const handleGoogleSuccess = (idToken: string) => {
    update.mutate({ email: pendingEmail, id_token: idToken });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Update Email"
        description="Verify your new email address with Google."
      />

      <Card className="p-6 sm:p-8 space-y-6">
        {step === "email" ? (
          <form onSubmit={handleEmailNext} className="space-y-6">
            <div className="space-y-1">
              <Label>Current email</Label>
              <Input
                type="email"
                leadingIcon={Mail}
                value={user?.email ?? ""}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <Label>New email address</Label>
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                leadingIcon={Mail}
                placeholder="new@example.com"
                {...form.register("email")}
              />
              {errors.email && (
                <p className={cn("text-xs text-error mt-1")} role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" variant="primary">
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
              <p className="text-sm text-navy font-medium">
                Sign in with the Google account for{" "}
                <span className="font-bold font-mono">{pendingEmail}</span> to confirm.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <ShieldCheck className="h-12 w-12 text-gold" aria-hidden="true" />
              <p className="text-sm text-gray-500 text-center max-w-sm">
                Google will verify that you own this email address. The token is sent directly to
                CredChain and never stored in the browser.
              </p>

              {update.isPending ? (
                <p className="text-sm text-gray-500">Updating email...</p>
              ) : (
                <GoogleLogin
                  onSuccess={(res) => {
                    if (res.credential) handleGoogleSuccess(res.credential);
                  }}
                  onError={() => {
                    form.setError("id_token", { message: "Google verification failed" });
                  }}
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="320"
                />
              )}

              {errors.id_token && (
                <p className="text-xs text-error" role="alert">
                  {errors.id_token.message}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-start">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("email")}
                disabled={update.isPending}
              >
                ← Back
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
