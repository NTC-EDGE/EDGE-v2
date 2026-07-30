import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING } from '@edge/ui';
import { ApplicationProvider, useApplications } from '../context/ApplicationContext';
import { ActivitiesFeedPane } from '../components/ActivitiesFeedPane';
import { ApplicationReviewScreen } from './ApplicationReviewScreen';

function NativeActivitiesContent() {
  const { colors } = useTheme();
  const { selectedId, setSelectedId } = useApplications();

  const handleClose = () => setSelectedId(null);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <PageHeader
          title="Application Queue"
          subtitle="Mobile Queue • NTC Evaluator"
        />

        {selectedId === null ? (
          <AnimatedCard padding={0} style={{ flex: 1, backgroundColor: colors.cardBg, borderColor: colors.border }}>
            <ActivitiesFeedPane />
          </AnimatedCard>
        ) : (
          <ApplicationReviewScreen onClose={handleClose} />
        )}
      </View>
    </SafeAreaView>
  );
}

export function ActivitiesScreen() {
  return (
    <ApplicationProvider>
      <NativeActivitiesContent />
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SPACING[12],
    gap: SPACING[12],
  },
});
