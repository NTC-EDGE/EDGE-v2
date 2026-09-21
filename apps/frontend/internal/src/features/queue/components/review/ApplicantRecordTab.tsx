import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import {
  useTheme,
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Icon as Lucide,
  SkeletonLoader,
  AlertToast,
  toast,
} from "@edge/ui";
import {
  applicationService,
  storageService,
  ApplicantRequirementItemDto,
  useApplicationFormWithSubmission,
  mutateApplications,
} from "@edge/api";
import { ApplicantRecordTabProps } from "./reviewTypes";
import { ApplicantItem } from "../../../../types/application";
import { DocumentPreviewFile } from "../../../../shared/components/DocumentPreviewModal";
import { SectionHeader } from "./reviewComponents";
import { reviewStyles as styles } from "./reviewStyles";
import { ApplicantVerdictModal, ApplicantVerdictType } from "../modals/ApplicantVerdictModal";
import { ApplicantParticularsCard } from "../ApplicantParticularsCard";
import { BaseApplicationPreview } from "../../../../shared/formPreview";
import { ApplicantRequirementsSection } from "./ApplicantRequirementsSection";
import { isAllowedRequirementFileType } from "../../../../utils/fileValidation";

export function ApplicantRecordTab({
  app,
  selectedApplicantIndex,
  onSelectApplicantIndex,
  updateApplication,
  isEditable,
  onPreviewFile,
}: ApplicantRecordTabProps) {
  const { colors, isDark } = useTheme();

  const effectiveApplicants = useMemo<ApplicantItem[]>(() => {
    if (app.applicantsList && app.applicantsList.length > 0) return app.applicantsList;
    return [{
      id: app.id,
      name: app.applicant || `${app.basicInfo?.firstName ?? ''} ${app.basicInfo?.lastName ?? ''}`.trim() || app.companyDetails?.name || app.filingUser?.name || "Applicant",
      applicantType: (app.applicantType === 'Company' ? 'Company' : 'Individual') as 'Individual' | 'Company',
      status: 'Complete' as const,
      evaluationRemarks: '',
      contactNumber: app.contactDetails?.contactNumber || '',
      email: app.contactDetails?.email || '',
      address: app.address?.address || app.address?.streetAddress || '',
      streetAddress: app.address?.streetAddress || app.address?.address || '',
      barangay: app.address?.barangay || '',
      city: app.address?.city || '',
      province: app.address?.province || '',
      region: app.address?.region || '',
      zipCode: app.address?.zipCode || '',
      basicInfo: app.basicInfo,
      companyDetails: app.companyDetails,
      requirements: app.requirements,
    }];
  }, [app]);

  const [localApplicants, setLocalApplicants] = useState<ApplicantItem[]>(effectiveApplicants);
  useEffect(() => { setLocalApplicants(effectiveApplicants); }, [effectiveApplicants]);

  const activeIdx = Math.min(selectedApplicantIndex ?? 0, Math.max(0, localApplicants.length - 1));
  const activeApplicant = localApplicants[activeIdx];

  const [activeReqMenuId, setActiveReqMenuId] = useState<string | null>(null);
  const [verdictModalState, setVerdictModalState] = useState<{
    applicantIndex: number; applicantName: string; targetVerdict: ApplicantVerdictType; initialRemarks: string;
  } | null>(null);
  const [localRemarks, setLocalRemarks] = useState(activeApplicant?.evaluationRemarks ?? '');
  const [toastState, setToastState] = useState<{ message: string; variant: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const { formData, isLoading: isLoadingForm } = useApplicationFormWithSubmission(app.id, activeApplicant?.id, activeApplicant?.serviceVariantId);

  useEffect(() => { setLocalRemarks(activeApplicant?.evaluationRemarks ?? ''); }, [activeApplicant?.id, activeApplicant?.evaluationRemarks]);
  useEffect(() => { setActiveReqMenuId(null); }, [activeApplicant?.id]);
  useEffect(() => {
    if (toastState !== null) {
      const timer = setTimeout(() => setToastState(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastState]);

  const flatFormValues = useMemo(() => {
    if (!formData || !formData.sections) return [];
    return formData.sections.flatMap((sec) =>
      sec.fields.map((f) => ({ fieldId: f.fieldId, fieldLabel: f.label, value: f.value ?? '' }))
    );
  }, [formData]);

  const hasFormValues = useMemo(() => {
    if (!formData || !formData.sections || formData.sections.length === 0) return false;
    return flatFormValues.some((fv) => {
      const val = fv.value;
      if (!val || typeof val !== 'string') return false;
      const trimmed = val.trim();
      return trimmed.length > 0 && trimmed !== 'null' && trimmed !== 'undefined' && trimmed !== '[]' && trimmed !== '{}';
    });
  }, [formData, flatFormValues]);

  const handleConfirmVerdict = async (verdict: ApplicantVerdictType, remarks: string) => {
    if (verdictModalState === null) return;
    const idx = verdictModalState.applicantIndex;
    const updated = [...localApplicants];
    const target = updated[idx];
    if (target) {
      const finalRemarks = remarks.length > 0 ? remarks : (target.evaluationRemarks ?? '');
      updated[idx] = { ...target, status: verdict, evaluationRemarks: finalRemarks };
      setLocalApplicants(updated);
      setLocalRemarks(finalRemarks);
      await updateApplication(app.id, { applicantsList: updated });
      toast.success(`Applicant ${target.name} set to ${verdict}.`);
    }
    setVerdictModalState(null);
  };

  const verdictButtons: { label: string; verdict: ApplicantVerdictType; color: string }[] = [
    { label: 'Complete', verdict: 'Complete', color: '#15803D' },
    { label: 'Incomplete', verdict: 'Incomplete', color: '#DC2626' },
    { label: 'For Endorsement', verdict: 'ForEndorsement', color: '#7E22CE' },
  ];

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {toastState !== null && (
        <View style={styles.floatingToastContainer}>
          <AlertToast message={toastState.message} variant={toastState.variant} onDismiss={() => setToastState(null)} />
        </View>
      )}

      {/* Applicant nav bar */}
      {localApplicants.length > 0 && (
        <View style={[styles.applicantSelectorBar, { backgroundColor: isDark ? colors.neutral[900] : colors.brand[50], borderColor: isDark ? colors.neutral[700] : colors.brand[200], marginTop: SPACING[8], marginBottom: SPACING[4], zIndex: 10 }]}>
          {localApplicants.length > 1 && (
            <Pressable disabled={activeIdx === 0} onPress={() => onSelectApplicantIndex?.(Math.max(0, activeIdx - 1))} style={[styles.selectorNavBtn, activeIdx === 0 && { opacity: 0.3 }]}>
              <Lucide name="chevron-left" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
              <Text style={[styles.selectorNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Previous</Text>
            </Pressable>
          )}
          <View style={styles.selectorCenter}>
            <Lucide name="user" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
            <Text style={[styles.selectorTitleText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
              {localApplicants.length > 1 ? `Applicant Record ${activeIdx + 1} of ${localApplicants.length}:` : 'Applicant Record:'}
            </Text>
            <Text style={[styles.selectorNameText, { color: isDark ? colors.brand[300] : colors.brand[900] }]}>{activeApplicant?.name}</Text>
          </View>
          {localApplicants.length > 1 && (
            <Pressable disabled={activeIdx >= localApplicants.length - 1} onPress={() => onSelectApplicantIndex?.(Math.min(localApplicants.length - 1, activeIdx + 1))} style={[styles.selectorNavBtn, activeIdx >= localApplicants.length - 1 && { opacity: 0.3 }]}>
              <Text style={[styles.selectorNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Next</Text>
              <Lucide name="chevron-right" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
            </Pressable>
          )}
        </View>
      )}

      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false} onScrollBeginDrag={() => setActiveReqMenuId(null)}>
        {/* 1. Profile */}
        <SectionHeader title={activeApplicant ? `1. APPLICANT PROFILE DETAILS (${activeApplicant.name.toUpperCase()})` : "APPLICATION FORM"} />
        <View style={{ paddingHorizontal: SPACING[16] }}>
          {activeApplicant && (
            <ApplicantParticularsCard
              applicant={{
                applicantName: activeApplicant.name, name: activeApplicant.name,
                applicantType: activeApplicant.applicantType === 'Company' ? 'company' : 'individual',
                email: activeApplicant.email || app.contactDetails?.email || app.filingUser?.email,
                mobileNumber: activeApplicant.contactNumber || app.contactDetails?.contactNumber,
                streetAddress: activeApplicant.streetAddress || activeApplicant.address || app.address?.streetAddress,
                barangay: activeApplicant.barangay || app.address?.barangay,
                cityMunicipality: activeApplicant.city || app.address?.city,
                province: activeApplicant.province || app.address?.province,
                region: activeApplicant.region || app.address?.region,
                zipCode: activeApplicant.zipCode || app.address?.zipCode,
                birthDate: activeApplicant.basicInfo?.dob || app.basicInfo?.dob,
                sex: activeApplicant.basicInfo?.sex || app.basicInfo?.sex,
                civilStatus: activeApplicant.basicInfo?.civilStatus || app.basicInfo?.civilStatus,
                nationality: activeApplicant.basicInfo?.nationality || app.basicInfo?.nationality,
                companyName: activeApplicant.companyDetails?.name || app.companyDetails?.name || app.filingUser?.company?.name,
                registrationNumber: activeApplicant.companyDetails?.registrationNumber || app.companyDetails?.registrationNumber,
                companyAddress: activeApplicant.companyDetails?.address || app.companyDetails?.address,
                companyEmail: activeApplicant.companyDetails?.email || app.companyDetails?.email,
                companyContactNumber: activeApplicant.companyDetails?.contactNumber || app.companyDetails?.contactNumber,
                representativeName: (activeApplicant.applicantType === 'Company') ? app.filingUser?.name : undefined,
                notes: activeApplicant.evaluationRemarks,
              }}
            />
          )}
        </View>

        {/* 2. Form submissions */}
        {(hasFormValues || isLoadingForm) && (
          <>
            <SectionHeader title="2. COMPLETED SERVICE FORM SUBMISSIONS & TECHNICAL SPECIFICATIONS" />
            <View style={{ paddingHorizontal: SPACING[16] }}>
              {isLoadingForm ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <SkeletonLoader height={32} style={{ marginBottom: 8, width: '100%' }} />
                  <SkeletonLoader height={32} style={{ marginBottom: 8, width: '100%' }} />
                </View>
              ) : formData && formData.sections.length > 0 ? (
                <BaseApplicationPreview
                  service={{ title: app.serviceName || app.permitTitle, category: app.serviceCategory || app.category }}
                  form={formData}
                  formFieldValues={flatFormValues}
                  showApplicantCard={false}
                  showSignatureCard={true}
                  onPreviewFile={onPreviewFile}
                />
              ) : null}
            </View>
          </>
        )}

        {/* 3. Requirements */}
        <SectionHeader title="3. SUBMITTED REQUIREMENTS & DOCUMENT ATTACHMENTS" />
        <View style={styles.infoBlock}>
          <ApplicantRequirementsSection app={app} activeApplicant={activeApplicant} isEditable={isEditable} onPreviewFile={onPreviewFile} />
        </View>

        {/* 4. Evaluator Verdict Dock */}
        {isEditable && activeApplicant && (
          <View style={{ paddingHorizontal: SPACING[16], paddingBottom: SPACING[20] }}>
            <SectionHeader title="4. EVALUATOR VERDICT" />
            <View style={[styles.infoBlock, { gap: 10 }]}>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {verdictButtons.map((btn) => (
                  <Pressable
                    key={btn.verdict}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.button, backgroundColor: activeApplicant.status === btn.verdict ? btn.color : (isDark ? colors.neutral[800] : colors.neutral[100]), borderWidth: 1, borderColor: btn.color, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    onPress={() => setVerdictModalState({ applicantIndex: activeIdx, applicantName: activeApplicant.name, targetVerdict: btn.verdict, initialRemarks: localRemarks || activeApplicant.evaluationRemarks || '' })}
                  >
                    {activeApplicant.status === btn.verdict && <Lucide name="check-circle" size={13} color={COLORS.neutral.white} />}
                    <Text style={{ fontSize: 12, fontWeight: TYPOGRAPHY.weights.semibold, color: activeApplicant.status === btn.verdict ? COLORS.neutral.white : (isDark ? colors.neutral[200] : colors.neutral[800]), fontFamily: TYPOGRAPHY.fonts.primary }}>
                      {btn.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {activeApplicant.evaluationRemarks ? (
                <Text style={{ fontSize: 12, color: isDark ? colors.neutral[400] : colors.neutral[600], fontFamily: TYPOGRAPHY.fonts.primary, fontStyle: 'italic' }}>
                  Remarks: {activeApplicant.evaluationRemarks}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {verdictModalState !== null && (
        <ApplicantVerdictModal
          visible={verdictModalState !== null}
          applicantName={verdictModalState.applicantName}
          targetVerdict={verdictModalState.targetVerdict}
          initialRemarks={verdictModalState.initialRemarks}
          onConfirm={handleConfirmVerdict}
          onCancel={() => setVerdictModalState(null)}
        />
      )}
    </View>
  );
}
