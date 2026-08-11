import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { AdminScopeProvider } from "@/lib/admin-scope-context";
import { SidebarNav } from "@/components/SidebarNav";
import { BackendStatusIndicator } from "@/components/BackendStatusIndicator";
import { ForbiddenAccessToast } from "@/components/ForbiddenAccessToast";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NTC EDGE | System Administration & Configurations",
  description: "Administrative portal for managing tenants, tenant members, regional settings, fee rules, and geographics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body className="h-full bg-background text-foreground antialiased flex flex-col md:flex-row overflow-hidden transition-colors duration-200">
          <ThemeProvider>
            <AdminScopeProvider>
              {/* Sidebar Navigation */}
              <SidebarNav />

              {/* Global 403 Forbidden Toast */}
              <ForbiddenAccessToast />

              {/* Main Area */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-shrink-0 transition-colors duration-200">
                  <BackendStatusIndicator />
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserButton />
                  </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                  <div className="w-full space-y-6">
                    {children}
                  </div>
                </main>
              </div>
            </AdminScopeProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
