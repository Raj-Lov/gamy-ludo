"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { GlassCard } from "@/components/primitives/glass-card";
import { MotionDiv } from "@/components/providers";

const AdminPage = () => {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-8 py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h2 className="text-4xl font-semibold text-foreground">Admin Control Center</h2>
          <p className="text-muted-foreground">
            Only admins can see this page. Use it to orchestrate tournaments, review reports, and manage squad invitations.
          </p>
        </MotionDiv>

        <GlassCard className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Moderation queue</h3>
          <p className="text-sm text-muted-foreground">
            Connect Firestore queries or server actions here to triage reported matches and player feedback.
          </p>
        </GlassCard>
      </section>
    </ProtectedRoute>
  );
};

export default AdminPage;
