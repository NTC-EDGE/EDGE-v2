import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { COLORS } from '@edge/ui';
import { ApplicationProvider } from '../context/ApplicationContext';
import { ActivitiesFeedPane } from '../components/ActivitiesFeedPane';
import { ApplicationReviewScreen } from './ApplicationReviewScreen';
import { useApplications } from '../context/ApplicationContext';

const DESKTOP_BREAKPOINT = 1024;

function ActivitiesContent() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const { selectedId, setSelectedId } = useApplications();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const handleClose = () => setSelectedId(null);
  const handleCollapse = () => setIsPanelCollapsed((p) => !p);

  if (isDesktop) {
    return (
      <View style={styles.desktopLayout}>
        {/* Left Feed Pane — always visible */}
        {!isPanelCollapsed && <ActivitiesFeedPane />}

        {/* Right Detail Pane */}
        <View style={styles.detailPane}>
          <ApplicationReviewScreen
            onClose={handleClose}
            onCollapse={handleCollapse}
            isCollapsed={isPanelCollapsed}
          />
        </View>
      </View>
    );
  }

  // Mobile: show feed list; selecting a card replaces the view with detail
  return (
    <View style={styles.mobileLayout}>
      {selectedId === null ? (
        <ActivitiesFeedPane />
      ) : (
        <ApplicationReviewScreen
          onClose={handleClose}
        />
      )}
    </View>
  );
}

export function ActivitiesScreen() {
  return (
    <ApplicationProvider>
      <View style={styles.root}>
        <ActivitiesContent />
      </View>
    </ApplicationProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  detailPane: {
    flex: 1,
  },
  mobileLayout: {
    flex: 1,
  },
});
