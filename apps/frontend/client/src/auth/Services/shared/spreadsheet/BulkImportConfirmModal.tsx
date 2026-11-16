import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { GeneralApplicantData } from "../types/generalApplicantTypes";

export type BulkImportMode = "REPLACE" | "APPEND";

export function isApplicantManuallyPopulated(
  app: GeneralApplicantData | undefined | null,
  isIndividualApplication: boolean = true
): boolean {
  if (!app) return false;

  if (
    Boolean(app.firstName && app.firstName.trim().length > 0) ||
    Boolean(app.middleName && app.middleName.trim().length > 0) ||
    Boolean(app.lastName && app.lastName.trim().length > 0) ||
    Boolean(app.suffix && app.suffix.trim().length > 0)
  ) {
    return true;
  }

  if (!isIndividualApplication && Boolean(app.companyName && app.companyName.trim().length > 0)) {
    return true;
  }

  if (
    Boolean(app.email && app.email.trim().length > 0) ||
    Boolean(app.contactNo && app.contactNo.trim().length > 0)
  ) {
    return true;
  }

  if (
    Boolean(app.region && app.region.trim().length > 0) ||
    Boolean(app.province && app.province.trim().length > 0) ||
    Boolean(app.city && app.city.trim().length > 0) ||
    Boolean(app.barangay && app.barangay.trim().length > 0) ||
    Boolean(app.street && app.street.trim().length > 0) ||
    Boolean(app.address && app.address.trim().length > 0) ||
    Boolean(app.zipCode && app.zipCode.trim().length > 0)
  ) {
    return true;
  }

  if (
    Boolean(app.sex && app.sex.trim().length > 0) ||
    Boolean(app.civilStatus && app.civilStatus.trim().length > 0)
  ) {
    return true;
  }

  if (
    Boolean(app.schoolName && app.schoolName.trim().length > 0) ||
    Boolean(app.courseDegree && app.courseDegree.trim().length > 0) ||
    Boolean(app.yearGraduated && app.yearGraduated.trim().length > 0) ||
    Boolean(app.specialOrderNo && app.specialOrderNo.trim().length > 0)
  ) {
    return true;
  }

  if (Boolean(app.signatureUrl && app.signatureUrl.trim().length > 0)) {
    return true;
  }

  if (app.uploads && Object.keys(app.uploads).length > 0) {
    return true;
  }

  if (Array.isArray(app.formFieldValues) && app.formFieldValues.length > 0) {
    const hasUserFieldVal = app.formFieldValues.some((fv) => {
      const idLower = (fv.fieldId || "").toLowerCase().trim();
      const lblLower = (fv.fieldLabel || "").toLowerCase().trim();
      if (
        idLower === "action_requested" ||
        idLower === "fd000000-0000-0000-0000-000000000307" ||
        lblLower === "action requested"
      ) {
        return false;
      }
      return Boolean(fv.value && fv.value.trim().length > 0);
    });
    if (hasUserFieldVal) return true;
  }

  return false;
}

export function hasManualApplicantEntries(
  applicants: GeneralApplicantData[] | undefined | null,
  isIndividualApplication: boolean = true
): boolean {
  if (!Array.isArray(applicants) || applicants.length === 0) return false;
  if (applicants.length > 1) return true;
  return applicants.some((app) => isApplicantManuallyPopulated(app, isIndividualApplication));
}

export function getManualEntriesCount(
  applicants: GeneralApplicantData[] | undefined | null,
  isIndividualApplication: boolean = true
): number {
  if (!Array.isArray(applicants) || applicants.length === 0) return 0;
  const populated = applicants.filter((app) =>
    isApplicantManuallyPopulated(app, isIndividualApplication)
  );
  if (populated.length > 0) return populated.length;
  return applicants.length > 1 ? applicants.length : 0;
}

export function applyImportedApplicantsToCohort(
  existingApplicants: GeneralApplicantData[],
  enrichedImported: GeneralApplicantData[],
  mode: BulkImportMode,
  isIndividualApplication: boolean = true
): GeneralApplicantData[] {
  if (mode === "APPEND") {
    const populatedExisting = existingApplicants.filter((app) =>
      isApplicantManuallyPopulated(app, isIndividualApplication)
    );
    const baseRetained =
      populatedExisting.length > 0
        ? populatedExisting
        : existingApplicants.length > 1
        ? existingApplicants
        : [];
    const combined = [...baseRetained, ...enrichedImported];
    return combined.map((app, idx) => ({
      ...app,
      id: idx + 1,
    }));
  }

  return enrichedImported.map((app, idx) => ({
    ...app,
    id: idx + 1,
  }));
}

export interface BulkImportConfirmModalProps {
  visible: boolean;
  existingCount: number;
  importedCount: number;
  onRetainAndAdd: () => void;
  onDisregardAndReplace: () => void;
  onCancel: () => void;
}

export function BulkImportConfirmModal({
  visible,
  existingCount,
  importedCount,
  onRetainAndAdd,
  onDisregardAndReplace,
  onCancel,
}: BulkImportConfirmModalProps) {
  const safeExistingCount = existingCount > 0 ? existingCount : 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Icon name="alert-circle" size={20} color="#1D4ED8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Existing Applicant Entries Found</Text>
              <Text style={styles.subtitle}>
                Confirm how to handle your current entries
              </Text>
            </View>
          </View>

          <Text style={styles.message}>
            You currently have{" "}
            <Text style={styles.boldText}>
              {safeExistingCount} manual applicant {safeExistingCount === 1 ? "entry" : "entries"}
            </Text>{" "}
            in your list. Before importing{" "}
            <Text style={styles.boldText}>
              {importedCount} bulk {importedCount === 1 ? "applicant" : "applicants"}
            </Text>{" "}
            from the spreadsheet, please select how you would like to proceed:
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={onRetainAndAdd}
              style={styles.retainBtn}
              activeOpacity={0.85}
            >
              <View style={styles.btnHeaderRow}>
                <Icon name="plus-circle" size={16} color="#FFFFFF" />
                <Text style={styles.retainBtnTitle}>
                  Retain Entries & Add Imported ({safeExistingCount + importedCount})
                </Text>
              </View>
              <Text style={styles.retainBtnDesc}>
                Keep your manually entered {safeExistingCount === 1 ? "applicant" : "applicants"} and append the {importedCount} imported bulk {importedCount === 1 ? "entry" : "entries"} to the cohort.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDisregardAndReplace}
              style={styles.replaceBtn}
              activeOpacity={0.85}
            >
              <View style={styles.btnHeaderRow}>
                <Icon name="refresh-cw" size={15} color="#B91C1C" />
                <Text style={styles.replaceBtnTitle}>
                  Disregard Manual Entries ({importedCount})
                </Text>
              </View>
              <Text style={styles.replaceBtnDesc}>
                Discard your manually entered {safeExistingCount === 1 ? "applicant" : "applicants"} and replace the list with only the {importedCount} imported bulk {importedCount === 1 ? "entry" : "entries"}.
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.75}>
            <Text style={styles.cancelBtnText}>Cancel Import</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.neutral.white,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  message: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 20,
    marginBottom: 18,
  },
  boldText: {
    fontWeight: "700",
    color: COLORS.neutral[900],
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 14,
  },
  retainBtn: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  btnHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retainBtnTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  retainBtnDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    color: "#DBEAFE",
    lineHeight: 16,
  },
  replaceBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  replaceBtnTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#B91C1C",
  },
  replaceBtnDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    color: "#991B1B",
    lineHeight: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.neutral[600],
  },
});
