import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, useWindowDimensions } from 'react-native';
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
  const collapseAnim = useRef(new Animated.Value(0)).current;

  const handleClose = () => setSelectedId(null);
  const handleCollapse = () => setIsPanelCollapsed((p) => !p);

  useEffect(() => {
    Animated.timing(collapseAnim, {
      toValue: isPanelCollapsed ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isPanelCollapsed, collapseAnim]);

  // On narrow web viewports behave like native: collapse the feed pane
  const isNarrow = width < 900;

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBorderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const cardBackground = isDark ? colors.neutral[800] : colors.cardBg;

  const feedWidth = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [380, 0],
  });

  const feedOpacity = collapseAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0, 0],
  });

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
        {/* Left: Feed pane (animated width & opacity) */}
        <Animated.View
          style={[
            styles.feedPaneWrapper,
            isNarrow && styles.feedPaneNarrow,
            {
              width: isNarrow ? (isPanelCollapsed ? 0 : '100%') : feedWidth,
              opacity: feedOpacity,
              overflow: 'hidden',
            },
          ]}
        >
          <View style={styles.feedPaneInner}>
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
        </Animated.View>

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
  feedPaneWrapper: {
    height: '100%',
  },
  feedPaneInner: {
    width: 380,
    height: '100%',
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
