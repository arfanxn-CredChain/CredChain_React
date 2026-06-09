/**
 * Typed access to Vite environment variables.
 * Validates required variables at module load.
 */

function required(key: keyof ImportMetaEnv, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${String(key)}`);
  }
  return value;
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
  googleClientId: required("VITE_GOOGLE_CLIENT_ID", import.meta.env.VITE_GOOGLE_CLIENT_ID),
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL ?? "support@credchain.app",
  appEnv: import.meta.env.VITE_APP_ENV ?? "development",
  isDev: import.meta.env.VITE_APP_ENV === "development" || import.meta.env.DEV,
  isProd: import.meta.env.VITE_APP_ENV === "production" || import.meta.env.PROD,
} as const;
