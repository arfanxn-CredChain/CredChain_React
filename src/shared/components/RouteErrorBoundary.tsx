import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Card } from "@ui/card";
import { Button } from "@ui/button";

export function RouteErrorBoundary() {
  const error = useRouteError();

  const is404 =
    isRouteErrorResponse(error) && error.status === 404;

  const title = is404 ? "Page not found" : "Something went wrong";
  const description = is404
    ? "The page you are looking for does not exist."
    : "An unexpected error occurred. Please try refreshing the page.";

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-6">
      <Card className="p-8 max-w-md text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-error mb-4" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold text-navy mb-2 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="primary">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </Card>
    </div>
  );
}
