import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { apiClient } from '@edge/api';
import { AlertToast } from '@edge/ui';

function parseForbiddenActionDetails(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const response = (error as Record<string, unknown>)['response'];
    if (typeof response === 'object' && response !== null) {
      const data = (response as Record<string, unknown>)['data'];
      if (typeof data === 'object' && data !== null) {
        const detail = (data as Record<string, unknown>)['detail'];
        if (typeof detail === 'string' && detail.trim().length > 0) {
          return detail.trim();
        }
        const message = (data as Record<string, unknown>)['message'];
        if (typeof message === 'string' && message.trim().length > 0) {
          return message.trim();
        }
        const title = (data as Record<string, unknown>)['title'];
        if (typeof title === 'string' && title.trim().length > 0 && !title.toLowerCase().includes('forbidden')) {
          return title.trim();
        }
      }
    }

    const config = (error as Record<string, unknown>)['config'];
    if (typeof config === 'object' && config !== null) {
      const url = (config as Record<string, unknown>)['url'];
      const method = (config as Record<string, unknown>)['method'];
      if (typeof url === 'string' && url.length > 0) {
        const cleanPath = url.split('?')[0].replace(/^\/api\/v\d+\//, '').replace(/^\//, '');
        const actionVerb =
          typeof method === 'string'
            ? method.toUpperCase() === 'POST' ? 'create records in'
              : method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH' ? 'update'
              : method.toUpperCase() === 'DELETE' ? 'delete'
              : 'access'
            : 'access';
        return `Access Denied: You do not have permission to ${actionVerb} '${cleanPath}'. Please contact your administrator to request access.`;
      }
    }
  }
  return "Access Denied: You do not have permission to perform this action. Please contact your system administrator.";
}

export function ForbiddenToastProvider({ children }: { readonly children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDismiss = useCallback(() => {
    setToastMessage(null);
  }, []);

  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (typeof error === 'object' && error !== null) {
          const response = (error as Record<string, unknown>)['response'];
          if (typeof response === 'object' && response !== null) {
            const status = (response as Record<string, unknown>)['status'];
            if (status === 403) {
              const details = parseForbiddenActionDetails(error);
              setToastMessage(details);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, []);

  return (
    <View style={styles.root}>
      {toastMessage !== null && (
        <View style={styles.toastContainer}>
          <AlertToast
            message={toastMessage}
            variant="error"
            onDismiss={handleDismiss}
          />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 9999,
    maxWidth: 400,
  },
});
