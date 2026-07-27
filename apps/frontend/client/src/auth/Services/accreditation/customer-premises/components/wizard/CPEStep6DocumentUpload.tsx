import React from "react";
import { useWindowDimensions } from "react-native";
import { ApplicantData } from "../../types/cpeTypes";
import { SharedDocumentUpload } from "../../../../../../shared/components/SharedDocumentUpload";
interface CPEStep6DocumentUploadProps {
  activeApplicant: ApplicantData;
  updateActiveApplicant: (fields: Partial<ApplicantData>) => void;
  handleDocumentPick: (key: string, file: { name: string; uri: string }) => void;
}

export const getRequirementsList = (type: "NEW" | "RENEWAL" | "MODIFICATION"): string[] => {
  if (type === "NEW") {
    return [
      "SEC / DTI Registration or Business/Mayor's Permit (Note: purpose must include CPE supplier accreditation related details)",
      "Proof of Paid-Up Capital (Minimum of PHP 250,000.00 certified by Treasurer/Partners/Owner)",
      "Distributorship or Representation Agreement on products to be sold",
      "Type Approval Certificate or copy of Grant of Equipment Conformity for CPE to be sold",
      "Certificate of Employment & valid ROC/license of two (2) qualified radio technicians (i.e. RCT/ECT) full-time",
      "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) or PECE",
    ];
  } else if (type === "RENEWAL") {
    return [
      "CPE Supplier Accreditation Certificate",
      "Business / Mayor's Permit",
      "Distributorship or Representation Agreement on products to be sold",
      "Certificate of Employment & valid ROC/license of two (2) qualified radio technicians (i.e. RCT/ECT) full-time",
      "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) or PECE",
    ];
  } else {
    return [
      "CPE Supplier Accreditation Certificate",
      "For equipment not previously indicated: Copy of Type Approval Certificate or Copy of Grant of Equipment Conformity",
    ];
  }
};

export function CPEStep6DocumentUpload({
  activeApplicant,
  updateActiveApplicant,
  handleDocumentPick,
}: CPEStep6DocumentUploadProps) {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const reqList = getRequirementsList(activeApplicant.appType);
  const mappedRequirements = reqList.map((req, idx) => ({
    key: idx.toString(),
    label: req,
    required: true,
  }));

  const handleRemove = (key: string) => {
    const nextUploads = { ...activeApplicant.uploads };
    delete nextUploads[key];
    updateActiveApplicant({ uploads: nextUploads });
  };

  return (
    <SharedDocumentUpload
      requirements={mappedRequirements}
      uploads={activeApplicant.uploads}
      onUpload={handleDocumentPick}
      onRemove={handleRemove}
      isWeb={isWeb}
    />
  );
}
