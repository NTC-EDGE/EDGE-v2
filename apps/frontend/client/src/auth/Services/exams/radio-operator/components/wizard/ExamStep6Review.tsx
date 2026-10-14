import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { ExamApplicantData } from "../../types/examTypes";
import { styles } from "../ExamFilingWizard.styles";
import { DocumentPreviewModal } from "../../../../../../shared/components/DocumentPreviewModal";
import { ExamScheduleCardData, formatFriendlyDate, formatFullExamDate } from "../../../../shared/components/ExamScheduleCard";

interface ExamStep6ReviewProps {
  activeApplicant: ExamApplicantData;
  selectedRegionId: string;
  appMode: "SINGLE" | "BULK" | "";
  selectedOfficeId: string;
  isAgreedToTerms: boolean;
  setIsAgreedToTerms: React.Dispatch<React.SetStateAction<boolean>>;
  schedules?: ExamScheduleCardData[];
  selectedScheduleId?: string | null;
}

export function ExamStep6Review({
  activeApplicant,
  selectedRegionId,
  appMode,
  selectedOfficeId,
  isAgreedToTerms,
  setIsAgreedToTerms,
  schedules,
  selectedScheduleId,
}: ExamStep6ReviewProps) {
  const [previewFile, setPreviewFile] = useState<{ name: string; uri?: string } | string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const selectedSchedule = Array.isArray(schedules) && selectedScheduleId
    ? schedules.find((s) => s.id === selectedScheduleId)
    : null;

  const appStartDisplay = formatFriendlyDate(selectedSchedule?.startApplication);
  const appEndDisplay = formatFriendlyDate(selectedSchedule?.endApplication || selectedSchedule?.applicationDeadline);
  const filingPeriodDisplay = selectedSchedule?.startApplication || selectedSchedule?.endApplication || selectedSchedule?.applicationDeadline
    ? `${appStartDisplay} – ${appEndDisplay}`
    : "—";

  const examDateDisplay = selectedSchedule?.startDate || selectedSchedule?.scheduledDate
    ? formatFullExamDate(selectedSchedule.startDate || selectedSchedule.scheduledDate)
    : "—";

  const examTimeDisplay = selectedSchedule
    ? [selectedSchedule.startTime, selectedSchedule.endTime].filter(Boolean).join(" - ") || "08:00 AM - 12:00 PM"
    : "—";

  const venueDisplay = selectedSchedule?.venue || "NTC Regional Examination Center";

  const fullAddress = [
    activeApplicant.street,
    activeApplicant.barangay,
    activeApplicant.city,
    activeApplicant.province,
    activeApplicant.zipCode
  ].filter(Boolean).join(", ");

  const birthDateDisplay = `${activeApplicant.birthMonth} ${activeApplicant.birthDay}, ${activeApplicant.birthYear}`;

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
            EXAMINATION PATHWAYS & SCHEDULE
          </Text>
        </View>
        {renderReviewRow("Region", selectedRegionId)}
        {renderReviewRow("Application Mode", appMode)}
        {renderReviewRow("NTC Office", selectedOfficeId)}
        {renderReviewRow("Scheduled Exam Date", examDateDisplay)}
        {renderReviewRow("Exam Time", examTimeDisplay)}
        {renderReviewRow("Examination Venue", venueDisplay)}
        {renderReviewRow("Application Period", filingPeriodDisplay)}

        <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
            APPLICANT DETAILS (First Applicant / Upload List)
          </Text>
        </View>
        {renderReviewRow("Name", [activeApplicant.firstName, activeApplicant.middleName, activeApplicant.lastName, activeApplicant.suffix].filter(Boolean).join(" "))}
        {renderReviewRow("Date of Birth", birthDateDisplay)}
        {renderReviewRow("Sex", activeApplicant.sex)}
        {renderReviewRow("Nationality", activeApplicant.nationality)}
        {renderReviewRow("Complete Address", fullAddress)}
        {renderReviewRow("Email", activeApplicant.email)}
        {renderReviewRow("Contact No", activeApplicant.contactNo)}
        {renderReviewRow("Exam Type", activeApplicant.examType)}
        {renderReviewRow("Class Option", activeApplicant.selectedOption)}
        {renderReviewRow("Examinee Type", activeApplicant.examineeType)}

        <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
            EDUCATIONAL BACKGROUND
          </Text>
        </View>
        {renderReviewRow("School / Institution", activeApplicant.schoolName)}
        {renderReviewRow("Program / Course / Degree", activeApplicant.courseDegree)}
        {renderReviewRow("Year Graduated", activeApplicant.yearGraduated)}
        {Boolean(activeApplicant.specialOrderNo) && renderReviewRow("Special Order (SO) No.", activeApplicant.specialOrderNo)}

        <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
            UPLOADED DOCUMENTS
          </Text>
        </View>
        {Object.keys(activeApplicant.uploads).length === 0 ? (
          <View style={{ padding: 12 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12.5, color: COLORS.neutral[400], fontStyle: "italic" }}>
              No documents uploaded
            </Text>
          </View>
        ) : (
          Object.keys(activeApplicant.uploads).map((key) => {
            const uploadItem = activeApplicant.uploads[key];
            const fileName =
              typeof uploadItem === "string"
                ? uploadItem
                : (uploadItem !== null && typeof uploadItem === "object" && "name" in uploadItem && typeof (uploadItem as { name: string }).name === "string"
                    ? (uploadItem as { name: string }).name
                    : "");

            return (
              <View
                key={key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f1f5f9",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                  <Icon name="file" size={14} color={COLORS.semantic.success} style={{ marginRight: 6 }} />
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12.5, color: COLORS.neutral[700] }} numberOfLines={1}>
                    {fileName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setPreviewFile(uploadItem);
                    setPreviewLabel(key);
                    setIsPreviewOpen(true);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#EFF6FF",
                    borderWidth: 1,
                    borderColor: "#BFDBFE",
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 6,
                    gap: 4,
                  }}
                >
                  <Icon name="eye" size={12} color="#1D4ED8" />
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        {Boolean(activeApplicant.signature) && (
          <>
            <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600] }}>
                ACKNOWLEDGEMENT & APPLICANT SIGNATURE
              </Text>
            </View>
            <View style={{ padding: 12, alignItems: "center" }}>
              {activeApplicant.signature?.startsWith("data:image") || activeApplicant.signature?.startsWith("http") || activeApplicant.signature?.startsWith("file:") ? (
                <Image
                  source={{ uri: activeApplicant.signature }}
                  style={{ width: 220, height: 70 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontFamily: "cursive", fontSize: 22, color: "#0F2C59", fontStyle: "italic" }}>
                  {activeApplicant.signature?.replace(/^typed:cursive:/, "")}
                </Text>
              )}
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: COLORS.neutral[500], marginTop: 4 }}>
                Digitally recorded applicant signature
              </Text>
            </View>
          </>
        )}
      </View>

      <DocumentPreviewModal
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
        label={previewLabel}
      />

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
