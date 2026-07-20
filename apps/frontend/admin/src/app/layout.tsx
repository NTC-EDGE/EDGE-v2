import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { 
  LayoutDashboard, 
  MapPin, 
  Building, 
  Building2, 
  Home, 
  ShieldCheck
} from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NTC EDGE | System Administration",
  description: "Administrative configuration portal for Region, Province, Municipality, and Barangay reference systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
        style={{ colorScheme: 'dark' }}
      >
        <body className="h-full bg-slate-950 text-slate-100 antialiased flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col flex-shrink-0">
            {/* Sidebar Brand/Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-white tracking-wide text-sm">NTC EDGE</h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">System Admin</p>
              </div>
            </div>

            {/* Sidebar Links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-300 hover:text-white hover:bg-slate-800/60 group"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                <span>Dashboard</span>
              </Link>

              <div className="pt-4 pb-2 px-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geographics</p>
              </div>

              <Link
                href="/regions"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-300 hover:text-white hover:bg-slate-800/60 group"
              >
                <MapPin className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                <span>Regions</span>
              </Link>

              <Link
                href="/provinces"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-300 hover:text-white hover:bg-slate-800/60 group"
              >
                <Building className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                <span>Provinces</span>
              </Link>

              <Link
                href="/municipalities"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-300 hover:text-white hover:bg-slate-800/60 group"
              >
                <Building2 className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                <span>Municipalities</span>
              </Link>

              <Link
                href="/barangays"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-300 hover:text-white hover:bg-slate-800/60 group"
              >
                <Home className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                <span>Barangays</span>
              </Link>
            </nav>

            {/* Sidebar Footer with Auth Profile */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <UserButton afterSignOutUrl="/sign-in" />
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">Administrator</p>
                  <p className="text-[10px] text-slate-400 truncate">System Manager</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 md:px-8 bg-slate-900/40 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-400 font-medium">Service Connection Active</span>
              </div>
              <div className="flex items-center gap-4">
                {/* Fallback Clerk control just in case */}
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
              <div className="max-w-[1200px] w-full mx-auto space-y-6">
                {children}
              </div>
            </main>
          </div>

        </body>
      </html>
    </ClerkProvider>
  );
}
