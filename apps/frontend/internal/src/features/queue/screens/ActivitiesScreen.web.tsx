import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, useWindowDimensions } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING } from '@edge/ui';
import { QueueTab } from '../../shell/context/PermissionContext';
import { ActivitiesFeedPane } from '../components/ActivitiesFeedPane';
import { ApplicationReviewScreen } from './ApplicationReviewScreen';
import {
  consumePendingQueueApplication,
  subscribeToQueueApplication,
} from '../data/internalApplicationNavigationHelper';

export function ActivitiesScreen() {
  const { colors, isDark } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('activity');
  const { width } = useWindowDimensions();

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const collapseAnim = useRef(new Animated.Value(0)).current;

  const handleClose = () => setSelectedId(null);
  const handleCollapse = () => setIsPanelCollapsed((p) => !p);

  useEffect(() => {
    const pending = consumePendingQueueApplication();
    if (pending !== null && pending !== '') {
      setSelectedId(pending);
    }

    const unsubscribe = subscribeToQueueApplication((appId) => {
      setSelectedId(appId);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.timing(collapseAnim, {
      toValue: isPanelCollapsed ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isPanelCollapsed, collapseAnim]);

  // On narrow web viewports behave like native: show feed OR detail, not both
  const isNarrow = width < 900;
  const showDetail = isNarrow && selectedId !== null;
  const showFeed = !isNarrow || !showDetail;

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
      {/* Page header — wide only; narrow relies on bottom nav + Feed card label for context */}
      {!isNarrow && (
        <View style={styles.headerWrapper}>
          <PageHeader
            title="Activities"
            subtitle="Application evaluation queue — review, approve, or return submissions."
          />
        </View>
      )}

      {/* Split pane layout */}
      <View style={[
        styles.body,
        isNarrow && styles.bodyNarrow,
        isNarrow && !showDetail && styles.bodyNarrowFeed,
        isNarrow && showDetail && styles.bodyNarrowDetail,
      ]}>
        {/* Left: Feed pane — hidden on narrow when an item is selected */}
        {showFeed && (
          <Animated.View
            style={[
              styles.feedPaneWrapper,
              isNarrow && styles.feedPaneNarrow,
              !isNarrow && {
                width: feedWidth,
                opacity: feedOpacity,
                overflow: 'hidden',
              },
            ]}
          >
            <View style={[styles.feedPaneInner, isNarrow && styles.feedPaneInnerNarrow]}>
              <AnimatedCard
                padding={0}
                hoverEffect={false}
                style={[
                  styles.card,
                  isNarrow && styles.cardNarrow,
                  { backgroundColor: cardBackground, borderColor: cardBorderColor },
                ]}
              >
                <ActivitiesFeedPane
                  selectedId={selectedId}
                  onSelectId={setSelectedId}
                  activeQueueTab={activeQueueTab}
                  onSelectQueueTab={setActiveQueueTab}
                />
              </AnimatedCard>
            </View>
          </Animated.View>
        )}

        {/* Right: Detail / review pane — hidden on narrow when no item is selected */}
        {(!isNarrow || showDetail) && (
          <View style={[styles.detailPane, isNarrow && styles.detailPaneNarrow]}>
            <ApplicationReviewScreen
              applicationId={selectedId}
              onClose={handleClose}
              onCollapse={!isNarrow ? handleCollapse : undefined}
              isCollapsed={!isNarrow ? isPanelCollapsed : undefined}
            />
          </View>
        )}
      </View>
    </View>
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
  // Narrow feed: flush to shell edges, no extra padding
  bodyNarrowFeed: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    gap: 0,
  },
  // Narrow detail: also flush
  bodyNarrowDetail: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    gap: 0,
  },
  feedPaneWrapper: {
    height: '100%',
  },
  feedPaneInner: {
    width: 380,
    height: '100%',
  },
  feedPaneInnerNarrow: {
    width: '100%',
  },
  feedPaneNarrow: {
    width: '100%',
    height: '100%',
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
  // Edge-to-edge on narrow: no rounded corners, no visible border
  cardNarrow: {
    borderRadius: 0,
    borderWidth: 0,
  },
  toastContainer: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 999,
  },
});
