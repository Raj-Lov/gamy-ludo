"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers";
import { cn } from "@/components/lib/utils";

export const AuthControls = () => {
  const router = useRouter();
  const { user, loading, logout, role } = useAuth();

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" aria-hidden />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-wide text-foreground transition hover:border-white/20 hover:bg-white/10"
      >
        Sign in
      </button>
    );
  }

  const avatarFallback = user.displayName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-left text-xs">
        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-background/60">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "User avatar"}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground">
              {avatarFallback}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{user.displayName ?? user.email}</span>
          <span className={cn("text-[10px] uppercase tracking-widest", role === "admin" ? "text-emerald-400" : "text-muted-foreground")}>{role}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground transition hover:border-white/20 hover:bg-white/10 hover:text-foreground"
      >
        Logout
      </button>
    </div>
  );
};
