import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { useGeographicLocations } from "../../../../shared/hooks/useGeographicLocations";
import { NTCService } from "../../data/servicesData";
import {
  GeneralApplicantData,
  ServiceRequirementItem,
  isRequirementMandatory,
} from "../hooks/useGeneralServiceWizard";
import {
  getSpreadsheetTemplateForService,
  generateCsvContent,
  downloadCsvFile,
  parseSpreadsheetContent,
} from "../spreadsheet";

export interface ServiceVariantItem {
  id: string;
  name?: string;
  type?: string;
  description?: string;
  [key: string]: unknown;
}

export interface ServiceVariantElementItem {
  id: string;
  code?: string;
  description?: string;
  [key: string]: unknown;
}

interface GeneralFilingModeStepProps {
  service: NTCService;
  variants?: ServiceVariantItem[];
  variantElements?: ServiceVariantElementItem[];
  variantRequirements?: Array<ServiceRequirementItem | string>;
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string, variantName: string) => void;
  selectedElementId?: string;
  onSelectElement?: (elementId: string, elementTitle: string) => void;
  applicantType?: "individual" | "company";
  onApplicantTypeChange?: (type: "individual" | "company") => void;
  companyName?: string;
  onCompanyNameChange?: (name: string) => void;
  dtiSecRegistration?: string;
  onDtiSecRegistrationChange?: (val: string) => void;
  representativeName?: string;
  onRepresentativeNameChange?: (val: string) => void;
  representativePosition?: string;
  onRepresentativePositionChange?: (val: string) => void;
  companyContactNo?: string;
  onCompanyContactNoChange?: (val: string) => void;
  activeApplicant?: GeneralApplicantData;
  updateActiveApplicant?: (
    fields: Partial<GeneralApplicantData> | ((prev: GeneralApplicantData) => Partial<GeneralApplicantData>)
  ) => void;
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

const safeUpper = (str?: unknown): string => {
  if (typeof str === "string") return str.toUpperCase();
  if (str !== null && str !== undefined && typeof (str as { toString: () => string }).toString === "function") {
    return (str as { toString: () => string }).toString().toUpperCase();
  }
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
  applicantType = "individual",
  onApplicantTypeChange,
  companyName = "",
  onCompanyNameChange,
  dtiSecRegistration = "",
  onDtiSecRegistrationChange,
  representativeName = "",
  onRepresentativeNameChange,
  representativePosition = "",
  onRepresentativePositionChange,
  companyContactNo = "",
  onCompanyContactNoChange,
  activeApplicant,
  updateActiveApplicant,
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
  const [selectedGeoRegionId, setSelectedGeoRegionId] = useState<string>("");
  const [selectedGeoProvinceId, setSelectedGeoProvinceId] = useState<string>("");
  const [selectedGeoMunicipalityId, setSelectedGeoMunicipalityId] = useState<string>("");

  const {
    regions,
    provinces,
    municipalities,
    barangays,
    loadingRegions,
    loadingProvinces,
    loadingMunicipalities,
    loadingBarangays,
  } = useGeographicLocations(selectedGeoRegionId, selectedGeoProvinceId, selectedGeoMunicipalityId);

  const serviceTitle = safeUpper(service?.title || "");

  React.useEffect(() => {
    if (!appMode || (applicantType === "individual" && appMode !== "SINGLE")) {
      onAppModeChange("SINGLE");
    }
  }, [appMode, applicantType, onAppModeChange]);

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

  const formatVariantLabel = (v: { description?: string; type?: string; name?: string } | null | undefined): string => {
    if (!v) return "Application Variant";

    const cleanStr = (s: string) =>
      s.replace(/\s*\(\s*N\/?A\s*\)/gi, "")
       .replace(/\bN\/?A\b/gi, "")
       .trim();

    const desc = v.description && typeof v.description === "string" ? v.description.trim() : "";
    const typeStr =
      v.type &&
      typeof v.type === "string" &&
      v.type.toUpperCase() !== "NA" &&
      v.type.toUpperCase() !== "N/A"
        ? safeUpper(v.type)
        : "";

    let rawLabel = "";
    if (desc.length > 0 && typeStr.length > 0) {
      if (desc.toUpperCase().includes(`(${typeStr})`)) {
        rawLabel = desc;
      } else {
        rawLabel = `${desc} (${typeStr})`;
      }
    } else if (desc.length > 0) {
      rawLabel = desc;
    } else if (typeStr.length > 0) {
      rawLabel = `${service?.title || "Application"} (${typeStr})`;
    } else if (v.name && typeof v.name === "string" && v.name.trim().length > 0) {
      rawLabel = v.name;
    } else {
      rawLabel = service?.title || "Application Variant";
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
  const isLifetimeSupplementary = safeUpper(activeVariantName).includes("LIFETIME") || (activeVariant?.id !== undefined && String(activeVariant.id).endsWith("35"));
  const isLifetime = safeUpper(activeVariantName).includes("LIFETIME");
  const isRenewal = safeUpper(activeVariantName).includes("RENEWAL");
  const isModification = safeUpper(activeVariantName).includes("MODIFICATION");

  const displayElements: ServiceVariantElementItem[] = variantElements;

  const classOptions = displayElements.map((elem) => ({
    id: elem.id,
    title: elem.code ? `${elem.code} — ${elem.description || ""}` : (elem.description || elem.id || ""),
    desc: elem.description || "",
  }));

  const hasElementsToDisplay = classOptions.length > 0 && !isLifetimeSupplementary;

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
                Selected Concern: {formatVariantLabel(activeVariant)}
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
          const displayRequirements: Array<ServiceRequirementItem | string> =
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
            <View style={{ gap: 8 }}>
              {displayRequirements.map((reqItem, idx) => {
                const label =
                  typeof reqItem === "string"
                    ? reqItem.replace(/\*$/, "").trim()
                    : (reqItem.name || reqItem.label || reqItem.title || reqItem.description || `Requirement ${idx + 1}`).replace(/\*$/, "").trim();
                const rawDesc =
                  typeof reqItem === "object" && reqItem !== null && reqItem.description
                    ? reqItem.description.replace(/\*$/, "").trim()
                    : "";
                const isDuplicateDesc =
                  !rawDesc ||
                  rawDesc.toLowerCase() === label.toLowerCase() ||
                  label.toLowerCase().includes(rawDesc.toLowerCase()) ||
                  rawDesc.toLowerCase().includes(label.toLowerCase());
                const desc = isDuplicateDesc ? null : rawDesc;
                const isMandatory = isRequirementMandatory(reqItem);

                return (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: isMandatory ? "#FEF3C7" : "#F1F5F9", justifyContent: "center", alignItems: "center", marginTop: 1 }}>
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: isMandatory ? "#92400E" : "#64748B" }}>
                        {idx + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12.5, fontWeight: "600", color: "#1E293B", lineHeight: 18 }}>
                        {label} {!isMandatory && <Text style={{ color: "#94A3B8", fontStyle: "italic", fontWeight: "normal" }}>(Optional)</Text>}
                      </Text>
                      {desc && (
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11.5, color: "#64748B", marginTop: 2, lineHeight: 16 }}>
                          {desc}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}
      </View>

      {/* ── 4. Select Applicant Classification (Individual vs Company)* ── */}
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
            <Icon name="user-check" size={15} color="#1D4ED8" />
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
            Applicant Classification / Entity Type*
          </Text>
        </View>

        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", marginBottom: 14 }}>
          Select whether this application is filed for an individual person or on behalf of a company/corporation:
        </Text>

        <View style={{ gap: 10 }}>
          {/* Option A: Individual Applicant */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              onApplicantTypeChange?.("individual");
              onAppModeChange("SINGLE");
            }}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              padding: 14,
              borderRadius: 10,
              borderWidth: applicantType === "individual" ? 2 : 1,
              borderColor: applicantType === "individual" ? "#0F2C59" : "#CBD5E1",
              backgroundColor: applicantType === "individual" ? "#F0F9FF" : "#FFFFFF",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: applicantType === "individual" ? "#0F2C59" : "#94A3B8",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
                marginTop: 2,
              }}
            >
              {applicantType === "individual" && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#0F2C59" }} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <Icon name="user" size={14} color={applicantType === "individual" ? "#0F2C59" : "#64748B"} />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: applicantType === "individual" ? "#0F2C59" : "#1E293B" }}>
                  Individual Applicant
                </Text>
              </View>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B", lineHeight: 16 }}>
                Personal filing for yourself. Individual applications are processed as single transactions.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option B: Company / Corporation / Organization */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              onApplicantTypeChange?.("company");
            }}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              padding: 14,
              borderRadius: 10,
              borderWidth: applicantType === "company" ? 2 : 1,
              borderColor: applicantType === "company" ? "#0F2C59" : "#CBD5E1",
              backgroundColor: applicantType === "company" ? "#F0F9FF" : "#FFFFFF",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: applicantType === "company" ? "#0F2C59" : "#94A3B8",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
                marginTop: 2,
              }}
            >
              {applicantType === "company" && (
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#0F2C59" }} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <Icon name="briefcase" size={14} color={applicantType === "company" ? "#0F2C59" : "#64748B"} />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: applicantType === "company" ? "#0F2C59" : "#1E293B" }}>
                  Company / Corporation / Organization
                </Text>
              </View>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B", lineHeight: 16 }}>
                Corporate filing on behalf of an enterprise, entity, or multiple employees (eligible for Bulk submission).
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Three Common Sections for Company Application: Representative, Company Details, Address */}
        {applicantType === "company" && (
          <View style={{ marginTop: 16, gap: 14 }}>
            {/* Section 1: Representative */}
            <View
              style={{
                padding: 16,
                backgroundColor: "#F8FAFC",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#CBD5E1",
                gap: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <Icon name="user-check" size={15} color="#0F2C59" />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, fontWeight: "700", color: "#0F2C59" }}>
                  Representative
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ValidatedInput
                    label="Authorized Representative Name"
                    placeholder="e.g., Engr. Juan Dela Cruz"
                    value={activeApplicant?.representativeName ?? representativeName}
                    onChangeText={(text) => {
                      onRepresentativeNameChange?.(text);
                      updateActiveApplicant?.({ representativeName: text });
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ValidatedInput
                    label="Designation / Position"
                    placeholder="e.g., Regulatory Affairs Manager"
                    value={activeApplicant?.representativePosition ?? representativePosition}
                    onChangeText={(text) => {
                      onRepresentativePositionChange?.(text);
                      updateActiveApplicant?.({ representativePosition: text });
                    }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ValidatedInput
                    label="Contact Number"
                    placeholder="e.g., 09171234567"
                    value={activeApplicant?.contactNo ?? companyContactNo}
                    onChangeText={(text) => {
                      onCompanyContactNoChange?.(text);
                      updateActiveApplicant?.({ contactNo: text });
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ValidatedInput
                    label="Email Address"
                    placeholder="e.g., representative@company.com"
                    value={activeApplicant?.email ?? ""}
                    onChangeText={(text) => {
                      updateActiveApplicant?.({ email: text });
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Section 2: Company Details */}
            <View
              style={{
                padding: 16,
                backgroundColor: "#F8FAFC",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#CBD5E1",
                gap: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <Icon name="briefcase" size={15} color="#0F2C59" />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, fontWeight: "700", color: "#0F2C59" }}>
                  Company Details
                </Text>
              </View>

              <ValidatedInput
                label="Company / Corporation Name"
                required={true}
                placeholder="e.g., Globe Telecom Inc., Converge ICT Solutions"
                value={activeApplicant?.companyName ?? companyName}
                onChangeText={(text) => {
                  onCompanyNameChange?.(text);
                  updateActiveApplicant?.({ companyName: text });
                }}
              />

              <ValidatedInput
                label="SEC / DTI Registration Number"
                placeholder="e.g., CS201912345 / 05943210"
                value={activeApplicant?.dtiSecRegistration ?? dtiSecRegistration}
                onChangeText={(text) => {
                  onDtiSecRegistrationChange?.(text);
                  updateActiveApplicant?.({ dtiSecRegistration: text });
                }}
              />
            </View>

            {/* Section 3: Address */}
            <View
              style={{
                padding: 16,
                backgroundColor: "#F8FAFC",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#CBD5E1",
                gap: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <Icon name="map-pin" size={15} color="#0F2C59" />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, fontWeight: "700", color: "#0F2C59" }}>
                  Address
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Select
                    label="Region"
                    placeholder={loadingRegions ? "Loading regions..." : "Select Region..."}
                    value={activeApplicant?.region || ""}
                    options={regions.map((r) => ({
                      label: r.code ? `${r.name} (${r.code})` : r.name,
                      value: r.name,
                    }))}
                    onValueChange={(val: string) => {
                      const matched = regions.find((r) => r.name === val);
                      if (matched) {
                        setSelectedGeoRegionId(matched.id);
                      }
                      updateActiveApplicant?.({
                        region: val,
                        province: "",
                        city: "",
                        barangay: "",
                      });
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Select
                    label="Province"
                    placeholder={
                      loadingProvinces
                        ? "Loading provinces..."
                        : !selectedGeoRegionId
                        ? "Select Region first..."
                        : "Select Province..."
                    }
                    value={activeApplicant?.province || ""}
                    options={provinces.map((p) => ({
                      label: p.name,
                      value: p.name,
                    }))}
                    onValueChange={(val: string) => {
                      const matched = provinces.find((p) => p.name === val);
                      if (matched) {
                        setSelectedGeoProvinceId(matched.id);
                      }
                      updateActiveApplicant?.({
                        province: val,
                        city: "",
                        barangay: "",
                      });
                    }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Select
                    label="City / Municipality"
                    placeholder={
                      loadingMunicipalities
                        ? "Loading cities..."
                        : !selectedGeoProvinceId
                        ? "Select Province first..."
                        : "Select City / Municipality..."
                    }
                    value={activeApplicant?.city || ""}
                    options={municipalities.map((m) => ({
                      label: m.name,
                      value: m.name,
                    }))}
                    onValueChange={(val: string) => {
                      const matched = municipalities.find((m) => m.name === val);
                      if (matched) {
                        setSelectedGeoMunicipalityId(matched.id);
                      }
                      updateActiveApplicant?.({
                        city: val,
                        barangay: "",
                      });
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Select
                    label="Barangay"
                    placeholder={
                      loadingBarangays
                        ? "Loading barangays..."
                        : !selectedGeoMunicipalityId
                        ? "Select City first..."
                        : "Select Barangay..."
                    }
                    value={activeApplicant?.barangay || ""}
                    options={barangays.map((b) => ({
                      label: b.name,
                      value: b.name,
                    }))}
                    onValueChange={(val: string) => {
                      updateActiveApplicant?.({
                        barangay: val,
                      });
                    }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 2 }}>
                  <ValidatedInput
                    label="Street / Building / Unit No."
                    placeholder="e.g., 123 Ayala Avenue, Tower One"
                    value={activeApplicant?.street || activeApplicant?.address || ""}
                    onChangeText={(val) => {
                      const fullAddr = [val, activeApplicant?.barangay, activeApplicant?.city, activeApplicant?.province, activeApplicant?.region, activeApplicant?.zipCode].filter(Boolean).join(", ");
                      updateActiveApplicant?.({
                        street: val,
                        address: fullAddr,
                      });
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ValidatedInput
                    label="Zip Code"
                    placeholder="e.g., 1226"
                    value={activeApplicant?.zipCode || ""}
                    onChangeText={(val) => {
                      updateActiveApplicant?.({
                        zipCode: val,
                      });
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ── 5. Select Filing Mode* (Card 5) ── */}
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

        {applicantType === "individual" ? (
          <View
            style={{
              backgroundColor: "#F8FAFC",
              borderRadius: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: "#CBD5E1",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
                  SINGLE APPLICATION
                </Text>
              </View>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59" }}>
                Individual Filing Mode
              </Text>
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B", lineHeight: 17 }}>
              Individual applicants are processed as single applications. If you need to submit batch filings for multiple applicants in bulk, select <Text style={{ fontWeight: "700", color: "#0F2C59" }}>Company / Corporation</Text> above.
            </Text>
          </View>
        ) : (
          <>
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
                { label: "Single Application (1 Applicant under Company)", value: "SINGLE" },
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
                  ✓ You selected Bulk Application for <Text style={{ fontWeight: "700" }}>{companyName || "your company"}</Text>. Click <Text style={{ fontWeight: "700" }}>Next</Text> to open the cohort management screen where you can import a spreadsheet or add applicants manually.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}
