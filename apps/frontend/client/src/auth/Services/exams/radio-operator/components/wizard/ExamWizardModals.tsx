import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
import { styles } from "../ExamFilingWizard.styles";

interface ExamWizardModalsProps {
  isPreviewModalOpen: boolean;
  setIsPreviewModalOpen: (open: boolean) => void;
  handleConfirmCSVImport: () => void;
  isBulkSubmitOpen: boolean;
  setIsBulkSubmitOpen: (open: boolean) => void;
  bulkCompanyName: string;
  bulkEmail: string;
  bulkPhone: string;
  handleBulkSubmitChange: (field: "companyName" | "email" | "phone", value: string) => void;
  bulkErrors: Record<string, string>;
  bulkTouched: Record<string, boolean>;
  isSubmitting: boolean;
  handleBulkFinalSubmit: () => Promise<void>;
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (open: boolean) => void;
  appMode: "SINGLE" | "BULK" | "";
  applicantsCount: number;
  handleFinalSubmit: () => Promise<void>;
  handleConfirmApplicantInBulk: () => void;
}

export function ExamWizardModals({
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  handleConfirmCSVImport,
  isBulkSubmitOpen,
  setIsBulkSubmitOpen,
  bulkCompanyName,
  bulkEmail,
  bulkPhone,
  handleBulkSubmitChange,
  bulkErrors,
  bulkTouched,
  isSubmitting,
  handleBulkFinalSubmit,
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  appMode,
  applicantsCount,
  handleFinalSubmit,
  handleConfirmApplicantInBulk,
}: ExamWizardModalsProps) {
  return (
    <>
      {/* CSV Import Preview Modal */}
      <Modal visible={isPreviewModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 20, width: "100%", maxWidth: 600 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
              CSV IMPORT DATA INGESTION PREVIEW
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], marginBottom: 16 }}>
              Review parsed entries from uploaded spreadsheet:
            </Text>

            <View style={{ borderWidth: 1, borderColor: COLORS.neutral[200], borderRadius: 6, overflow: "hidden", marginBottom: 20 }}>
              <View style={{ flexDirection: "row", backgroundColor: COLORS.neutral[100], padding: 8 }}>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "700" }}>Name</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "700" }}>Exam Type</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: "700" }}>Status</Text>
              </View>
              {["John Smith Doe Jr.", "Maria Santos Reyes", "Juan Dela Cruz"].map((name, i) => (
                <View key={name} style={{ flexDirection: "row", padding: 8, borderTopWidth: 1, borderTopColor: COLORS.neutral[200] }}>
                  <Text style={{ flex: 1, fontSize: 11, fontWeight: "600" }}>{name}</Text>
                  <Text style={{ flex: 1, fontSize: 11 }}>Amateur (Class {i === 0 ? "A" : i === 1 ? "B" : "C"})</Text>
                  <Text style={{ flex: 1, fontSize: 11, color: "green", fontWeight: "600" }}>Valid</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setIsPreviewModalOpen(false)} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmCSVImport} style={[styles.btnPrimary, styles.btnPrimaryActive]}>
                <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextActive]}>Confirm Ingestion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submit Applications Bulk Modal */}
      <Modal visible={isBulkSubmitOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 440 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 8 }}>
              Submit Applications
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, color: COLORS.neutral[500], marginBottom: 20 }}>
              Please provide contact details to submit this batch of {applicantsCount} applications:
            </Text>

            <ValidatedInput
              label="Company Name"
              placeholder="Enter Company Name"
              value={bulkCompanyName}
              onChangeText={(val: string) => handleBulkSubmitChange("companyName", val)}
              error={bulkErrors.companyName}
              touched={bulkTouched.companyName}
              required
            />
            <ValidatedInput
              label="Email Address"
              placeholder="company@domain.com"
              value={bulkEmail}
              onChangeText={(val: string) => handleBulkSubmitChange("email", val)}
              error={bulkErrors.email}
              touched={bulkTouched.email}
              required
            />
            <ValidatedInput
              label="Phone Number"
              placeholder="09XXXXXXXXX"
              value={bulkPhone}
              onChangeText={(val: string) => handleBulkSubmitChange("phone", val)}
              error={bulkErrors.phone}
              touched={bulkTouched.phone}
              required
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
              <TouchableOpacity disabled={isSubmitting} onPress={() => setIsBulkSubmitOpen(false)} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={isSubmitting} onPress={handleBulkFinalSubmit} style={[styles.btnPrimary, styles.btnPrimaryActive]}>
                <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextActive]}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={isConfirmModalOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 440 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 12 }}>
              {appMode === "BULK" ? "Confirm Applicant Details?" : "Confirm Application Submission?"}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[600], lineHeight: 20, marginBottom: 24 }}>
              {appMode === "BULK"
                ? "Are you sure you want to confirm this applicant's details?"
                : "Are you sure you want to submit this examination application to the NTC? Once submitted, you cannot modify the details."}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity disabled={isSubmitting} onPress={() => setIsConfirmModalOpen(false)} style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isSubmitting}
                onPress={() => {
                  setIsConfirmModalOpen(false);
                  if (appMode === "BULK") {
                    handleConfirmApplicantInBulk();
                  } else {
                    handleFinalSubmit();
                  }
                }}
                style={[styles.btnPrimary, styles.btnPrimaryActive]}
              >
                <Text style={[styles.btnPrimaryText, styles.btnPrimaryTextActive]}>
                  {appMode === "BULK" ? "Confirm" : isSubmitting ? "Submitting..." : "Yes, Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
