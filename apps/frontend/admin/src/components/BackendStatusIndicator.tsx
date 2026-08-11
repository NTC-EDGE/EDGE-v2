"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, WifiOff } from "lucide-react";

export function BackendStatusIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let timer: ReturnType<typeof setTimeout> | undefined;

    const handleOffline = () => {
      setIsOffline(true);
      setShowToast(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setShowToast(false), 5000);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowToast(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setShowToast(false), 3000);
    };

    window.addEventListener("backend-offline", handleOffline);
    window.addEventListener("backend-online", handleOnline);

    return () => {
      window.removeEventListener("backend-offline", handleOffline);
      window.removeEventListener("backend-online", handleOnline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const toastElement = showToast && (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 ${
        isOffline
          ? "bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 animate-bounce"
          : "bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200"
      }`}
    >
      {isOffline ? (
        <WifiOff className="w-5 h-5 text-rose-500 shrink-0" />
      ) : (
        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
      )}
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold uppercase tracking-wider">
          {isOffline ? "Connection Lost" : "Connection Restored"}
        </span>
        <span className="text-[11px] text-slate-600 dark:text-slate-400">
          {isOffline
            ? "The backend server is currently unavailable. Requests are suspended."
            : "The connection to the backend server has been re-established."}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full animate-pulse transition-colors duration-300 ${
            isOffline ? "bg-rose-500" : "bg-emerald-500"
          }`}
        ></span>
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors duration-300">
          {isOffline
            ? "System Configuration Service Offline"
            : "System Configuration Service Connected"}
        </span>
      </div>

      {mounted && typeof document !== "undefined" && toastElement
        ? createPortal(toastElement, document.body)
        : null}
    </>
  );
}
