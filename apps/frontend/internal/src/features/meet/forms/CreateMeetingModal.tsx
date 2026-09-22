import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog } from '@edge/ui';
import { createMeetingSchema, CreateMeetingFormValues } from '../schemas/meetSchemas';

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
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<CreateMeetingFormValues>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: '',
      description: '',
      scope: 'IntraRegional',
      scheduledStartTime: new Date().toISOString(),
    },
  });

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
      subtitle="Set up a video/audio conference for your region or inter-regional teams."
      icon="video"
      iconVariant="accent"
      confirmText="Schedule Meeting"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={480}
    >
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
        placeholder="Key discussion points and agenda items..."
      />
    </ModalDialog>
  );
};
