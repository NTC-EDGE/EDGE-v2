"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id?: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
  autoHideDuration?: number;
}

export function ToastNotification({ toast, onClose, autoHideDuration = 5000 }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoHideDuration);
    return () => clearTimeout(timer);
  }, [toast, onClose, autoHideDuration]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`p-4 rounded-xl border shadow-2xl flex items-start justify-between gap-3 backdrop-blur-md ${
          isSuccess
            ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
            : isError
            ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
            : "bg-indigo-950/90 border-indigo-500/40 text-indigo-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {!isSuccess && !isError && <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {isSuccess ? "Success" : isError ? "Error Response" : "Information"}
            </h4>
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export const getErrorMessage = (err: unknown, defaultMessage = "An error occurred while executing the transaction."): string => {
  if (!err) return defaultMessage;
  const anyErr = err as {
    response?: {
      data?: {
        detail?: string;
        message?: string;
        title?: string;
        errors?: Record<string, string[]>;
      };
      statusText?: string;
    };
    message?: string;
  };

  const data = anyErr.response?.data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.errors) {
    const messages = Object.values(data.errors).flat();
    if (messages.length > 0) return messages.join(" ");
  }
  if (data?.title) return data.title;
  if (anyErr.message) return anyErr.message;
  return defaultMessage;
};
