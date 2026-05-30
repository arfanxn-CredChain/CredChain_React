import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import id from "./id.json";

export function readPersistedLocale(): "en" | "id" {
  try {
    const raw = localStorage.getItem("credchain-store");
    if (!raw) return "id";
    const parsed = JSON.parse(raw) as { state?: { locale?: string } };
    const locale = parsed?.state?.locale;
    return locale === "en" || locale === "id" ? locale : "id";
  } catch {
    return "id";
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: readPersistedLocale(),
  fallbackLng: "id",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export { i18n };
