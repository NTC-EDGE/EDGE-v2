import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

interface PostSubmissionSuccessModalProps {
  visible: boolean;
  onApplyMore: () => void;
  onViewApplications: () => void;
  serviceTitle?: string;
}

export function PostSubmissionSuccessModal({
  visible,
  onApplyMore,
  onViewApplications,
  serviceTitle,
}: PostSubmissionSuccessModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            width: "100%",
            maxWidth: 460,
            borderRadius: 20,
            padding: 28,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Success Badge */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#DCFCE7",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Icon name="check" size={32} color="#16A34A" />
          </View>

          {/* Heading */}
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 21,
              fontWeight: "800",
              color: "#0F2C59",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Application Submitted!
          </Text>

          {/* Description */}
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 13.5,
              color: "#64748B",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            {serviceTitle ? (
              <Text>
                Your application for <Text style={{ fontWeight: "700", color: "#1E293B" }}>{serviceTitle}</Text> has been received and is now queued for evaluation.
              </Text>
            ) : (
              "Your application has been received and is now queued for evaluation by NTC officers."
            )}
            {"\n\n"}
            What would you like to do next?
          </Text>

          {/* Two Distinct Actions */}
          <View style={{ width: "100%", gap: 12 }}>
            {/* Action 1: View My Applications */}
            <TouchableOpacity
              onPress={onViewApplications}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#0F2C59",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 18,
                shadowColor: "#0F2C59",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon name="file-text" size={17} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 14.5,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    View My Applications
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11.5,
                      color: "#94A3B8",
                      marginTop: 2,
                    }}
                  >
                    Track status, upload additional docs & pay
                  </Text>
                </View>
              </View>
              <Icon name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Action 2: Apply for Another Service */}
            <TouchableOpacity
              onPress={onApplyMore}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F8FAFC",
                borderWidth: 1.5,
                borderColor: "#CBD5E1",
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 18,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: "#E2E8F0",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon name="plus-circle" size={17} color="#0F2C59" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 14.5,
                      fontWeight: "700",
                      color: "#0F2C59",
                    }}
                  >
                    Apply for Another Service
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 11.5,
                      color: "#64748B",
                      marginTop: 2,
                    }}
                  >
                    Return to the NTC service catalog
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
