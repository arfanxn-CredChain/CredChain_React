import { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@shared/components/layout/PublicLayout";
import { DashboardLayout } from "@shared/components/layout/DashboardLayout";
import { AdaptiveLayout } from "@shared/components/layout/AdaptiveLayout";
import { ProtectedRoute, PublicRoute } from "@shared/auth/guards";
import { Role } from "@shared/auth/role";
import { Login } from "@feature/auth/Login";
import { NotFound } from "@shared/components/NotFound";
import { RouteErrorBoundary } from "@shared/components/RouteErrorBoundary";
import { LoadingSpinner } from "@shared/components/LoadingSpinner";

/**
 * Lazy-load a named export from a module.
 * React Router's `lazy:` expects { Component, ErrorBoundary?, loader?, action? }.
 * This helper bridges named-export modules into that shape so the rest of the
 * codebase can keep its no-default-exports rule.
 */
function lazyRoute<T extends Record<string, React.ComponentType>>(
  importer: () => Promise<T>,
  exportName: keyof T & string,
) {
  return {
    lazy: async () => {
      const mod = await importer();
      const Component = mod[exportName] as React.ComponentType;
      const Wrapped = () => (
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Component />
        </Suspense>
      );
      return { Component: Wrapped, ErrorBoundary: RouteErrorBoundary };
    },
  };
}

export const router = createBrowserRouter([
  // Landing — self-wraps in SplitLayout
  {
    path: "/",
    ...lazyRoute(() => import("@feature/landing/Landing"), "Landing"),
  },

  // Public routes (no auth required) — uses PublicLayout chrome
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/credentials/verify/:credentialId",
        ...lazyRoute(() => import("@feature/credential/VerifyCredential"), "VerifyCredential"),
      },
    ],
  },

  // Adaptive routes — DashboardLayout when authenticated, PublicLayout otherwise
  {
    element: <AdaptiveLayout />,
    children: [
      { path: "/help", ...lazyRoute(() => import("@feature/help/Help"), "Help") },
      { path: "/about", ...lazyRoute(() => import("@feature/about/About"), "About") },
    ],
  },

  // Auth routes (redirect if already logged in) — Login self-wraps in SplitLayout
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <Login /> }],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Any authenticated user
          {
            path: "/dashboard",
            ...lazyRoute(() => import("@feature/dashboard/Dashboard"), "Dashboard"),
          },
          {
            path: "/credentials/self",
            ...lazyRoute(() => import("@feature/credential/MyCredentials"), "MyCredentials"),
          },
          {
            path: "/account/profile",
            ...lazyRoute(() => import("@feature/user/UserSelfProfile"), "UserSelfProfile"),
          },
          {
            path: "/account/email",
            ...lazyRoute(() => import("@feature/user/UserSelfEmail"), "UserSelfEmail"),
          },

          // Issuer+
          {
            element: <ProtectedRoute allowedRoles={[Role.ISSUER, Role.ADMIN, Role.SUPER_ADMIN]} />,
            children: [
              { path: "/users", ...lazyRoute(() => import("@feature/user/UserList"), "UserList") },
              {
                path: "/users/:id",
                ...lazyRoute(() => import("@feature/user/UserDetail"), "UserDetail"),
              },
              {
                path: "/credentials",
                ...lazyRoute(() => import("@feature/credential/CredentialList"), "CredentialList"),
              },
              {
                path: "/credentials/issue",
                ...lazyRoute(
                  () => import("@feature/credential/CredentialIssue"),
                  "CredentialIssue",
                ),
              },
              {
                path: "/credentials/:id",
                ...lazyRoute(
                  () => import("@feature/credential/CredentialDetail"),
                  "CredentialDetail",
                ),
              },
            ],
          },

          // Admin+
          {
            element: <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]} />,
            children: [
              {
                path: "/users/create",
                ...lazyRoute(() => import("@feature/user/UserCreate"), "UserCreate"),
              },
              {
                path: "/settings",
                ...lazyRoute(() => import("@feature/dashboard/Settings"), "Settings"),
              },
            ],
          },
        ],
      },
    ],
  },

  // Fallback
  { path: "*", element: <NotFound /> },
]);
