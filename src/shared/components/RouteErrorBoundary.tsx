import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Card } from "@ui/card";
import { Button } from "@ui/button";

export function RouteErrorBoundary() {
  const { t } = useTranslation();
  const error = useRouteError();

  const is404 = isRouteErrorResponse(error) && error.status === 404;

  const title = is404 ? t("error_boundary.notFoundTitle") : t("error_boundary.title");
  const description = is404
    ? t("error_boundary.notFoundDescription")
    : t("error_boundary.description");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-base p-6">
      <Card className="max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-error" aria-hidden="true" />
        <h2 className="mb-2 font-display text-2xl font-bold tracking-tight text-navy">{title}</h2>
        <p className="mb-6 text-sm text-gray-500">{description}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              {t("error_boundary.goDashboard")}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("error_boundary.reload")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
