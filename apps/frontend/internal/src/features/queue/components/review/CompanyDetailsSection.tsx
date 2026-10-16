import React from "react";
import { View } from "react-native";
import { ApplicationData } from "../../../../types/application";
import { SectionHeader, InfoRow } from "./reviewComponents";
import { reviewStyles as styles } from "./reviewStyles";

interface CompanyDetailsSectionProps {
  app: ApplicationData;
  isEditingSection: boolean;
  emailDraft: string;
  setEmailDraft: (val: string) => void;
  compNameDraft: string;
  setCompNameDraft: (val: string) => void;
  compRegNoDraft: string;
  setCompRegNoDraft: (val: string) => void;
  compAddrDraft: string;
  setCompAddrDraft: (val: string) => void;
  editAction: React.ReactNode;
}

export function CompanyDetailsSection({
  app,
  isEditingSection,
  emailDraft,
  setEmailDraft,
  compNameDraft,
  setCompNameDraft,
  compRegNoDraft,
  setCompRegNoDraft,
  compAddrDraft,
  setCompAddrDraft,
  editAction,
}: CompanyDetailsSectionProps) {
  return (
    <>
      <SectionHeader
        title="FILING ENTITY & SUBMITTER DETAILS"
        rightAction={editAction}
      />
      <View style={styles.infoBlock}>
        <InfoRow label="Submitted By:" value={app.filingUser?.name ?? "—"} />
        <InfoRow
          label="User Email:"
          value={app.filingUser?.email ?? "—"}
          isEditing={isEditingSection}
          editValue={emailDraft}
          onEditChange={setEmailDraft}
        />
        <InfoRow
          label="User Account Type:"
          value={app.filingUser?.accountType ?? app.applicantType ?? "Individual"}
        />
        <InfoRow
          label="Company Name:"
          value={app.companyDetails?.name || app.applicant}
          isEditing={isEditingSection}
          editValue={compNameDraft}
          onEditChange={setCompNameDraft}
        />
        <InfoRow
          label="Company Reg No:"
          value={app.companyDetails?.registrationNumber || "—"}
          isEditing={isEditingSection}
          editValue={compRegNoDraft}
          onEditChange={setCompRegNoDraft}
        />
        <InfoRow
          label="Company Address:"
          value={app.companyDetails?.address || "—"}
          isEditing={isEditingSection}
          editValue={compAddrDraft}
          onEditChange={setCompAddrDraft}
        />
      </View>
    </>
  );
}
