import React from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { SPACING } from '@edge/ui';
import { TransitionWrapper } from './TransitionWrapper';

interface StandardPageWrapperProps {
  children: React.ReactNode;
  activeScreen?: string;
}

export function StandardPageWrapper({
  children,
  activeScreen = 'Dashboard',
}: StandardPageWrapperProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <ScrollView
      style={styles.contentScrollView}
      contentContainerStyle={[
        styles.contentContainer,
        isMobile && styles.mobileContentContainer,
      ]}
    >
      <View style={styles.maxContainer}>
        <TransitionWrapper trigger={activeScreen}>
          {children}
        </TransitionWrapper>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING[32],
    paddingVertical: SPACING[32],
    alignItems: 'center',
  },
  mobileContentContainer: {
    paddingHorizontal: SPACING[16],
    paddingTop: SPACING[16],
    paddingBottom: 110,
  },
  maxContainer: {
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
  },
});
