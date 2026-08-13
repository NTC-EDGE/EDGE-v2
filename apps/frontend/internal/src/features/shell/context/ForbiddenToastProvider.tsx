import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { apiClient } from '@edge/api';
import { toast, Toaster } from 'sonner';

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
      }
    }

    const config = (error as Record<string, unknown>)['config'];
    if (typeof config === 'object' && config !== null) {
      const url = (config as Record<string, unknown>)['url'];
      const method = (config as Record<string, unknown>)['method'];
      if (typeof url === 'string' && url.length > 0) {
        const cleanPath = url.split('?')[0].replace(/^\/api\/v\d+\//, '');
        const actionVerb =
          typeof method === 'string'
            ? method.toUpperCase() === 'POST' ? 'perform create operation on'
              : method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH' ? 'perform update operation on'
              : method.toUpperCase() === 'DELETE' ? 'perform delete operation on'
              : 'access'
            : 'access';
        return `You don't have permission to ${actionVerb} resource (${cleanPath}).`;
      }
    }
  }
  return "You don't have permission to perform this action.";
}

export function ForbiddenToastProvider({ children }: { readonly children: React.ReactNode }) {
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
              toast.error(details);
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
      <Toaster position="top-right" richColors />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
