import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING } from '@edge/ui';
import { QueueTab } from '../../shell/context/PermissionContext';
import { ActivitiesFeedPane } from '../components/ActivitiesFeedPane';
import { ApplicationReviewScreen } from './ApplicationReviewScreen';

export function ActivitiesScreen() {
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('activity');
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

  const feedWidth = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [380, 0],
  });

  const feedOpacity = collapseAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0, 0],
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.headerWrapper}>
        <PageHeader
          title="Queue Command Center"
          subtitle="Desktop Workstation • Operational application queue, evaluation workspace, and review tools."
        />
      </View>

      <View style={styles.desktopLayout}>
        <Animated.View
          style={[
            styles.feedPaneWrapper,
            {
              width: feedWidth,
              opacity: feedOpacity,
              overflow: 'hidden',
            },
          ]}
        >
          <View style={styles.feedPaneInner}>
            <AnimatedCard padding={0} style={{ flex: 1, backgroundColor: colors.cardBg, borderColor: colors.border }}>
              <ActivitiesFeedPane
                selectedId={selectedId}
                onSelectId={setSelectedId}
                activeQueueTab={activeQueueTab}
                onSelectQueueTab={setActiveQueueTab}
              />
            </AnimatedCard>
          </View>
        </Animated.View>

        <View style={styles.detailPane}>
          <ApplicationReviewScreen
            applicationId={selectedId}
            onClose={handleClose}
            onCollapse={handleCollapse}
            isCollapsed={isPanelCollapsed}
          />
        </View>
      </View>
    </View>
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
  feedPaneWrapper: {
    height: '100%',
  },
  feedPaneInner: {
    width: 380,
    height: '100%',
  },
  detailPane: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 999,
  },
});
