import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog } from '@edge/ui';
import { createMeetingSchema, CreateMeetingFormValues } from '../schemas/meetSchemas';
import { TenantParticipantPicker } from '../../../shared/components';

interface CreateMeetingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreateMeetingFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { control, handleSubmit, setValue, reset } = useForm<CreateMeetingFormValues>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: '',
      description: '',
      scope: 'IntraRegional',
      scheduledStartTime: new Date().toISOString(),
      participantUserIds: [],
    },
  });

  const selectedUserIds = useWatch({ control, name: 'participantUserIds' }) || [];

  const handleSelectedUserIdsChange = (userIds: string[]) => {
    setValue('participantUserIds', userIds, { shouldValidate: true });
  };

  const handleFormSubmit = async (values: CreateMeetingFormValues) => {
    await onSubmit(values);
    reset();
    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title="Schedule Regional Meeting"
      subtitle="Select tenant office and invite members to conference."
      icon="video"
      confirmText="Schedule Meeting"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={540}
    >
      <View style={styles.formContent}>
        <FormFieldInput
          control={control}
          name="title"
          label="Meeting Title"
          placeholder="e.g. Q3 Regional Coordination Meeting"
        />
        <FormFieldInput
          control={control}
          name="description"
          label="Agenda / Notes (Optional)"
          placeholder="Key discussion points..."
        />

        <TenantParticipantPicker
          label={`Invite Participants (${selectedUserIds.length} invited)`}
          selectedUserIds={selectedUserIds}
          onSelectedUserIdsChange={handleSelectedUserIdsChange}
          listMaxHeight={180}
        />
      </View>
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  formContent: {
    gap: 12,
  },
});
