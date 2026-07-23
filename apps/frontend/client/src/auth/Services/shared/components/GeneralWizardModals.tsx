import React from "react";
import { Alert } from "react-native";
import { UploadChoiceDialog } from "./UploadChoiceDialog";
import { DeclarationModal } from "./DeclarationModal";
import { FeedbackModal } from "./FeedbackModal";
import { GeneralLoadingOverlay } from "./GeneralLoadingOverlay";

interface GeneralWizardModalsProps {
  isUploadSheetOpen: boolean;
  setIsUploadSheetOpen: (open: boolean) => void;
  handleDocumentPick: () => void;
  handleCameraLaunch: () => void;
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
  isUploadSheetOpen,
  setIsUploadSheetOpen,
  handleDocumentPick,
  handleCameraLaunch,
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
  return (
    <>
      <UploadChoiceDialog
        visible={isUploadSheetOpen}
        onClose={() => setIsUploadSheetOpen(false)}
        onDocumentPick={handleDocumentPick}
        onCameraLaunch={handleCameraLaunch}
      />

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
            setIsFeedbackModalOpen(true);
          } catch (err) {
            Alert.alert("Error", "Submission failed.");
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
