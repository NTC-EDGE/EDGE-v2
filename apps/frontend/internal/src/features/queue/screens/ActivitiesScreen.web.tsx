import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING } from '@edge/ui';
import { ApplicationProvider, useApplications } from '../context/ApplicationContext';
import { ActivitiesFeedPane } from '../components/ActivitiesFeedPane';
import { ApplicationReviewScreen } from './ApplicationReviewScreen';

// ─── Inner content (needs ApplicationContext) ─────────────────────────────────

function WebActivitiesContent() {
  const { colors, isDark } = useTheme();
  const { setSelectedId } = useApplications();
  const { width } = useWindowDimensions();

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const handleClose = () => setSelectedId(null);
  const handleCollapse = () => setIsPanelCollapsed((p) => !p);

  // On narrow web viewports behave like native: collapse the feed pane
  const isNarrow = width < 900;

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBorderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const cardBackground = isDark ? colors.neutral[800] : colors.cardBg;

  return (
    <View style={[styles.screen, { backgroundColor: canvasBg }]}>
      {/* Page header — harmonized typography & spacing */}
      <View style={styles.headerWrapper}>
        <PageHeader
          title="Activities"
          subtitle="Application evaluation queue — review, approve, or return submissions."
        />
      </View>

      {/* Split pane layout */}
      <View style={[styles.body, isNarrow && styles.bodyNarrow]}>
        {/* Left: Feed pane */}
        {(!isNarrow || !isPanelCollapsed) && (
          <View style={[styles.feedPane, isNarrow && styles.feedPaneNarrow]}>
            <AnimatedCard
              padding={0}
              hoverEffect={false}
              style={[
                styles.card,
                { backgroundColor: cardBackground, borderColor: cardBorderColor },
              ]}
            >
              <ActivitiesFeedPane />
            </AnimatedCard>
          </View>
        )}

        {/* Right: Detail / review pane */}
        <View style={[styles.detailPane, isNarrow && styles.detailPaneNarrow]}>
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

// ─── Exported screen (wraps with context provider) ───────────────────────────

export function ActivitiesScreen() {
  return (
    <ApplicationProvider>
      <WebActivitiesContent />
    </ApplicationProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: SPACING[24],
    paddingTop: SPACING[16],
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: SPACING[24],
    paddingBottom: SPACING[24],
    gap: SPACING[16],
  },
  bodyNarrow: {
    flexDirection: 'column',
  },
  feedPane: {
    width: 380,
  },
  feedPaneNarrow: {
    width: '100%',
    flex: 1,
  },
  detailPane: {
    flex: 1,
  },
  detailPaneNarrow: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
