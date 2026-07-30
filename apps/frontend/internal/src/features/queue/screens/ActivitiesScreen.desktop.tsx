import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING } from '@edge/ui';
import { ApplicationProvider, useApplications } from '../context/ApplicationContext';
import { ActivitiesFeedPane } from '../components/ActivitiesFeedPane';
import { ApplicationReviewScreen } from './ApplicationReviewScreen';

function DesktopActivitiesContent() {
  const { colors } = useTheme();
  const { setSelectedId } = useApplications();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const handleClose = () => setSelectedId(null);
  const handleCollapse = () => setIsPanelCollapsed((p) => !p);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.headerWrapper}>
        <PageHeader
          title="Queue Command Center"
          subtitle="Desktop Workstation • Operational application queue, evaluation workspace, and review tools."
        />
      </View>

      <View style={styles.desktopLayout}>
        {!isPanelCollapsed && (
          <View style={styles.feedPane}>
            <AnimatedCard padding={0} style={{ flex: 1, backgroundColor: colors.cardBg, borderColor: colors.border }}>
              <ActivitiesFeedPane />
            </AnimatedCard>
          </View>
        )}

        <View style={styles.detailPane}>
          <ApplicationReviewScreen
            onClose={handleClose}
            onCollapse={handleCollapse}
            isCollapsed={isPanelCollapsed}
          />
        </View>
      </View>
    </View>
  );
}

export function ActivitiesScreen() {
  return (
    <ApplicationProvider>
      <DesktopActivitiesContent />
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: SPACING[24],
    paddingTop: SPACING[16],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: SPACING[24],
    paddingBottom: SPACING[24],
    gap: SPACING[16],
  },
  feedPane: {
    width: 380,
  },
  detailPane: {
    flex: 1,
  },
});
