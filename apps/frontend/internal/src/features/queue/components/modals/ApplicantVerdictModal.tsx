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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setRemarks(initialRemarks);
    setErrorMessage(null);
  }, [initialRemarks, visible]);

  if (!visible || targetVerdict === null) return null;

  const isComplete = targetVerdict === 'Complete';
  const isIncomplete = targetVerdict === 'Incomplete';
  const trimmed = remarks.trim();
  const canConfirm = !isIncomplete || trimmed.length >= 5;

  const handleConfirm = () => {
    if (isIncomplete && trimmed.length < 5) {
      setErrorMessage('Please provide a deficiency or discrepancy reason (minimum 5 characters).');
      return;
    }
    setErrorMessage(null);
    onConfirm(targetVerdict, trimmed);
  };

  const handleCancel = () => {
    setErrorMessage(null);
    onCancel();
  };

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
      confirmDisabled={!canConfirm}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
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
              borderColor: errorMessage !== null
                ? COLORS.semantic.error
                : isDark
                ? colors.neutral[700]
                : colors.neutral[300],
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
          onChangeText={(text) => {
            setRemarks(text);
            if (errorMessage !== null && (!isIncomplete || text.trim().length >= 5)) {
              setErrorMessage(null);
            }
          }}
          textAlignVertical="top"
        />
        {errorMessage !== null ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
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
