import { useStore } from "@app/store";
import { DashboardLayout } from "./DashboardLayout";
import { PublicLayout } from "./PublicLayout";

export function AdaptiveLayout() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  return isAuthenticated ? <DashboardLayout /> : <PublicLayout />;
}
