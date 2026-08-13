"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { SidebarNav } from "@/components/SidebarNav";
import { BackendStatusIndicator } from "@/components/BackendStatusIndicator";
import { ForbiddenAccessToast } from "@/components/ForbiddenAccessToast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserButton } from "@clerk/nextjs";

export function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isAuthPage) {
    return (
      <main className="h-full w-full overflow-y-auto bg-background">
        <Toaster position="top-right" richColors />
        {children}
      </main>
    );
  }

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Global Toaster & 403 Listener */}
      <Toaster position="top-right" richColors />
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
    </div>
  );
}
