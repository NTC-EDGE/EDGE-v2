import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Icon, COLORS } from "@edge/ui";
import { ExamApplicantData } from "../index";
import { styles } from "./ExamBulkApplicantsPanel.styles";
import { isExamApplicantComplete } from "../helpers/validation";

interface ExamBulkApplicantCardProps {
  app: ExamApplicantData;
  isSelected: boolean;
  originalIdx: number;
  bulkMethod: "MANUAL" | "EXCEL" | undefined;
  onSelectApplicant: (idx: number) => void;
  setStep: (step: number) => void;
  onDeletePress: (idx: number, name: string) => void;
  isChecked?: boolean;
  onToggleCheck?: () => void;
}

export function ExamBulkApplicantCard({
  app,
  isSelected,
  originalIdx,
  bulkMethod,
  onSelectApplicant,
  setStep,
  onDeletePress,
  isChecked,
  onToggleCheck,
}: ExamBulkApplicantCardProps) {
  const complete = isExamApplicantComplete(app);
  const fullName = `${app.firstName} ${app.lastName}`.trim();
  const uploadedCount = Object.keys(app.uploads).length;
  const totalRequired = app.examineeType === "Upgrader" ? 4 : 3;

  return (
    <View
      style={[
        styles.itemCard,
        isSelected && styles.itemCardSelected,
        { flexDirection: "row", alignItems: "center", paddingLeft: 10 }
      ]}
    >
      {onToggleCheck && (
        <TouchableOpacity
          onPress={onToggleCheck}
          style={{ padding: 4, marginRight: 4 }}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: isChecked ? "#2563EB" : "#CBD5E1",
              backgroundColor: isChecked ? "#2563EB" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isChecked && <Icon name="check" size={12} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => {
          onSelectApplicant(originalIdx);
          if (bulkMethod === "EXCEL") {
            setStep(5);
          }
        }}
        style={{ flex: 1, paddingVertical: 14, paddingRight: 8, paddingLeft: 4 }}
      >
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, isSelected && styles.itemTitleSelected]} numberOfLines={1}>
            {fullName || `Draft Applicant ${app.id}`}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 11, color: COLORS.neutral[400], fontWeight: "600" }}>
              {uploadedCount}/{totalRequired}
            </Text>
            <Icon
              name="check-circle"
              size={14}
              color={complete ? "#10b981" : COLORS.neutral[300]}
            />
          </View>
        </View>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {app.examineeType} • {app.examType}-{app.selectedOption}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          onDeletePress(originalIdx, fullName || `Draft Applicant ${app.id}`);
        }}
        style={{ padding: 14, justifyContent: "center", alignItems: "center" }}
      >
        <Icon name="trash" size={16} color={COLORS.semantic.error} />
      </TouchableOpacity>
    </View>
  );
}
