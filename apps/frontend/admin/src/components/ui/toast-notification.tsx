"use client";

import { useEffect } from "react";
import { toast as sonnerToast } from "sonner";

export { sonnerToast as toast };

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

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast || !toast.message) return;
    if (toast.type === "success") {
      sonnerToast.success(toast.message);
    } else if (toast.type === "error") {
      sonnerToast.error(toast.message);
    } else {
      sonnerToast.info(toast.message);
    }
    onClose();
  }, [toast, onClose]);

  return null;
}

export const getErrorMessage = (err: unknown, defaultMessage = "An error occurred while executing the transaction."): string => {
  if (!err) return defaultMessage;
  if (typeof err === "string" && err.trim().length > 0) return err;

  const anyErr = err as {
    status?: number;
    statusCode?: number;
    response?: {
      status?: number;
      data?: {
        detail?: string;
        message?: string;
        title?: string;
        errors?: Record<string, string[]>;
      } | string | null;
      statusText?: string;
    };
    message?: string;
  };

  const status = anyErr.response?.status || anyErr.status || anyErr.statusCode;
  const rawData = anyErr.response?.data;
  const data = typeof rawData === "object" && rawData !== null ? rawData : null;

  // Handle 403 Forbidden globally via ForbiddenAccessToast
  if (status === 403) {
    return "";
  }

  if (status === 409) {
    return data?.detail || data?.message || "A conflict occurred with the resource state (e.g., duplicate code or active references exist).";
  }

  if (status === 401) {
    return data?.detail || data?.message || "You are unauthorized to perform this action.";
  }

  if (status === 404) {
    return data?.detail || data?.message || "The requested resource could not be found.";
  }

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
