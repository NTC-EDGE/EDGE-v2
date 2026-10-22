"use client";

import React from "react";
import { useClerk, useAuth, useUser } from "@clerk/nextjs";
import { ShieldAlert, LogOut, ExternalLink, Loader2 } from "lucide-react";
import { useAdminScope } from "@/lib/admin-scope-context";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { signOut } = useClerk();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { currentUser, isLoadingUser, isSuperAdmin } = useAdminScope();

  const internalAppUrl = process.env.NEXT_PUBLIC_INTERNAL_APP_URL ?? "http://localhost:8081";

  // 1. Loading State
  if (!isAuthLoaded || isLoadingUser) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
            <div className="relative rounded-2xl bg-card border border-border p-4 shadow-xl">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">Verifying Privileges</h2>
            <p className="text-sm text-muted-foreground">Checking Super Administrator access permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (handled by Clerk middleware / redirects)
  if (!isSignedIn) {
    return null;
  }

  // 3. Authenticated but NOT a SuperAdmin -> Access Denied
  if (!isSuperAdmin) {
    const displayName =
      currentUser !== null && (currentUser.firstName.length > 0 || currentUser.lastName.length > 0)
        ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
        : user?.fullName !== null && user?.fullName !== undefined && user.fullName.length > 0
        ? user.fullName
        : "Authenticated User";

    const displayEmail =
      currentUser?.email !== null && currentUser?.email !== undefined && currentUser.email.length > 0
        ? currentUser.email
        : user?.primaryEmailAddress?.emailAddress !== null && user?.primaryEmailAddress?.emailAddress !== undefined
        ? user.primaryEmailAddress.emailAddress
        : "No email associated";

    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-lg space-y-6 rounded-2xl border border-destructive/20 bg-card p-6 shadow-2xl sm:p-8 text-center">
          {/* Glowing Warning Icon */}
          <div className="mx-auto relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-destructive/15 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>

          {/* Heading and Description */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
              Access Restricted
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Super Administrator Required
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access to the <span className="font-semibold text-foreground">NTC-EDGE System Administration</span> portal is strictly limited to authorized Super Administrators.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Signed in account
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground font-mono">{displayEmail}</p>
              </div>
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Non-SuperAdmin
              </span>
            </div>
          </div>

          {/* Information & Guidance */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Regional Directors, Licensing Evaluators, Enforcement Staff, and Administrative Officers should sign in through the <strong>Internal Staff Workstation</strong>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={internalAppUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Internal Workstation
            </a>
            <button
              type="button"
              onClick={() => {
                void signOut({ redirectUrl: "/sign-in" });
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized SuperAdmin
  return <>{children}</>;
}
