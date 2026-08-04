import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { apiClient } from '@edge/api';
import { AlertToast, useTheme, SPACING } from '@edge/ui';

const TOAST_DURATION_MS = 5000;

/**
 * ForbiddenToastProvider
 *
 * Registers an axios response interceptor on the shared apiClient and
 * displays an AlertToast whenever any request returns HTTP 403 Forbidden.
 *
 * Self-contained within the frontend — no changes needed in packages/api.
 */
export function ForbiddenToastProvider({ children }: { readonly children: React.ReactNode }) {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, [opacity]);

  const show = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    opacity.setValue(0);
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    timerRef.current = setTimeout(dismiss, TOAST_DURATION_MS);
  }, [opacity, dismiss]);

  useEffect(() => {
    // Register an axios response interceptor on the shared apiClient.
    // This is the same apiClient all SWR hooks use, so any 403 from any
    // GET request will be caught here.
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (typeof error === 'object' && error !== null) {
          const response = (error as Record<string, unknown>)['response'];
          if (typeof response === 'object' && response !== null) {
            const status = (response as Record<string, unknown>)['status'];
            if (status === 403) {
              show();
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [show]);

  return (
    <View style={styles.root}>
      {children}
      {visible && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Animated.View style={[styles.toastWrapper, { opacity }]}>
            <AlertToast
              message="You don't have permission to access this resource."
              variant="warning"
              onDismiss={dismiss}
              style={{
                shadowColor: isDark ? '#000' : '#64748B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    zIndex: 99999,
  },
  toastWrapper: {
    marginTop: SPACING[16],
    marginRight: SPACING[24],
    maxWidth: 420,
    width: '90%',
  },
});
