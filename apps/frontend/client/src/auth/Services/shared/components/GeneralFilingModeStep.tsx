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
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string, variantName: string) => void;
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
  selectedVariantId = "",
  onSelectVariant,
  appMode,
  onAppModeChange,
  isFileUploaded,
  setIsFileUploaded,
  uploadedFileName,
  setUploadedFileName,
  onApplicantsImported,
}: GeneralFilingModeStepProps) {
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("class-a");
  const serviceTitle = safeUpper(service?.title || "");

  const templateConfig = getSpreadsheetTemplateForService(service);

  // Generate fallback variants if backend endpoint returns empty array
  const displayVariants: ServiceVariantItem[] =
    variants.length > 0
      ? variants
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
            type: "NA",
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
    if (v.name && typeof v.name === "string" && v.name.trim().length > 0) return v.name;
    if (v.description && typeof v.description === "string" && v.description.includes("(")) return v.description;
    if (v.serviceName && v.type) return `${v.serviceName} (${safeUpper(v.type)})`;
    if (v.type) return `${service?.title || "Application"} (${safeUpper(v.type)})`;
    return v.description || "Application Variant";
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

  const classOptions =
    variantElements && variantElements.length > 0
      ? variantElements.map((elem) => ({
          id: elem.id,
          title: elem.code ? `${elem.code} — ${elem.description}` : elem.description,
          desc: elem.description || "",
        }))
      : isLifetime
      ? [
          {
            id: "class-a-lifetime",
            title: "Class A — Lifetime Radio Station License",
            desc: "For Class A Radio Amateurs at least 60 years old with 15+ consecutive years of service.",
          },
        ]
      : [
          {
            id: "class-a",
            title: "Class A — Advanced Amateur Station (VHF/UHF/HF)",
            desc: "Full privilege amateur station license for Advanced class operators.",
          },
          {
            id: "class-b",
            title: "Class B — General Amateur Station",
            desc: "General class station license with HF/VHF privileges.",
          },
          {
            id: "class-c",
            title: "Class C — Novice Amateur Station",
            desc: "Novice class station license for VHF and limited HF bands.",
          },
          {
            id: "class-d",
            title: "Class D — Foundation Amateur Station (VHF Only)",
            desc: "Foundation entry-level VHF amateur station license.",
          },
        ];

  const hasElementsToDisplay = (variantElements && variantElements.length > 0) || serviceTitle.includes("AMATEUR") || serviceTitle.includes("STATION");

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
      {/* ── 1. Select Application Variant / Service Type* (Card 1) ── */}
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 200 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
              <Icon name="file-text" size={15} color="#0F2C59" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
              1. Select Application Variant / Service Type*
            </Text>
          </View>
          <View style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#92400E" }}>
              CARD 1 • TRANSACTION
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", marginBottom: 14 }}>
          Select the transaction concern from the dropdown menu below:
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
              {activeVariant.type && (
                <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: "#1E40AF" }}>
                    {safeUpper(activeVariant.type)}
                  </Text>
                </View>
              )}
            </View>
            {activeVariant.description && (
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569", lineHeight: 17 }}>
                {activeVariant.description}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* ── 2. Select Service Variant Element / Class Option* (Card 2) ── */}
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 200 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
              <Icon name="shield" size={15} color="#1D4ED8" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
              2. Select Service Variant Element / Class Option*
            </Text>
          </View>
          <View style={{ backgroundColor: "#EFF6FF", borderColor: "#3B82F6", borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#1E40AF" }}>
              CARD 2 • STATION CLASS
            </Text>
          </View>
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
                onPress={() => setSelectedClassId(opt.id)}
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

      {/* ── 3. Mandatory Requirements Checklist Preview (Card 3) ── */}
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 200 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center" }}>
              <Icon name="check-square" size={15} color="#92400E" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: "#0F2C59" }}>
              3. Mandatory Requirements Checklist Preview
            </Text>
          </View>
          <View style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#92400E" }}>
              CARD 3 • CHECKLIST
            </Text>
          </View>
        </View>

        {isLifetime ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>1. Letter request for Issuance of a Lifetime Radio Station License.</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>2. Certificate of Good Standing from an NTC-registered amateur club.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>3. Valid Government ID (Birth Cert / Passport / PRC / Driver's License — Applicant at least 60 years old).*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>4. Copy of active Amateur Class 'A' Radio Station License.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>5. Proof of amateur service of at least 15 consecutive years.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>6. Clear 1x1 ID picture taken within the last 6 months.*</Text>
          </View>
        ) : isRenewal ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>1. Copy of Existing Amateur Radio Station License.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>2. Certificate of Good Standing from an NTC-Registered Amateur Club.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>3. Proof of Paid Annual Dues / Official Receipt.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>4. Clear 1x1 ID picture taken within the last 6 months.*</Text>
          </View>
        ) : isModification ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>1. Copy of Existing Amateur Radio Station License.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>2. Proof / Documents Supporting Requested Modification.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>3. Certificate of Good Standing from an NTC-Registered Amateur Club.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>4. Clear 1x1 ID picture taken within the last 6 months.*</Text>
          </View>
        ) : (
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>1. Certificate of Passing Examination / Seminar.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>2. Certificate of Good Standing from an NTC-Registered Amateur Club.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>3. Valid Government Issued ID.*</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>4. Clear 1x1 ID picture taken within the last 6 months.*</Text>
          </View>
        )}
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 200 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#ECFDF5", justifyContent: "center", alignItems: "center" }}>
              <Icon name="users" size={15} color="#047857" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
              4. Select Filing Mode*
            </Text>
          </View>
          <View style={{ backgroundColor: "#ECFDF5", borderColor: "#10B981", borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#047857" }}>
              CARD 4 • FILING MODE
            </Text>
          </View>
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

        {/* Bulk Import Buttons */}
        {appMode === "BULK" && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: COLORS.neutral[200] }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 12 }}>
              Bulk Spreadsheet Import
            </Text>

            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
              <TouchableOpacity
                onPress={handleDownloadTemplate}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: COLORS.brand[800],
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
              >
                <Icon name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#ffffff" }}>
                  Download Template (.csv)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUploadSpreadsheet}
                disabled={loading}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: COLORS.neutral.white,
                  borderWidth: 1,
                  borderColor: COLORS.neutral[300],
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.brand[800]} style={{ marginRight: 8 }} />
                ) : (
                  <Icon name="upload" size={16} color={COLORS.neutral[800]} style={{ marginRight: 8 }} />
                )}
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral[800] }}>
                  {isFileUploaded ? `Uploaded (${uploadedFileName || "Spreadsheet"}) ✔` : "Upload Spreadsheet (.csv / Excel)"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
