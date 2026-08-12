import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING, AlertToast } from '@edge/ui';
import { ApplicationProvider, useApplications } from '../context/ApplicationContext';
import { ActivitiesFeedPane } from '../components/ActivitiesFeedPane';
import { ApplicationReviewScreen } from './ApplicationReviewScreen';

function NativeActivitiesContent() {
  const { colors } = useTheme();
  const { selectedId, setSelectedId, toast, dismissToast } = useApplications();

  const handleClose = () => setSelectedId(null);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      {toast !== null && (
        <View style={styles.toastContainer}>
          <AlertToast
            message={toast.message}
            variant={toast.variant}
            onDismiss={dismissToast}
          />
        </View>
      )}
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
  toastContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 999,
  },
});
