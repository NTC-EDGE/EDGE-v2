import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog } from '@edge/ui';
import { createGroupChatSchema, CreateGroupChatFormValues } from '../schemas/chatSchemas';
import { TenantParticipantPicker } from '../../../shared/components';

interface CreateGroupChatModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupChatFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { control, handleSubmit, setValue, reset } = useForm<CreateGroupChatFormValues>({
    resolver: zodResolver(createGroupChatSchema),
    defaultValues: {
      title: '',
      description: '',
      scope: 'IntraRegional',
      participantUserIds: [],
    },
  });

  const selectedUserIds = useWatch({ control, name: 'participantUserIds' }) || [];

  const handleSelectedUserIdsChange = (userIds: string[]) => {
    setValue('participantUserIds', userIds, { shouldValidate: true });
  };

  const handleFormSubmit = async (values: CreateGroupChatFormValues) => {
    await onSubmit(values);
    reset();
    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title="Create Group Chat"
      subtitle="Select tenant office and add members to group."
      icon="users"
      confirmText="Create Group"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={540}
    >
      <View style={styles.formContent}>
        <FormFieldInput
          control={control}
          name="title"
          label="Group Title"
          placeholder="e.g. Operations & Finance Taskforce"
        />
        <FormFieldInput
          control={control}
          name="description"
          label="Description (Optional)"
          placeholder="Purpose of this group..."
        />

        <TenantParticipantPicker
          label={`Add Participants (${selectedUserIds.length} selected)`}
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
