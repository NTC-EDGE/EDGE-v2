import React from 'react';
import { Text } from 'react-native';
import { TYPOGRAPHY, COLORS, ConfirmationModal, useTheme } from '@edge/ui';

interface ApproveModalProps {
  visible: boolean;
  applicantName: string;
  title?: string;
  confirmText?: string;
  subtitleText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ApproveModal({
  visible,
  applicantName,
  title = 'Approve Application',
  confirmText = 'Confirm Approval',
  subtitleText,
  onConfirm,
  onCancel,
}: ApproveModalProps) {
  const { colors, isDark } = useTheme();

  return (
    <ConfirmationModal
      visible={visible}
      title={title}
      variant="success"
      confirmText={confirmText}
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
          {subtitleText !== undefined && subtitleText.length > 0 ? (
            subtitleText
          ) : (
            <>
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
            </>
          )}
        </Text>
      }
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
