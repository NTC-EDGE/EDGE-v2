import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTheme, COLORS, SPACING, Icon as Lucide, toast } from "@edge/ui";
import { ApplicationDetailsTabProps } from "./reviewTypes";
import { InfoRow } from "./reviewComponents";
import { FormsAttachmentSection } from "./FormsAttachmentSection";
import { BulkApplicantsRosterSection } from "./BulkApplicantsRosterSection";
import { HeroReviewHeader } from "../HeroReviewHeader";
import { CompanyDetailsSection } from "./CompanyDetailsSection";
import { PrimaryApplicantDetailsSection } from "./PrimaryApplicantDetailsSection";
import { reviewStyles as styles } from "./reviewStyles";
import { ApplicantVerdictType } from "../modals/ApplicantVerdictModal";
import { BatchActionType } from "../modals/BatchConfirmationModal";
import { ApplicantItem, ApplicationFormAttachment } from "../../../../types/application";

export function ApplicationDetailsTab({
  app,
  isEditable,
  updateApplication,
  onInspectApplicant,
  onPrintAccountableForm,
}: ApplicationDetailsTabProps) {
  const { colors, isDark } = useTheme();
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [refDraft, setRefDraft] = useState(app.referenceNumber);
  const [applicationDraft, setApplicationDraft] = useState(app.applicationNumber);
  const [emailDraft, setEmailDraft] = useState(app.contactDetails?.email ?? "");
  const [compNameDraft, setCompNameDraft] = useState(app.companyDetails?.name ?? app.applicant);
  const [compRegNoDraft, setCompRegNoDraft] = useState(app.companyDetails?.registrationNumber ?? "");
  const [compAddrDraft, setCompAddrDraft] = useState(app.companyDetails?.address ?? "");

  const isExamService = useMemo(() => {
    const cat = (app.category || "").toLowerCase();
    const title = (app.serviceName || app.permitTitle || "").toLowerCase();
    return cat.includes("exam") || title.includes("exam") || title.includes("admission") || title.includes("operator examination");
  }, [app.category, app.serviceName, app.permitTitle]);

  const appliedServices = useMemo(() => {
    const defaultName = app.serviceName || app.permitTitle || `${app.serviceCategory || app.category} Application`;
    if (!app.services?.length) {
      return [{ name: defaultName, category: app.serviceCategory || app.category, variant: app.serviceVariantName }];
    }
    const map = new Map<string, { id?: string; name: string; category?: string; variant?: string }>();
    for (const s of app.services) {
      const name = s.serviceName || defaultName;
      const key = `${s.serviceId ?? ""}-${name}-${s.serviceVariantName ?? ""}`;
      if (!map.has(key)) map.set(key, { id: s.id, name, category: s.serviceCategory || app.category, variant: s.serviceVariantName });
    }
    return Array.from(map.values());
  }, [app.services, app.serviceName, app.permitTitle, app.serviceCategory, app.category, app.serviceVariantName]);

  const scheduleSummaryText = useMemo(() => {
    if (app.office && app.office.trim().length > 0) return `NTC Field Office • ${app.office}`;
    return null;
  }, [app.office]);

  const handleSaveDetails = () => {
    setIsEditingSection(false);
    updateApplication(app.id, {
      referenceNumber: refDraft,
      applicationNumber: applicationDraft,
      contactDetails: { ...app.contactDetails, email: emailDraft },
      companyDetails: app.companyDetails ? {
        ...app.companyDetails,
        name: compNameDraft,
        registrationNumber: compRegNoDraft,
        address: compAddrDraft,
      } : undefined,
    });
  };

  const handleUpdateApplicantVerdict = (index: number, verdict: ApplicantVerdictType, remarks?: string) => {
    const list = [...(app.applicantsList ?? [])];
    const target = list[index];
    if (target) {
      list[index] = { ...target, status: verdict, evaluationRemarks: remarks ?? target.evaluationRemarks };
      updateApplication(app.id, { applicantsList: list });
      toast.success(`Applicant #${index + 1} marked as ${verdict}.`);
    }
  };

  const handleBatchAction = (action: BatchActionType) => {
    const targetVerdict: ApplicantVerdictType = action === "MarkAllComplete" ? "Complete" : "ForEndorsement";
    const list = (app.applicantsList ?? []).map((a: ApplicantItem) => ({ ...a, status: targetVerdict }));
    updateApplication(app.id, { applicantsList: list });
    toast.success(`All ${list.length} applicants marked as ${targetVerdict}.`);
  };

  const accountableForms = app.forms.filter((f: ApplicationFormAttachment) => f.section === "ACCOUNTABLE FORM");
  const downloadForms = app.forms.filter((f: ApplicationFormAttachment) => f.section === "DOWNLOAD FORM");

  const isIndividual = (app.applicantType || "").toLowerCase() === "individual";
  const isCompanyApplication =
    !isIndividual &&
    (
      (app.applicantType || "").toLowerCase() === "company" ||
      app.applicationType === "BULK" ||
      Boolean(app.companyDetails?.name) ||
      app.filingUser?.accountType === "Company"
    );

  const editAction = isEditable ? (
    isEditingSection ? (
      <View style={{ flexDirection: "row", gap: 6 }}>
        <Pressable style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200], paddingHorizontal: 10 }]} onPress={() => setIsEditingSection(false)}>
          <Text style={[styles.inspectBtnText, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], paddingHorizontal: 12 }]} onPress={handleSaveDetails}>
          <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: "700" }]}>Save</Text>
        </Pressable>
      </View>
    ) : (
      <Pressable style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: isDark ? colors.brand[500] : colors.brand[600], borderWidth: 1, paddingHorizontal: 10 }]} onPress={() => setIsEditingSection(true)}>
        <Lucide name="edit-2" size={12} color={isDark ? colors.brand[400] : colors.brand[700]} />
        <Text style={[styles.inspectBtnText, { color: isDark ? colors.brand[400] : colors.brand[700], fontWeight: "600" }]}>Edit</Text>
      </Pressable>
    )
  ) : null;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: SPACING[16], paddingTop: SPACING[16] }}>
        <HeroReviewHeader
          services={appliedServices}
          serviceName={app.serviceName || app.permitTitle || `${app.serviceCategory || app.category} Application`}
          category={app.serviceCategory || app.category}
          isExamService={isExamService}
          variantLabel={app.serviceVariantName || "Standard"}
          scheduleSummaryText={scheduleSummaryText}
          mode={app.applicationType === "BULK" ? "Bulk" : "Single"}
          totalApplicants={app.applicantsList?.length || 1}
          isAssessmentOnly={app.isAssessmentOnly || app.intent === "AssessmentOnly"}
        />
      </View>

      <View style={styles.infoBlock}>
        <Text style={[styles.fieldGroupLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
          REFERENCE NUMBER
        </Text>
        <InfoRow label="Reference Number:" value={app.referenceNumber} isEditing={isEditingSection} editValue={refDraft} onEditChange={setRefDraft} />

        <Text style={[styles.fieldGroupLabel, { marginTop: SPACING[12], color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
          DOCUMENT NUMBER
        </Text>
        <InfoRow label="Application Number:" value={app.applicationNumber} isEditing={isEditingSection} editValue={applicationDraft} onEditChange={setApplicationDraft} />
      </View>

      {isCompanyApplication && (
        <CompanyDetailsSection
          app={app}
          isEditingSection={isEditingSection}
          emailDraft={emailDraft}
          setEmailDraft={setEmailDraft}
          compNameDraft={compNameDraft}
          setCompNameDraft={setCompNameDraft}
          compRegNoDraft={compRegNoDraft}
          setCompRegNoDraft={setCompRegNoDraft}
          compAddrDraft={compAddrDraft}
          setCompAddrDraft={setCompAddrDraft}
          editAction={editAction}
        />
      )}

      {app.applicationType === "BULK" && (app.applicantsList?.length ?? 0) > 0 && (
        <BulkApplicantsRosterSection
          app={app}
          localApplicants={app.applicantsList ?? []}
          isEditable={isEditable}
          onInspectApplicant={onInspectApplicant}
          onUpdateApplicantVerdict={handleUpdateApplicantVerdict}
          onBatchAction={handleBatchAction}
        />
      )}

      {app.applicationType !== "BULK" && (
        <PrimaryApplicantDetailsSection
          app={app}
          isCompanyApplication={isCompanyApplication}
          isEditingSection={isEditingSection}
          emailDraft={emailDraft}
          setEmailDraft={setEmailDraft}
          editAction={editAction}
          onInspectApplicant={onInspectApplicant}
        />
      )}

      <FormsAttachmentSection
        accountableForms={accountableForms}
        downloadForms={downloadForms}
        onPrintForm={onPrintAccountableForm}
      />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
