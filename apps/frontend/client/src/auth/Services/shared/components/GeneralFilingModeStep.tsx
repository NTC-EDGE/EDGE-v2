import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import {
  getSpreadsheetTemplateForService,
  generateCsvContent,
  downloadCsvFile,
  parseSpreadsheetContent,
} from "../spreadsheet";

interface ServiceVariantItem {
  id: string;
  name: string;
  type?: string;
  description?: string;
}

interface ServiceVariantElementItem {
  id: string;
  code: string;
  description: string;
}

interface GeneralFilingModeStepProps {
  service: NTCService;
  variants?: ServiceVariantItem[];
  variantElements?: ServiceVariantElementItem[];
  variantRequirements?: string[];
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string, variantName: string) => void;
  selectedElementId?: string;
  onSelectElement?: (elementId: string, elementTitle: string) => void;
  appMode: "SINGLE" | "BULK" | "";
  onAppModeChange: (mode: "SINGLE" | "BULK") => void;
  bulkMethod?: "MANUAL" | "EXCEL";
  setBulkMethod?: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded?: boolean;
  setIsFileUploaded?: (val: boolean) => void;
  uploadedFileName?: string;
  setUploadedFileName?: (name: string) => void;
  onApplicantsImported?: (applicants: GeneralApplicantData[]) => void;
}

const safeUpper = (str?: any): string => {
  if (typeof str === "string") return str.toUpperCase();
  if (str && typeof str.toString === "function") return str.toString().toUpperCase();
  return "";
};

export function GeneralFilingModeStep({
  service,
  variants = [],
  variantElements = [],
  variantRequirements = [],
  selectedVariantId = "",
  onSelectVariant,
  selectedElementId = "",
  onSelectElement,
  appMode,
  onAppModeChange,
  isFileUploaded,
  setIsFileUploaded,
  uploadedFileName,
  setUploadedFileName,
  onApplicantsImported,
}: GeneralFilingModeStepProps) {
  const [loading, setLoading] = useState(false);
  const [localSelectedClassId, setLocalSelectedClassId] = useState<string>("");
  const serviceTitle = safeUpper(service?.title || "");

  const selectedClassId = selectedElementId || localSelectedClassId;

  const templateConfig = getSpreadsheetTemplateForService(service);

  // Generate fallback variants if backend endpoint returns empty array
  const displayVariants: ServiceVariantItem[] =
    variants.length > 0
      ? variants
      : serviceTitle.includes("EXAM") || serviceTitle.includes("ADMISSION SLIP") || serviceTitle.includes("OPERATOR")
      ? [
          {
            id: "v-exam-new",
            name: `${service?.title || "Admission Slip for Radio Operator Examination"} (NEW)`,
            type: "New",
            description: "First-time examination filing for Radio Operator License / Admission Slip.",
          },
          {
            id: "v-exam-retake",
            name: `${service?.title || "Admission Slip for Radio Operator Examination"} (RETAKE)`,
            type: "Retake",
            description: "Re-examination / retake filing for previously unpassed radio elements.",
          },
          {
            id: "v-exam-special",
            name: `${service?.title || "Admission Slip for Radio Operator Examination"} (SPECIAL EXAM)`,
            type: "Special Exam",
            description: "Special radio operator examination schedule request.",
          },
        ]
      : serviceTitle.includes("AMATEUR") || serviceTitle.includes("LICENSE")
      ? [
          {
            id: "v-new-1",
            name: "Amateur Radio Station License (NEW)",
            type: "New",
            description: "For first-time applicants of Class A, B, C, or D Amateur Radio Station Licenses.",
          },
          {
            id: "v-ren-2",
            name: "Amateur Radio Station License (RENEWAL)",
            type: "Renewal",
            description: "For renewing an active or expiring Amateur Radio Station License.",
          },
          {
            id: "v-mod-3",
            name: "Amateur Radio Station License (MODIFICATION)",
            type: "Modification",
            description: "For amending station details, equipment changes, location moves, or class upgrades.",
          },
          {
            id: "v-life-4",
            name: "Lifetime Amateur Radio Station License for Class A",
            type: "Lifetime",
            description: "For Class A Radio Amateurs at least 60 years old with 15+ consecutive years of service.",
          },
        ]
      : [
          {
            id: "v-gen-new",
            name: `${service?.title || "Application"} (NEW)`,
            type: "New",
            description: "New filing / first-time issuance of permit or license.",
          },
          {
            id: "v-gen-ren",
            name: `${service?.title || "Application"} (RENEWAL)`,
            type: "Renewal",
            description: "Renewal of existing active or expired permit or license.",
          },
          {
            id: "v-gen-mod",
            name: `${service?.title || "Application"} (MODIFICATION)`,
            type: "Modification",
            description: "Modification or amendment of permit/license details.",
          },
        ];

  const activeVariantId = selectedVariantId || (displayVariants[0] ? displayVariants[0].id : "");
  const activeVariant = displayVariants.find((v) => v.id === activeVariantId) || displayVariants[0] || {
    id: "v-default",
    name: service?.title || "Standard Application",
    type: "New",
    description: "Standard filing concern",
  };

  const formatVariantLabel = (v: any): string => {
    if (!v) return "Application Variant";

    const cleanStr = (s: string) =>
      s.replace(/\s*\(\s*N\/?A\s*\)/gi, "")
       .replace(/\bN\/?A\b/gi, "")
       .trim();

    let rawLabel = "";
    if (v.name && typeof v.name === "string" && v.name.trim().length > 0) {
      rawLabel = v.name;
    } else if (v.description && typeof v.description === "string" && v.description.includes("(")) {
      rawLabel = v.description;
    } else if (v.serviceName && v.type && v.type.toUpperCase() !== "NA" && v.type.toUpperCase() !== "N/A") {
      rawLabel = `${v.serviceName} (${safeUpper(v.type)})`;
    } else if (v.type && v.type.toUpperCase() !== "NA" && v.type.toUpperCase() !== "N/A") {
      rawLabel = `${service?.title || "Application"} (${safeUpper(v.type)})`;
    } else {
      rawLabel = v.description || service?.title || "Application Variant";
    }

    return cleanStr(rawLabel);
  };

  const variantDropdownOptions = displayVariants.map((v) => ({
    label: formatVariantLabel(v),
    value: v.id,
  }));

  const handleVariantDropdownChange = (val: string) => {
    const matched = displayVariants.find((v) => v.id === val);
    if (matched && onSelectVariant) {
      onSelectVariant(matched.id, formatVariantLabel(matched));
    }
  };

  // Station Class / Element Options for component 2
  const activeVariantName = activeVariant?.name || activeVariant?.description || "";
  const isLifetime = safeUpper(activeVariantName).includes("LIFETIME");
  const isRenewal = safeUpper(activeVariantName).includes("RENEWAL");
  const isModification = safeUpper(activeVariantName).includes("MODIFICATION");

  const displayElements: ServiceVariantElementItem[] = variantElements;

  const classOptions = displayElements.map((elem) => ({
    id: elem.id,
    title: elem.code ? `${elem.code} — ${elem.description}` : elem.description,
    desc: elem.description || "",
  }));

  const hasElementsToDisplay = classOptions.length > 0;

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvContent(templateConfig);
    downloadCsvFile(templateConfig.filename, csvContent);
  };

  const handleUploadSpreadsheet = async () => {
    try {
      setLoading(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        setLoading(false);
        return;
      }

      const asset = res.assets[0];
      if (!asset) {
        setLoading(false);
        return;
      }

      if (setUploadedFileName) {
        setUploadedFileName(asset.name || "applicants_template.csv");
      }

      let fileText = "";
      if (Platform.OS === "web" && asset.file) {
        fileText = await asset.file.text();
      } else if (asset.uri) {
        const response = await fetch(asset.uri);
        fileText = await response.text();
      }

      if (fileText && fileText.trim().length > 0) {
        const parseResult = parseSpreadsheetContent(fileText, service);
        if (parseResult.applicants.length > 0 && onApplicantsImported) {
          onApplicantsImported(parseResult.applicants);
        }
        if (setIsFileUploaded) {
          setIsFileUploaded(true);
        }
        Alert.alert(
          "Spreadsheet Imported",
          `Populated ${parseResult.totalRows} applicant entries (${parseResult.validCount} valid) into the system.`
        );
      }
    } catch (err) {
      console.error("Failed to upload spreadsheet:", err);
      Alert.alert("Error", "Could not parse the selected file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: 20 }}>
      {/* ── 1. Select Application Variant / Service Type* ── */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 20,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          borderLeftWidth: 5,
          borderLeftColor: "#0F2C59",
          shadowColor: "#0F2C59",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
            <Icon name="file-text" size={15} color="#0F2C59" />
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
            Application Variant & Service Type*
          </Text>
        </View>

        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", marginBottom: 14 }}>
          Select the transaction concern from the options below:
        </Text>

        <Select
          label="Application Variant / Service Type*"
          placeholder="Select Application Variant..."
          value={activeVariantId}
          onValueChange={handleVariantDropdownChange}
          options={variantDropdownOptions}
          iconName="file-text"
        />

        {/* Concern Badge & Description Box */}
        {activeVariant && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: "#F8FAFC",
              borderLeftWidth: 4,
              borderWidth: 1,
              borderColor: "#0F2C59",
              borderRadius: 10,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Icon name="check-circle" size={15} color="#0F2C59" />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59" }}>
                Selected Concern: {activeVariant.name || activeVariant.description || "Variant Selected"}
              </Text>
            </View>
            {activeVariant.description && (
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569", lineHeight: 17 }}>
                {activeVariant.description}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* ── 2. Select Service Variant Element / Class Option* ── */}
      {hasElementsToDisplay && (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 20,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          borderLeftWidth: 5,
          borderLeftColor: "#3B82F6",
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
            <Icon name="shield" size={15} color="#1D4ED8" />
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
            Service Variant & Station Class*
          </Text>
        </View>

        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", marginBottom: 14 }}>
          Select the station class or radio element for this application:
        </Text>

        <View style={{ gap: 10 }}>
          {classOptions.map((opt) => {
            const isSelected = selectedClassId === opt.id || (isLifetime && opt.id === "class-a-lifetime");
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  setLocalSelectedClassId(opt.id);
                  onSelectElement?.(opt.id, opt.title);
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: 14,
                  borderRadius: 10,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? "#0F2C59" : "#CBD5E1",
                  backgroundColor: isSelected ? "#F0F9FF" : "#FFFFFF",
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: isSelected ? "#0F2C59" : "#94A3B8",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  {isSelected && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#0F2C59" }} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: isSelected ? "#0F2C59" : "#1E293B", marginBottom: 2 }}>
                    {opt.title}
                  </Text>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B", lineHeight: 16 }}>
                    {opt.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      )}

      {/* ── 3. Mandatory Requirements Checklist Preview ── */}
      <View
        style={{
          backgroundColor: "#F8FAFC",
          borderRadius: 14,
          padding: 18,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          borderLeftWidth: 5,
          borderLeftColor: "#F59E0B",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center" }}>
            <Icon name="check-square" size={15} color="#92400E" />
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: "#0F2C59" }}>
            Mandatory Requirements Checklist
          </Text>
        </View>

        {(() => {
          const displayRequirements =
            variantRequirements && variantRequirements.length > 0
              ? variantRequirements
              : service.requirements && service.requirements.length > 0
              ? service.requirements
              : [];

          if (displayRequirements.length === 0) {
            return (
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B" }}>
                No mandatory requirements checklist specified for this service variant.
              </Text>
            );
          }

          return (
            <View style={{ gap: 6 }}>
              {displayRequirements.map((reqItem, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#92400E" }}>
                    {idx + 1}.
                  </Text>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569", flex: 1, lineHeight: 18 }}>
                    {reqItem}
                  </Text>
                </View>
              ))}
            </View>
          );
        })()}
      </View>

      {/* ── 4. Select Filing Mode* (Card 4 — Positioned DIRECTLY BELOW Variant & Elements) ── */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 20,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          borderLeftWidth: 5,
          borderLeftColor: "#10B981",
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#ECFDF5", justifyContent: "center", alignItems: "center" }}>
            <Icon name="users" size={15} color="#047857" />
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
            Filing Mode*
          </Text>
        </View>

        <Select
          label="Filing Mode*"
          placeholder="Select Filing Mode..."
          value={appMode}
          onValueChange={(val) => {
            if (val === "SINGLE" || val === "BULK") {
              onAppModeChange(val);
            }
          }}
          options={[
            { label: "Single Application (Individual)", value: "SINGLE" },
            { label: "Bulk Application (Multiple Applicants / Spreadsheet Import)", value: "BULK" },
          ]}
          iconName="users"
        />

        {appMode === "BULK" && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: "#EFF6FF",
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: "#BFDBFE",
            }}
          >
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#1E40AF", lineHeight: 18 }}>
              ✓ You selected Bulk Application. Click <Text style={{ fontWeight: "700" }}>Next</Text> to open the cohort management screen where you can import a spreadsheet or add applicants manually.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
