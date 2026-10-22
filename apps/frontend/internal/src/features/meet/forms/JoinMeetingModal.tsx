import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog, Icon, useTheme } from '@edge/ui';
import { joinMeetingSchema, JoinMeetingFormValues } from '../schemas/meetSchemas';

interface JoinMeetingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: JoinMeetingFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const JoinMeetingModal: React.FC<JoinMeetingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { colors, isDark } = useTheme();

  const { control, handleSubmit, reset } = useForm<JoinMeetingFormValues>({
    resolver: zodResolver(joinMeetingSchema),
    defaultValues: {
      meetingCode: '',
    },
  });

  const handleFormSubmit = async (values: JoinMeetingFormValues) => {
    await onSubmit(values);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={handleClose}
      title="Join Meeting by Code"
      subtitle="Enter a meeting code to connect to an ongoing or scheduled session."
      icon="link"
      confirmText="Join Meeting"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={480}
    >
      <View style={styles.formContainer}>
        <FormFieldInput
          control={control}
          name="meetingCode"
          label="Meeting Code"
          placeholder="e.g. edg-a1b2c3d4"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
            },
          ]}
        >
          <Icon name="info" size={16} color={colors.brand.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            If you were not directly invited by the host, your request will be placed in the Waiting Room until the host admits you into the room.
          </Text>
        </View>
      </View>
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
