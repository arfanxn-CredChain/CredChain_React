import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUserSelf } from "@feature/user/api/useUserSelf";
import { useStore } from "@app/store";
import { configureAuthHandler, configureLocaleResolver } from "@shared/api/client";
import { FullPageSpinner } from "@shared/components/LoadingSpinner";
import { isApiError } from "@shared/api/envelope";

export function SessionHydrator({ children }: { children: React.ReactNode }) {
  const setUser = useStore((s) => s.setUser);
  const clearUser = useStore((s) => s.clearUser);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const locale = useStore((s) => s.locale);
  const { i18n } = useTranslation();

  // Wire axios interceptor handlers
  useEffect(() => {
    configureAuthHandler(() => {
      clearUser();
      window.location.href = "/login";
    });
    configureLocaleResolver(() => locale);
  }, [clearUser, locale]);

  // Sync i18n language with stored locale on mount and locale change
  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const { data, isLoading, isError, error } = useUserSelf();

  useEffect(() => {
    if (data) setUser(data);
    if (isError && isApiError(error) && error.status === 401) {
      clearUser();
    }
  }, [data, isError, error, setUser, clearUser]);

  if (isLoading && !isAuthenticated) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
