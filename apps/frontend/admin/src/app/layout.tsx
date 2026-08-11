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

import { AdminAppLayout } from "@/components/AdminAppLayout";

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
        <body className="h-full bg-background text-foreground antialiased flex flex-col overflow-hidden transition-colors duration-200">
          <ThemeProvider>
            <AdminScopeProvider>
              <AdminAppLayout>{children}</AdminAppLayout>
            </AdminScopeProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
