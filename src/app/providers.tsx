import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";
import { Toaster } from "@shared/components/ui/toaster";
import { AppErrorBoundary } from "@shared/components/ErrorBoundary";
import { OfflineBanner } from "@shared/components/OfflineBanner";
import { i18n } from "@shared/i18n/config";
import { queryClient } from "@shared/api/query-client";
import { env } from "@shared/lib/env";
import { ThemeProvider } from "@app/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <GoogleOAuthProvider clientId={env.googleClientId}>
          <ThemeProvider>
            <AppErrorBoundary>
              <OfflineBanner />
              {children}
              <Toaster />
            </AppErrorBoundary>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
