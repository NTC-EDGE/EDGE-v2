import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Easing, StyleSheet } from 'react-native';

interface TransitionWrapperProps {
  children: React.ReactNode;
  trigger: string;
}

export function TransitionWrapper({ children, trigger }: TransitionWrapperProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // Only animate on Web. On native platforms, React Navigation handles transitions natively.
    if (Platform.OS !== 'web') {
      return;
    }

    // Reset animation values to start state
    fadeAnim.setValue(0);
    slideAnim.setValue(12);

    // Run parallel transition animation
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo
        useNativeDriver: false,
      }),
    ]);

    animation.start();

    // Cleanup: stop any running animation on unmount or trigger change
    return () => {
      animation.stop();
    };
  }, [trigger, fadeAnim, slideAnim]);

  // If not web, just return the children directly to let native navigation transitions run
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
