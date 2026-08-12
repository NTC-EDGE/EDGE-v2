import React from "react";
import { View, Text, ScrollView } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { TenantInfo, OfficeInfo, GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

interface GeneralReviewSubmitStepProps {
  service: NTCService;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  selectedRegionId: string | null;
  selectedOfficeId: string | null;
  activeApplicant: GeneralApplicantData;
  appMode: "SINGLE" | "BULK" | "";
  variants?: Array<{ id: string; name?: string; description?: string }>;
}

// ─── Small reusable summary row ─────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#F8FAFC",
        padding: 14,
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
          fontSize: 14,
          fontWeight: "600",
          color: "#0F172A",
        }}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

// ─── Section card wrapper ────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  badge,
  accentColor = "#0F2C59",
  children,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  badge?: string;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 20,
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
      {/* Card header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#EFF6FF",
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
        {badge !== undefined && badge.length > 0 && (
          <View
            style={{
              backgroundColor: "#ECFDF5",
              borderColor: "#10B981",
              borderWidth: 1,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 9,
                fontWeight: "800",
                color: "#047857",
              }}
            >
              {badge}
            </Text>
          </View>
        )}
      </View>

      {children}
    </View>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function GeneralReviewSubmitStep({
  service,
  tenants,
  offices,
  selectedRegionId,
  selectedOfficeId,
  activeApplicant,
  appMode,
  variants = [],
}: GeneralReviewSubmitStepProps) {
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

  // Dynamic form field values (from DB-seeded form)
  const formFieldValues = activeApplicant.formFieldValues ?? [];

  // Derived full name from applicant base fields
  const fullName =
    [activeApplicant.firstName, activeApplicant.lastName].filter(Boolean).join(" ") || null;

  // Birth date from month/day/year parts
  const birthDate =
    activeApplicant.birthMonth && activeApplicant.birthDay && activeApplicant.birthYear
      ? `${activeApplicant.birthMonth} ${activeApplicant.birthDay}, ${activeApplicant.birthYear}`
      : null;

  return (
    <View style={{ gap: 16 }}>
      {/* ── Hero header ── */}
      <View
        style={{
          backgroundColor: "#0F2C59",
          borderRadius: 14,
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
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
            Final Application Review
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Please verify all details before submitting. NTC officers will review upon receipt.
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#10B981",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 10,
              fontWeight: "800",
              color: "#FFFFFF",
            }}
          >
            STEP 6
          </Text>
        </View>
      </View>

      {/* ── Section 1: Service & Filing Parameters ── */}
      <SectionCard icon="layers" title="Service & Filing Parameters" badge="SECTION 1">
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
            <SummaryRow label="Application Mode" value={appModeLabel} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Variant / Type" value={variantLabel} />
          </View>
        </View>
      </SectionCard>

      {/* ── Section 2: Applicant Personal Details ── */}
      {(fullName !== null ||
        activeApplicant.email ||
        activeApplicant.contactNo ||
        activeApplicant.address) && (
        <SectionCard
          icon="user"
          title="Applicant Personal Details"
          badge="SECTION 2"
          accentColor="#1D4ED8"
        >
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
            <SummaryRow label="Address" value={activeApplicant.address} />
          )}
          {birthDate !== null && <SummaryRow label="Date of Birth" value={birthDate} />}
        </SectionCard>
      )}

      {/* ── Section 3: Dynamic / Form Field Values ── */}
      {formFieldValues.length > 0 && (
        <SectionCard
          icon="file-text"
          title="Filing Details"
          badge="SECTION 3"
          accentColor="#7C3AED"
        >
          {formFieldValues.map((fv) => (
            <SummaryRow key={fv.fieldId} label={fv.fieldLabel} value={fv.value} />
          ))}
        </SectionCard>
      )}

      {/* ── Section 4: Uploaded Documents ── */}
      <SectionCard
        icon="paperclip"
        title="Uploaded Supporting Documents"
        badge={`${uploadCount} ATTACHMENT${uploadCount !== 1 ? "S" : ""}`}
        accentColor="#059669"
      >
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
              No documents attached. Please go back to Step 5 to upload required attachments.
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
                      width: 28,
                      height: 28,
                      borderRadius: 14,
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
                        color: "#4ADE80",
                        marginTop: 1,
                      }}
                    >
                      {key.replace(/^req-/, "").replace(/-/g, " ").toUpperCase()}
                    </Text>
                  </View>
                  <Icon name="check-circle" size={16} color="#16A34A" />
                </View>
              );
            })}

            {/* Total badge */}
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
                  {uploadCount} document{uploadCount !== 1 ? "s" : ""} ready
                </Text>
              </View>
            </View>
          </View>
        )}
      </SectionCard>

      {/* ── Declaration notice ── */}
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
          <Text style={{ fontWeight: "700" }}>Submit</Text>, you confirm that all provided information
          is true and correct. Submission of false documents may result in rejection or legal
          consequences under existing NTC regulations.
        </Text>
      </View>
    </View>
  );
}
