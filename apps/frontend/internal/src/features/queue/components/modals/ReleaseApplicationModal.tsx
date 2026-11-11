import React from 'react';
import { Text } from 'react-native';
import { ConfirmationModal, useTheme, TYPOGRAPHY, COLORS } from '@edge/ui';

export interface ReleaseApplicationModalProps {
  visible: boolean;
  applicationNumber?: string;
  stageLabel: string;
  isOtherOfficer?: boolean;
  officerName?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ReleaseApplicationModal({
  visible,
  applicationNumber,
  stageLabel,
  isOtherOfficer = false,
  officerName,
  onConfirm,
  onCancel,
}: ReleaseApplicationModalProps) {
  const { colors, isDark } = useTheme();

  const title = isOtherOfficer
    ? 'Admin Release: Relinquish Claim?'
    : 'Release Application Authority?';

  const subtitleNode = (
    <Text
      style={{
        fontFamily: TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        color: isDark ? colors.neutral[400] : COLORS.neutral[500],
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
      }}
    >
      {isOtherOfficer ? (
        <>
          As an administrator, you are about to release application{' '}
          <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold, color: isDark ? colors.neutral[200] : COLORS.neutral[700] }}>
            {applicationNumber || 'this application'}
          </Text>{' '}
          currently claimed by{' '}
          <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold, color: isDark ? colors.neutral[200] : COLORS.neutral[700] }}>
            {officerName || 'another officer'}
          </Text>
          . It will be returned to the queue as unclaimed so another officer can take and process it.
        </>
      ) : (
        <>
          Are you sure you want to release{' '}
          <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold, color: isDark ? colors.neutral[200] : COLORS.neutral[700] }}>
            {applicationNumber || 'this application'}
          </Text>
          ? It will be returned to the queue as unclaimed for {stageLabel} so other officers can take and continue processing it.
        </>
      )}
    </Text>
  );

  return (
    <ConfirmationModal
      visible={visible}
      title={title}
      variant="warning"
      icon="unlock"
      confirmText="Confirm Release"
      cancelText="Keep Application"
      subtitle={subtitleNode}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
