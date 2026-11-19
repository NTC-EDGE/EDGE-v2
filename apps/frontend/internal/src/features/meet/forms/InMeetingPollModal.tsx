import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog, Icon, useTheme } from '@edge/ui';
import { createPollSchema, CreatePollFormValues } from '../schemas/meetSchemas';

interface InMeetingPollModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreatePollFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const InMeetingPollModal: React.FC<InMeetingPollModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { colors, isDark } = useTheme();
  const { control, handleSubmit, setValue, reset } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      isAnonymous: false,
    },
  });

  const isAnonymous = useWatch({ control, name: 'isAnonymous' });

  const handleFormSubmit = async (values: CreatePollFormValues) => {
    await onSubmit(values);
    reset();
    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title="Create Live In-Meeting Poll"
      subtitle="Gather real-time votes and feedback from attendees during the call."
      icon="bar-chart-2"
      iconVariant="primary"
      confirmText="Launch Poll"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={440}
    >
      <View style={styles.container}>
        <FormFieldInput
          control={control}
          name="question"
          label="Poll Question"
          placeholder="e.g. Approve the revised regional schedule?"
        />

        <FormFieldInput
          control={control}
          name="option1"
          label="Option 1"
          placeholder="e.g. Yes / In Favor"
        />

        <FormFieldInput
          control={control}
          name="option2"
          label="Option 2"
          placeholder="e.g. No / Against"
        />

        <FormFieldInput
          control={control}
          name="option3"
          label="Option 3 (Optional)"
          placeholder="e.g. Abstain"
        />

        <FormFieldInput
          control={control}
          name="option4"
          label="Option 4 (Optional)"
          placeholder="e.g. Needs Discussion"
        />

        <Pressable
          style={[
            styles.anonToggle,
            {
              borderColor: isAnonymous ? colors.brand.primary : colors.border,
              backgroundColor: isAnonymous
                ? colors.brand.primary + '15'
                : isDark
                  ? 'rgba(255,255,255,0.04)'
                  : '#F8FAFC',
            },
          ]}
          onPress={() => setValue('isAnonymous', !isAnonymous)}
        >
          <Icon
            name={isAnonymous ? 'check-square' : 'square'}
            size={16}
            color={isAnonymous ? colors.brand.primary : colors.textMuted}
          />
          <View style={styles.anonTextGroup}>
            <Text style={[styles.anonTitle, { color: colors.text }]}>Anonymous Voting</Text>
            <Text style={[styles.anonDesc, { color: colors.textMuted }]}>
              Hide individual voter identities in poll results
            </Text>
          </View>
        </Pressable>
      </View>
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  anonTextGroup: {
    flex: 1,
    gap: 2,
  },
  anonTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  anonDesc: {
    fontSize: 11,
  },
});
