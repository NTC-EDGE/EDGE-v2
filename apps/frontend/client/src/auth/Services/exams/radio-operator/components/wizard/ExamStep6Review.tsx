import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { ExamApplicantData } from "../../types/examTypes";
import { styles } from "../ExamFilingWizard.styles";

interface ExamStep6ReviewProps {
  activeApplicant: ExamApplicantData;
  selectedRegionId: string;
  appMode: "SINGLE" | "BULK" | "";
  selectedOfficeId: string;
  isAgreedToTerms: boolean;
  setIsAgreedToTerms: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ExamStep6Review({
  activeApplicant,
  selectedRegionId,
  appMode,
  selectedOfficeId,
  isAgreedToTerms,
  setIsAgreedToTerms,
}: ExamStep6ReviewProps) {
  const renderReviewRow = (label: string, value: string) => (
    <View style={{ flexDirection: "row", paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], width: "30%", minWidth: 120 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[800], fontWeight: "600", flex: 1 }}>
        {value || "—"}
      </Text>
    </View>
  );

  return (
    <View>
      <Text style={styles.stepSubtitle}>Review your application details before final submission:</Text>

      <View style={{ backgroundColor: COLORS.neutral.white, borderWidth: 1, borderColor: COLORS.neutral[200], borderRadius: 12, overflow: "hidden" }}>
        <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
            EXAMINATION PATHWAYS
          </Text>
        </View>
        {renderReviewRow("Region", selectedRegionId)}
        {renderReviewRow("Application Mode", appMode)}
        {renderReviewRow("NTC Office", selectedOfficeId)}

        <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
            APPLICANT DETAILS (First Applicant / Upload List)
          </Text>
        </View>
        {renderReviewRow("Name", `${activeApplicant.firstName} ${activeApplicant.middleName} ${activeApplicant.lastName}`)}
        {renderReviewRow("Sex", activeApplicant.sex)}
        {renderReviewRow("Nationality", activeApplicant.nationality)}
        {renderReviewRow("Exam Type", activeApplicant.examType)}
        {renderReviewRow("Class Option", activeApplicant.selectedOption)}
        {renderReviewRow("Examinee Type", activeApplicant.examineeType)}
        {renderReviewRow("School", activeApplicant.schoolName)}
        {renderReviewRow("Course", activeApplicant.courseDegree)}
        {renderReviewRow("Email", activeApplicant.email)}
        {renderReviewRow("Contact No", activeApplicant.contactNo)}

        <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
            UPLOADED DOCUMENTS
          </Text>
        </View>
        {Object.keys(activeApplicant.uploads).map((key) => (
          <View key={key} style={{ flexDirection: "row", paddingVertical: 6, paddingHorizontal: 12 }}>
            <Icon name="file" size={14} color={COLORS.semantic.success} style={{ marginRight: 6 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12.5, color: COLORS.neutral[700] }}>
              {typeof activeApplicant.uploads[key] === "string" ? activeApplicant.uploads[key] : (activeApplicant.uploads[key] as any)?.name || ""}
            </Text>
          </View>
        ))}
      </View>

      {/* Terms and Conditions */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 24, gap: 10 }}>
        <TouchableOpacity
          onPress={() => setIsAgreedToTerms((prev) => !prev)}
          style={{
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: isAgreedToTerms ? COLORS.brand[600] : COLORS.neutral[300],
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isAgreedToTerms ? COLORS.brand[600] : COLORS.neutral.white,
          }}
        >
          {isAgreedToTerms && <Icon name="check" size={14} color="#ffffff" />}
        </TouchableOpacity>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], flex: 1 }}>
          I hereby certify that all information supplied here is true, complete, and correct to the best of my knowledge.
        </Text>
      </View>
    </View>
  );
}
