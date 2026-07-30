import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useTheme, AnimatedCard } from '@edge/ui';
import {
  ApplicationReviewScreenContent,
  ApplicationReviewScreenProps,
} from './ApplicationReviewScreenContent';

export function ApplicationReviewScreen(props: ApplicationReviewScreenProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <AnimatedCard delay={0} padding={0} hoverEffect={false} style={styles.cardWrapper}>
        <ApplicationReviewScreenContent {...props} />
      </AnimatedCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});
