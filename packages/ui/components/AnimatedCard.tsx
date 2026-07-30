import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { RADIUS, SHADOWS } from '../theme/tokens';

export interface AnimatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  onPress?: () => void;
  hoverEffect?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  style,
  padding = 16,
  onPress,
  hoverEffect = true,
  delay = 0,
}: AnimatedCardProps) {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const [isHovered, setIsHovered] = useState(false);
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
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]);
    animation.start();
  }, [fadeAnim, slideAnim, delay, reduceMotion]);

  const isInteractive = onPress !== undefined;

  const cardStyle: ViewStyle = {
    padding,
    backgroundColor: colors.cardBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    shadowColor: colors.neutral[900],
  };

  const hoverStyle: ViewStyle =
    hoverEffect && isHovered
      ? {
          borderColor: isDark ? colors.brand[600] : colors.brand[500],
          backgroundColor: isDark ? colors.neutral[800] : colors.neutral.white,
        }
      : {};

  const webDarkShadowStyle: ViewStyle =
    Platform.OS === 'web' && isDark
      ? {
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }
      : {};

  const content = (
    <Animated.View
      style={[
        styles.card,
        SHADOWS.card,
        cardStyle,
        hoverStyle,
        webDarkShadowStyle,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );

  if (isInteractive) {
    return (
      <Pressable
        onPress={onPress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={({ pressed }) => [
          styles.pressableWrapper,
          pressed ? styles.pressedState : null,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  pressableWrapper: {
    width: '100%',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  pressedState: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
