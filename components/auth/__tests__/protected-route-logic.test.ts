import assert from "node:assert/strict";
import test from "node:test";

import { evaluateProtectedRoute } from "../protected-route-logic.ts";

const baseOptions = {
  loading: false,
  user: { uid: "123" },
  role: "user" as const,
  redirectTo: "/login"
};

test("evaluateProtectedRoute returns loading status when auth state is resolving", () => {
  assert.deepEqual(
    evaluateProtectedRoute({
      ...baseOptions,
      loading: true
    }),
    { status: "loading", redirectTarget: "/login" }
  );
});

test("evaluateProtectedRoute requests a redirect when there is no authenticated user", () => {
  assert.deepEqual(
    evaluateProtectedRoute({
      ...baseOptions,
      user: null
    }),
    { status: "redirect", redirectTarget: "/login" }
  );
});

test("evaluateProtectedRoute requests a redirect when the current role is insufficient", () => {
  assert.deepEqual(
    evaluateProtectedRoute({
      ...baseOptions,
      requiredRole: "admin",
      redirectTo: "/dashboard"
    }),
    { status: "redirect", redirectTarget: "/dashboard" }
  );
});

test("evaluateProtectedRoute allows rendering when authenticated with the required role", () => {
  assert.deepEqual(
    evaluateProtectedRoute({
      ...baseOptions,
      role: "admin",
      requiredRole: "admin"
    }),
    { status: "render", redirectTarget: "/login" }
  );
});
