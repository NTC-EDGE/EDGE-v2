import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { ConfirmationModal, Icon, useTheme } from '@edge/ui';

interface ScreenShareStageProps {
  screenStream: MediaStream | null;
  presenterName?: string;
  isSelfPresenter?: boolean;
  onStopSharing?: () => void;
}

export const ScreenShareStage: React.FC<ScreenShareStageProps> = ({
  screenStream,
  presenterName,
  isSelfPresenter = true,
  onStopSharing,
}) => {
  const { colors } = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [showStopModal, setShowStopModal] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current && screenStream) {
      if (videoRef.current.srcObject !== screenStream) {
        videoRef.current.srcObject = screenStream;
        videoRef.current.play().catch(() => {
          // Handled autoplay error
        });
      }
    }
  }, [screenStream]);

  const toggleFitMode = () => {
    setFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'));
  };

  return (
    <View style={styles.stageContainer}>
      {Platform.OS === 'web' && screenStream !== null ? (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <video
          ref={(el: HTMLVideoElement | null) => {
            videoRef.current = el;
            if (el && screenStream && el.srcObject !== screenStream) {
              el.srcObject = screenStream;
            }
          }}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: fitMode,
            backgroundColor: '#090D16',
            borderRadius: 14,
          }}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Icon name="monitor" size={48} color="#3B82F6" />
          <Text style={styles.placeholderTitle}>Screen Share Preview</Text>
          <Text style={styles.placeholderDesc}>
            {isSelfPresenter ? 'Preparing your screen presentation...' : 'Waiting for presenter stream...'}
          </Text>
        </View>
      )}

      {/* Floating Presentation Overlay Header */}
      <View style={styles.floatingHeader}>
        <View style={styles.presenterBadge}>
          <View style={styles.blueDot} />
          <Icon name="monitor" size={13} color="#60A5FA" />
          <Text style={styles.presenterText} numberOfLines={1}>
            {isSelfPresenter ? 'You are sharing your screen' : `${presenterName ?? 'Presenter'} is sharing`}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.actionBtn}
            onPress={toggleFitMode}
            accessibilityLabel="Toggle screen fit mode"
          >
            <Icon name={fitMode === 'contain' ? 'maximize-2' : 'minimize-2'} size={14} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>{fitMode === 'contain' ? 'Fill' : 'Fit'}</Text>
          </Pressable>

          {isSelfPresenter && onStopSharing && (
            <Pressable
              style={styles.stopSharingBtn}
              onPress={() => setShowStopModal(true)}
              accessibilityLabel="Stop sharing screen"
            >
              <Icon name="x-circle" size={14} color="#FFFFFF" />
              <Text style={styles.stopSharingBtnText}>Stop Sharing</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Reusable Confirmation Modal to Stop Screen Sharing */}
      <ConfirmationModal
        visible={showStopModal}
        title="Stop Screen Sharing?"
        subtitle="Are you sure you want to stop sharing your screen with participants?"
        variant="warning"
        confirmText="Stop Sharing"
        cancelText="Keep Sharing"
        onCancel={() => setShowStopModal(false)}
        onConfirm={() => {
          setShowStopModal(false);
          onStopSharing?.();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  stageContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#060A13',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  placeholderDesc: {
    color: '#94A3B8',
    fontSize: 13,
  },
  floatingHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
    gap: 8,
  },
  presenterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    maxWidth: '65%',
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  presenterText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  stopSharingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  stopSharingBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
