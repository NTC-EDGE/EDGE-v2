"use client";

import { useEffect } from "react";
import { toast as sonnerToast } from "sonner";

export { sonnerToast as toast };

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id?: string;
  message: string;
  type: ToastType;
  description?: string;
}

/**
 * Global standardized toast messenger functions for direct imperative invocation.
 * All feature modules should use this to guarantee identical appearance, duration, and styling.
 */
export const showToast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4500,
    });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },
  custom: (message: string, type: ToastType = "info", description?: string) => {
    if (type === "success") showToast.success(message, description);
    else if (type === "error") showToast.error(message, description);
    else if (type === "warning") showToast.warning(message, description);
    else showToast.info(message, description);
  },
};

/**
 * Standard React hook for interacting with the standardized toast notification system.
 */
export function useStandardToast() {
  return {
    success: showToast.success,
    error: showToast.error,
    warning: showToast.warning,
    info: showToast.info,
    showToast,
    getErrorMessage,
  };
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
  autoHideDuration?: number;
}

/**
 * Declarative component adapter for existing state-driven toast patterns.
 */
export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast || !toast.message) return;
    showToast.custom(toast.message, toast.type, toast.description);
    onClose();
  }, [toast, onClose]);

  return null;
}

import { parseApiError } from "@edge/api";

export const getErrorMessage = (err: unknown, defaultMessage = "An error occurred while executing the transaction."): string => {
  return parseApiError(err, defaultMessage);
};

