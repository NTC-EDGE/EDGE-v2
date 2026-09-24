import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, AnimatedCard } from '@edge/ui';
import {
  ApplicationReviewScreenContent,
  ApplicationReviewScreenProps,
} from './ApplicationReviewScreenContent';

export function ApplicationReviewScreen(props: ApplicationReviewScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <AnimatedCard delay={0} padding={0} hoverEffect={false} style={styles.cardWrapper}>
        <ApplicationReviewScreenContent {...props} />
      </AnimatedCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});
