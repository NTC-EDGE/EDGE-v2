import React from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

interface SubmissionFailureModalProps {
  visible: boolean;
  errorMessage: string;
  onRetry: () => void | Promise<void>;
  onSaveDraft?: () => void | Promise<void>;
  onClose: () => void;
  isRetrying?: boolean;
  isSavingDraft?: boolean;
}

export function SubmissionFailureModal({
  visible,
  errorMessage,
  onRetry,
  onSaveDraft,
  onClose,
  isRetrying = false,
  isSavingDraft = false,
}: SubmissionFailureModalProps) {
  const isBusy = isRetrying || isSavingDraft;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            width: "100%",
            maxWidth: 480,
            borderRadius: 20,
            padding: 24,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.18,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Failure Alert Badge */}
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: "#FEE2E2",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Icon name="alert-triangle" size={28} color="#DC2626" />
          </View>

          {/* Heading */}
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 19,
              fontWeight: "800",
              color: "#0F2C59",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Submission Could Not Be Completed
          </Text>

          {/* Subtitle description */}
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 13,
              color: "#64748B",
              textAlign: "center",
              marginBottom: 16,
              lineHeight: 18,
            }}
          >
            Your entered form entries are safe. Please review the error details below and choose how you would like to proceed.
          </Text>

          {/* Error Details Box */}
          <View
            style={{
              width: "100%",
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FECACA",
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <Icon name="info" size={16} color="#DC2626" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#991B1B",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Error Details
                </Text>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 12.5,
                    color: "#7F1D1D",
                    lineHeight: 18,
                  }}
                >
                  {errorMessage || "An unexpected issue occurred while uploading documents or processing your filing."}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Options */}
          <View style={{ width: "100%", gap: 10 }}>
            {/* Primary Action: Re-submit */}
            <TouchableOpacity
              onPress={onRetry}
              disabled={isBusy}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isBusy ? "#94A3B8" : "#0F2C59",
                borderRadius: 12,
                paddingVertical: 13,
                paddingHorizontal: 16,
                shadowColor: "#0F2C59",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              ) : (
                <Icon name="refresh-cw" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              )}
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                {isRetrying ? "Re-submitting..." : "Re-submit Application"}
              </Text>
            </TouchableOpacity>

            {/* Secondary Action: Save as Draft */}
            {onSaveDraft ? (
              <TouchableOpacity
                onPress={onSaveDraft}
                disabled={isBusy}
                activeOpacity={0.85}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1.5,
                  borderColor: "#CBD5E1",
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                {isSavingDraft ? (
                  <ActivityIndicator size="small" color="#0F2C59" style={{ marginRight: 8 }} />
                ) : (
                  <Icon name="save" size={16} color="#0F2C59" style={{ marginRight: 8 }} />
                )}
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 13.5,
                    fontWeight: "700",
                    color: "#0F2C59",
                  }}
                >
                  {isSavingDraft ? "Saving Draft..." : "Save as Draft & Finish Later"}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Tertiary Action: Review / Edit Form Inputs */}
            <TouchableOpacity
              onPress={onClose}
              disabled={isBusy}
              activeOpacity={0.7}
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#64748B",
                }}
              >
                Review & Edit Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
