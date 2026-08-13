import { useEffect } from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

export { sonnerToast as toast, SonnerToaster as Toaster };

export interface AlertToastProps {
  message: string | null;
  onDismiss?: () => void;
  variant?: "error" | "success" | "warning" | "info";
  style?: unknown;
}

export function AlertToast({
  message,
  onDismiss,
  variant = "error",
}: AlertToastProps) {
  useEffect(() => {
    if (!message || message.length === 0) return;
    if (variant === "success") {
      sonnerToast.success(message);
    } else if (variant === "warning") {
      sonnerToast.warning(message);
    } else if (variant === "info") {
      sonnerToast.info(message);
    } else {
      sonnerToast.error(message);
    }
    if (onDismiss) onDismiss();
  }, [message, variant, onDismiss]);

  return null;
}
