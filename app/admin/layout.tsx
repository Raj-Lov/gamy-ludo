"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { cn } from "@/components/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/codes", label: "Codes" },
  { href: "/admin/puzzles", label: "Puzzles" }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0b1120_60%,_#030712_100%)] pb-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-sky-500/20 via-transparent to-transparent blur-3xl" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
          <header className="flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Command Center</p>
              <h1 className="text-4xl font-semibold text-white">Admin Suite</h1>
            </div>
            <nav className="flex flex-wrap items-center gap-3">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      active
                        ? "border-white/30 bg-white/20 text-white shadow-lg shadow-sky-500/20"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
