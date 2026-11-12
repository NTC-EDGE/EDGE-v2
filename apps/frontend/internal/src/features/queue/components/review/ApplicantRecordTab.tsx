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
import {
  BaseApplicationPreview,
  resolvePreviewVariant,
  resolvePreviewApplicationType,
  resolvePreviewElements,
} from "../../../../shared/formPreview";
import { ApplicantRequirementsSection } from "./ApplicantRequirementsSection";
import { ApplicationHistoryTimeline } from "./ApplicationHistoryTimeline";
import { isAllowedRequirementFileType } from "../../../../utils/fileValidation";
import { resolveApplicantAuditHistory } from "../../utils/officerEvaluationHelper";
import { splitFullName } from "../../data/applicationMapper";
import { EditApplicantProfileModal } from "../modals/EditApplicantProfileModal";
import { EditFormValuesModal } from "../modals/EditFormValuesModal";

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
    const fallbackType: 'Individual' | 'Company' = app.applicantType === 'Company' ? 'Company' : 'Individual';
    const fallbackStatus: 'Complete' | 'Incomplete' | 'ForEndorsement' = 'Complete';
    return [{
      id: app.id,
      name: app.applicant || `${app.basicInfo?.firstName ?? ''} ${app.basicInfo?.lastName ?? ''}`.trim() || app.companyDetails?.name || app.filingUser?.name || "Applicant",
      applicantType: fallbackType,
      status: fallbackStatus,
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
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isEditFormValuesModalOpen, setIsEditFormValuesModalOpen] = useState(false);

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

  const resolvedActiveApplicant = useMemo<ApplicantItem | null>(() => {
    if (!activeApplicant) return null;
    const isPrimary = activeIdx === 0 || localApplicants.length === 1;
    const findFv = (predicate: (lbl: string) => boolean): string => {
      const match = flatFormValues.find((f) => predicate((f.fieldLabel || '').toLowerCase().trim()));
      return match && typeof match.value === 'string' ? match.value.trim() : '';
    };

    const resolvedName =
      activeApplicant.name ||
      (isPrimary ? (app.applicant || app.filingUser?.name) : '') ||
      'Applicant';

    const rawFirst = activeApplicant.basicInfo?.firstName || (isPrimary ? app.basicInfo?.firstName : '') || '';
    const rawMiddle = activeApplicant.basicInfo?.middleName || (isPrimary ? app.basicInfo?.middleName : '') || '';
    const rawLast = activeApplicant.basicInfo?.lastName || (isPrimary ? app.basicInfo?.lastName : '') || '';
    const rawSuffix = activeApplicant.basicInfo?.extensionName || (isPrimary ? app.basicInfo?.extensionName : '') || '';

    const parsedName = splitFullName(
      (!rawLast && rawFirst.includes(' ')) ? rawFirst : resolvedName
    );

    const firstName =
      (rawLast ? rawFirst : (rawFirst && !rawFirst.includes(' ') ? rawFirst : '')) ||
      findFv((l) => l === 'first name' || l === 'given name' || l.includes('first name')) ||
      parsedName.firstName ||
      rawFirst;
    const middleName =
      rawMiddle ||
      findFv((l) => l === 'middle name' || l === 'middle initial' || l.includes('middle name')) ||
      parsedName.middleName ||
      '';
    const lastName =
      rawLast ||
      findFv((l) => l === 'last name' || l === 'surname' || l === 'family name' || l.includes('last name')) ||
      parsedName.lastName ||
      '';
    const extensionName =
      rawSuffix ||
      findFv((l) => l === 'suffix' || l.includes('suffix') || l.includes('extension')) ||
      parsedName.suffix ||
      '';

    const email =
      activeApplicant.email ||
      (isPrimary ? (app.contactDetails?.email || app.filingUser?.email) : '') ||
      findFv((l) => (l.includes('email') || l.includes('e-mail')) && !l.includes('company')) ||
      '';
    const contactNumber =
      activeApplicant.contactNumber ||
      (isPrimary ? app.contactDetails?.contactNumber : '') ||
      findFv((l) => (l.includes('contact') || l.includes('mobile') || l.includes('phone') || l.includes('telephone')) && !l.includes('company')) ||
      '';
    const streetAddress =
      activeApplicant.streetAddress ||
      activeApplicant.address ||
      (isPrimary ? (app.address?.streetAddress || app.address?.address) : '') ||
      findFv((l) => l === 'address' || l.includes('street') || l.includes('house') || l.includes('unit no')) ||
      '';
    const barangay =
      activeApplicant.barangay ||
      (isPrimary ? app.address?.barangay : '') ||
      findFv((l) => l.includes('barangay')) ||
      '';
    const city =
      activeApplicant.city ||
      (isPrimary ? app.address?.city : '') ||
      findFv((l) => l.includes('city') || l.includes('municipality')) ||
      '';
    const province =
      activeApplicant.province ||
      (isPrimary ? app.address?.province : '') ||
      findFv((l) => l.includes('province')) ||
      '';
    const region =
      activeApplicant.region ||
      (isPrimary ? app.address?.region : '') ||
      findFv((l) => l.includes('region')) ||
      '';
    const zipCode =
      activeApplicant.zipCode ||
      (isPrimary ? app.address?.zipCode : '') ||
      findFv((l) => l.includes('zip') || l.includes('postal')) ||
      '';
    const rawDob =
      activeApplicant.basicInfo?.dob ||
      activeApplicant.dob ||
      (isPrimary ? app.basicInfo?.dob : '') ||
      findFv((l) => l.includes('birth') || l === 'dob') ||
      '';
    const dob = rawDob.startsWith('0001-01-01') || rawDob.startsWith('1900-01-01')
      ? ''
      : (rawDob.includes('T') ? (rawDob.split('T')[0] ?? '') : rawDob);
    const sex =
      activeApplicant.basicInfo?.sex ||
      activeApplicant.sex ||
      (isPrimary ? app.basicInfo?.sex : '') ||
      findFv((l) => l.includes('sex') || l.includes('gender')) ||
      '';
    const civilStatus =
      activeApplicant.basicInfo?.civilStatus ||
      activeApplicant.civilStatus ||
      (isPrimary ? app.basicInfo?.civilStatus : '') ||
      findFv((l) => l.includes('civil') || l.includes('marital')) ||
      '';
    const nationality =
      activeApplicant.basicInfo?.nationality ||
      activeApplicant.nationality ||
      (isPrimary ? app.basicInfo?.nationality : '') ||
      findFv((l) => l.includes('nationality') || l.includes('citizenship')) ||
      'Filipino';

    const compSource =
      activeApplicant.companyDetails ??
      activeApplicant.company ??
      (isPrimary ? (app.companyDetails ?? app.filingUser?.company) : undefined);

    const companyDetails = compSource
      ? {
          name: compSource.name || '',
          registrationNumber: compSource.registrationNumber || '',
          address: compSource.address || '',
          email: compSource.email || '',
          contactNumber: compSource.contactNumber || '',
        }
      : undefined;

    return {
      ...activeApplicant,
      name: resolvedName,
      email,
      contactNumber,
      address: streetAddress,
      streetAddress,
      barangay,
      city,
      province,
      region,
      zipCode,
      dob,
      sex,
      civilStatus,
      nationality,
      basicInfo: {
        firstName,
        middleName,
        lastName,
        extensionName,
        dob,
        placeOfBirth: activeApplicant.basicInfo?.placeOfBirth || (isPrimary ? app.basicInfo?.placeOfBirth : '') || '',
        sex,
        weight: activeApplicant.basicInfo?.weight ?? (isPrimary ? app.basicInfo?.weight : 0) ?? 0,
        height: activeApplicant.basicInfo?.height ?? (isPrimary ? app.basicInfo?.height : 0) ?? 0,
        nationality,
        civilStatus,
        employmentStatus: activeApplicant.basicInfo?.employmentStatus || '',
        occupation: activeApplicant.basicInfo?.occupation || '',
      },
      company: companyDetails,
      companyDetails,
      formFieldValues: flatFormValues,
    };
  }, [activeApplicant, activeIdx, localApplicants.length, app, flatFormValues]);

  const applicantHistory = useMemo<AuditTrailEntry[]>(
    () => resolveApplicantAuditHistory(app, activeApplicant),
    [app, activeApplicant]
  );

  const effectiveVariantName = resolvePreviewVariant({
    variantName: activeApplicant?.serviceVariantName,
    serviceVariantName: app.serviceVariantName,
    variant: app.services?.find((s) => s.applicantId === activeApplicant?.id)?.serviceVariantName,
    formFieldValues: flatFormValues,
  });

  const effectiveVariantId =
    activeApplicant?.serviceVariantId ||
    app.services?.find((s) => s.applicantId === activeApplicant?.id)?.serviceVariantId ||
    null;

  const effectiveAppType = resolvePreviewApplicationType({
    applicationType:
      activeApplicant?.applicationType ||
      app.services?.find((s) => s.applicantId === activeApplicant?.id)?.applicationType ||
      app.serviceVariantType,
    examineeType: undefined,
    element: activeApplicant?.element || app.element,
    formFieldValues: flatFormValues,
  }) || (app.applicationType !== 'BULK' ? 'New' : undefined);

  const effectiveElements = resolvePreviewElements({
    element: activeApplicant?.element || activeApplicant?.elements || app.element || app.elements,
    elements: activeApplicant?.elements || app.elements,
    formFieldValues: flatFormValues,
  });

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
        <SectionHeader
          title={activeApplicant ? `1. APPLICANT PROFILE DETAILS (${activeApplicant.name.toUpperCase()})` : "1. APPLICANT PROFILE DETAILS"}
          rightAction={isEditable ? (
            <Pressable
              style={[
                styles.inspectBtn,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                },
              ]}
              onPress={() => setIsEditProfileModalOpen(true)}
            >
              <Lucide name="edit-2" size={12} color={isDark ? colors.brand[400] : colors.brand[700]} />
              <Text style={[styles.inspectBtnText, { color: isDark ? colors.brand[400] : colors.brand[700], fontWeight: "600" }]}>
                Edit Profile
              </Text>
            </Pressable>
          ) : null}
        />
        <View style={{ paddingHorizontal: SPACING[16] }}>
          {resolvedActiveApplicant && (() => {
            const isCompanyRecord = resolvedActiveApplicant.applicantType === 'Company' || (resolvedActiveApplicant.applicantType !== 'Individual' && app.applicantType === 'Company');
            return (
              <ApplicantParticularsCard
                applicant={{
                  applicantName: resolvedActiveApplicant.name,
                  name: resolvedActiveApplicant.name,
                  applicantType: isCompanyRecord ? 'company' : 'individual',
                  email: resolvedActiveApplicant.email,
                  mobileNumber: resolvedActiveApplicant.contactNumber,
                  streetAddress: resolvedActiveApplicant.streetAddress || resolvedActiveApplicant.address,
                  barangay: resolvedActiveApplicant.barangay,
                  cityMunicipality: resolvedActiveApplicant.city,
                  province: resolvedActiveApplicant.province,
                  region: resolvedActiveApplicant.region,
                  zipCode: resolvedActiveApplicant.zipCode,
                  birthDate: resolvedActiveApplicant.basicInfo?.dob || resolvedActiveApplicant.dob,
                  sex: resolvedActiveApplicant.basicInfo?.sex || resolvedActiveApplicant.sex,
                  civilStatus: resolvedActiveApplicant.basicInfo?.civilStatus || resolvedActiveApplicant.civilStatus,
                  nationality: resolvedActiveApplicant.basicInfo?.nationality || resolvedActiveApplicant.nationality,
                  companyName: isCompanyRecord ? resolvedActiveApplicant.companyDetails?.name : undefined,
                  registrationNumber: isCompanyRecord ? resolvedActiveApplicant.companyDetails?.registrationNumber : undefined,
                  companyAddress: isCompanyRecord ? resolvedActiveApplicant.companyDetails?.address : undefined,
                  companyEmail: isCompanyRecord ? resolvedActiveApplicant.companyDetails?.email : undefined,
                  companyContactNumber: isCompanyRecord ? resolvedActiveApplicant.companyDetails?.contactNumber : undefined,
                  representativeName: isCompanyRecord ? app.filingUser?.name : undefined,
                  notes: resolvedActiveApplicant.evaluationRemarks,
                }}
              />
            );
          })()}
        </View>

        {/* 2. Form submissions */}
        {(hasFormValues || isLoadingForm) && (
          <>
            <SectionHeader
              title="2. COMPLETED SERVICE FORM SUBMISSIONS & TECHNICAL SPECIFICATIONS"
              rightAction={isEditable ? (
                <Pressable
                  style={[
                    styles.inspectBtn,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                      borderColor: isDark ? colors.brand[500] : colors.brand[600],
                      borderWidth: 1,
                      paddingHorizontal: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    },
                  ]}
                  onPress={() => setIsEditFormValuesModalOpen(true)}
                >
                  <Lucide name="edit-2" size={12} color={isDark ? colors.brand[400] : colors.brand[700]} />
                  <Text style={[styles.inspectBtnText, { color: isDark ? colors.brand[400] : colors.brand[700], fontWeight: "600" }]}>
                    Edit Form Fields
                  </Text>
                </Pressable>
              ) : null}
            />
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
                  applicationType={effectiveAppType}
                  elements={effectiveElements}
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
                    element: effectiveElements || activeApplicant.element || undefined,
                    elements: effectiveElements || activeApplicant.elements || undefined,
                    selectedElementTitle: effectiveElements || activeApplicant.element || undefined,
                  } : undefined}
                  schoolAttended={activeApplicant?.schoolAttended}
                  courseTaken={activeApplicant?.courseTaken}
                  yearGraduated={activeApplicant?.yearGraduated}
                  isExamService={Boolean(
                    (app.serviceCategory || app.category || '').toLowerCase().includes('exam') ||
                    (app.serviceName || app.permitTitle || '').toLowerCase().includes('exam')
                  )}
                  showEquivalentFormHeader={false}
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

      <EditApplicantProfileModal
        visible={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        applicationId={app.id}
        applicant={resolvedActiveApplicant}
        onSuccess={async (updatedApplicant) => {
          if (updatedApplicant) {
            setLocalApplicants((prev) =>
              prev.map((item, idx) => (idx === activeIdx ? { ...item, ...updatedApplicant } : item))
            );
          }
          await mutateApplications(app.id);
          updateApplication(app.id, {});
        }}
      />

      <EditFormValuesModal
        visible={isEditFormValuesModalOpen}
        onClose={() => setIsEditFormValuesModalOpen(false)}
        applicationId={app.id}
        applicantId={activeApplicant?.id || app.id}
        applicantName={activeApplicant?.name}
        submissionId={formData?.submissionId}
        formSections={formData?.sections}
        flatFormValues={flatFormValues}
        onSuccess={async () => {
          await mutateApplications(app.id);
          updateApplication(app.id, {});
        }}
      />
    </View>
  );
}
