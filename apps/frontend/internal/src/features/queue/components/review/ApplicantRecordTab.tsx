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

  const applicantHistory = useMemo<AuditTrailEntry[]>(() => {
    if (activeApplicant === null || activeApplicant === undefined) return [];

    const isBulk = app.applicationType === "BULK" && (app.applicantsList && app.applicantsList.length > 1);

    // For single/regular applications, display the full application audit history
    if (!isBulk && app.history && app.history.length > 0) {
      return app.history;
    }

    if (activeApplicant.history !== null && activeApplicant.history !== undefined && activeApplicant.history.length > 0) {
      return activeApplicant.history;
    }

    const list: AuditTrailEntry[] = [];

    // 1. Initial Submission for this applicant
    const submitter = app.filingUser?.name || app.applicant || "Applicant";
    list.push({
      id: `applicant-sub-${activeApplicant.id}`,
      action: isBulk
        ? `Applicant Record Submitted (${activeApplicant.name})`
        : "Applicant Record Submitted",
      staff: submitter,
      role: "Filing Submitter",
      status: "Submitted",
      timestamp: app.createdAt
        ? new Date(app.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "",
    });

    // 2. Application-level history events that mention this applicant
    if (app.history !== null && app.history !== undefined && app.history.length > 0) {
      const applicantNameLower = typeof activeApplicant.name === "string" ? activeApplicant.name.toLowerCase() : "";
      for (const h of app.history) {
        if (
          h.id.startsWith("init-") ||
          (h.action.toLowerCase().includes("application submitted") &&
            (applicantNameLower.length === 0 || !h.action.toLowerCase().includes(applicantNameLower)))
        ) {
          continue;
        }

        const actionMatch = applicantNameLower.length > 0 && h.action.toLowerCase().includes(applicantNameLower);
        const remarksMatch = applicantNameLower.length > 0 && typeof h.remarks === "string" && h.remarks.toLowerCase().includes(applicantNameLower);

        if (!isBulk || actionMatch || remarksMatch) {
          list.push(h);
        }
      }
    }

    // 3. Current Applicant Evaluation Verdict / Status
    if (activeApplicant.status !== null && activeApplicant.status !== undefined) {
      if (activeApplicant.status === "Incomplete") {
        list.push({
          id: `applicant-eval-${activeApplicant.id}`,
          action: "Applicant Evaluation: Incomplete / Deficiencies Noted",
          staff: "Evaluating Officer",
          role: "Return Officer",
          status: "Incomplete",
          remarks: activeApplicant.evaluationRemarks && activeApplicant.evaluationRemarks.trim().length > 0
            ? activeApplicant.evaluationRemarks
            : "Discrepancy remarks or missing requirements noted during evaluation.",
          timestamp: "Current Evaluation State",
        });
      } else if (activeApplicant.status === "ForEndorsement") {
        list.push({
          id: `applicant-eval-${activeApplicant.id}`,
          action: "Applicant Evaluation: Recommended for Endorsement",
          staff: "Evaluating Officer",
          role: "Evaluating Officer",
          status: "ForEndorsement",
          remarks: activeApplicant.evaluationRemarks && activeApplicant.evaluationRemarks.trim().length > 0
            ? activeApplicant.evaluationRemarks
            : undefined,
          timestamp: "Current Evaluation State",
        });
      } else if (activeApplicant.status === "Complete") {
        list.push({
          id: `applicant-eval-${activeApplicant.id}`,
          action: "Applicant Evaluation: Complete & Verified",
          staff: "Evaluating Officer",
          role: "Evaluating Officer",
          status: "Complete",
          remarks: activeApplicant.evaluationRemarks && activeApplicant.evaluationRemarks.trim().length > 0
            ? activeApplicant.evaluationRemarks
            : undefined,
          timestamp: "Current Evaluation State",
        });
      }
    }

    return list;
  }, [activeApplicant, app]);

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
