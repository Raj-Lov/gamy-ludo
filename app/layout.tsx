import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { AuthProvider, MotionProvider, ThemeProvider } from "@/components/providers";
import { AuthControls } from "@/components/auth/auth-controls";
import { ThemeToggle } from "@/components/theme-toggle";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Gamy Ludo UI",
  description: "A luminous gaming dashboard scaffold built with Next.js 14, Tailwind, shadcn/ui, and Framer Motion."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans`}> 
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <MotionProvider>
              <div className="flex min-h-screen flex-col">
                <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 px-8 py-6 backdrop-blur-xl">
                  <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Project</p>
                      <h1 className="text-lg font-semibold text-foreground">Gamy Ludo</h1>
                    </div>
                    <div className="flex items-center gap-4">
                      <ThemeToggle />
                      <AuthControls />
                    </div>
                  </div>
                </header>
                <main className="flex-1">{children}</main>
                <footer className="border-t border-white/5 bg-background/80 px-8 py-6 text-center text-sm text-muted-foreground backdrop-blur">
                  Crafted with ⚡️ Next.js, Tailwind CSS, shadcn/ui & Framer Motion.
                </footer>
              </div>
            </MotionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
