"use client";

import React from "react";
import { ShieldX } from "lucide-react";

interface PageForbiddenStateProps {
  /** Optional custom title. Defaults to "Access Denied". */
  title?: string;
  /** Optional custom message. Defaults to a generic permission message. */
  message?: string;
}

/**
 * Rendered inline inside a page when the backend returns HTTP 403 for the
 * primary data-fetch of that page. Provides a clear, non-intrusive explanation
 * without crashing the surrounding layout.
 */
export function PageForbiddenState({
  title = "Access Denied",
  message = "You do not have permission to view this resource. If you believe this is a mistake, please contact your system administrator.",
}: PageForbiddenStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] text-center px-6 py-16 select-none">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl scale-150" />
        <div className="relative p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <ShieldX className="w-10 h-10 text-amber-400" />
        </div>
      </div>

      {/* Status code badge */}
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-4 tracking-widest">
        HTTP 403 &mdash; FORBIDDEN
      </span>

      {/* Title */}
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{title}</h2>

      {/* Message */}
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">{message}</p>
    </div>
  );
}

/**
 * Helper to determine if an unknown SWR/Axios error is a 403 Forbidden response.
 */
function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

export function isForbiddenError(error: unknown): boolean {
  if (!isRecord(error)) return false;

  const response = error["response"];
  if (isRecord(response) && response["status"] === 403) {
    return true;
  }

  if (error["status"] === 403) {
    return true;
  }

  return false;
}

