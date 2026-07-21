import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { AdminScopeProvider } from "@/lib/admin-scope-context";
import { SidebarNav } from "@/components/SidebarNav";

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
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
        style={{ colorScheme: "dark" }}
      >
        <body className="h-full bg-slate-950 text-slate-100 antialiased flex flex-col md:flex-row overflow-hidden">
          <AdminScopeProvider>
            {/* Sidebar Navigation */}
            <SidebarNav />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Top Header */}
              <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-900/40 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs text-slate-300 font-medium">System Configuration Service Connected</span>
                </div>
                <div className="flex items-center gap-4">
                  <UserButton />
                </div>
              </header>

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
                <div className="w-full space-y-6">
                  {children}
                </div>
              </main>
            </div>
          </AdminScopeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
