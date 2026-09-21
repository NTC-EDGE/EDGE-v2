import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, useTheme, ConfirmationModal } from '@edge/ui';

export type ApplicantVerdictType = 'Complete' | 'Incomplete' | 'ForEndorsement';

export interface ApplicantVerdictModalProps {
  visible: boolean;
  applicantName: string;
  targetVerdict: ApplicantVerdictType | null;
  initialRemarks?: string;
  onConfirm: (verdict: ApplicantVerdictType, remarks: string) => void;
  onCancel: () => void;
}

export function ApplicantVerdictModal({
  visible,
  applicantName,
  targetVerdict,
  initialRemarks = '',
  onConfirm,
  onCancel,
}: ApplicantVerdictModalProps) {
  const { colors, isDark } = useTheme();
  const [remarks, setRemarks] = useState(initialRemarks);

  useEffect(() => {
    setRemarks(initialRemarks);
  }, [initialRemarks, visible]);

  if (!visible || targetVerdict === null) return null;

  const isComplete = targetVerdict === 'Complete';
  const isIncomplete = targetVerdict === 'Incomplete';

  const title = isComplete
    ? 'Mark Applicant as Complete'
    : isIncomplete
    ? 'Mark Applicant as Incomplete'
    : 'Endorse Applicant Record';

  const subtitle = isComplete
    ? `You are confirming that all submitted documents and requirements for ${applicantName} have been verified.`
    : isIncomplete
    ? `You are marking ${applicantName} as Incomplete. Please specify the required deficiencies or missing documents below.`
    : `You are routing ${applicantName}'s record for specialized technical or management endorsement.`;

  const variant = isComplete ? 'success' : isIncomplete ? 'danger' : 'purple';
  const confirmText = isComplete
    ? 'Confirm Complete'
    : isIncomplete
    ? 'Confirm Incomplete'
    : 'Confirm Endorsement';

  return (
    <ConfirmationModal
      visible={visible}
      title={title}
      subtitle={subtitle}
      variant={variant}
      confirmText={confirmText}
      onConfirm={() => onConfirm(targetVerdict, remarks.trim())}
      onCancel={onCancel}
    >
      <View style={styles.inputWrapper}>
        <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
          {isIncomplete ? 'Deficiency / Discrepancy Remarks *' : 'Evaluation Remarks (Optional)'}
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              color: isDark ? colors.neutral[100] : colors.neutral[900],
              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
            },
          ]}
          multiline
          numberOfLines={3}
          placeholder={
            isIncomplete
              ? 'Describe missing documents or corrections required...'
              : 'Add any notes for this evaluation record...'
          }
          placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
          value={remarks}
          onChangeText={setRemarks}
          textAlignVertical="top"
        />
      </View>
    </ConfirmationModal>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
  },
  inputLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 6,
  },
  textArea: {
    width: '100%',
    minHeight: 80,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[12],
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
});
