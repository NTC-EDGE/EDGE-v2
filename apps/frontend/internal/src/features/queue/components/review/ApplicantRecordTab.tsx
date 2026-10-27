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
import { ApplicantItem, AuditTrailEntry } from "../../../../types/application";
import { DocumentPreviewFile } from "../../../../shared/components/DocumentPreviewModal";
import { SectionHeader } from "./reviewComponents";
import { reviewStyles as styles } from "./reviewStyles";
import { ApplicantParticularsCard } from "../ApplicantParticularsCard";
import { BaseApplicationPreview } from "../../../../shared/formPreview";
import { ApplicantRequirementsSection } from "./ApplicantRequirementsSection";
import { ApplicationHistoryTimeline } from "./ApplicationHistoryTimeline";
import { isAllowedRequirementFileType } from "../../../../utils/fileValidation";
import { resolveApplicantAuditHistory } from "../../utils/officerEvaluationHelper";

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
      formFieldValues: app.formFieldValues,
    }];
  }, [app]);

  const [localApplicants, setLocalApplicants] = useState<ApplicantItem[]>(effectiveApplicants);
  useEffect(() => { setLocalApplicants(effectiveApplicants); }, [effectiveApplicants]);

  const activeIdx = Math.min(selectedApplicantIndex ?? 0, Math.max(0, localApplicants.length - 1));
  const activeApplicant = localApplicants[activeIdx];

  const [activeReqMenuId, setActiveReqMenuId] = useState<string | null>(null);
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
    const valuesFromForm = (formData?.sections ?? []).flatMap((sec) =>
      sec.fields.map((f) => ({ fieldId: f.fieldId, fieldLabel: f.label, value: f.value ?? '' }))
    );
    const applicantFvs = activeApplicant?.formFieldValues ?? [];

    const map = new Map<string, { fieldId: string; fieldLabel: string; value: string }>();
    for (const fv of applicantFvs) {
      if (fv.fieldId) map.set(fv.fieldId.toLowerCase(), fv);
      if (fv.fieldLabel) map.set(fv.fieldLabel.toLowerCase().trim(), fv);
    }
    for (const fv of valuesFromForm) {
      const keyId = fv.fieldId ? fv.fieldId.toLowerCase() : '';
      const keyLabel = fv.fieldLabel ? fv.fieldLabel.toLowerCase().trim() : '';
      const existing = (keyId && map.get(keyId)) || (keyLabel && map.get(keyLabel));
      if (!existing || (!existing.value && fv.value)) {
        if (keyId) map.set(keyId, fv);
        if (keyLabel) map.set(keyLabel, fv);
      }
    }
    return Array.from(new Set(map.values()));
  }, [formData, activeApplicant]);

  const hasFormValues = useMemo(() => {
    if (flatFormValues.length === 0) return false;
    return flatFormValues.some((fv) => {
      const val = fv.value;
      if (!val || typeof val !== 'string') return false;
      const trimmed = val.trim();
      return trimmed.length > 0 && trimmed !== 'null' && trimmed !== 'undefined' && trimmed !== '[]' && trimmed !== '{}';
    });
  }, [flatFormValues]);

  const applicantHistory = useMemo<AuditTrailEntry[]>(
    () => resolveApplicantAuditHistory(app, activeApplicant),
    [app, activeApplicant]
  );

  const effectiveVariantName =
    activeApplicant?.serviceVariantName ||
    app.serviceVariantName ||
    app.permitTitle ||
    null;

  const effectiveVariantId =
    activeApplicant?.serviceVariantId ||
    app.services?.find((s) => s.applicantId === activeApplicant?.id)?.serviceVariantId ||
    null;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {toastState !== null && (
        <View style={styles.floatingToastContainer}>
          <AlertToast message={toastState.message} variant={toastState.variant} onDismiss={() => setToastState(null)} />
        </View>
      )}

      {/* Applicant nav bar */}
      {localApplicants.length > 1 && (
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
          {activeApplicant && (() => {
            const isCompanyRecord = activeApplicant.applicantType === 'Company' || (activeApplicant.applicantType !== 'Individual' && app.applicantType === 'Company');
            return (
              <ApplicantParticularsCard
                applicant={{
                  applicantName: activeApplicant.name,
                  name: activeApplicant.name,
                  applicantType: isCompanyRecord ? 'company' : 'individual',
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
                  companyName: isCompanyRecord ? (activeApplicant.companyDetails?.name || app.companyDetails?.name || app.filingUser?.company?.name) : undefined,
                  registrationNumber: isCompanyRecord ? (activeApplicant.companyDetails?.registrationNumber || app.companyDetails?.registrationNumber) : undefined,
                  companyAddress: isCompanyRecord ? (activeApplicant.companyDetails?.address || app.companyDetails?.address) : undefined,
                  companyEmail: isCompanyRecord ? (activeApplicant.companyDetails?.email || app.companyDetails?.email) : undefined,
                  companyContactNumber: isCompanyRecord ? (activeApplicant.companyDetails?.contactNumber || app.companyDetails?.contactNumber) : undefined,
                  representativeName: isCompanyRecord ? app.filingUser?.name : undefined,
                  notes: activeApplicant.evaluationRemarks,
                  schoolAttended: activeApplicant.schoolAttended,
                  courseTaken: activeApplicant.courseTaken,
                  yearGraduated: activeApplicant.yearGraduated,
                }}
              />
            );
          })()}
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
              ) : (formData && formData.sections.length > 0) || flatFormValues.length > 0 ? (
                <BaseApplicationPreview
                  service={{ id: activeApplicant?.serviceId || app.serviceId || '', title: app.serviceName || app.permitTitle, category: app.serviceCategory || app.category }}
                  form={formData}
                  formFieldValues={flatFormValues}
                  selectedVariantName={effectiveVariantName}
                  selectedVariantId={effectiveVariantId}
                  applicationType={activeApplicant?.applicationType || app.applicationType}
                  activeApplicant={activeApplicant ? {
                    applicantType: activeApplicant.applicantType,
                    companyName: activeApplicant.companyDetails?.name,
                    email: activeApplicant.email,
                    contactNo: activeApplicant.contactNumber,
                    address: activeApplicant.address,
                    street: activeApplicant.streetAddress,
                    barangay: activeApplicant.barangay,
                    city: activeApplicant.city,
                    province: activeApplicant.province,
                    region: activeApplicant.region,
                    zipCode: activeApplicant.zipCode,
                    birthDate: activeApplicant.basicInfo?.dob,
                    sex: activeApplicant.basicInfo?.sex,
                    civilStatus: activeApplicant.basicInfo?.civilStatus,
                    nationality: activeApplicant.basicInfo?.nationality,
                    notes: activeApplicant.evaluationRemarks,
                    schoolAttended: activeApplicant.schoolAttended,
                    courseTaken: activeApplicant.courseTaken,
                    yearGraduated: activeApplicant.yearGraduated,
                    selectedVariantName: effectiveVariantName || undefined,
                    selectedVariantId: effectiveVariantId || undefined,
                  } : undefined}
                  schoolAttended={activeApplicant?.schoolAttended}
                  courseTaken={activeApplicant?.courseTaken}
                  yearGraduated={activeApplicant?.yearGraduated}
                  isExamService={Boolean(
                    (app.serviceCategory || app.category || '').toLowerCase().includes('exam') ||
                    (app.serviceName || app.permitTitle || '').toLowerCase().includes('exam')
                  )}
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

        {/* 4. Applicant History & Evaluation Audit */}
        <ApplicationHistoryTimeline
          history={applicantHistory}
          title={app.applicationType === 'BULK'
            ? `4. APPLICANT RECORD AUDIT & EVALUATION HISTORY (${applicantHistory.length})`
            : undefined
          }
        />

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}
