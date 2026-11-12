import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon, toast, DatePickerInput } from "@edge/ui";
import { applicationService } from "@edge/api";

function extractError(err: unknown): string {
  if (typeof err === "object" && err !== null && Reflect.has(err, "message")) {
    return String(Reflect.get(err, "message"));
  }
  if (typeof err === "string") return err;
  return "An unexpected error occurred. Please try again.";
}

interface EditFormFieldItem {
  fieldId: string;
  fieldLabel: string;
  fieldType?: string;
  value: string;
}

function isDateFormField(field: EditFormFieldItem): boolean {
  const fType = (field.fieldType || "").toLowerCase().trim();
  if (fType === "date" || fType === "datepicker" || fType === "datetime") {
    return true;
  }
  const lbl = (field.fieldLabel || "").toLowerCase().trim();
  if (
    lbl.includes("birth") ||
    lbl === "dob" ||
    lbl.includes("date of") ||
    lbl.includes("issue date") ||
    lbl.includes("date issued") ||
    lbl.includes("expiry date") ||
    lbl.includes("expiration date") ||
    lbl.includes("validity date") ||
    lbl.includes("check date") ||
    (/\bdate\b/.test(lbl) && !lbl.includes("update") && !lbl.includes("up to date") && !lbl.includes("candidate"))
  ) {
    return true;
  }
  const val = (field.value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(val)) {
    return true;
  }
  return false;
}

interface EditFormSectionItem {
  id?: string;
  title?: string;
  description?: string;
  fields: EditFormFieldItem[];
}

interface EditFormValuesModalProps {
  visible: boolean;
  onClose: () => void;
  applicationId: string;
  applicantId: string;
  applicantName?: string;
  submissionId?: string | null;
  formSections?: Array<{
    id?: string;
    title?: string;
    description?: string;
    fields: Array<{
      fieldId?: string;
      id?: string;
      label?: string;
      type?: string;
      value?: string | null;
    }>;
  }>;
  flatFormValues: EditFormFieldItem[];
  onSuccess: () => Promise<void> | void;
}

export function EditFormValuesModal({
  visible,
  onClose,
  applicationId,
  applicantId,
  applicantName,
  submissionId,
  formSections,
  flatFormValues,
  onSuccess,
}: EditFormValuesModalProps) {
  const { colors, isDark } = useTheme();

  // Local state map: fieldId -> current edited value
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize values when opened
  useEffect(() => {
    const initialMap: Record<string, string> = {};

    for (const fv of flatFormValues) {
      if (fv.fieldId) {
        initialMap[fv.fieldId] = fv.value ?? "";
      }
    }

    if (formSections && formSections.length > 0) {
      for (const sec of formSections) {
        for (const f of sec.fields) {
          const fid = f.fieldId || f.id;
          if (fid && initialMap[fid] === undefined) {
            initialMap[fid] = f.value ?? "";
          }
        }
      }
    }

    setEditedValues(initialMap);
    setErrorMessage(null);
  }, [flatFormValues, formSections, visible]);

  const handleFieldChange = (fieldId: string, val: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  // Build display sections
  const displaySections: EditFormSectionItem[] = React.useMemo(() => {
    if (formSections && formSections.length > 0) {
      return formSections.map((sec, idx) => ({
        id: sec.id || `sec-${idx}`,
        title: sec.title || `Section ${idx + 1}`,
        description: sec.description,
        fields: sec.fields.map((f, fIdx) => {
          const fid = f.fieldId || f.id || `field-${idx}-${fIdx}`;
          return {
            fieldId: fid,
            fieldLabel: f.label || "Field",
            fieldType: f.type,
            value: editedValues[fid] ?? f.value ?? "",
          };
        }),
      }));
    }

    // Fallback if no schema sections: group all flatFormValues
    return [
      {
        id: "default-section",
        title: "Service Form Specifications",
        fields: flatFormValues.map((fv) => ({
          fieldId: fv.fieldId,
          fieldLabel: fv.fieldLabel,
          value: editedValues[fv.fieldId] ?? fv.value ?? "",
        })),
      },
    ];
  }, [formSections, flatFormValues, editedValues]);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    // Build fields array for backend
    const updatedFields: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];

    for (const sec of displaySections) {
      for (const f of sec.fields) {
        const currentVal = editedValues[f.fieldId] ?? f.value ?? "";
        updatedFields.push({
          fieldId: f.fieldId,
          fieldLabel: f.fieldLabel,
          value: currentVal,
        });
      }
    }

    try {
      const [, err] = await applicationService.adminUpdateFormValues(
        applicationId,
        applicantId,
        updatedFields,
        submissionId ? submissionId : undefined
      );

      if (err !== null) {
        setErrorMessage(extractError(err));
        return;
      }

      toast.success("Form Values Updated");
      await onSuccess();
      onClose();
    } catch (e: unknown) {
      setErrorMessage(extractError(e));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View
          style={[
            modalStyles.container,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              modalStyles.header,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={modalStyles.titleRow}>
                <Icon name="sliders" size={18} color="#1D4ED8" />
                <Text
                  style={[
                    modalStyles.title,
                    { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                  ]}
                >
                  Edit Technical Specifications & Form Fields
                </Text>
              </View>
              <Text
                style={[
                  modalStyles.subtitle,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                Evaluator corrections for {applicantName || "Application Submission"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn} disabled={isSaving}>
              <Icon name="x" size={18} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={modalStyles.errorBanner}>
              <Icon name="alert-circle" size={16} color="#DC2626" />
              <Text style={modalStyles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Fields Scroll */}
          <ScrollView style={modalStyles.scrollBody} showsVerticalScrollIndicator={false}>
            {displaySections.map((sec, secIdx) => (
              <View key={sec.id || `sec-${secIdx}`} style={modalStyles.sectionBlock}>
                <Text
                  style={[
                    modalStyles.sectionHeader,
                    { color: isDark ? colors.brand[400] : colors.brand[700] },
                  ]}
                >
                  {sec.title}
                </Text>
                {sec.description ? (
                  <Text
                    style={[
                      modalStyles.sectionDesc,
                      { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    ]}
                  >
                    {sec.description}
                  </Text>
                ) : null}

                <View style={{ gap: 12, marginTop: 8 }}>
                  {sec.fields.map((f) => {
                    const currentVal = editedValues[f.fieldId] ?? f.value ?? "";
                    const isDate = isDateFormField({ ...f, value: currentVal });
                    const isLongText = !isDate && (currentVal.length > 50 || currentVal.includes("\n"));

                    return (
                      <View key={f.fieldId} style={modalStyles.fieldGroup}>
                        <Text
                          style={[
                            modalStyles.fieldLabel,
                            { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                          ]}
                        >
                          {f.fieldLabel}
                        </Text>
                        {isDate ? (
                          <DatePickerInput
                            value={currentVal}
                            onChangeText={(text) => handleFieldChange(f.fieldId, text)}
                            placeholder="YYYY-MM-DD"
                          />
                        ) : (
                          <TextInput
                            style={[
                              modalStyles.input,
                              isLongText && modalStyles.textArea,
                              {
                                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                                color: isDark ? colors.neutral[100] : colors.neutral[900],
                                borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                              },
                            ]}
                            value={currentVal}
                            onChangeText={(text) => handleFieldChange(f.fieldId, text)}
                            placeholder={`Enter ${f.fieldLabel.toLowerCase()}`}
                            placeholderTextColor="#94A3B8"
                            multiline={isLongText}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={[
              modalStyles.footer,
              { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              style={[modalStyles.btnCancel, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
              disabled={isSaving}
            >
              <Text
                style={[
                  modalStyles.btnCancelText,
                  { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[modalStyles.btnSave, isSaving && { opacity: 0.7 }]}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="check" size={16} color="#FFFFFF" />
              )}
              <Text style={modalStyles.btnSaveText}>
                {isSaving ? "Saving Field Values..." : "Save Field Values"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "90%",
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  sectionDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  fieldGroup: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  btnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnCancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  btnSave: {
    backgroundColor: "#1D4ED8",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSaveText: {
    color: "#FFFFFF",
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});
