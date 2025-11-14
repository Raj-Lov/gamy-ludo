"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth, type AppUserRole } from "@/components/providers";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requiredRole?: AppUserRole;
  loadingFallback?: ReactNode;
}

const defaultRedirect = "/login";

export const ProtectedRoute = ({
  children,
  redirectTo = defaultRedirect,
  requiredRole,
  loadingFallback
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, loading, role } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [loading, redirectTo, router, user]);

  useEffect(() => {
    if (!loading && requiredRole && role !== requiredRole) {
      router.replace(redirectTo);
    }
  }, [loading, redirectTo, requiredRole, role, router]);

  if (loading) {
    return (
      loadingFallback ?? (
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Checking access…
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};
