import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@edge/ui';
import { TransitionWrapper } from './TransitionWrapper';

export interface StandardScreenWrapperProps {
  children: React.ReactNode;
  activeScreen?: string;
}

/**
 * A thin container that wraps screen content with a transition animation.
 * Does NOT include a ScrollView — each screen manages its own scrolling
 * to avoid double-ScrollView nesting bugs on React Native Web.
 */
export function StandardScreenWrapper({
  children,
  activeScreen = 'Dashboard',
}: StandardScreenWrapperProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <TransitionWrapper trigger={activeScreen}>
        {children}
      </TransitionWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
  },
});

