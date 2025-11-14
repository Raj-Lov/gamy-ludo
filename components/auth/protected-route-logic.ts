import type { AppUserRole } from "@/components/providers";

const defaultRedirect = "/login";

export type ProtectedRouteStatus = "loading" | "redirect" | "render";

export interface ProtectedRouteEvaluation {
  status: ProtectedRouteStatus;
  redirectTarget: string;
}

interface EvaluateOptions {
  loading: boolean;
  user: unknown;
  role: AppUserRole;
  requiredRole?: AppUserRole;
  redirectTo?: string;
}

export const evaluateProtectedRoute = ({
  loading,
  user,
  role,
  requiredRole,
  redirectTo
}: EvaluateOptions): ProtectedRouteEvaluation => {
  const target = redirectTo ?? defaultRedirect;

  if (loading) {
    return { status: "loading", redirectTarget: target };
  }

  if (!user) {
    return { status: "redirect", redirectTarget: target };
  }

  if (requiredRole && role !== requiredRole) {
    return { status: "redirect", redirectTarget: target };
  }

  return { status: "render", redirectTarget: target };
};
