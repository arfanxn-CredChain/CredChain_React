import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { DecorBlob } from "@shared/components/DecorBlob";
import { Button } from "@ui/button";

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-base px-4">
      <DecorBlob tone="navy" position="top-right" size="xl" />

      <div className="relative z-10 max-w-md text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-navy p-4 shadow-lg shadow-navy/20">
          <ShieldAlert className="h-12 w-12 text-gold" aria-hidden="true" />
        </div>

        <p className="mb-3 font-mono text-sm font-bold tracking-widest text-gold uppercase">
          {t("not_found.code")}
        </p>

        <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight text-balance text-navy md:text-5xl">
          {t("not_found.title")}
        </h1>

        <p className="mb-8 text-lg text-pretty text-gray-500">{t("not_found.description")}</p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary" size="lg">
            <Link to="/overview">
              <ArrowLeft className="h-4 w-4" />
              {t("not_found.goOverview")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">{t("not_found.signIn")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
