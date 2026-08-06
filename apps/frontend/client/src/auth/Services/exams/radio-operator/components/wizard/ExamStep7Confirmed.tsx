import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { styles } from "../ExamFilingWizard.styles";

interface ExamStep7ConfirmedProps {
  applicantsCount: number;
  handleAddAnotherApplicant: () => void;
}

export function ExamStep7Confirmed({
  applicantsCount,
  handleAddAnotherApplicant,
}: ExamStep7ConfirmedProps) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#dcfce7",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Icon name="check-circle" size={36} color="#166534" />
      </View>

      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 20,
          fontWeight: "700",
          color: COLORS.neutral[900],
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Applicant Details Confirmed!
      </Text>

      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 14,
          color: COLORS.neutral[600],
          textAlign: "center",
          maxWidth: 480,
          lineHeight: 22,
          marginBottom: 28,
        }}
      >
        The applicant details have been saved to your batch list. You can click below to encode another applicant or click <Text style={{ fontWeight: "700" }}>SUBMIT</Text> on the left sidebar to submit the batch.
      </Text>

      <TouchableOpacity
        onPress={handleAddAnotherApplicant}
        style={[
          styles.btnPrimary,
          styles.btnPrimaryActive,
          { paddingHorizontal: 24, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
        ]}
      >
        <Icon name="plus" size={16} color="#ffffff" style={{ marginRight: 8 }} />
        <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextActive, { fontSize: 14 }]}>
          Add Another Applicant ({applicantsCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}
