import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../theme/useTheme';

export type SkeletonVariant = 'text' | 'rectangular' | 'circular';

export interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  variant?: SkeletonVariant;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius,
  variant = 'rectangular',
  style,
}: SkeletonLoaderProps) {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
      if (isMounted) {
        setReduceMotion(isEnabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled: boolean) => {
        if (isMounted) {
          setReduceMotion(isEnabled);
        }
      }
    );

    return () => {
      isMounted = false;
      if (subscription !== undefined && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.6);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1.0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, reduceMotion]);

  const computeRadius = (): number => {
    if (borderRadius !== undefined) {
      return borderRadius;
    }
    if (variant === 'circular') {
      return typeof height === 'number' ? height / 2 : 9999;
    }
    if (variant === 'text') {
      return 4;
    }
    return 8;
  };

  const baseBg = isDark ? colors.neutral[800] : colors.neutral[200];

  const computedStyle: ViewStyle = {
    width: width,
    height: height,
    borderRadius: computeRadius(),
    backgroundColor: baseBg,
  };

  return <Animated.View style={[styles.skeleton, computedStyle, { opacity }, style]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
