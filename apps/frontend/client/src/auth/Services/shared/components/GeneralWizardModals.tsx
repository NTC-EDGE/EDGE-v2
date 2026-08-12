import React from "react";
import { DeclarationModal } from "./DeclarationModal";
import { FeedbackModal } from "./FeedbackModal";
import { GeneralLoadingOverlay } from "./GeneralLoadingOverlay";
import { useToast } from "../../../../shared/components/Toast";

interface GeneralWizardModalsProps {
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (open: boolean) => void;
  isAgreedToTerms: boolean;
  setIsAgreedToTerms: (agreed: boolean | ((p: boolean) => boolean)) => void;
  submitApplicationPayload: () => Promise<void>;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  feedbackRating: number;
  setFeedbackRating: (rating: number) => void;
  feedbackComment: string;
  setFeedbackComment: (comment: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  onSuccess: () => void;
}

export function GeneralWizardModals({
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  isAgreedToTerms,
  setIsAgreedToTerms,
  submitApplicationPayload,
  isFeedbackModalOpen,
  setIsFeedbackModalOpen,
  feedbackRating,
  setFeedbackRating,
  feedbackComment,
  setFeedbackComment,
  isSubmitting,
  setIsSubmitting,
  onSuccess,
}: GeneralWizardModalsProps) {
  const toast = useToast();

  return (
    <>
      <DeclarationModal
        visible={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        isAgreed={isAgreedToTerms}
        onToggleAgree={() => setIsAgreedToTerms((prev) => !prev)}
        onConfirm={async () => {
          setIsConfirmModalOpen(false);
          setIsSubmitting(true);
          try {
            await submitApplicationPayload();
            toast.success(
              "Application Submitted",
              "Your application has been received and is now under review by NTC officers."
            );
            setIsFeedbackModalOpen(true);
          } catch (err: unknown) {
            const message =
              err instanceof Error && err.message.length > 0
                ? err.message
                : "Submission failed. Please try again.";
            toast.error("Submission Failed", message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <FeedbackModal
        visible={isFeedbackModalOpen}
        rating={feedbackRating}
        setRating={setFeedbackRating}
        comment={feedbackComment}
        setComment={setFeedbackComment}
        onSubmit={() => {
          setIsFeedbackModalOpen(false);
          onSuccess();
        }}
      />

      <GeneralLoadingOverlay visible={isSubmitting} />
    </>
  );
}
