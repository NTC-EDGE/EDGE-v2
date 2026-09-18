import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { ApplicantData } from "../../types/cpeTypes";
import { useToast } from "../../../../../../shared/components/Toast";
import { SubmissionFailureModal } from "../../../../shared/components/SubmissionFailureModal";

interface CPEWizardModalsProps {
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (open: boolean) => void;
  isAgreedToTerms: boolean;
  setIsAgreedToTerms: (agreed: boolean | ((p: boolean) => boolean)) => void;
  submitApplicationPayload: (isDraft?: boolean) => Promise<void>;
  setIsSubmitting: (submitting: boolean) => void;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  feedbackRating: number;
  setFeedbackRating: (rating: number) => void;
  feedbackComment: string;
  setFeedbackComment: (comment: string) => void;
  setStep: (step: number) => void;
  isPreviewModalOpen: boolean;
  setIsPreviewModalOpen: (open: boolean) => void;
  csvRows: Array<{
    id: number;
    status: "Valid" | "Invalid";
    name: string;
    type: "NEW" | "RENEWAL" | "MODIFICATION";
    reason?: string;
  }>;
  handleConfirmCSVImport: () => void;
  isSubmitting: boolean;
  onSaveDraft?: () => Promise<boolean | void> | void;
}

export function CPEWizardModals({
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  isAgreedToTerms,
  setIsAgreedToTerms,
  submitApplicationPayload,
  setIsSubmitting,
  isFeedbackModalOpen,
  setIsFeedbackModalOpen,
  feedbackRating,
  setFeedbackRating,
  feedbackComment,
  setFeedbackComment,
  setStep,
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  csvRows,
  handleConfirmCSVImport,
  isSubmitting,
  onSaveDraft,
}: CPEWizardModalsProps) {
  const toast = useToast();
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
        "Your CPE accreditation application has been received and is now under review."
      );
      setIsFeedbackModalOpen(true);
    } catch (err: unknown) {
      console.error("Failed to submit CPE application:", err);
      const msg = err instanceof Error && err.message.length > 0 ? err.message : "Filing submission failed. Please try again.";
      setFailureErrorMessage(msg);
      setIsFailureModalOpen(true);
      toast.error("Submission Incomplete", msg);
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
        "Your CPE accreditation application progress has been saved as a draft."
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

      {/* CSV Import Preview Modal */}
      <Modal
        visible={isPreviewModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPreviewModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: COLORS.neutral.white, width: "90%", maxWidth: 640, borderRadius: 16, overflow: "hidden", padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[800] }}>
                CSV Import Preview
              </Text>
              <TouchableOpacity onPress={() => setIsPreviewModalOpen(false)}>
                <Icon name="x" size={20} color={COLORS.neutral[500]} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], marginBottom: 20 }}>
              Review your uploaded CSV data before importing.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1, backgroundColor: COLORS.neutral[50], borderColor: COLORS.neutral[200], borderWidth: 1, borderRadius: 12, padding: 12 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: COLORS.neutral[500], marginBottom: 4 }}>Total Rows</Text>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: COLORS.neutral[800] }}>3</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", borderWidth: 1, borderRadius: 12, padding: 12 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#16a34a", marginBottom: 4 }}>Valid</Text>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: "#15803d" }}>1</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "#fef2f2", borderColor: "#fecaca", borderWidth: 1, borderRadius: 12, padding: 12 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#dc2626", marginBottom: 4 }}>Invalid</Text>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: "#991b1b" }}>2</Text>
              </View>
            </View>

            <View style={{ borderWidth: 1, borderColor: COLORS.neutral[200], borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
              <View style={{ flexDirection: "row", backgroundColor: COLORS.neutral[50], borderBottomWidth: 1, borderBottomColor: COLORS.neutral[200], paddingVertical: 10, paddingHorizontal: 12 }}>
                <Text style={{ width: 40, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: COLORS.neutral[500] }}>#</Text>
                <Text style={{ width: 80, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: COLORS.neutral[500] }}>STATUS</Text>
                <Text style={{ flex: 1.5, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: COLORS.neutral[500] }}>APPLICANT NAME</Text>
                <Text style={{ flex: 1, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: COLORS.neutral[500] }}>APPLICATION TYPE</Text>
              </View>
              {csvRows.map((row) => (
                <View key={row.id} style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100], paddingVertical: 12, paddingHorizontal: 12, alignItems: "center", backgroundColor: row.status === "Invalid" ? "#fffafb" : COLORS.neutral.white }}>
                  <Text style={{ width: 40, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600] }}>{row.id}</Text>
                  <View style={{ width: 80 }}>
                    <View style={{
                      backgroundColor: row.status === "Valid" ? "#e6f4ea" : "#fce8e6",
                      borderRadius: 12,
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                      alignSelf: "flex-start",
                    }}>
                      <Text style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 11,
                        fontWeight: "700",
                        color: row.status === "Valid" ? "#137333" : "#c5221f",
                      }}>{row.status}</Text>
                    </View>
                  </View>
                  <Text style={{ flex: 1.5, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral[800] }}>{row.name}</Text>
                  <Text style={{ flex: 1, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600] }}>{row.type}</Text>
                </View>
              ))}
            </View>

            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[800], fontWeight: "700", marginBottom: 6 }}>
              2 row/s need correction
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[500], marginBottom: 20 }}>
              Only valid rows will be imported into the system.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setIsPreviewModalOpen(false)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: COLORS.neutral[300],
                  backgroundColor: COLORS.neutral.white,
                }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.neutral[700] }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmCSVImport}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: COLORS.brand[700],
                }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.neutral.white }}>
                  Import 1 Valid Rows
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Terms Confirmation Modal */}
      <Modal
        visible={isConfirmModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsConfirmModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: COLORS.neutral.white, width: "90%", maxWidth: 540, borderRadius: 16, overflow: "hidden", padding: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[800] }}>
                Declaration of Intent & Consent
              </Text>
              <TouchableOpacity onPress={() => setIsConfirmModalOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="x" size={20} color={COLORS.neutral[500]} />
              </TouchableOpacity>
            </View>

            <View style={{ borderWidth: 1, borderColor: COLORS.neutral[200], borderRadius: 12, padding: 16, backgroundColor: COLORS.neutral[50], marginBottom: 20 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], lineHeight: 20, textAlign: "justify" }}>
                I hereby declare that all the entries are true and correct. Under the Revised Penal Code, I shall be held liable for any willful false statement(s) or misrepresentation(s) made in this application form that may serve as a valid ground for the denial of this application and/or cancellation/revocation of the permit issued/granted. Further, I am freely giving full consent for the collection and processing of personal information in accordance with Republic Act No. 10713, <Text style={{ color: COLORS.brand[700], fontWeight: "600" }}>Data Privacy Act of 2012</Text>.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsAgreedToTerms((prev) => !prev)}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
            >
              <Icon
                name={isAgreedToTerms ? "check-circle" : "circle"}
                size={22}
                color={isAgreedToTerms ? COLORS.brand[700] : COLORS.neutral[300]}
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
                I agree to the Terms and Conditions
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setIsConfirmModalOpen(false)}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.neutral[300],
                  borderRadius: 24,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[700] }}>
                  Close
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!isAgreedToTerms) {
                    Alert.alert("Warning", "You must agree to the Terms and Conditions to proceed.");
                    return;
                  }
                  setIsConfirmModalOpen(false);
                  await executeSubmission();
                }}
                style={{
                  backgroundColor: isAgreedToTerms ? COLORS.brand[700] : COLORS.neutral[300],
                  borderRadius: 24,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                disabled={!isAgreedToTerms}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.neutral.white }}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Rating Modal */}
      <Modal
        visible={isFeedbackModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFeedbackModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: COLORS.neutral.white, width: "90%", maxWidth: 440, borderRadius: 16, padding: 24, alignItems: "center" }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#e8f5e9", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <Icon name="check-circle" size={32} color="#2e7d32" />
            </View>

            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.brand[800], textAlign: "center", marginBottom: 6 }}>
              Your application has been submitted.
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[500], textAlign: "center", marginBottom: 20 }}>
              We will notify you once your application is validated. Thank you!
            </Text>

            <View style={{ backgroundColor: COLORS.neutral[50], borderRadius: 12, padding: 16, width: "100%", borderColor: COLORS.neutral[200], borderWidth: 1 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: COLORS.neutral[500], textAlign: "center", marginBottom: 12, letterSpacing: 0.5 }}>
                HOW WAS YOUR EXPERIENCE?
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)}>
                    <Icon
                      name="star"
                      size={28}
                      color={star <= feedbackRating ? "#eab308" : COLORS.neutral[300]}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "600", color: COLORS.neutral[600], marginBottom: 6 }}>
                Share your comment/s
              </Text>
              <TextInput
                style={{
                  height: 80,
                  backgroundColor: COLORS.neutral.white,
                  borderColor: COLORS.neutral[200],
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 13,
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  color: COLORS.neutral[800],
                  textAlignVertical: "top",
                  marginBottom: 16,
                }}
                placeholder="Share any thoughts on the application process..."
                placeholderTextColor={COLORS.neutral[400]}
                multiline
                value={feedbackComment}
                onChangeText={setFeedbackComment}
              />

              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Feedback Received", "Thank you for sharing your experience!");
                  setIsFeedbackModalOpen(false);
                  setStep(8);
                }}
                style={{
                  backgroundColor: "#8b9dc3",
                  borderRadius: 8,
                  paddingVertical: 10,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name="send" size={14} color={COLORS.neutral.white} style={{ marginRight: 8 }} />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.neutral.white }}>
                  Send your feedback
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submission Failure Modal */}
      <SubmissionFailureModal
        visible={isFailureModalOpen}
        errorMessage={failureErrorMessage}
        onRetry={executeSubmission}
        onSaveDraft={handleSaveDraftAction}
        onClose={() => setIsFailureModalOpen(false)}
        isRetrying={isRetrying}
        isSavingDraft={isSavingDraftState}
      />

      {/* Submission Loading Overlay */}
      {isSubmitting && !isFailureModalOpen && (
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255,255,255,0.85)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}>
          <Icon name="loader" size={48} color={COLORS.brand[700]} style={{ marginBottom: 16 }} />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: COLORS.neutral[800] }}>
            Submitting Application...
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], marginTop: 6 }}>
            Please wait while we validate and process your filing details.
          </Text>
        </View>
      )}
    </>
  );
}
