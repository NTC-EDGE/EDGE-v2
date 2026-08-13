import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING } from '@edge/ui';
import { QueueTab } from '../../shell/context/PermissionContext';
import { ActivitiesFeedPane } from '../components/ActivitiesFeedPane';
import { ApplicationReviewScreen } from './ApplicationReviewScreen';

export function ActivitiesScreen() {
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('activity');

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
            <ActivitiesFeedPane
              selectedId={selectedId}
              onSelectId={setSelectedId}
              activeQueueTab={activeQueueTab}
              onSelectQueueTab={setActiveQueueTab}
            />
          </AnimatedCard>
        ) : (
          <ApplicationReviewScreen applicationId={selectedId} onClose={handleClose} />
        )}
      </View>
    </SafeAreaView>
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
  toastContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 999,
  },
});
