import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog } from '@edge/ui';
import { createGroupChatSchema, CreateGroupChatFormValues } from '../schemas/chatSchemas';

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
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<CreateGroupChatFormValues>({
    resolver: zodResolver(createGroupChatSchema),
    defaultValues: {
      title: '',
      description: '',
      scope: 'IntraRegional',
      participantUserIds: [],
    },
  });

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
      subtitle="Collaborate across regional units, field offices, and divisions."
      icon="users"
      iconVariant="primary"
      confirmText="Create Group"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={480}
    >
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
        placeholder="Purpose and scope of this group..."
      />
    </ModalDialog>
  );
};
