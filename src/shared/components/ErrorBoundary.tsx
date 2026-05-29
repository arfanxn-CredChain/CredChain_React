import { ErrorBoundary as REB } from "react-error-boundary";
import { ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card } from "@shared/components/ui/card";

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <REB
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen flex items-center justify-center p-6 bg-base">
          <Card className="p-8 max-w-md text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-error mb-4" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold text-navy mb-2 tracking-tight">
              Something broke
            </h2>
            <p className="text-sm text-gray-500 mb-6">{error.message}</p>
            <Button onClick={resetErrorBoundary} variant="primary">
              Try again
            </Button>
          </Card>
        </div>
      )}
      onError={(error) => {
        // eslint-disable-next-line no-console
        console.error("App boundary:", error);
      }}
    >
      {children}
    </REB>
  );
}
