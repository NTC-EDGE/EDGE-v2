import React from "react";
import { View, Text } from "react-native";
import { TYPOGRAPHY, COLORS } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { SharedDocumentUpload } from "../../../../shared/components/SharedDocumentUpload";

interface GeneralDocumentUploadStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  isWeb: boolean;
  onUploadPress: (req: string, file: { name: string; uri: string }) => void;
  onRemoveUpload: (req: string) => void;
}

export function GeneralDocumentUploadStep({
  service,
  activeApplicant,
  isWeb,
  onUploadPress,
  onRemoveUpload,
}: GeneralDocumentUploadStepProps) {
  const serviceTitle = (service.title || "").toUpperCase();
  const amateurData = activeApplicant.amateurLicenseData;
  const isLifetime =
    serviceTitle.includes("LIFETIME AMATEUR") ||
    activeApplicant.lifetimeLicenseData !== undefined ||
    (activeApplicant.selectedVariantId && activeApplicant.selectedVariantId.includes("life"));

  let reqList: Array<{ key: string; label: string; required: boolean; hint?: string }> = [];

  if (isLifetime) {
    reqList = [
      {
        key: "req-letter-request",
        label: "Letter request for Issuance of a Lifetime Radio Station License",
        required: true,
      },
      {
        key: "req-cert-good-standing",
        label: "Certificate of Good Standing as a Member from a registered amateur club or association with the NTC*",
        required: true,
      },
      {
        key: "req-gov-id-attachments",
        label: "Valid Government ID (Birth Certificate / Passport / PRC License / Driver's License)*",
        required: true,
        hint: "Note 1: Applicant must show original upon verification. Note 2: Applicant must be at least 60 years of age.",
      },
      {
        key: "req-class-a-license",
        label: "Amateur Class 'A' Radio Station License*",
        required: true,
      },
      {
        key: "req-proof-15-years-service",
        label: "Proof of amateur service of at least fifteen (15) consecutive years*",
        required: true,
      },
      {
        key: "req-1x1-id-picture",
        label: "Clear 1x1 ID picture taken within the last six (6) months*",
        required: true,
      },
    ];
  } else if (serviceTitle.includes("AMATEUR") || serviceTitle.includes("LICENSE")) {
    const appType = amateurData?.appType || "NEW";
    if (appType === "RENEWAL") {
      reqList = [
        {
          key: "req-existing-arsl-copy",
          label: "Copy of Existing Amateur Radio Station License*",
          required: true,
        },
        {
          key: "req-cert-good-standing-club",
          label: "Certificate of Good Standing from an NTC-Registered Amateur Club*",
          required: true,
        },
        {
          key: "req-proof-paid-dues",
          label: "Proof of Paid Annual Dues / NTC Official Receipt*",
          required: true,
        },
        {
          key: "req-1x1-photo",
          label: "1x1 ID Picture taken within the last 6 months*",
          required: true,
        },
      ];
    } else if (appType === "MODIFICATION") {
      reqList = [
        {
          key: "req-existing-arsl-copy",
          label: "Copy of Existing Amateur Radio Station License*",
          required: true,
        },
        {
          key: "req-mod-justification-docs",
          label: "Proof / Documents Supporting Requested Modification (Location Move / Equipment Specs / Class Upgrade)*",
          required: true,
        },
        {
          key: "req-cert-good-standing-club",
          label: "Certificate of Good Standing from an NTC-Registered Amateur Club*",
          required: true,
        },
        {
          key: "req-1x1-photo",
          label: "1x1 ID Picture taken within the last 6 months*",
          required: true,
        },
      ];
    } else {
      // NEW Application
      reqList = [
        {
          key: "req-exam-seminar-cert",
          label: "Certificate of Passing Examination / Seminar*",
          required: true,
        },
        {
          key: "req-cert-good-standing-club",
          label: "Certificate of Good Standing from an NTC-Registered Amateur Club*",
          required: true,
        },
        {
          key: "req-gov-id",
          label: "Valid Government Issued ID*",
          required: true,
        },
        {
          key: "req-1x1-photo",
          label: "1x1 ID Picture taken within the last 6 months*",
          required: true,
        },
      ];
    }
  } else {
    reqList = (service.requirements || []).map((req, idx) => ({
      key: `req-gen-${idx}`,
      label: req,
      required: true,
    }));
  }

  return (
    <View style={{ gap: 16 }}>
      {isLifetime && (
        <View style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, borderRadius: 10, padding: 14 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#92400E", marginBottom: 4 }}>
            Mandatory Lifetime Class A Document Requirements
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#78350F", lineHeight: 18 }}>
            Applicant showing original ID upon inspection. Applicant must be at least 60 years of age and have rendered 15+ consecutive years of amateur service.
          </Text>
        </View>
      )}

      <SharedDocumentUpload
        requirements={reqList}
        uploads={activeApplicant.uploads}
        onUpload={onUploadPress}
        onRemove={onRemoveUpload}
        isWeb={isWeb}
      />
    </View>
  );
}
