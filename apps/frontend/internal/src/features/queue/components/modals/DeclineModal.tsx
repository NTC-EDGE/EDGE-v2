import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, ConfirmationModal, useTheme } from '@edge/ui';

interface DeclineModalProps {
  visible: boolean;
  applicantName: string;
  title?: string;
  confirmText?: string;
  reasonLabel?: string;
  placeholder?: string;
  isLoading?: boolean;
  onConfirm: (noticeText: string) => void | Promise<void>;
  onCancel: () => void;
}

export function DeclineModal({
  visible,
  applicantName,
  title = 'Return Application',
  confirmText = 'Confirm Return',
  reasonLabel = 'Reason / Notice of Discrepancy',
  placeholder = 'Describe the reason for returning this application...',
  isLoading = false,
  onConfirm,
  onCancel,
}: DeclineModalProps) {
  const { colors, isDark } = useTheme();
  const [noticeText, setNoticeText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);

  const trimmed = noticeText.trim();
  const canSubmit = trimmed.length >= 5;
  const isBusy = isLoading || isSubmittingInternal;

  const handleConfirm = async () => {
    if (!trimmed) {
      setErrorMessage('A return reason or notice of discrepancy is required.');
      return;
    }
    if (trimmed.length < 5) {
      setErrorMessage(`Please provide at least 5 characters (${5 - trimmed.length} more required).`);
      return;
    }
    setErrorMessage(null);
    setIsSubmittingInternal(true);
    try {
      await onConfirm(trimmed);
      setNoticeText('');
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  const handleCancel = () => {
    setNoticeText('');
    setErrorMessage(null);
    onCancel();
  };

  return (
    <ConfirmationModal
      visible={visible}
      title={title}
      variant="danger"
      confirmText={confirmText}
      confirmDisabled={!canSubmit || isBusy}
      isLoading={isBusy}
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
          Return application for{' '}
          <Text
            style={{
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: isDark ? colors.neutral[200] : COLORS.neutral[700],
            }}
          >
            {applicantName}
          </Text>.
        </Text>
      }
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <View style={styles.textAreaWrapper}>
        <Text style={[styles.label, { color: isDark ? colors.neutral[300] : COLORS.neutral[700] }]}>
          {reasonLabel} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              color: isDark ? colors.neutral[100] : COLORS.neutral[800],
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
              borderColor: errorMessage
                ? COLORS.semantic.error
                : isDark
                ? colors.neutral[700]
                : COLORS.neutral[300],
            },
          ]}
          multiline
          numberOfLines={4}
          placeholder={placeholder}
          placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
          value={noticeText}
          onChangeText={(text) => {
            setNoticeText(text);
            if (errorMessage !== null && text.trim().length >= 5) {
              setErrorMessage(null);
            }
          }}
          textAlignVertical="top"
        />
        {errorMessage !== null ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        <View style={styles.hintRow}>
          <Text style={styles.mandatoryHint}>
            * Reason is required to submit return
          </Text>
          <Text style={[styles.charHint, { color: isDark ? colors.neutral[500] : COLORS.neutral[400] }]}>
            {trimmed.length < 5
              ? `${5 - trimmed.length} more characters required`
              : `${trimmed.length} characters`}
          </Text>
        </View>
      </View>
    </ConfirmationModal>
  );
}

const styles = StyleSheet.create({
  textAreaWrapper: {
    width: '100%',
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING[8],
  },
  required: {
    color: COLORS.semantic.error,
  },
  textArea: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    padding: SPACING[12],
    minHeight: 100,
    lineHeight: 20,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
    marginTop: SPACING[4],
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[4],
  },
  mandatoryHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.semantic.error,
  },
  charHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    textAlign: 'right',
  },
});

