import React, { useState } from "react";
import { DeclarationModal } from "./DeclarationModal";
import { FeedbackModal } from "./FeedbackModal";
import { PostSubmissionSuccessModal } from "./PostSubmissionSuccessModal";
import { SubmissionFailureModal } from "./SubmissionFailureModal";
import { GeneralLoadingOverlay } from "./GeneralLoadingOverlay";
import { useToast } from "../../../../shared/components/Toast";

interface GeneralWizardModalsProps {
  serviceTitle?: string;
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (open: boolean) => void;
  isAgreedToTerms: boolean;
  setIsAgreedToTerms: (agreed: boolean | ((p: boolean) => boolean)) => void;
  submitApplicationPayload: (isDraft?: boolean) => Promise<void>;
  submitFeedback?: (rating: number, comment: string) => Promise<void>;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  feedbackRating: number;
  setFeedbackRating: (rating: number) => void;
  feedbackComment: string;
  setFeedbackComment: (comment: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  onSuccess: () => void;
  onApplyMore?: () => void;
  onSaveDraft?: () => Promise<boolean | void> | void;
}

export function GeneralWizardModals({
  serviceTitle,
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  isAgreedToTerms,
  setIsAgreedToTerms,
  submitApplicationPayload,
  submitFeedback,
  isFeedbackModalOpen,
  setIsFeedbackModalOpen,
  feedbackRating,
  setFeedbackRating,
  feedbackComment,
  setFeedbackComment,
  isSubmitting,
  setIsSubmitting,
  onSuccess,
  onApplyMore,
  onSaveDraft,
}: GeneralWizardModalsProps) {
  const toast = useToast();
  const [isPostSubmissionModalOpen, setIsPostSubmissionModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [failureErrorMessage, setFailureErrorMessage] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSavingDraftState, setIsSavingDraftState] = useState(false);

  const executeSubmission = async () => {
    setIsSubmitting(true);
    setIsRetrying(true);
    try {
      await submitApplicationPayload(false);
      setIsFailureModalOpen(false);
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
      setFailureErrorMessage(message);
      setIsFailureModalOpen(true);
      toast.error("Submission Incomplete", message);
    } finally {
      setIsSubmitting(false);
      setIsRetrying(false);
    }
  };

  const handleSaveDraftAction = async () => {
    setIsSavingDraftState(true);
    try {
      if (onSaveDraft) {
        await onSaveDraft();
      } else {
        await submitApplicationPayload(true);
      }
      setIsFailureModalOpen(false);
      toast.success(
        "Draft Saved",
        "Your application progress and documents have been saved as a draft."
      );
    } catch (draftErr: unknown) {
      const draftMsg =
        draftErr instanceof Error && draftErr.message.length > 0
          ? draftErr.message
          : "Failed to save draft. Please check your connection.";
      toast.error("Draft Save Failed", draftMsg);
    } finally {
      setIsSavingDraftState(false);
    }
  };

  return (
    <>
      <DeclarationModal
        visible={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        isAgreed={isAgreedToTerms}
        onToggleAgree={() => setIsAgreedToTerms((prev) => !prev)}
        onConfirm={async () => {
          setIsConfirmModalOpen(false);
          await executeSubmission();
        }}
      />

      <FeedbackModal
        visible={isFeedbackModalOpen}
        rating={feedbackRating}
        setRating={setFeedbackRating}
        comment={feedbackComment}
        setComment={setFeedbackComment}
        onSubmit={async () => {
          if (feedbackRating > 0 && submitFeedback) {
            await submitFeedback(feedbackRating, feedbackComment);
          }
          setIsFeedbackModalOpen(false);
          setIsPostSubmissionModalOpen(true);
        }}
      />

      <PostSubmissionSuccessModal
        visible={isPostSubmissionModalOpen}
        serviceTitle={serviceTitle}
        onViewApplications={() => {
          setIsPostSubmissionModalOpen(false);
          onSuccess();
        }}
        onApplyMore={() => {
          setIsPostSubmissionModalOpen(false);
          if (onApplyMore) {
            onApplyMore();
          } else {
            onSuccess();
          }
        }}
      />

      <SubmissionFailureModal
        visible={isFailureModalOpen}
        errorMessage={failureErrorMessage}
        onRetry={executeSubmission}
        onSaveDraft={handleSaveDraftAction}
        onClose={() => setIsFailureModalOpen(false)}
        isRetrying={isRetrying}
        isSavingDraft={isSavingDraftState}
      />

      <GeneralLoadingOverlay visible={isSubmitting && !isFailureModalOpen} />
    </>
  );
}
