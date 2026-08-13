import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "@edge/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Individual Toast Item ────────────────────────────────────────────────────

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string; iconName: React.ComponentProps<typeof Icon>["name"] }> = {
  success: { bg: "#F0FDF4", border: "#16A34A", icon: "#16A34A", iconName: "check-circle" },
  error:   { bg: "#FEF2F2", border: "#DC2626", icon: "#DC2626", iconName: "x-circle" },
  warning: { bg: "#FFFBEB", border: "#D97706", icon: "#D97706", iconName: "alert-triangle" },
  info:    { bg: "#EFF6FF", border: "#2563EB", icon: "#2563EB", iconName: "info" },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const isWeb = Platform.OS === "web";
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(isWeb ? 16 : -16)).current;
  const colors = TOAST_COLORS[toast.type];

  React.useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss
    const duration = toast.duration ?? (toast.type === "error" ? 6000 : 4000);
    const timer = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: isWeb ? 16 : -16, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss(toast.id));
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.bg,
          borderLeftColor: colors.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Icon name={colors.iconName} size={18} color={colors.icon} style={styles.toastIcon} />
      <View style={styles.toastBody}>
        <Text style={[styles.toastTitle, { color: colors.border }]}>{toast.title}</Text>
        {toast.message !== undefined && toast.message.length > 0 && (
          <Text style={styles.toastMessage} numberOfLines={3}>
            {toast.message}
          </Text>
        )}
      </View>
      <Pressable onPress={dismiss} style={styles.dismissBtn} hitSlop={8}>
        <Icon name="x" size={14} color="#94A3B8" />
      </Pressable>
    </Animated.View>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]); // max 4 at once
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: "warning", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast container — rendered above all content */}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

// ─── Utility: extract a human-readable message from an axios error ────────────

export function extractApiErrorMessage(err: unknown): string {
  if (err === null || err === undefined) return "An unexpected error occurred.";

  // Axios response error — try to pull backend message/errors
  const axiosErr = err as { response?: { data?: unknown; status?: number } };
  if (axiosErr.response !== undefined) {
    const status = axiosErr.response.status;
    if (status === 403) return ""; // Handled globally by 403 forbidden listener

    const data = axiosErr.response.data;
    if (data !== null && data !== undefined && typeof data === "object") {
      const d = data as Record<string, unknown>;
      // Standard EDGE ApiResponse shape: { message, errors[] }
      if (typeof d["message"] === "string" && d["message"].length > 0) {
        return d["message"];
      }
      if (Array.isArray(d["errors"]) && d["errors"].length > 0) {
        return (d["errors"] as string[]).join(" ");
      }
      // ASP.NET ValidationProblem shape: { title, detail, errors }
      if (typeof d["title"] === "string" && d["title"].length > 0) {
        return d["title"];
      }
      if (typeof d["detail"] === "string" && d["detail"].length > 0) {
        return d["detail"];
      }
    }
    // HTTP status fallback
    if (status === 401) return "You are not authorized. Please sign in again.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 409) return "A conflict occurred. This record may already exist.";
    if (typeof status === "number" && status >= 500) return "A server error occurred. Please try again later.";
  }

  // Network error
  const errObj = err as { code?: string; message?: string };
  if (errObj.code === "ERR_NETWORK" || errObj.code === "ECONNREFUSED" || errObj.code === "ETIMEDOUT") {
    return "Cannot reach the server. Please check your internet connection.";
  }
  if (typeof errObj.message === "string" && errObj.message.length > 0) {
    return errObj.message;
  }

  return "An unexpected error occurred. Please try again.";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: Platform.select({
    web: {
      position: "fixed",
      bottom: 24,
      right: 24,
      alignItems: "flex-end",
      zIndex: 99999,
      gap: 10,
      pointerEvents: "box-none",
    },
    default: {
      position: "absolute",
      top: 56,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 9999,
      gap: 8,
      paddingHorizontal: 16,
      pointerEvents: "box-none",
    },
  }) as any,
  toast: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: "#E2E8F0",
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIcon: {
    marginTop: 1,
  },
  toastBody: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  toastMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
  },
  dismissBtn: {
    padding: 2,
    marginTop: 1,
  },
});
