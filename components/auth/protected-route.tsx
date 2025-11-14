"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth, type AppUserRole } from "@/components/providers";
import { evaluateProtectedRoute } from "./protected-route-logic";

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

  const evaluation = evaluateProtectedRoute({
    loading,
    user,
    role,
    requiredRole,
    redirectTo
  });

  useEffect(() => {
    if (evaluation.status === "redirect") {
      router.replace(evaluation.redirectTarget);
    }
  }, [evaluation.redirectTarget, evaluation.status, router]);

  if (evaluation.status === "loading") {
    return (
      loadingFallback ?? (
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Checking access…
        </div>
      )
    );
  }

  if (evaluation.status === "redirect") {
    return null;
  }

  return <>{children}</>;
};
