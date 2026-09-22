import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog } from '@edge/ui';
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
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: '',
      option1: '',
      option2: '',
      option3: '',
      isAnonymous: false,
    },
  });

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
      subtitle="Gather live feedback and votes from attendees during the call."
      icon="bar-chart-2"
      iconVariant="primary"
      confirmText="Launch Poll"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={440}
    >
      <FormFieldInput
        control={control}
        name="question"
        label="Poll Question"
        placeholder="e.g. Approve the revised budget?"
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
    </ModalDialog>
  );
};
