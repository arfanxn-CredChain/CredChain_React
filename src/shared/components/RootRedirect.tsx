import { Navigate } from "react-router-dom";
import { useStore } from "@app/store";

export function RootRedirect() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
