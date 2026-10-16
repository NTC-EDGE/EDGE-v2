import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, Icon as Lucide, toast } from "@edge/ui";
import { ApplicationDetailsTabProps } from "./reviewTypes";
import { SectionHeader, InfoRow } from "./reviewComponents";
import { FormsAttachmentSection } from "./FormsAttachmentSection";
import { BulkApplicantsRosterSection } from "./BulkApplicantsRosterSection";
import { HeroReviewHeader } from "../HeroReviewHeader";
import { reviewStyles as styles } from "./reviewStyles";
import { ApplicantVerdictModal, ApplicantVerdictType } from "../modals/ApplicantVerdictModal";
import { BatchConfirmationModal, BatchActionType } from "../modals/BatchConfirmationModal";
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
  const [emailDraft, setEmailDraft] = useState(app.contactDetails?.email ?? '');
  const [compNameDraft, setCompNameDraft] = useState(app.companyDetails?.name ?? app.applicant);
  const [compRegNoDraft, setCompRegNoDraft] = useState(app.companyDetails?.registrationNumber ?? '');
  const [compAddrDraft, setCompAddrDraft] = useState(app.companyDetails?.address ?? '');

  const isExamService = useMemo(() => {
    const cat = (app.category || '').toLowerCase();
    const title = (app.serviceName || app.permitTitle || '').toLowerCase();
    return cat.includes('exam') || title.includes('exam') || title.includes('admission') || title.includes('operator examination');
  }, [app.category, app.serviceName, app.permitTitle]);

  const appliedServices = useMemo(() => {
    if (app.services && app.services.length > 0) {
      const map = new Map<string, { id?: string; name: string; category?: string; variant?: string }>();
      for (const s of app.services) {
        const name = s.serviceName || app.serviceName || app.permitTitle || `${app.serviceCategory || app.category} Application`;
        const category = s.serviceCategory || app.serviceCategory || app.category || undefined;
        const variant = s.serviceVariantName || app.serviceVariantName || undefined;
        const key = `${s.serviceId ?? ''}-${name}-${variant ?? ''}`;
        if (!map.has(key)) {
          map.set(key, { id: s.id, name, category, variant });
        }
      }
      return Array.from(map.values());
    }
    return [
      {
        name: app.serviceName || app.permitTitle || `${app.serviceCategory || app.category} Application`,
        category: app.serviceCategory || app.category || undefined,
        variant: app.serviceVariantName || undefined,
      },
    ];
  }, [app.services, app.serviceName, app.permitTitle, app.serviceCategory, app.category, app.serviceVariantName]);

  const scheduleSummaryText = useMemo(() => {
    if (app.assignedTo && app.assignedTo.trim().length > 0) return app.assignedTo;
    if (app.office && app.office.trim().length > 0) return `NTC Field Office • ${app.office}`;
    return null;
  }, [app.assignedTo, app.office]);

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
    const targetVerdict: ApplicantVerdictType = action === 'MarkAllComplete' ? 'Complete' : 'ForEndorsement';
    const list = (app.applicantsList ?? []).map((a: ApplicantItem) => ({ ...a, status: targetVerdict }));
    updateApplication(app.id, { applicantsList: list });
    toast.success(`All ${list.length} applicants marked as ${targetVerdict}.`);
  };

  const accountableForms = app.forms.filter((f: ApplicationFormAttachment) => f.section === "ACCOUNTABLE FORM");
  const downloadForms = app.forms.filter((f: ApplicationFormAttachment) => f.section === "DOWNLOAD FORM");

  const isIndividual = (app.applicantType || '').toLowerCase() === 'individual';
  const isCompanyApplication =
    !isIndividual &&
    (
      (app.applicantType || '').toLowerCase() === 'company' ||
      app.applicationType === 'BULK' ||
      Boolean(app.companyDetails?.name) ||
      app.filingUser?.accountType === 'Company'
    );

  const editAction = isEditable ? (
    isEditingSection ? (
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Pressable style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200], paddingHorizontal: 10 }]} onPress={() => setIsEditingSection(false)}>
          <Text style={[styles.inspectBtnText, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], paddingHorizontal: 12 }]} onPress={handleSaveDetails}>
          <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '700' }]}>Save</Text>
        </Pressable>
      </View>
    ) : (
      <Pressable style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: isDark ? colors.brand[500] : colors.brand[600], borderWidth: 1, paddingHorizontal: 10 }]} onPress={() => setIsEditingSection(true)}>
        <Lucide name="edit-2" size={12} color={isDark ? colors.brand[400] : colors.brand[700]} />
        <Text style={[styles.inspectBtnText, { color: isDark ? colors.brand[400] : colors.brand[700], fontWeight: '600' }]}>Edit</Text>
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
          variantLabel={app.serviceVariantName || 'Standard'}
          scheduleSummaryText={scheduleSummaryText}
          mode={app.applicationType === 'BULK' ? 'Bulk' : 'Single'}
          totalApplicants={app.applicantsList?.length || 1}
          isAssessmentOnly={app.isAssessmentOnly || app.intent === 'AssessmentOnly'}
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
        <>
          <SectionHeader
            title="FILING ENTITY & SUBMITTER DETAILS"
            rightAction={editAction}
          />
          <View style={styles.infoBlock}>
            <InfoRow label="Submitted By:" value={app.filingUser?.name ?? "—"} />
            <InfoRow label="User Email:" value={app.filingUser?.email ?? "—"} isEditing={isEditingSection} editValue={emailDraft} onEditChange={setEmailDraft} />
            <InfoRow label="User Account Type:" value={app.filingUser?.accountType ?? app.applicantType ?? "Individual"} />
            {isCompanyApplication && (
              <>
                <InfoRow label="Company Name:" value={app.companyDetails?.name || app.applicant} isEditing={isEditingSection} editValue={compNameDraft} onEditChange={setCompNameDraft} />
                <InfoRow label="Company Reg No:" value={app.companyDetails?.registrationNumber || "—"} isEditing={isEditingSection} editValue={compRegNoDraft} onEditChange={setCompRegNoDraft} />
                <InfoRow label="Company Address:" value={app.companyDetails?.address || "—"} isEditing={isEditingSection} editValue={compAddrDraft} onEditChange={setCompAddrDraft} />
              </>
            )}
          </View>
        </>
      )}

      {app.applicationType === 'BULK' && (app.applicantsList?.length ?? 0) > 0 && (
        <BulkApplicantsRosterSection
          app={app}
          localApplicants={app.applicantsList ?? []}
          isEditable={isEditable}
          onInspectApplicant={onInspectApplicant}
          onUpdateApplicantVerdict={handleUpdateApplicantVerdict}
          onBatchAction={handleBatchAction}
        />
      )}

      {app.applicationType !== 'BULK' && (
        <View style={{ paddingHorizontal: SPACING[16], marginTop: SPACING[12] }}>
          <SectionHeader
            title="PRIMARY APPLICANT DETAILS"
            rightAction={!isCompanyApplication ? editAction : undefined}
          />
          <View style={[styles.infoBlock, { backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white }]}>
            <InfoRow label="Applicant Name:" value={app.applicant || "—"} />
            <InfoRow label="Applicant Type:" value={app.applicantType || "Individual"} />
            <InfoRow
              label="Email Address:"
              value={app.contactDetails?.email || app.filingUser?.email || "—"}
              isEditing={!isCompanyApplication ? isEditingSection : false}
              editValue={emailDraft}
              onEditChange={setEmailDraft}
            />
            <InfoRow label="Contact Number:" value={app.contactDetails?.contactNumber || app.companyDetails?.contactNumber || "—"} />
            {(app.address?.address || app.address?.streetAddress) ? (
              <InfoRow label="Address:" value={app.address?.address || app.address?.streetAddress || "—"} />
            ) : null}
            <Pressable
              style={{
                marginTop: SPACING[8],
                padding: SPACING[12],
                borderRadius: RADIUS.card,
                backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                borderWidth: 1,
                borderColor: isDark ? colors.brand[700] : colors.brand[200],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => onInspectApplicant?.(0)}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? colors.brand[300] : colors.brand[900] }}>
                  Application Form Submissions & Requirements
                </Text>
                <Text style={{ fontSize: 11, color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 2 }}>
                  Switch to the Applicant Records tab to view full form fields, specs, and uploaded documents.
                </Text>
              </View>
              <Lucide name="arrow-right" size={16} color={isDark ? colors.brand[300] : colors.brand[700]} />
            </Pressable>
          </View>
        </View>
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
