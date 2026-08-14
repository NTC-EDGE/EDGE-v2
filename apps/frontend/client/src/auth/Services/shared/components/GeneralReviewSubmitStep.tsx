import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { TenantInfo, OfficeInfo, GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { getApplicantDisplayName } from "../helpers/applicantDisplayHelper";
import { DocumentPreviewModal } from "../../../../shared/components/DocumentPreviewModal";

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
  variants?: Array<{ id: string; name?: string; description?: string }>;
}

// ─── Reusable Summary Row ──────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  onPreviewFile,
}: {
  label: string;
  value?: string | null;
  onPreviewFile?: (file: string, label: string) => void;
}) {
  if (!value || value.trim() === "") return null;

  const trimmedVal = value.trim();
  const labelLower = label.toLowerCase();

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
            {label}
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
}: GeneralReviewSubmitStepProps) {
  const [previewFile, setPreviewFile] = useState<{ name: string; uri?: string } | string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const regionName =
    tenants.find((t) => t.id === selectedRegionId)?.name ||
    selectedRegionId ||
    "NTC Central / Regional Jurisdiction";

  const officeName =
    offices.find((o) => o.id === selectedOfficeId)?.name ||
    selectedOfficeId ||
    "Main Processing Office";

  const selectedVariant = variants.find((v) => v.id === activeApplicant.selectedVariantId);
  const variantLabel =
    selectedVariant?.name ||
    selectedVariant?.description ||
    activeApplicant.selectedVariantId ||
    "Standard";

  const appModeLabel =
    appMode === "SINGLE" ? "Single Applicant" : appMode === "BULK" ? "Bulk / Group Filing" : "—";

  const uploadedEntries = Object.entries(activeApplicant.uploads || {});
  const uploadCount = uploadedEntries.length;

  // Dynamic form field values (from DB-seeded forms)
  const formFieldValues = activeApplicant.formFieldValues ?? [];

  // Derived full name from applicant base fields
  const fullName =
    [activeApplicant.firstName, activeApplicant.lastName].filter(Boolean).join(" ") || null;

  // Birth date from month/day/year parts
  const birthDate =
    activeApplicant.birthMonth && activeApplicant.birthDay && activeApplicant.birthYear
      ? `${activeApplicant.birthMonth} ${activeApplicant.birthDay}, ${activeApplicant.birthYear}`
      : null;

  // Specialized Models
  const amateur = activeApplicant.amateurLicenseData;
  const lifetime = activeApplicant.lifetimeLicenseData;
  const radioCert = activeApplicant.radioCertData;
  const deviceReg = activeApplicant.deviceRegData;
  const tvroReg = activeApplicant.tvroRegData;
  const vasData = activeApplicant.vasData;
  const copyOfCert = activeApplicant.copyOfCertData;

  const hasSpecializedData =
    Boolean(amateur) ||
    Boolean(lifetime) ||
    Boolean(radioCert) ||
    Boolean(deviceReg) ||
    Boolean(tvroReg) ||
    Boolean(vasData) ||
    Boolean(copyOfCert);

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

      {/* ── Section 1: Service & Jurisdiction Parameters ── */}
      <SectionCard icon="layers" title="Service & Jurisdiction Parameters" accentColor="#0F2C59">
        <SummaryRow label="Service Name" value={service.title} />
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
            <SummaryRow label="Filing Mode" value={appModeLabel} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Application Variant / Type" value={variantLabel} />
          </View>
        </View>
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

      {/* ── Section 2: Applicant & Contact Particulars ── */}
      {(fullName !== null ||
        activeApplicant.email ||
        activeApplicant.contactNo ||
        activeApplicant.address ||
        activeApplicant.notes) && (
        <SectionCard icon="user" title="Applicant & Contact Particulars" accentColor="#1D4ED8">
          {fullName !== null && <SummaryRow label="Full Name" value={fullName} />}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {activeApplicant.email.length > 0 && (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Email Address" value={activeApplicant.email} />
              </View>
            )}
            {activeApplicant.contactNo.length > 0 && (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Contact Number" value={activeApplicant.contactNo} />
              </View>
            )}
          </View>
          {activeApplicant.address.length > 0 && (
            <SummaryRow label="Residential / Office Address" value={activeApplicant.address} />
          )}
          {birthDate !== null && <SummaryRow label="Date of Birth" value={birthDate} />}
          {activeApplicant.notes ? <SummaryRow label="Special Notes / Remarks" value={activeApplicant.notes} /> : null}
        </SectionCard>
      )}

      {/* ── Section 3: Specialized Application Details & License/Cert Particulars ── */}
      {hasSpecializedData && (
        <SectionCard icon="file-text" title="Application & License Particulars" accentColor="#7C3AED">
          {/* Amateur Radio Station License Data */}
          {amateur && (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Station Class" value={amateur.classOfStation} />
                </View>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Call Sign" value={amateur.callSign} />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="License Validity / Years" value={amateur.noOfYears ? `${amateur.noOfYears} Year(s)` : null} />
                </View>
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
          )}

          {/* Lifetime Amateur License Data */}
          {lifetime && (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Call Sign" value={lifetime.callSign} />
                </View>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Years of Amateur Service" value={lifetime.yearsOfAmateurService ? `${lifetime.yearsOfAmateurService} Years` : null} />
                </View>
              </View>
              <SummaryRow label="Affiliated Amateur Club" value={lifetime.memberClubName} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Cert of Good Standing No." value={lifetime.certOfGoodStandingNo} />
                </View>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Class A License No." value={lifetime.existingClassALicenseNo} />
                </View>
              </View>
              {lifetime.licenseExpiryDate ? <SummaryRow label="Class A License Expiry" value={lifetime.licenseExpiryDate} /> : null}
              {lifetime.location ? <SummaryRow label="Station Location" value={lifetime.location} /> : null}
            </View>
          )}

          {/* Radio Operator Certificate Data */}
          {radioCert && (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Certificate Type" value={radioCert.typeOfCertificate} />
                </View>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Validity Years" value={radioCert.years ? `${radioCert.years} Year(s)` : null} />
                </View>
              </View>
              {radioCert.certificateNo ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Certificate No." value={radioCert.certificateNo} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Expiry Date" value={radioCert.dateOfExpiry} />
                  </View>
                </View>
              ) : null}
              {radioCert.modificationDueTo ? <SummaryRow label="Reason for Modification" value={radioCert.modificationDueTo} /> : null}
              {radioCert.employmentStatus || radioCert.employmentType || radioCert.employmentLocation ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Employment Status" value={radioCert.employmentStatus} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Employment Type / Location" value={[radioCert.employmentType, radioCert.employmentLocation].filter(Boolean).join(" - ")} />
                  </View>
                </View>
              ) : null}
              {radioCert.heightCm || radioCert.weightKg ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Height" value={radioCert.heightCm ? `${radioCert.heightCm} cm` : null} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Weight" value={radioCert.weightKg ? `${radioCert.weightKg} kg` : null} />
                  </View>
                </View>
              ) : null}
              {radioCert.clubName ? <SummaryRow label="Amateur Club & Call Sign" value={[radioCert.clubName, radioCert.clubCallSign].filter(Boolean).join(" (") + (radioCert.clubCallSign ? ")" : "")} /> : null}
            </View>
          )}

          {/* Device Registration Data */}
          {deviceReg && (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Registration Type" value={deviceReg.registrationType} />
                </View>
                {deviceReg.invoiceNo ? (
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Invoice No." value={deviceReg.invoiceNo} />
                  </View>
                ) : null}
              </View>
              {deviceReg.businessName ? <SummaryRow label="Business Name" value={deviceReg.businessName} /> : null}
              {deviceReg.dtiSecNo ? <SummaryRow label="DTI / SEC Reg No." value={deviceReg.dtiSecNo} /> : null}
            </View>
          )}

          {/* TVRO Registration Data */}
          {tvroReg && (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Classification" value={tvroReg.classification} />
                </View>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Validity Years" value={tvroReg.years ? `${tvroReg.years} Year(s)` : null} />
                </View>
              </View>
              {tvroReg.bsdNumber ? <SummaryRow label="Assigned BSD Number" value={tvroReg.bsdNumber} /> : null}
              {tvroReg.businessName ? <SummaryRow label="Business Name" value={tvroReg.businessName} /> : null}
            </View>
          )}

          {/* VAS Provider Data */}
          {vasData && (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Entity Service Type" value={vasData.serviceType} />
                </View>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Validity Years" value={vasData.years ? `${vasData.years} Year(s)` : null} />
                </View>
              </View>
              {vasData.certificateNumber ? <SummaryRow label="VAS Certificate No." value={vasData.certificateNumber} /> : null}
              {vasData.serviceNo ? <SummaryRow label="CPCN / PA / CA Number" value={vasData.serviceNo} /> : null}
              {vasData.otherTradeName ? <SummaryRow label="Other Trade Name" value={vasData.otherTradeName} /> : null}
              {vasData.valueAddedServices && vasData.valueAddedServices.length > 0 ? (
                <SummaryRow label="Registered Value Added Services" value={vasData.valueAddedServices.join(", ")} />
              ) : null}
            </View>
          )}

          {/* Copy of Certificate Data */}
          {copyOfCert && (
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Copy Request Type" value={copyOfCert.copyType === "CERTIFIED_TRUE_COPY" ? "Certified True Copy" : "Duplicate Replacement"} />
                </View>
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Certificate No." value={copyOfCert.certificateNo} />
                </View>
              </View>
              {copyOfCert.targetService ? <SummaryRow label="Target Permit / License" value={copyOfCert.targetService} /> : null}
              {copyOfCert.numberOfCopies ? <SummaryRow label="Number of Copies" value={copyOfCert.numberOfCopies} /> : null}
              {copyOfCert.circumstancesOfLoss ? <SummaryRow label="Circumstances of Loss / Affidavit Details" value={copyOfCert.circumstancesOfLoss} /> : null}
            </View>
          )}
        </SectionCard>
      )}

      {/* ── Section 4: Equipment & Technical Particulars (Nested Tables / Lists) ── */}
      {amateur && amateur.particularsEquipment && amateur.particularsEquipment.length > 0 && amateur.particularsEquipment.some((g) => g.makeTypeModel || g.equipments.length > 0) && (
        <SectionCard icon="cpu" title="Radio Equipment Particulars" accentColor="#0284C7">
          {amateur.particularsEquipment.map((group, gIdx) => (
            <View key={group.id || gIdx} style={{ backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 10 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59", marginBottom: 6 }}>
                Equipment Model Group #{gIdx + 1}: {group.makeTypeModel || "Standard Model"}
              </Text>
              {group.equipments.map((eq, eqIdx) => (
                <View key={eq.id || eqIdx} style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, backgroundColor: "#FFFFFF", padding: 8, borderRadius: 6, marginTop: 4, borderWidth: 1, borderColor: "#CBD5E1" }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#334155" }}>
                    • Serial No: <Text style={{ fontWeight: "700" }}>{eq.serialNo || "N/A"}</Text>
                  </Text>
                  {eq.frequencyRange ? (
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#334155" }}>
                      | Freq: <Text style={{ fontWeight: "700" }}>{eq.frequencyRange}</Text>
                    </Text>
                  ) : null}
                  {eq.powerOutput ? (
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#334155" }}>
                      | Power: <Text style={{ fontWeight: "700" }}>{eq.powerOutput}</Text>
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </SectionCard>
      )}

      {deviceReg && deviceReg.particulars && deviceReg.particulars.length > 0 && (
        <SectionCard icon="cpu" title="Registered Device Particulars" accentColor="#0284C7">
          {deviceReg.particulars.map((item, pIdx) => (
            <View key={item.id || pIdx} style={{ backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59", marginBottom: 4 }}>
                {item.typeOfEquipmentDevice || "Device"} — {item.nameTypeModel || "Particulars"}
              </Text>
              {item.equipmentSerials && item.equipmentSerials.length > 0 ? (
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#475569" }}>
                  Serials: {item.equipmentSerials.map((s) => s.serialNumber).filter(Boolean).join(", ") || "N/A"}
                </Text>
              ) : null}
            </View>
          ))}
        </SectionCard>
      )}

      {tvroReg && (
        <>
          {tvroReg.particularsEquipment && tvroReg.particularsEquipment.length > 0 && (
            <SectionCard icon="tv" title="TVRO Equipment Particulars" accentColor="#0284C7">
              {tvroReg.particularsEquipment.map((item, idx) => (
                <View key={item.id || idx} style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#0F172A" }}>
                    {item.type} — {item.makeTypeModel}
                  </Text>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#64748B" }}>
                    Serial: {item.serialNo || "N/A"} | Freq: {item.frequencyRange || "N/A"}
                  </Text>
                </View>
              ))}
            </SectionCard>
          )}

          {tvroReg.particularsOfAntennaSystem && tvroReg.particularsOfAntennaSystem.length > 0 && (
            <SectionCard icon="radio" title="Antenna System Particulars" accentColor="#0284C7">
              {tvroReg.particularsOfAntennaSystem.map((ant, idx) => (
                <View key={ant.id || idx} style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#0F172A" }}>
                    {ant.makeTypeModel}
                  </Text>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#64748B" }}>
                    Dish Dia: {ant.dishDiameter} | Polar: {ant.polarization} | Azimuth: {ant.azimuth}
                  </Text>
                </View>
              ))}
            </SectionCard>
          )}
        </>
      )}

      {/* ── Section 5: Dynamic Form Field Values (DB Seeded) ── */}
      {formFieldValues.length > 0 && (
        <SectionCard icon="edit-3" title="Dynamic Filing Form Fields" accentColor="#D97706">
          {formFieldValues.map((fv) => (
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

      {/* ── Section 6: Uploaded Documents Summary ── */}
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
                typeof file === "string" ? file : (file as { name: string; uri: string }).name;
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
                        fontSize: 10,
                        color: "#15803D",
                        marginTop: 1,
                      }}
                    >
                      {key.replace(/^req-/, "").replace(/-/g, " ").toUpperCase()}
                    </Text>
                  </View>
                  <Icon name="check-circle" size={16} color="#16A34A" />
                  <TouchableOpacity
                    onPress={() => {
                      setPreviewFile(file);
                      setPreviewLabel(key.replace(/^req-/, "").replace(/-/g, " ").toUpperCase());
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

      {/* ── Declaration & Legal Notice ── */}
      <View
        style={{
          backgroundColor: "#EFF6FF",
          borderColor: "#BFDBFE",
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          flexDirection: "row",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Icon name="info" size={15} color="#1D4ED8" style={{ marginTop: 1 }} />
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 12,
            color: "#1E40AF",
            flex: 1,
            lineHeight: 18,
          }}
        >
          By clicking{" "}
          <Text style={{ fontWeight: "700" }}>Submit</Text>, you certify that all provided particulars
          and attached documents are true and accurate. Official evaluation will proceed upon submission.
        </Text>
      </View>

      <DocumentPreviewModal
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
        label={previewLabel}
      />
    </View>
  );
}
