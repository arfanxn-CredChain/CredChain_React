import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStore } from "@app/store";
import { Role, canAccessAny } from "@shared/auth/role";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const user = useStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !canAccessAny(user.role, allowedRoles)) {
    const fallback = user.role === Role.HOLDER ? "/credentials/self" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  if (isAuthenticated) {
    return <Navigate to={from ?? "/dashboard"} replace />;
  }
  return <Outlet />;
}

interface RoleGateProps {
  allowed: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowed, children, fallback = null }: RoleGateProps) {
  const user = useStore((s) => s.user);
  return canAccessAny(user?.role, allowed) ? <>{children}</> : <>{fallback}</>;
}
