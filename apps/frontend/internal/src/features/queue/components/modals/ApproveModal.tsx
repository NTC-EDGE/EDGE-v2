import React from 'react';
import { Text } from 'react-native';
import { TYPOGRAPHY, COLORS, ConfirmationModal, useTheme } from '@edge/ui';

interface ApproveModalProps {
  visible: boolean;
  applicantName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ApproveModal({ visible, applicantName, onConfirm, onCancel }: ApproveModalProps) {
  const { colors, isDark } = useTheme();

  return (
    <ConfirmationModal
      visible={visible}
      title="Approve Application"
      variant="success"
      confirmText="Confirm Approval"
      subtitle={
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
          You are about to approve the application for{' '}
          <Text
            style={{
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: isDark ? colors.neutral[200] : COLORS.neutral[700],
            }}
          >
            {applicantName}
          </Text>.
          {'\n'}This action cannot be undone.
        </Text>
      }
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
