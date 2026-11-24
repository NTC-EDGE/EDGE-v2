"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import { isGoogleSsoEnabled } from "@edge/api";
import {
  Shield,
  Lock,
  Building2,
  Sliders,
  Activity,
  X,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";

const POLICY_CONTENT: Record<string, { title: string; body: string }> = {
  "User Agreement": {
    title: "NTC-EDGE Administrative User Agreement",
    body: "Access to the National Telecommunications Commission (NTC) EDGE System Administration Console is restricted exclusively to authorized Super Administrators and designated ICT personnel. All configuration changes, role assignments, statutory fee updates, and tenant modifications are permanently recorded in the immutable system audit trail.",
  },
  "Privacy Policy": {
    title: "Data Privacy & Governance Policy (RA 10173)",
    body: "In compliance with Republic Act No. 10173 (Data Privacy Act of 2012), all personal and organizational data accessed within the NTC-EDGE System Administration Console must be handled with strict confidentiality and used solely for official regulatory, licensing, and technical support operations.",
  },
  "Security Policy": {
    title: "Information Security & Session Policy",
    body: "Administrative sessions are protected by TLS 1.3 encryption, short-lived cryptographic Clerk JWTs, and strict role-based access controls (RBAC). Unauthorized access attempts or privilege escalation actions are automatically logged and reported.",
  },
};

export default function SignInPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  const showGoogleSso = isGoogleSsoEnabled({
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    enableGoogleSso: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO,
  });

  const logoSrc = isDark ? "/footer-logo.png" : "/logo.png";
  const selectedPolicy = activePolicy ? POLICY_CONTENT[activePolicy] : null;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Ambient Radial Decorative Glows */}
      <div
        className="pointer-events-none fixed -top-36 -left-36 h-[480px] w-[480px] rounded-full bg-blue-600/15 dark:bg-blue-500/15 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-36 -right-36 h-[520px] w-[520px] rounded-full bg-cyan-500/12 dark:bg-indigo-500/15 blur-[120px]"
        aria-hidden="true"
      />

      {/* Top Utility Header Bar */}
      <header className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>NTC Node: Online</span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Two-Column Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
          {/* Left Hero Column */}
          <div className="w-full lg:flex-1 lg:max-w-[560px] flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 mb-5">
              <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700 dark:text-blue-400">
                OFFICIAL GOV PORTAL • EDGE V2 SYSTEM ADMIN
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight lg:leading-[1.18] mb-4">
              National Telecommunications Commission
            </h1>

            <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-[600px]">
              Centralized System Administration &amp; Governance Console for Regional Tenants, Dynamic Form Builder, Statutory Fee Rules, Service Catalogs, and Security Audit Trails.
            </p>

            {/* Feature Highlights Grid */}
            <div className="w-full space-y-3.5 text-left">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-sm backdrop-blur-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Multi-Tenant &amp; Regional Branch Governance
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Configure NTC Regional Offices, Field Offices, staff role assignments, and granular RBAC permissions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-sm backdrop-blur-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Dynamic Form Builder &amp; Service Catalogs
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Manage application variants, documentary requirement mappings, statutory fee formulas, and SOA notes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-sm backdrop-blur-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    System Diagnostics &amp; Security Auditing
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Monitor real-time audit trails, error logs, global user directory, and regional client feedback reports.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Card Column (strictly max-w-[440px]) */}
          <div className="w-full max-w-[440px] mx-auto lg:mx-0 flex flex-col items-center">
            {/* Theme-Aware NTC Logo */}
            <div className="mb-5 flex flex-col items-center">
              <Image
                src="/logo.png"
                alt="National Telecommunications Commission"
                width={190}
                height={54}
                className="block dark:hidden h-12 sm:h-14 w-auto object-contain"
                priority
              />
              <Image
                src="/footer-logo.png"
                alt="National Telecommunications Commission"
                width={190}
                height={54}
                className="hidden dark:block h-12 sm:h-14 w-auto object-contain"
                priority
              />
            </div>

            {/* Glass Card with Window Bar */}
            <div className="w-full rounded-[20px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-colors duration-200">
              {/* Top Window Accent Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/70">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Lock className="h-3 w-3" />
                  <span>System Admin • Web Console</span>
                </div>
              </div>

              {/* Card Main Body */}
              <div className="p-5 sm:p-7">
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Super Administrator Access</span>
                  </div>
                  <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 dark:text-white">
                    Sign In to Admin Console
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                    {showGoogleSso
                      ? "Enter your administrator credentials or continue with Google SSO."
                      : "Enter your authorized administrator credentials to continue."}
                  </p>
                </div>

                {/* Embedded Clerk SignIn without any Sign-Up action or link */}
                <div className="w-full admin-clerk-signin">
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    withSignUp={false}
                    fallbackRedirectUrl="/"
                    appearance={{
                      elements: {
                        rootBox: "!w-full !max-w-none",
                        cardBox:
                          "!w-full !max-w-none !shadow-none !border-0 !bg-transparent",
                        card: "!w-full !max-w-none !shadow-none !border-0 !bg-transparent !p-0 !gap-4",
                        header: { display: "none" },
                        headerTitle: { display: "none" },
                        headerSubtitle: { display: "none" },
                        footer: { display: "none" },
                        footerAction: { display: "none" },
                        footerActionText: { display: "none" },
                        footerActionLink: { display: "none" },
                        footerPages: { display: "none" },
                        main: "!gap-4",
                        form: "!gap-4",
                        formFieldRow: "!mb-0",
                        formFieldLabel:
                          "!text-xs !font-semibold !text-slate-700 dark:!text-slate-300 !mb-1.5",
                        formFieldInput:
                          "!h-11 !rounded-xl !border !border-slate-300 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-950 !text-slate-900 dark:!text-white !text-sm !px-3.5 focus:!border-blue-600 dark:focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/20",
                        formButtonPrimary:
                          "!h-11 !rounded-xl !bg-[#0F2C59] hover:!bg-[#163d7a] dark:!bg-blue-600 dark:hover:!bg-blue-500 !text-white !text-sm !font-semibold !shadow-md !transition-all",
                        formFieldAction:
                          "!text-xs !font-semibold !text-blue-700 dark:!text-blue-400 hover:!underline",
                        identityPreview:
                          "!rounded-xl !border !border-slate-200 dark:!border-slate-800 !bg-slate-50 dark:!bg-slate-950 !px-3.5 !py-2.5",
                        identityPreviewText:
                          "!text-slate-800 dark:!text-slate-200 !text-sm !font-medium",
                        identityPreviewEditButton:
                          "!text-blue-600 dark:!text-blue-400 !text-xs !font-semibold",
                        formResendCodeLink:
                          "!text-blue-600 dark:!text-blue-400 !text-xs !font-semibold",
                        otpCodeFieldInput:
                          "!h-11 !rounded-xl !border !border-slate-300 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-950 !text-slate-900 dark:!text-white !font-bold",
                        alternativeMethodsBlockButton:
                          "!h-10 !rounded-xl !border !border-slate-200 dark:!border-slate-800 !bg-slate-50 dark:!bg-slate-950 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-800 !text-xs !font-semibold",
                        backLink:
                          "!text-blue-600 dark:!text-blue-400 !text-xs !font-semibold",
                        alert:
                          "!rounded-xl !border !border-rose-500/30 !bg-rose-500/10 !p-3",
                        alertText:
                          "!text-xs !text-rose-600 dark:!text-rose-400 !font-medium",
                        socialButtonsBlockButton:
                          "!h-11 !rounded-xl !border !border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-950 hover:!bg-slate-50 dark:hover:!bg-slate-800 !text-slate-700 dark:!text-slate-200 !text-sm !font-medium",
                        dividerLine: "!bg-slate-200 dark:!bg-slate-800",
                        dividerText:
                          "!text-xs !text-slate-400 dark:!text-slate-500 !font-medium",
                        ...(showGoogleSso
                          ? {}
                          : {
                              socialButtons: { display: "none" },
                              socialButtonsBlockButton: { display: "none" },
                              dividerRow: { display: "none" },
                            }),
                      },
                    }}
                  />
                </div>

                {/* Security Compliance Footer Pill */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-500/10 dark:bg-slate-800/90 px-3 py-2 text-center">
                  <Shield className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
                  <span className="text-[11px] font-medium text-blue-800 dark:text-blue-300">
                    Authorized NTC Admin Portal • TLS 1.3 Encrypted Session
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="relative z-10 w-full py-6 px-4 text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActivePolicy("User Agreement")}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            User Agreement
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setActivePolicy("Privacy Policy")}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setActivePolicy("Security Policy")}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Security Policy
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} National Telecommunications Commission • All Rights Reserved
        </p>
      </footer>

      {/* Policy Modal */}
      {selectedPolicy !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[440px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedPolicy.title}
              </h3>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close policy dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedPolicy.body}
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="px-4 py-2 rounded-xl bg-[#0F2C59] dark:bg-blue-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
