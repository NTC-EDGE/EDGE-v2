import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, ConfirmationModal, useTheme } from '@edge/ui';

interface DeclineModalProps {
  visible: boolean;
  applicantName: string;
  onConfirm: (noticeText: string) => void;
  onCancel: () => void;
}

export function DeclineModal({ visible, applicantName, onConfirm, onCancel }: DeclineModalProps) {
  const { colors, isDark } = useTheme();
  const [noticeText, setNoticeText] = useState('');
  const canSubmit = noticeText.trim().length > 10;

  const handleConfirm = () => {
    if (canSubmit) {
      onConfirm(noticeText);
      setNoticeText('');
    }
  };

  const handleCancel = () => {
    setNoticeText('');
    onCancel();
  };

  return (
    <ConfirmationModal
      visible={visible}
      title="Decline Application"
      variant="danger"
      confirmText="Decline Application"
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
          Declining the application for{' '}
          <Text
            style={{
              fontWeight: TYPOGRAPHY.weights.semibold,
              color: isDark ? colors.neutral[200] : COLORS.neutral[700],
            }}
          >
            {applicantName}
          </Text>.
          {'\n'}Please provide a Notice of Discrepancy.
        </Text>
      }
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <View style={styles.textAreaWrapper}>
        <Text style={[styles.label, { color: isDark ? colors.neutral[300] : COLORS.neutral[700] }]}>
          Notice of Discrepancy <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              color: isDark ? colors.neutral[100] : COLORS.neutral[800],
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral[50],
              borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300],
            },
          ]}
          multiline
          numberOfLines={4}
          placeholder="Describe the discrepancy or reason for declining this application..."
          placeholderTextColor={isDark ? colors.neutral[500] : COLORS.neutral[400]}
          value={noticeText}
          onChangeText={setNoticeText}
          textAlignVertical="top"
        />
        <Text style={[styles.charHint, { color: isDark ? colors.neutral[500] : COLORS.neutral[400] }]}>
          {noticeText.trim().length < 10
            ? `${10 - noticeText.trim().length} more characters required`
            : `${noticeText.trim().length} characters`}
        </Text>
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
  charHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: SPACING[4],
    textAlign: 'right',
  },
});
