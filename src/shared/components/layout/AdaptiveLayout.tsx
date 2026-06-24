import { useStore } from "@app/store";
import { OverviewLayout } from "./OverviewLayout";
import { PublicLayout } from "./PublicLayout";

export function AdaptiveLayout() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  return isAuthenticated ? <OverviewLayout /> : <PublicLayout />;
}
