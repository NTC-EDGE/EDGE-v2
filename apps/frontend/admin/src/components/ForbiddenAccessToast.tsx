"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldX, X } from "lucide-react";

interface ForbiddenEvent extends Event {
  detail?: { url?: string };
}

export function ForbiddenAccessToast() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);

    const handleForbidden = (_evt: Event) => {
      setVisible(true);
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 6000);
    };

    window.addEventListener("forbidden-access", handleForbidden as EventListener);
    return () => {
      window.removeEventListener("forbidden-access", handleForbidden as EventListener);
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    if (timerRef.current !== undefined) clearTimeout(timerRef.current);
  };

  const toastElement = visible ? (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-4 py-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl shadow-amber-950/20 dark:shadow-amber-950/40 max-w-sm transition-all duration-300"
    >
      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
        <ShieldX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Access Denied
        </p>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
          You do not have permission to access this resource. Contact your system administrator if you believe this is a mistake.
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  ) : null;

  return mounted && typeof document !== "undefined" && toastElement
    ? createPortal(toastElement, document.body)
    : null;
}
