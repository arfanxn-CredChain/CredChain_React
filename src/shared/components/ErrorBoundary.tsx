import { ErrorBoundary as REB } from "react-error-boundary";
import { ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card } from "@shared/components/ui/card";

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <REB
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="flex min-h-dvh items-center justify-center bg-base p-6">
          <Card className="max-w-md p-8 text-center">
            <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-error" aria-hidden="true" />
            <h2 className="mb-2 font-display text-2xl font-bold tracking-tight text-navy">
              Something broke
            </h2>
            <p className="mb-6 text-sm text-gray-500">{error.message}</p>
            <Button onClick={resetErrorBoundary} variant="primary">
              Try again
            </Button>
          </Card>
        </div>
      )}
      onError={(error) => {
        console.error("App boundary:", error);
      }}
    >
      {children}
    </REB>
  );
}
