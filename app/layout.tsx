import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { AuthProvider, FeedbackProvider, MotionProvider, PwaProvider, ThemeProvider } from "@/components/providers";
import { AuthControls } from "@/components/auth/auth-controls";
import { ThemeToggle } from "@/components/theme-toggle";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Gamy Ludo UI",
  description: "A luminous gaming dashboard scaffold built with Next.js 14, Tailwind, shadcn/ui, and Framer Motion.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#050816"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <MotionProvider>
              <FeedbackProvider>
                <PwaProvider>
                  <div className="relative flex min-h-screen flex-col overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(76,201,240,0.2),transparent_65%)]" />
                      <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(165,180,252,0.16),rgba(14,165,233,0.05)_45%,transparent_70%)] blur-3xl" />
                      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.14)_0%,rgba(124,58,237,0.12)_35%,transparent_70%)]" />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[length:100%_46px] opacity-40 [mask-image:radial-gradient(circle_at_center,rgba(0,0,0,0.7),transparent_70%)]" />
                    </div>

                    <header className="relative sticky top-0 z-40 border-b border-white/10 bg-background/70 px-6 py-6 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(2,6,23,0.9)]">
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
                      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[11px] uppercase tracking-[0.6em] text-muted-foreground">Project Control</p>
                          <h1 className="text-xl font-semibold text-foreground md:text-2xl">Gamy Ludo Command Center</h1>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.5em] text-muted-foreground md:flex">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                            Live Sync
                          </div>
                          <ThemeToggle />
                          <AuthControls />
                        </div>
                      </div>
                    </header>

                    <main className="relative z-10 flex-1">{children}</main>

                    <footer className="relative border-t border-white/10 bg-background/80 px-6 py-8 backdrop-blur">
                      <span className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-center text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <p className="font-medium text-foreground/80">Crafted for luminous play loops.</p>
                        <p className="text-xs md:text-sm">
                          Powered by ⚡ Next.js 14, Tailwind CSS, shadcn/ui & Framer Motion with realtime auth & PWA superpowers.
                        </p>
                      </div>
                    </footer>
                  </div>
                </PwaProvider>
              </FeedbackProvider>
            </MotionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
