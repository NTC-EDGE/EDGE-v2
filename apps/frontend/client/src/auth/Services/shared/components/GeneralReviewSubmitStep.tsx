import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { TenantInfo, OfficeInfo, GeneralApplicantData, ServiceRequirementItem } from "../hooks/useGeneralServiceWizard";
import { getApplicantDisplayName } from "../helpers/applicantDisplayHelper";
import { DocumentPreviewModal } from "../../../../shared/components/DocumentPreviewModal";
import { OFFICIAL_LEGAL_DECLARATION } from "../../../../shared/components/DeclarationCheckbox";
import { useServiceForm } from "../hooks/useServiceForm";
import { FIELD_ID_SIGNATURE } from "../../../../shared/constants/fieldIds";

interface GeneralReviewSubmitStepProps {
  service: NTCService;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  selectedRegionId: string | null;
  selectedOfficeId: string | null;
  activeApplicant: GeneralApplicantData;
  applicants?: GeneralApplicantData[];
  currentApplicantIndex?: number;
  appMode: "SINGLE" | "BULK" | "";
  variants?: Array<{ id: string; name?: string; description?: string; type?: string }>;
  variantRequirements?: Array<ServiceRequirementItem | string>;
  schedules?: Array<{ id: string; scheduledDate: string; startTime?: string; endTime?: string; venue?: string }>;
  selectedScheduleId?: string | null;
}

// ─── Type Guard Helpers (Strict Monorepo Standard — No Type Assertions) ──────
function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isPreviewFileObject(file: unknown): file is { name: string; uri?: string } {
  return typeof file === "object" && file !== null && "name" in file && typeof (file as { name: unknown }).name === "string";
}

// ─── Format Field Key to Human-Readable Label ─────────────────────────────
const formatFieldKey = (key: string): string => {
  if (!key) return "";
  const map: Record<string, string> = {
    make: "Make",
    typemodel: "Type / Model",
    type_model: "Type / Model",
    serialnumber: "Serial Number",
    serial_number: "Serial Number",
    frequencyrange: "Frequency Range",
    frequency_range: "Frequency Range",
    outputpower: "Output Power",
    output_power: "Output Power",
    powerwatts: "Power (Watts)",
    power_watts: "Power (Watts)",
    fullname: "Full Name",
    full_name: "Full Name",
    prclicenseno: "PRC License No.",
    prc_no: "PRC License No.",
    prcno: "PRC License No.",
    ptrno: "PTR No.",
    ptr_no: "PTR No.",
    peceno: "PECE / ECE No.",
    pece_no: "PECE / ECE No.",
    validuntil: "Valid Until",
    valid_until: "Valid Until",
    datehired: "Date Hired",
    date_hired: "Date Hired",
    position: "Position / Designation",
    grosstonnage: "Gross Tonnage",
    gross_tonnage: "Gross Tonnage",
    nettonnage: "Net Tonnage",
    net_tonnage: "Net Tonnage",
    callsign: "Call Sign",
    call_sign: "Call Sign",
    dishdiameter: "Dish Diameter",
    dish_diameter: "Dish Diameter",
    polarization: "Polarization",
    azimuth: "Azimuth",
    location: "Location",
    elevation: "Elevation (m)",
    height: "Height (m)",
    gain: "Gain (dBi)",
    type: "Type",
    power: "Power",
    frequency: "Frequency",
    bandwidth: "Bandwidth",
    emission: "Emission / Modulation",
    channel: "Channel No.",
    quantity: "Quantity",
    tacnumber: "TAC / Approval No.",
    tac_no: "TAC / Approval No.",
    schoolname: "School / Training Institution",
    school_name: "School / Training Institution",
    coursedegree: "Course / Degree",
    course_degree: "Course / Degree",
    yeargraduated: "Year Graduated",
    year_graduated: "Year Graduated",
    educationalattainment: "Educational Attainment",
    educational_attainment: "Educational Attainment",
    specialneeds: "Special Needs / Accommodation",
    special_needs: "Special Needs / Accommodation",
  };

  const lower = key.toLowerCase().replace(/[-_]/g, "");
  if (map[lower]) return map[lower];

  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// ─── Helpers to Filter Unrelated & Duplicate Sections / Fields ─────────────
const isUnrelatedSection = (titleOrKey: string): boolean => {
  const lower = titleOrKey.toLowerCase().replace(/['’]/g, "").replace(/[-_]/g, " ").trim();
  return (
    lower.includes("payment") ||
    lower.includes("fee") ||
    lower.includes("office use") ||
    lower.includes("official use") ||
    lower.includes("ntc use") ||
    lower.includes("evaluation") ||
    lower.includes("processing note") ||
    lower.includes("personal information") ||
    lower.includes("personal detail") ||
    lower.includes("personal data") ||
    lower.includes("personal particular") ||
    lower.includes("personal info") ||
    lower.includes("applicant information") ||
    lower.includes("applicant detail") ||
    lower.includes("applicant particular") ||
    lower.includes("applicant person") ||
    lower.includes("applicant contact") ||
    lower.includes("applicantperson") ||
    lower.includes("applicantinfo") ||
    lower.includes("basic information") ||
    lower.includes("basic detail") ||
    lower.includes("contact information") ||
    lower.includes("contact detail") ||
    lower.includes("contact particular") ||
    lower === "declaration" ||
    lower === "declaration of applicant" ||
    lower === "acknowledgement" ||
    lower === "acknowledgement & applicant signature" ||
    lower === "signature" ||
    lower === "typeofcertificate" ||
    lower === "permittype" ||
    lower === "apptype" ||
    lower === "applicationtype" ||
    lower === "typeofapplication" ||
    lower === "type of certificate / application" ||
    lower === "type of application & permit category" ||
    lower === "type of application & category" ||
    lower === "type of certificate" ||
    lower === "type of application" ||
    lower === "application type" ||
    lower === "permit type / application type" ||
    lower === "permit type" ||
    lower === "permit category"
  );
};

const isApplicantParticularField = (labelOrId: string): boolean => {
  const lower = labelOrId.toLowerCase().replace(/['’]/g, "").replace(/[-_]/g, " ").trim();

  // Explicit non-applicant entity fields to allow through
  if (
    lower.includes("dealer") ||
    lower.includes("seller") ||
    lower.includes("buyer") ||
    lower.includes("equipment") ||
    lower.includes("school") ||
    lower.includes("institution") ||
    lower.includes("course") ||
    lower.includes("degree") ||
    lower.includes("station") ||
    lower.includes("satellite") ||
    lower.includes("vessel") ||
    lower.includes("ship") ||
    lower.includes("aircraft")
  ) {
    return false;
  }

  return (
    lower.includes("full name") ||
    lower.includes("legal name") ||
    lower.includes("applicant name") ||
    lower === "name" ||
    lower === "first name" ||
    lower === "fname" ||
    lower === "middle name" ||
    lower === "mname" ||
    lower === "last name" ||
    lower === "surname" ||
    lower === "lname" ||
    lower === "suffix" ||
    lower.includes("company name") ||
    lower.includes("business name") ||
    lower.includes("corporate name") ||
    lower.includes("representative name") ||
    lower.includes("email") ||
    lower.includes("contact") ||
    lower.includes("phone") ||
    lower.includes("mobile") ||
    lower.includes("cellphone") ||
    lower.includes("telephone") ||
    lower.includes("nationality") ||
    lower.includes("citizenship") ||
    lower.includes("civil status") ||
    lower.includes("marital") ||
    lower.includes("birth") ||
    lower === "dob" ||
    lower === "sex" ||
    lower === "gender" ||
    lower.includes("sex / gender") ||
    lower.includes("gender") ||
    lower.includes("address") ||
    lower.includes("street") ||
    lower.includes("barangay") ||
    lower.includes("city") ||
    lower.includes("municipality") ||
    lower.includes("province") ||
    lower.includes("region") ||
    lower.includes("zip") ||
    lower.includes("postal")
  );
};

const isSignatureOrDeclarationField = (labelOrId: string): boolean => {
  const lower = labelOrId.toLowerCase().trim();
  return (
    lower.includes("signature") ||
    lower.includes("declare") ||
    lower.includes("declaration") ||
    lower.includes("affirm") ||
    lower.includes("certify")
  );
};

const isJurisdictionOrVariantField = (labelOrId: string): boolean => {
  const lower = labelOrId.toLowerCase().trim();
  return (
    lower === "service" ||
    lower === "service category" ||
    lower === "category" ||
    lower === "service name" ||
    lower === "type of application" ||
    lower === "application type" ||
    lower === "permit type" ||
    lower === "license type" ||
    lower === "certificate type" ||
    lower === "filing mode" ||
    lower === "application mode"
  );
};

const getSectionIcon = (title: string): React.ComponentProps<typeof Icon>["name"] => {
  const lower = title.toLowerCase();
  if (lower.includes("applicant") || lower.includes("personal") || lower.includes("contact")) return "user";
  if (lower.includes("education") || lower.includes("school") || lower.includes("training") || lower.includes("seminar") || lower.includes("exam")) return "book-open";
  if (lower.includes("assistance") || lower.includes("special") || lower.includes("pwd") || lower.includes("accommodation")) return "info";
  if (lower.includes("station") || lower.includes("location") || lower.includes("site") || lower.includes("address")) return "map-pin";
  if (lower.includes("equipment") || lower.includes("device") || lower.includes("transceiver") || lower.includes("technical")) return "cpu";
  if (lower.includes("antenna") || lower.includes("mast") || lower.includes("tower") || lower.includes("radio")) return "radio";
  if (lower.includes("personnel") || lower.includes("engineer") || lower.includes("technician") || lower.includes("pece") || lower.includes("ece")) return "award";
  if (lower.includes("vessel") || lower.includes("ship") || lower.includes("maritime")) return "anchor";
  if (lower.includes("aircraft") || lower.includes("aero")) return "navigation";
  if (lower.includes("document") || lower.includes("upload") || lower.includes("attachment")) return "paperclip";
  return "file-text";
};

const getSectionAccentColor = (idx: number): string => {
  const colors = ["#7C3AED", "#0284C7", "#0D9488", "#4F46E5", "#D97706", "#2563EB", "#9333EA"];
  return colors[idx % colors.length] || "#0F2C59";
};

function SummaryRow({
  label,
  value,
  onPreviewFile,
}: {
  label: string;
  value?: string | null;
  onPreviewFile?: (file: string, label: string) => void;
}) {
  if (
    !value ||
    value.trim() === "" ||
    value.trim().toUpperCase() === "N/A" ||
    value.trim().toUpperCase() === "NA" ||
    value.trim() === "-" ||
    value.trim() === "[]" ||
    value.trim() === "{}"
  ) {
    return null;
  }

  const trimmedVal = value.trim();
  const labelLower = label.toLowerCase();

  // Check if value is a JSON array or object (e.g. from repeater tables like ECE Personnel, Equipment Details, etc.)
  let parsedArray: Array<Record<string, unknown>> | null = null;
  if (
    (trimmedVal.startsWith("[") && trimmedVal.endsWith("]")) ||
    (trimmedVal.startsWith("{") && trimmedVal.endsWith("}"))
  ) {
    try {
      const parsed: unknown = JSON.parse(trimmedVal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validRows = parsed.filter(isRecord);
        if (validRows.length > 0) {
          parsedArray = validRows;
        }
      } else if (isRecord(parsed)) {
        parsedArray = [parsed];
      }
    } catch {
      // Ignored if not JSON
    }
  }

  if (parsedArray !== null && parsedArray.length > 0) {
    return (
      <View
        style={{
          backgroundColor: "#F8FAFC",
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 11,
              fontWeight: "700",
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderWidth: 1,
              borderColor: "#BFDBFE",
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: "#1D4ED8" }}>
              {parsedArray.length} {parsedArray.length === 1 ? "ENTRY RECORDED" : "ENTRIES RECORDED"}
            </Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {parsedArray.map((row, rIdx) => {
            const entries = Object.entries(row).filter(
              ([k, v]) =>
                k !== "_id" &&
                k !== "id" &&
                k !== "key" &&
                v !== null &&
                v !== undefined &&
                String(v).trim() !== ""
            );

            if (entries.length === 0) return null;

            return (
              <View
                key={row._id ? String(row._id) : `row-${rIdx}`}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                    paddingBottom: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F5F9",
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: "#0F2C59",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: "#FFFFFF" }}>
                      {rIdx + 1}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#0F2C59" }}>
                    Item #{rIdx + 1}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                  {entries.map(([k, v]) => (
                    <View
                      key={k}
                      style={{
                        flex: k.toLowerCase().includes("make") || k.toLowerCase().includes("model") ? 1.3 : 1,
                        backgroundColor: "#F8FAFC",
                        padding: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 10,
                          fontWeight: "700",
                          color: "#64748B",
                          marginBottom: 2,
                        }}
                      >
                        {formatFieldKey(k)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 12.5,
                          fontWeight: "600",
                          color: "#0F172A",
                        }}
                      >
                        {String(v)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  const isSignature =
    labelLower.includes("signature") ||
    trimmedVal.startsWith("data:image") ||
    trimmedVal.startsWith("typed:cursive:") ||
    trimmedVal.startsWith("blob:");

  const isCheckbox =
    labelLower.includes("declare") ||
    labelLower.includes("certify") ||
    labelLower.includes("agreement") ||
    labelLower.includes("declaration") ||
    trimmedVal === "true" ||
    trimmedVal === "false" ||
    trimmedVal === "agreed" ||
    trimmedVal === "yes" ||
    trimmedVal === "no";

  const isDocumentFile =
    !isSignature &&
    (trimmedVal.startsWith("data:application/pdf") ||
      trimmedVal.startsWith("blob:") ||
      trimmedVal.toLowerCase().endsWith(".pdf") ||
      trimmedVal.toLowerCase().endsWith(".png") ||
      trimmedVal.toLowerCase().endsWith(".jpg") ||
      trimmedVal.toLowerCase().endsWith(".jpeg"));

  if (isSignature) {
    const isImageSignature =
      trimmedVal.startsWith("data:image") ||
      trimmedVal.startsWith("blob:") ||
      trimmedVal.startsWith("http://") ||
      trimmedVal.startsWith("https://");

    const typedText = trimmedVal.startsWith("typed:cursive:")
      ? trimmedVal.replace("typed:cursive:", "").trim()
      : trimmedVal;

    return (
      <View
        style={{
          backgroundColor: "#F8FAFC",
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 11,
              fontWeight: "700",
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
          <View style={{ backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: "#1D4ED8" }}>
              APPLICANT SIGNATURE
            </Text>
          </View>
        </View>

        {isImageSignature ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 8,
              padding: 8,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 90,
            }}
          >
            <Image
              source={{ uri: trimmedVal }}
              style={{ width: "100%", height: 80 }}
              resizeMode="contain"
            />
            <View style={{ width: "80%", height: 1, backgroundColor: "#CBD5E1", marginTop: 6 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, color: "#94A3B8", marginTop: 4 }}>
              Digital Handwritten Signature Recorded
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 8,
              padding: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 22,
                fontStyle: "italic",
                fontWeight: "700",
                color: "#0F2C59",
                letterSpacing: 1,
              }}
            >
              {typedText}
            </Text>
            <View style={{ width: "80%", height: 1, backgroundColor: "#0F2C59", marginTop: 6 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, color: "#64748B", marginTop: 4 }}>
              Digitally / Electronically Signed
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (isCheckbox) {
    const isChecked = trimmedVal === "true" || trimmedVal === "agreed" || trimmedVal === "yes" || trimmedVal === "1";
    const displayLabel = labelLower.startsWith("i hereby declare")
      ? OFFICIAL_LEGAL_DECLARATION
      : label;

    return (
      <View
        style={{
          backgroundColor: isChecked ? "#F0FDF4" : "#FEF2F2",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isChecked ? "#BBF7D0" : "#FECACA",
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            backgroundColor: isChecked ? "#16A34A" : "#FFFFFF",
            borderWidth: 1.5,
            borderColor: isChecked ? "#16A34A" : "#DC2626",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isChecked && <Icon name="check" size={14} color="#FFFFFF" />}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12.5,
              fontWeight: "600",
              color: isChecked ? "#166534" : "#991B1B",
              lineHeight: 18,
            }}
          >
            {displayLabel}
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 10,
              fontWeight: "700",
              color: isChecked ? "#15803D" : "#B91C1C",
              marginTop: 2,
              textTransform: "uppercase",
            }}
          >
            {isChecked ? "✓ Confirmed & Agreed" : "✗ Not Agreed"}
          </Text>
        </View>
      </View>
    );
  }

  if (isDocumentFile) {
    return (
      <View
        style={{
          backgroundColor: "#F8FAFC",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 10,
              fontWeight: "700",
              color: "#64748B",
              marginBottom: 3,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              fontWeight: "600",
              color: "#0F172A",
            }}
            numberOfLines={1}
          >
            {trimmedVal}
          </Text>
        </View>
        {onPreviewFile !== undefined && (
          <TouchableOpacity
            onPress={() => onPreviewFile(trimmedVal, label)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#EFF6FF",
              borderWidth: 1,
              borderColor: "#BFDBFE",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              gap: 4,
            }}
          >
            <Icon name="eye" size={13} color="#1D4ED8" />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
              View Document
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: "#F8FAFC",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 10,
          fontWeight: "700",
          color: "#64748B",
          marginBottom: 3,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 13,
          fontWeight: "600",
          color: "#0F172A",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Reusable Section Card Wrapper ─────────────────────────────────────────
function SectionCard({
  icon,
  title,
  accentColor = "#0F2C59",
  children,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderLeftWidth: 5,
        borderLeftColor: accentColor,
        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 0,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: `${accentColor}12`,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name={icon} size={14} color={accentColor} />
        </View>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 14,
            fontWeight: "700",
            color: "#0F2C59",
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export function GeneralReviewSubmitStep({
  service,
  tenants,
  offices,
  selectedRegionId,
  selectedOfficeId,
  activeApplicant,
  applicants = [],
  currentApplicantIndex = 0,
  appMode,
  variants = [],
  variantRequirements = [],
  schedules = [],
  selectedScheduleId = null,
}: GeneralReviewSubmitStepProps) {
  const [previewFile, setPreviewFile] = useState<{ name: string; uri?: string } | string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getRequirementLabel = (key: string): string => {
    const cleanKey = key.replace(/^req-/, "");
    const matched = (variantRequirements || []).find((r) => {
      if (typeof r === "string") return false;
      return r.id === cleanKey || r.key === key || r.key === cleanKey;
    });
    if (matched && typeof matched === "object") {
      return (matched.name || matched.label || matched.title || matched.description || cleanKey).replace(/\*$/, "").trim();
    }
    if (service.requirements && Array.isArray(service.requirements)) {
      const matchedFromSvc = service.requirements.find((r) => {
        if (typeof r === "string") return false;
        const rObj = r as unknown as { id?: string; name?: string; label?: string; description?: string };
        return rObj.id === cleanKey;
      });
      if (matchedFromSvc && typeof matchedFromSvc === "object") {
        const rObj = matchedFromSvc as unknown as { id?: string; name?: string; label?: string; description?: string };
        return (rObj.name || rObj.label || rObj.description || cleanKey).replace(/\*$/, "").trim();
      }
    }
    return cleanKey.replace(/[-_]/g, " ").toUpperCase();
  };

  // Retrieve dynamic form definition if available for this service
  const { form } = useServiceForm(service.id, activeApplicant.selectedVariantId);

  // Service Domain Category Flags
  const serviceCategoryLower = (service.category || "").toLowerCase().trim();
  const serviceTitleLower = (service.title || "").toLowerCase().trim();

  const isExamService =
    serviceCategoryLower.includes("exam") ||
    serviceTitleLower.includes("exam") ||
    serviceTitleLower.includes("admission") ||
    serviceTitleLower.includes("operator examination");

  const isLicenseService =
    !isExamService &&
    (serviceCategoryLower.includes("licen") ||
      serviceTitleLower.includes("license") ||
      serviceTitleLower.includes("licence"));

  const isPermitService =
    !isExamService &&
    (serviceCategoryLower.includes("permit") ||
      serviceTitleLower.includes("permit"));

  const isCertificateService =
    !isExamService &&
    (serviceCategoryLower.includes("cert") ||
      serviceTitleLower.includes("certificate") ||
      serviceTitleLower.includes("radio operator certificate") ||
      serviceTitleLower.includes("roc") ||
      serviceTitleLower.includes("tvro") ||
      serviceTitleLower.includes("vas"));

  const regionName =
    tenants.find((t) => t.id === selectedRegionId)?.name ||
    selectedRegionId ||
    "NTC Central / Regional Jurisdiction";

  const officeName =
    offices.find((o) => o.id === selectedOfficeId)?.name ||
    selectedOfficeId ||
    "Main Processing Office";

  const matchedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const scheduleSummaryText = matchedSchedule
    ? [
        matchedSchedule.scheduledDate,
        [matchedSchedule.startTime, matchedSchedule.endTime].filter(Boolean).join(" - "),
        matchedSchedule.venue,
      ]
        .filter(Boolean)
        .join(" • ")
    : null;

  const selectedVariant = variants.find((v) => v.id === activeApplicant.selectedVariantId);
  const variantDesc = selectedVariant?.description?.trim() || selectedVariant?.name?.trim() || "";
  const variantType =
    selectedVariant?.type &&
    typeof selectedVariant.type === "string" &&
    selectedVariant.type.toUpperCase() !== "NA" &&
    selectedVariant.type.toUpperCase() !== "N/A"
      ? selectedVariant.type.toUpperCase()
      : "";

  const variantLabel =
    variantDesc.length > 0 && variantType.length > 0
      ? variantDesc.toUpperCase().includes(`(${variantType})`)
        ? variantDesc
        : `${variantDesc} (${variantType})`
      : variantDesc || activeApplicant.selectedVariantId || "Standard";

  const appModeLabel =
    appMode === "SINGLE" ? "Single Applicant" : appMode === "BULK" ? "Bulk / Group Filing" : "—";

  const uploadedEntries = Object.entries(activeApplicant.uploads || {});
  const uploadCount = uploadedEntries.length;

  // Dynamic form field values (from DB-seeded forms)
  const formFieldValues = activeApplicant.formFieldValues ?? [];

  // Resolve applicant particulars from base fields with fallback to formFieldValues
  const resolvedFullName =
    [activeApplicant.firstName, activeApplicant.middleName, activeApplicant.lastName, activeApplicant.suffix]
      .filter(Boolean)
      .join(" ") ||
    formFieldValues.find((fv) => isApplicantParticularField(fv.fieldId) && fv.fieldLabel.toLowerCase().includes("name"))?.value ||
    null;

  const addressParts = [
    activeApplicant.address,
    activeApplicant.barangay,
    activeApplicant.city,
    activeApplicant.province,
    activeApplicant.region,
    activeApplicant.zipCode ? `ZIP ${activeApplicant.zipCode}` : null,
  ].filter(Boolean);

  const resolvedAddress =
    addressParts.length > 0
      ? addressParts.join(", ")
      : formFieldValues.find((fv) => (fv.fieldId === "address" || fv.fieldLabel.toLowerCase().includes("address")) && !fv.fieldLabel.toLowerCase().includes("email"))?.value ||
        null;

  const resolvedBirthDate =
    activeApplicant.birthMonth && activeApplicant.birthDay && activeApplicant.birthYear
      ? `${activeApplicant.birthMonth} ${activeApplicant.birthDay}, ${activeApplicant.birthYear}`
      : activeApplicant.birthDate ||
        formFieldValues.find((fv) => fv.fieldId === "birthDate" || fv.fieldLabel.toLowerCase().includes("birth"))?.value ||
        null;

  const resolvedEmail =
    activeApplicant.email ||
    formFieldValues.find((fv) => fv.fieldId === "email" || fv.fieldLabel.toLowerCase().includes("email"))?.value ||
    "";

  const resolvedContactNo =
    activeApplicant.contactNo ||
    formFieldValues.find((fv) => fv.fieldId === "contactNo" || fv.fieldId === "contactNumber" || fv.fieldLabel.toLowerCase().includes("contact") || fv.fieldLabel.toLowerCase().includes("phone") || fv.fieldLabel.toLowerCase().includes("mobile"))?.value ||
    "";

  const resolvedSex =
    activeApplicant.sex ||
    formFieldValues.find((fv) => fv.fieldId === "sex" || fv.fieldLabel.toLowerCase().includes("sex") || fv.fieldLabel.toLowerCase().includes("gender"))?.value ||
    null;

  const resolvedCivilStatus =
    activeApplicant.civilStatus ||
    formFieldValues.find((fv) => fv.fieldId === "civilStatus" || fv.fieldLabel.toLowerCase().includes("civil") || fv.fieldLabel.toLowerCase().includes("marital"))?.value ||
    null;

  const resolvedNationality =
    activeApplicant.nationality ||
    formFieldValues.find((fv) => fv.fieldId === "nationality" || fv.fieldLabel.toLowerCase().includes("nationality") || fv.fieldLabel.toLowerCase().includes("citizenship"))?.value ||
    null;

  // Digital Signature identification
  const signatureEntry = formFieldValues.find(
    (fv) =>
      fv.fieldId === FIELD_ID_SIGNATURE ||
      fv.fieldLabel.toLowerCase().includes("signature") ||
      fv.value.startsWith("data:image") ||
      fv.value.startsWith("typed:cursive:")
  ) || (activeApplicant.signatureUrl || (activeApplicant as any).signature ? {
    fieldId: FIELD_ID_SIGNATURE,
    fieldLabel: "Applicant Signature",
    value: activeApplicant.signatureUrl || (activeApplicant as any).signature || "",
  } : undefined);

  // Specialized Models Data
  const amateur = activeApplicant.amateurLicenseData;
  const lifetime = activeApplicant.lifetimeLicenseData;
  const radioCert = activeApplicant.radioCertData;
  const deviceReg = activeApplicant.deviceRegData;
  const tvroReg = activeApplicant.tvroRegData;
  const vasData = activeApplicant.vasData;
  const copyOfCert = activeApplicant.copyOfCertData;
  const permitData = activeApplicant.permitData;

  // ── Track rendered field IDs to avoid duplicate display ─────────────────
  const renderedFieldIds = new Set<string>();

  // ── Build Structured Dynamic Form Sections ──────────────────────────────
  const dynamicSectionsToRender = (() => {
    if (!form || !form.sections || !Array.isArray(form.sections) || form.sections.length === 0) {
      return [];
    }

    const result: Array<{
      id: string;
      title: string;
      icon: React.ComponentProps<typeof Icon>["name"];
      accentColor: string;
      fields: Array<{ fieldId: string; label: string; value: string }>;
    }> = [];

    form.sections.forEach((section, sIdx) => {
      const sectionKey = section.key || section.id || "";
      const sectionTitle = section.title || `Section ${sIdx + 1}`;

      // Exclude unrelated sections (Payment, Office Use, Declaration, redundant type selectors)
      if (isUnrelatedSection(sectionTitle) || isUnrelatedSection(sectionKey)) {
        return;
      }

      const sectionFields: Array<{ fieldId: string; label: string; value: string }> = [];

      (section.fields || []).forEach((field) => {
        const fieldId = field.fieldId || field.id || "";
        const fieldLabel = field.label || "";

        // Check if field is already handled in Section 2 (Applicant particulars) or is signature/unrelated
        if (
          isApplicantParticularField(fieldLabel) ||
          isApplicantParticularField(fieldId) ||
          isSignatureOrDeclarationField(fieldLabel) ||
          isSignatureOrDeclarationField(fieldId) ||
          isJurisdictionOrVariantField(fieldLabel) ||
          isJurisdictionOrVariantField(fieldId)
        ) {
          renderedFieldIds.add(fieldId);
          renderedFieldIds.add(fieldLabel);
          return;
        }

        // Find value in formFieldValues
        const matchedFv = formFieldValues.find(
          (fv) => fv.fieldId === fieldId || fv.fieldLabel.toLowerCase().trim() === fieldLabel.toLowerCase().trim()
        );

        if (matchedFv && matchedFv.value && matchedFv.value.trim() !== "") {
          const val = matchedFv.value.trim();
          if (val.toUpperCase() !== "N/A" && val.toUpperCase() !== "NA" && val !== "-" && val !== "[]" && val !== "{}") {
            sectionFields.push({ fieldId, label: fieldLabel || matchedFv.fieldLabel, value: val });
            renderedFieldIds.add(fieldId);
            renderedFieldIds.add(matchedFv.fieldId);
            renderedFieldIds.add(fieldLabel);
            renderedFieldIds.add(matchedFv.fieldLabel);
          }
        }
      });

      if (sectionFields.length > 0) {
        result.push({
          id: section.id || sectionKey || `sec-${sIdx}`,
          title: sectionTitle,
          icon: getSectionIcon(sectionTitle),
          accentColor: getSectionAccentColor(result.length),
          fields: sectionFields,
        });
      }
    });

    return result;
  })();

  // ── Remaining Non-Empty Form Fields not covered in Dynamic Sections ──────
  const remainingFields = formFieldValues.filter((fv) => {
    const fieldId = fv.fieldId || "";
    const label = fv.fieldLabel || "";
    if (renderedFieldIds.has(fieldId) || renderedFieldIds.has(label)) return false;
    if (isApplicantParticularField(label) || isApplicantParticularField(fieldId)) return false;
    if (isSignatureOrDeclarationField(label) || isSignatureOrDeclarationField(fieldId)) return false;
    if (isJurisdictionOrVariantField(label) || isJurisdictionOrVariantField(fieldId)) return false;
    if (!fv.value || fv.value.trim() === "" || fv.value.trim().toUpperCase() === "N/A" || fv.value.trim().toUpperCase() === "NA" || fv.value.trim() === "-") return false;
    return true;
  });

  // Separate exam-specific remaining fields into clean logical groups
  const examEducationFields = isExamService
    ? remainingFields.filter(
        (f) =>
          f.fieldLabel.toLowerCase().includes("school") ||
          f.fieldLabel.toLowerCase().includes("course") ||
          f.fieldLabel.toLowerCase().includes("degree") ||
          f.fieldLabel.toLowerCase().includes("education") ||
          f.fieldLabel.toLowerCase().includes("attainment") ||
          f.fieldLabel.toLowerCase().includes("graduated") ||
          f.fieldLabel.toLowerCase().includes("year")
      )
    : [];

  const examAssistanceFields = isExamService
    ? remainingFields.filter(
        (f) =>
          f.fieldLabel.toLowerCase().includes("assist") ||
          f.fieldLabel.toLowerCase().includes("special") ||
          f.fieldLabel.toLowerCase().includes("pwd") ||
          f.fieldLabel.toLowerCase().includes("accommodat") ||
          f.fieldLabel.toLowerCase().includes("needs")
      )
    : [];


  // Specialized Model Display Conditions: STRICT CATEGORY GATES to prevent cross-contamination
  const hasAmateurLicenseData =
    isLicenseService &&
    Boolean(
      amateur &&
        (amateur.classOfStation ||
          amateur.callSign ||
          amateur.licenseNo ||
          amateur.location ||
          (amateur.particularsEquipment &&
            amateur.particularsEquipment.some((g) => g.makeTypeModel || g.equipments.length > 0)))
    );

  const hasLifetimeLicenseData =
    isLicenseService &&
    Boolean(
      lifetime &&
        (lifetime.callSign ||
          lifetime.yearsOfAmateurService ||
          lifetime.memberClubName ||
          lifetime.existingClassALicenseNo)
    );

  const hasRadioCertData =
    isCertificateService &&
    Boolean(
      radioCert &&
        (radioCert.typeOfCertificate ||
          radioCert.certificateNo ||
          radioCert.dateOfExpiry ||
          radioCert.modificationDueTo ||
          radioCert.employmentStatus)
    );

  const hasDeviceRegData =
    isCertificateService &&
    Boolean(
      deviceReg &&
        (deviceReg.registrationType ||
          deviceReg.invoiceNo ||
          deviceReg.businessName ||
          (deviceReg.particulars && deviceReg.particulars.length > 0))
    );

  const hasTvroData =
    isCertificateService &&
    serviceTitleLower.includes("tvro") &&
    Boolean(
      tvroReg &&
        (tvroReg.bsdNumber ||
          tvroReg.businessName ||
          (tvroReg.particularsEquipment &&
            tvroReg.particularsEquipment.some((e) => e.makeTypeModel || e.serialNo)) ||
          (tvroReg.particularsOfAntennaSystem &&
            tvroReg.particularsOfAntennaSystem.some((a) => a.makeTypeModel || a.dishDiameter)))
    );

  const hasVasData =
    isCertificateService &&
    serviceTitleLower.includes("vas") &&
    Boolean(
      vasData &&
        (vasData.certificateNumber ||
          vasData.serviceNo ||
          vasData.otherTradeName ||
          (vasData.valueAddedServices && vasData.valueAddedServices.length > 0))
    );

  const hasCopyOfCertData =
    (serviceTitleLower.includes("copy") || serviceTitleLower.includes("duplicate") || serviceTitleLower.includes("certified")) &&
    Boolean(
      copyOfCert &&
        (copyOfCert.certificateNo ||
          copyOfCert.targetService ||
          copyOfCert.circumstancesOfLoss)
    );

  const hasPermitData =
    isPermitService &&
    Boolean(
      permitData &&
        (permitData.callSign ||
          permitData.exactLocation ||
          permitData.serviceArea ||
          permitData.nameOfDealer ||
          permitData.authorizedSellerBuyer)
    );

  return (
    <View style={{ gap: 16 }}>
      {/* ── Hero Header ── */}
      <View
        style={{
          backgroundColor: "#0F2C59",
          borderRadius: 14,
          padding: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "rgba(255,255,255,0.15)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="check-circle" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 16,
              fontWeight: "700",
              color: "#FFFFFF",
              marginBottom: 2,
            }}
          >
            Final Application Review & Summary
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Please verify all filled-out particulars and parameters before official submission.
          </Text>
        </View>
      </View>

      {/* ── Section 1: Service & Jurisdiction Parameters / Examination Details ── */}
      <SectionCard
        icon={isExamService ? "file-text" : "layers"}
        title={isExamService ? "Examination Details" : "Service & Jurisdiction Parameters"}
        accentColor="#0F2C59"
      >
        <SummaryRow label="Service Name" value={service.title} />
        {service.category ? <SummaryRow label="Service Category" value={service.category} /> : null}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Target Region" value={regionName} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Field Office" value={officeName} />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow
              label="Applicant Classification"
              value={
                activeApplicant.applicantType === "company"
                  ? activeApplicant.companyName
                    ? `Company / Corporation (${activeApplicant.companyName})`
                    : "Company / Corporation"
                  : "Individual Applicant"
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Filing Mode" value={appModeLabel} />
          </View>
        </View>
        <SummaryRow label="Application Variant / Type" value={variantLabel} />
        {activeApplicant.selectedElementTitle ? (
          <SummaryRow label="Selected Element / Category" value={activeApplicant.selectedElementTitle} />
        ) : null}
        {scheduleSummaryText && (
          <SummaryRow label="Exam Schedule & Venue" value={scheduleSummaryText} />
        )}
      </SectionCard>

      {/* ── Bulk Cohort Summary Card ── */}
      {appMode === "BULK" && applicants && applicants.length > 0 && (
        <SectionCard icon="users" title={`Bulk Application Group Cohort (${applicants.length} Applicants)`} accentColor="#0284C7">
          <View style={{ gap: 8 }}>
            {applicants.map((app, idx) => {
              const appName = getApplicantDisplayName(app, idx + 1);
              const docCount = Object.keys(app.uploads || {}).length;
              const isSelected = idx === currentApplicantIndex;
              return (
                <View
                  key={app.id || idx}
                  style={{
                    backgroundColor: isSelected ? "#EFF6FF" : "#F8FAFC",
                    borderWidth: 1,
                    borderColor: isSelected ? "#93C5FD" : "#E2E8F0",
                    borderRadius: 10,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59" }}>
                      {idx + 1}. {appName} {isSelected ? "(Active Review)" : ""}
                    </Text>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      {app.email || "No Email"} • {app.contactNo || "No Contact"} • {docCount} attached file{docCount !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: "#DCFCE7", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#166534" }}>
                      Cohort Member
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </SectionCard>
      )}

      {/* ── Section 2: Applicant Details ── */}
      {(resolvedFullName !== null ||
        activeApplicant.companyName ||
        activeApplicant.representativeName ||
        resolvedEmail.length > 0 ||
        resolvedContactNo.length > 0 ||
        resolvedAddress !== null ||
        resolvedSex !== null ||
        resolvedCivilStatus !== null ||
        resolvedNationality !== null ||
        resolvedBirthDate !== null ||
        activeApplicant.notes) && (
        <SectionCard icon="user" title="Applicant Details" accentColor="#1D4ED8">
          {resolvedFullName !== null && <SummaryRow label="Full Legal Name" value={resolvedFullName} />}
          {activeApplicant.applicantType === "company" && activeApplicant.companyName && (
            <SummaryRow label="Registered Business / Corporate Name" value={activeApplicant.companyName} />
          )}
          {activeApplicant.representativeName && (
            <SummaryRow label="Authorized Representative" value={activeApplicant.representativeName} />
          )}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {resolvedEmail.length > 0 && (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Email Address" value={resolvedEmail} />
              </View>
            )}
            {resolvedContactNo.length > 0 && (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Contact / Mobile Number" value={resolvedContactNo} />
              </View>
            )}
          </View>
          {resolvedAddress !== null && (
            <SummaryRow label="Complete Residential / Office Address" value={resolvedAddress} />
          )}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {resolvedBirthDate !== null && (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Date of Birth" value={resolvedBirthDate} />
              </View>
            )}
            {resolvedSex !== null && (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Sex / Gender" value={resolvedSex} />
              </View>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {resolvedCivilStatus !== null && (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Civil Status" value={resolvedCivilStatus} />
              </View>
            )}
            {resolvedNationality !== null && (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Nationality / Citizenship" value={resolvedNationality} />
              </View>
            )}
          </View>
          {activeApplicant.notes ? <SummaryRow label="Special Notes / Remarks" value={activeApplicant.notes} /> : null}
        </SectionCard>
      )}

      {/* ── Section 3+: Dynamic Form Sections (From Seeded Contract Catalog) ── */}
      {dynamicSectionsToRender.map((sec) => (
        <SectionCard key={sec.id} icon={sec.icon} title={sec.title} accentColor={sec.accentColor}>
          {sec.fields.map((field) => (
            <SummaryRow
              key={field.fieldId || field.label}
              label={field.label}
              value={field.value}
              onPreviewFile={(uri, lbl) => {
                setPreviewFile({ name: lbl, uri });
                setPreviewLabel(lbl);
                setIsPreviewOpen(true);
              }}
            />
          ))}
        </SectionCard>
      ))}

      {/* ── Exam-Specific Clean Logical Sections (If not covered by dynamic sections) ── */}
      {isExamService && examEducationFields.length > 0 && (
        <SectionCard icon="book-open" title="Educational Background & Qualifications" accentColor="#0284C7">
          {examEducationFields.map((fv) => (
            <SummaryRow
              key={fv.fieldId}
              label={fv.fieldLabel}
              value={fv.value}
              onPreviewFile={(uri, lbl) => {
                setPreviewFile({ name: lbl, uri });
                setPreviewLabel(lbl);
                setIsPreviewOpen(true);
              }}
            />
          ))}
        </SectionCard>
      )}

      {isExamService && examAssistanceFields.length > 0 && (
        <SectionCard icon="info" title="Special Needs & Assistance Request" accentColor="#0D9488">
          {examAssistanceFields.map((fv) => (
            <SummaryRow
              key={fv.fieldId}
              label={fv.fieldLabel}
              value={fv.value}
              onPreviewFile={(uri, lbl) => {
                setPreviewFile({ name: lbl, uri });
                setPreviewLabel(lbl);
                setIsPreviewOpen(true);
              }}
            />
          ))}
        </SectionCard>
      )}

      {/* ── Non-Exam Unmapped Form Fields (if any) ── */}
      {!isExamService && remainingFields.length > 0 && (
        <SectionCard icon="file-text" title="Application Particulars & Technical Details" accentColor="#0284C7">
          {remainingFields.map((fv) => (
            <SummaryRow
              key={fv.fieldId}
              label={fv.fieldLabel}
              value={fv.value}
              onPreviewFile={(uri, lbl) => {
                setPreviewFile({ name: lbl, uri });
                setPreviewLabel(lbl);
                setIsPreviewOpen(true);
              }}
            />
          ))}
        </SectionCard>
      )}

      {/* ── Specialized Models: Amateur Radio Station License Data (Licenses Only) ── */}
      {hasAmateurLicenseData && amateur && (
        <SectionCard icon="radio" title="Amateur Radio Station Particulars" accentColor="#7C3AED">
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {amateur.classOfStation ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Station Class" value={amateur.classOfStation} />
                </View>
              ) : null}
              {amateur.callSign ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Call Sign" value={amateur.callSign} />
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {amateur.noOfYears ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="License Validity / Years" value={`${amateur.noOfYears} Year(s)`} />
                </View>
              ) : null}
              {amateur.licenseNo ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Existing License No." value={amateur.licenseNo} />
                </View>
              ) : null}
            </View>
            {amateur.dateOfExpiry ? <SummaryRow label="License Expiry Date" value={amateur.dateOfExpiry} /> : null}
            {amateur.modificationDueTo ? <SummaryRow label="Reason for Modification" value={amateur.modificationDueTo} /> : null}
            {amateur.location ? <SummaryRow label="Station Location / Address" value={amateur.location} /> : null}
            {amateur.placeOfExamSeminar || amateur.dateOfExamSeminar || amateur.ratings ? (
              <View style={{ backgroundColor: "#F1F5F9", padding: 10, borderRadius: 8, marginTop: 4 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#475569", marginBottom: 4 }}>
                  EXAMINATION / SEMINAR RECORD
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#1E293B" }}>
                  {[amateur.placeOfExamSeminar, amateur.dateOfExamSeminar, amateur.ratings ? `Rating: ${amateur.ratings}` : null]
                    .filter(Boolean)
                    .join(" • ")}
                </Text>
              </View>
            ) : null}
          </View>
        </SectionCard>
      )}

      {/* ── Specialized Models: Lifetime Amateur License Data (Licenses Only) ── */}
      {hasLifetimeLicenseData && lifetime && (
        <SectionCard icon="award" title="Lifetime Amateur License Particulars" accentColor="#7C3AED">
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {lifetime.callSign ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Call Sign" value={lifetime.callSign} />
                </View>
              ) : null}
              {lifetime.yearsOfAmateurService ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Years of Amateur Service" value={`${lifetime.yearsOfAmateurService} Years`} />
                </View>
              ) : null}
            </View>
            {lifetime.memberClubName ? <SummaryRow label="Affiliated Amateur Club" value={lifetime.memberClubName} /> : null}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {lifetime.certOfGoodStandingNo ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Cert of Good Standing No." value={lifetime.certOfGoodStandingNo} />
                </View>
              ) : null}
              {lifetime.existingClassALicenseNo ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Class A License No." value={lifetime.existingClassALicenseNo} />
                </View>
              ) : null}
            </View>
            {lifetime.licenseExpiryDate ? <SummaryRow label="Class A License Expiry" value={lifetime.licenseExpiryDate} /> : null}
            {lifetime.location ? <SummaryRow label="Station Location" value={lifetime.location} /> : null}
          </View>
        </SectionCard>
      )}

      {/* ── Specialized Models: Radio Operator Certificate Data (Certificates Only) ── */}
      {hasRadioCertData && radioCert && (
        <SectionCard icon="file-text" title="Radio Operator Certificate Particulars" accentColor="#7C3AED">
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {radioCert.typeOfCertificate ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Certificate Type" value={radioCert.typeOfCertificate} />
                </View>
              ) : null}
              {radioCert.years ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Validity Years" value={`${radioCert.years} Year(s)`} />
                </View>
              ) : null}
            </View>
            {radioCert.certificateNo ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Certificate No." value={radioCert.certificateNo} />
                </View>
                {radioCert.dateOfExpiry ? (
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Expiry Date" value={radioCert.dateOfExpiry} />
                  </View>
                ) : null}
              </View>
            ) : null}
            {radioCert.modificationDueTo ? <SummaryRow label="Reason for Modification" value={radioCert.modificationDueTo} /> : null}
            {radioCert.employmentStatus || radioCert.employmentType || radioCert.employmentLocation ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                {radioCert.employmentStatus ? (
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Employment Status" value={radioCert.employmentStatus} />
                  </View>
                ) : null}
                {radioCert.employmentType || radioCert.employmentLocation ? (
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Employment Type / Location" value={[radioCert.employmentType, radioCert.employmentLocation].filter(Boolean).join(" - ")} />
                  </View>
                ) : null}
              </View>
            ) : null}
            {radioCert.clubName ? <SummaryRow label="Amateur Club & Call Sign" value={[radioCert.clubName, radioCert.clubCallSign].filter(Boolean).join(" (") + (radioCert.clubCallSign ? ")" : "")} /> : null}
          </View>
        </SectionCard>
      )}

      {/* ── Specialized Models: Device Registration (Certificates Only) ── */}
      {hasDeviceRegData && deviceReg && (
        <SectionCard icon="cpu" title="Registered Device Particulars" accentColor="#0284C7">
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {deviceReg.registrationType ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Registration Type" value={deviceReg.registrationType} />
                </View>
              ) : null}
              {deviceReg.invoiceNo ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Invoice No." value={deviceReg.invoiceNo} />
                </View>
              ) : null}
            </View>
            {deviceReg.businessName ? <SummaryRow label="Business Name" value={deviceReg.businessName} /> : null}
            {deviceReg.dtiSecNo ? <SummaryRow label="DTI / SEC Reg No." value={deviceReg.dtiSecNo} /> : null}
          </View>
        </SectionCard>
      )}

      {/* ── Specialized Models: TVRO Registration (Certificates / TVRO Only) ── */}
      {hasTvroData && tvroReg && (
        <SectionCard icon="tv" title="TVRO Station Particulars & Specifications" accentColor="#0284C7">
          <View style={{ gap: 12 }}>
            {/* Section 1-3 Summary */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {tvroReg.classification ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Classification" value={tvroReg.classification} />
                </View>
              ) : null}
              {tvroReg.years ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Validity Years" value={`${tvroReg.years} Year(s)`} />
                </View>
              ) : null}
            </View>
            {tvroReg.businessName ? <SummaryRow label="Business Name" value={tvroReg.businessName} /> : null}

            {/* Section 4: Location */}
            {(tvroReg.serviceArea || tvroReg.exactLocation || tvroReg.longitude || tvroReg.latitude) && (
              <View style={{ marginTop: 4, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", gap: 6 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                  4. Location Details
                </Text>
                {tvroReg.serviceArea ? <SummaryRow label="Service Area" value={tvroReg.serviceArea} /> : null}
                {tvroReg.exactLocation ? <SummaryRow label="Exact Location of TVRO System" value={tvroReg.exactLocation} /> : null}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {tvroReg.longitude ? (
                    <View style={{ flex: 1 }}>
                      <SummaryRow label="Longitude (deg-min-sec)" value={tvroReg.longitude} />
                    </View>
                  ) : null}
                  {tvroReg.latitude ? (
                    <View style={{ flex: 1 }}>
                      <SummaryRow label="Latitude (deg-min-sec)" value={tvroReg.latitude} />
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {/* Section 5: Particulars of Equipment */}
            {tvroReg.particularsEquipment && tvroReg.particularsEquipment.length > 0 && (
              <View style={{ marginTop: 4, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                  5. Particulars of Equipment ({tvroReg.particularsEquipment.length} Unit(s))
                </Text>
                {tvroReg.particularsEquipment.map((eq, idx) => (
                  <View key={eq.id || idx} style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, borderWidth: 1, borderColor: "#CBD5E1", gap: 4 }}>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#1E293B" }}>
                      Unit #{idx + 1}: {eq.type || "Equipment"}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Make / Type / Model" value={eq.makeTypeModel || "N/A"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Serial Number" value={eq.serialNo || "N/A"} />
                      </View>
                    </View>
                    {eq.frequencyRange ? <SummaryRow label="Frequency Range" value={eq.frequencyRange} /> : null}
                  </View>
                ))}
              </View>
            )}

            {/* Section 6: Particulars of Antenna System */}
            {tvroReg.particularsOfAntennaSystem && tvroReg.particularsOfAntennaSystem.length > 0 && (
              <View style={{ marginTop: 4, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", gap: 8, width: "100%" }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                  6. Particulars of Antenna System ({tvroReg.particularsOfAntennaSystem.length} Dish(es))
                </Text>
                {tvroReg.particularsOfAntennaSystem.map((ant, idx) => (
                  <View key={ant.id || idx} style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, borderWidth: 1, borderColor: "#CBD5E1", gap: 4, width: "100%" }}>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#1E293B", marginBottom: 4 }}>
                      Antenna #{idx + 1}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                      <View style={{ flex: 1.3 }}>
                        <SummaryRow label="Make/Type/Model" value={ant.makeTypeModel || "N/A"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Dish Diameter" value={ant.dishDiameter || "N/A"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Polarization" value={ant.polarization || "N/A"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Azimuth" value={ant.azimuth || "N/A"} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Section 7: Particulars of Signal to be Received */}
            {tvroReg.particularsOfSignalToBeReceived && tvroReg.particularsOfSignalToBeReceived.length > 0 && (
              <View style={{ marginTop: 4, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                  7. Particulars of Signal to be Received ({tvroReg.particularsOfSignalToBeReceived.length} Channel(s))
                </Text>
                {tvroReg.particularsOfSignalToBeReceived.map((sig, idx) => (
                  <View key={sig.id || idx} style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 6, borderWidth: 1, borderColor: "#CBD5E1", gap: 4 }}>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#1E293B" }}>
                      Signal Channel #{idx + 1}: {sig.satellite || "Satellite"}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Received Frequency" value={sig.receivedFrequency || "N/A"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SummaryRow label="Polarization" value={sig.polarization || "N/A"} />
                      </View>
                    </View>
                    {sig.nameOfPrograms ? <SummaryRow label="Name of Programs" value={sig.nameOfPrograms} /> : null}
                  </View>
                ))}
              </View>
            )}

            {/* Section 8: BSD */}
            <View style={{ marginTop: 4, padding: 12, backgroundColor: "#F1F5F9", borderRadius: 8, borderWidth: 1, borderColor: "#CBD5E1", gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                  8. Broadcast Services Division (BSD)
                </Text>
                <View style={{ backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10.5, fontWeight: "700", color: "#1D4ED8" }}>
                    NTC ASSIGNMENT
                  </Text>
                </View>
              </View>
              <SummaryRow label="BSD No." value={tvroReg.bsdNumber || "TO BE ASSIGNED BY NTC"} />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#64748B", fontStyle: "italic" }}>
                * BSD No. is designated and assigned exclusively by the NTC upon application review.
              </Text>
            </View>
          </View>
        </SectionCard>
      )}

      {/* ── Specialized Models: VAS Provider (Certificates / VAS Only) ── */}
      {hasVasData && vasData && (
        <SectionCard icon="globe" title="VAS Provider Registration Particulars" accentColor="#0284C7">
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {vasData.serviceType ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Entity Service Type" value={vasData.serviceType} />
                </View>
              ) : null}
              {vasData.years ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Validity Years" value={`${vasData.years} Year(s)`} />
                </View>
              ) : null}
            </View>
            {vasData.certificateNumber ? <SummaryRow label="VAS Certificate No." value={vasData.certificateNumber} /> : null}
            {vasData.serviceNo ? <SummaryRow label="CPCN / PA / CA Number" value={vasData.serviceNo} /> : null}
            {vasData.otherTradeName ? <SummaryRow label="Other Trade Name" value={vasData.otherTradeName} /> : null}
            {vasData.valueAddedServices && vasData.valueAddedServices.length > 0 ? (
              <SummaryRow label="Registered Value Added Services" value={vasData.valueAddedServices.join(", ")} />
            ) : null}
          </View>
        </SectionCard>
      )}

      {/* ── Specialized Models: Duplicate / True Copy Request ── */}
      {hasCopyOfCertData && copyOfCert && (
        <SectionCard icon="copy" title="Copy / Duplicate Request Details" accentColor="#0284C7">
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <SummaryRow label="Copy Request Type" value={copyOfCert.copyType === "CERTIFIED_TRUE_COPY" ? "Certified True Copy" : "Duplicate Replacement"} />
              </View>
              {copyOfCert.certificateNo ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Certificate No." value={copyOfCert.certificateNo} />
                </View>
              ) : null}
            </View>
            {copyOfCert.targetService ? <SummaryRow label="Target Permit / License" value={copyOfCert.targetService} /> : null}
            {copyOfCert.numberOfCopies ? <SummaryRow label="Number of Copies" value={copyOfCert.numberOfCopies} /> : null}
            {copyOfCert.circumstancesOfLoss ? <SummaryRow label="Circumstances of Loss / Affidavit Details" value={copyOfCert.circumstancesOfLoss} /> : null}
          </View>
        </SectionCard>
      )}

      {/* ── Specialized Models: Amateur Permit Data (Permits Only) ── */}
      {hasPermitData && permitData && (
        <SectionCard icon="file-text" title="Amateur Permit Particulars" accentColor="#7C3AED">
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {permitData.applicationType ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Application Type" value={permitData.applicationType} />
                </View>
              ) : null}
              {permitData.callSign ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Call Sign" value={permitData.callSign} />
                </View>
              ) : null}
            </View>
            {permitData.serviceArea ? <SummaryRow label="Service Area" value={permitData.serviceArea} /> : null}
            {permitData.stationClass ? <SummaryRow label="Station Class" value={permitData.stationClass} /> : null}
            {permitData.exactLocation ? <SummaryRow label="Exact Location" value={permitData.exactLocation} /> : null}
            {permitData.nameOfDealer || permitData.authorizedSellerBuyer ? (
              <SummaryRow
                label="Source of Equipment"
                value={[permitData.nameOfDealer, permitData.authorizedSellerBuyer, permitData.orInvoiceNo ? `Invoice: ${permitData.orInvoiceNo}` : null]
                  .filter(Boolean)
                  .join(" • ")}
              />
            ) : null}
          </View>
        </SectionCard>
      )}

      {/* ── Section: Uploaded Supporting Documents ── */}
      <SectionCard icon="paperclip" title="Uploaded Supporting Documents" accentColor="#059669">
        {uploadCount === 0 ? (
          <View
            style={{
              backgroundColor: "#FEF9C3",
              borderColor: "#FDE047",
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="alert-triangle" size={14} color="#92400E" />
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 12,
                color: "#92400E",
                flex: 1,
              }}
            >
              No documents attached. Please upload the required attachments before submitting.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {uploadedEntries.map(([key, file], idx) => {
              const fileName =
                typeof file === "string"
                  ? file
                  : isPreviewFileObject(file)
                  ? file.name
                  : "Document";
              return (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#F0FDF4",
                    borderWidth: 1,
                    borderColor: "#BBF7D0",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: "#DCFCE7",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 11,
                        fontWeight: "800",
                        color: "#166534",
                      }}
                    >
                      {idx + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#166534",
                      }}
                      numberOfLines={1}
                    >
                      {fileName}
                    </Text>
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 11,
                        color: "#15803D",
                        marginTop: 2,
                        lineHeight: 15,
                      }}
                    >
                      {getRequirementLabel(key)}
                    </Text>
                  </View>
                  <Icon name="check-circle" size={16} color="#16A34A" />
                  <TouchableOpacity
                    onPress={() => {
                      setPreviewFile(file);
                      setPreviewLabel(getRequirementLabel(key));
                      setIsPreviewOpen(true);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#EFF6FF",
                      borderWidth: 1,
                      borderColor: "#BFDBFE",
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      marginLeft: 4,
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="eye" size={13} color="#1D4ED8" style={{ marginRight: 4 }} />
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 4,
              }}
            >
              <View
                style={{
                  backgroundColor: "#DCFCE7",
                  borderColor: "#86EFAC",
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Icon name="paperclip" size={11} color="#166534" />
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#166534",
                  }}
                >
                  {uploadCount} document{uploadCount !== 1 ? "s" : ""} attached & verified
                </Text>
              </View>
            </View>
          </View>
        )}
      </SectionCard>

      {/* ── Section: Acknowledgement & Applicant Signature ── */}
      {signatureEntry && signatureEntry.value ? (
        <SectionCard icon="edit-2" title="Acknowledgement & Digital Signature" accentColor="#0F2C59">
          <SummaryRow
            label="Recorded Applicant Signature"
            value={signatureEntry.value}
          />
        </SectionCard>
      ) : null}



      <DocumentPreviewModal
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
        label={previewLabel}
      />
    </View>
  );
}
