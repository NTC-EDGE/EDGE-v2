import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import {
  useTheme,
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Icon as Lucide,
  toast,
} from "@edge/ui";
import { ApplicationData, ApplicationStatus } from "../../../types/application";
import { useRole } from "../../shell/context/RoleContext";
import { usePermissions } from "../../shell/context/PermissionContext";
import { useAuthContext } from "../../auth/context/AuthContext";
import {
  applicationService,
  useAdminApplicationDetails,
  mutateApplications,
  useNextAvailableOrNumber,
  PendingPaymentDto,
} from "@edge/api";
import { mapApplicationDtoToUI } from "../data/applicationMapper";
import { ApproveModal } from "../components/modals/ApproveModal";
import { DeclineModal } from "../components/modals/DeclineModal";
import { EndorseModal, EndorsementSubmission } from "../components/modals/EndorseModal";
import { IssueReceiptModal } from "../../receipts/components/IssueReceiptModal";
import { GenerateSoaModal } from "../components/modals/GenerateSoaModal";
import { SoaReportPreviewModal, ReportDocumentType } from "../components/modals/SoaReportPreviewModal";
import {
  generateSoaPrintableHtml,
  generateOpPrintableHtml,
  openPrintableDocumentWindow,
} from "../utils/soaReportGenerator";
import { UserRole } from "../../shell/context/RoleContext";
import { CustomDocPreviewModal } from "../../../shared/components/CustomDocPreviewModal";
import { DocumentPreviewFile } from "../../../shared/components/DocumentPreviewModal";
import { ApplicationReviewSkeleton } from "../components/review/ApplicationReviewSkeleton";
import { ApplicationDetailsTab } from "../components/review/ApplicationDetailsTab";
import { ApplicantRecordTab } from "../components/review/ApplicantRecordTab";
import { SoaPaymentTab } from "../components/review/SoaPaymentTab";
import { InnerTab, INNER_TABS } from "../components/review/reviewTypes";
import {
  resolveUserIdentifiers,
  matchesUserIdentifier,
  computeOfficerEvaluationState,
} from "../utils/officerEvaluationHelper";

export interface ApplicationReviewScreenProps {
  applicationId?: string | null;
  onClose: () => void;
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

export function ApplicationReviewScreenContent({
  applicationId: propApplicationId,
  onClose,
  onCollapse,
  isCollapsed,
}: ApplicationReviewScreenProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 900;
  const { applicationDto, isLoading: isDetailsLoading, refetch } = useAdminApplicationDetails(propApplicationId);
  const { user, clerkUser } = useAuthContext();
  const { currentRole } = useRole();
  const { canApprove, canDecline, canEndorse, canForwardToAccountant, canApproveAsAccountant, canVerifyCashier } = usePermissions();
  const isAdmin = currentRole === 'Admin';
  const officerName = (
    user?.name?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    clerkUser?.fullName?.trim() ||
    user?.username?.trim() ||
    clerkUser?.username?.trim() ||
    user?.email?.trim() ||
    clerkUser?.primaryEmailAddress?.emailAddress?.trim() ||
    'Authorized Officer'
  );

  const currentUserIdentifiers = useMemo(
    () => resolveUserIdentifiers(user, clerkUser),
    [user, clerkUser]
  );

  const matchesCurrentUser = useCallback(
    (target?: string | null): boolean => matchesUserIdentifier(target, currentUserIdentifiers),
    [currentUserIdentifiers]
  );

  const selectedApplication = useMemo(() => {
    return applicationDto ? mapApplicationDtoToUI(applicationDto, currentRole) : null;
  }, [applicationDto, currentRole]);

  const updateApplication = useCallback(async (id: string, patch: Partial<ApplicationData>) => {
    try {
      if (typeof patch.status === 'string' && patch.status.length > 0) {
        const [, err] = await applicationService.updateStatus(id, {
          status: patch.status,
          remarks: typeof patch.note === 'string' ? patch.note : undefined,
          staffName: officerName,
        });
        if (err !== null) {
          const errMsg = typeof err === 'object' && err !== null && Reflect.has(err, 'message')
            ? String(Reflect.get(err, 'message'))
            : 'Please try again.';
          toast.error(`Status update failed: ${errMsg}`);
          return;
        }
      } else {
        const payload: Record<string, unknown> = {};
        if (patch.referenceNumber !== undefined) payload.referenceNumber = patch.referenceNumber;
        if (patch.applicationNumber !== undefined) payload.permitNumber = patch.applicationNumber;
        if (patch.office !== undefined) payload.office = patch.office;
        if (patch.applicant !== undefined) payload.applicant = patch.applicant;
        if (patch.applicantType !== undefined) payload.applicantType = patch.applicantType;
        if (patch.note !== undefined) payload.note = patch.note;
        if (patch.contactDetails !== undefined) payload.contactDetails = patch.contactDetails;
        if (patch.address !== undefined) payload.address = patch.address;
        if (patch.companyDetails !== undefined) payload.companyDetails = patch.companyDetails;
        if (patch.basicInfo !== undefined) payload.basicInfo = patch.basicInfo;
        if (patch.applicantsList !== undefined) payload.applicantsList = patch.applicantsList;

        const [, err] = await applicationService.adminUpdateApplication(id, payload);
        if (err !== null) {
          const errMsg = typeof err === 'object' && err !== null && Reflect.has(err, 'message')
            ? String(Reflect.get(err, 'message'))
            : 'Please try again.';
          toast.error(`Update failed: ${errMsg}`);
          return;
        }
        if (patch.note !== undefined && Object.keys(payload).length === 1) {
          toast.success("Evaluation note saved successfully.");
        } else {
          toast.success("Application updated successfully.");
        }
      }
      await mutateApplications(id);
      await refetch();
    } catch {
      toast.error("Failed to update application data.");
    }
  }, [officerName, refetch]);

  const [innerTab, setInnerTab] = useState<InnerTab>("details");
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(0);
  const [showApprove, setShowApprove] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showEndorse, setShowEndorse] = useState(false);
  const [showCashier, setShowCashier] = useState(false);
  const [showGenerateSoa, setShowGenerateSoa] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportPreviewInitialDoc, setReportPreviewInitialDoc] = useState<ReportDocumentType>("soa");
  const [previewCustomDoc, setPreviewCustomDoc] = useState<DocumentPreviewFile | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tabScrollRef = useRef<ScrollView>(null);

  const cashierTenantId = (selectedApplication?.tenantId || user?.tenantId || '00000000-0000-0000-0000-000000000001');
  const { nextOr, mutate: mutateNextOr } = useNextAvailableOrNumber(
    showCashier || selectedApplication?.status === 'PendingPayment' ? cashierTenantId : null,
    user?.id ?? user?.email ?? null
  );

  const pendingPaymentPayload = useMemo<PendingPaymentDto | null>(() => {
    if (!selectedApplication) return null;
    const itemApp = selectedApplication;
    const lineItems = (itemApp.soaItems && itemApp.soaItems.length > 0)
      ? itemApp.soaItems.map((item) => ({
          feeCode: item.code || 'FEE',
          description: item.particular,
          amount: item.amount,
        }))
      : [{
          feeCode: 'FEE',
          description: itemApp.serviceName || itemApp.permitTitle || 'Permit / Licensing Fee',
          amount: itemApp.totalAmountDue || 0,
        }];

    const refOrId = (itemApp.referenceNumber && itemApp.referenceNumber.length > 0)
      ? itemApp.referenceNumber
      : itemApp.id.slice(0, 8).toUpperCase();

    return {
      orderOfPaymentId: itemApp.payment?.orderOfPaymentId || itemApp.id,
      applicationId: itemApp.id,
      statementOfAccountId: itemApp.id,
      opNumber: itemApp.payment?.opNumber || `OP-${refOrId}`,
      soaNumber: `SOA-${refOrId}`,
      applicationNumber: itemApp.applicationNumber || '',
      referenceNumber: itemApp.referenceNumber || '',
      applicantName: itemApp.applicant || itemApp.companyDetails?.name || 'Applicant',
      applicantType: itemApp.applicantType || 'Individual',
      serviceName: itemApp.serviceName || itemApp.permitTitle || itemApp.category || 'NTC Service',
      serviceCategory: itemApp.serviceCategory || itemApp.category || 'Licensing',
      amountDue: itemApp.totalAmountDue || itemApp.payment?.amountReceived || 0,
      billedAt: itemApp.createdAt || new Date().toISOString(),
      remarks: itemApp.note || null,
      lineItems,
    };
  }, [selectedApplication]);

  useEffect(() => { setSelectedApplicantIndex(0); }, [selectedApplication?.id]);
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [selectedApplication?.id, fadeAnim]);

  const handlePreviewFile = useCallback((fileOrUri: DocumentPreviewFile | string, label?: string) => {
    if (typeof fileOrUri === 'string') {
      setPreviewCustomDoc({ uri: fileOrUri, name: (label ?? '').trim() || 'Attachment Document', category: label });
    } else if (fileOrUri !== null && typeof fileOrUri === 'object') {
      setPreviewCustomDoc(fileOrUri);
    }
  }, []);

  const handleClosePreviewDoc = useCallback(() => {
    setPreviewCustomDoc((prev) => {
      if (prev?.uri && typeof prev.uri === 'string' && prev.uri.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try { URL.revokeObjectURL(prev.uri); } catch { /* ignore */ }
      }
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (previewCustomDoc?.uri && typeof previewCustomDoc.uri === 'string' && previewCustomDoc.uri.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try { URL.revokeObjectURL(previewCustomDoc.uri); } catch { /* cleanup */ }
      }
    };
  }, [previewCustomDoc?.uri]);

  const handlePrintSoa = useCallback(() => {
    if (selectedApplication !== null) openPrintableDocumentWindow(generateSoaPrintableHtml(selectedApplication));
  }, [selectedApplication]);

  const handlePrintOp = useCallback(() => {
    if (selectedApplication !== null) openPrintableDocumentWindow(generateOpPrintableHtml(selectedApplication));
  }, [selectedApplication]);

  const handlePreviewReport = useCallback((docType: ReportDocumentType) => {
    setReportPreviewInitialDoc(docType);
    setShowReportPreview(true);
  }, []);

  const handleCloseAnimated = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      onClose();
      fadeAnim.setValue(1);
    });
  };

  if (isDetailsLoading) return <ApplicationReviewSkeleton onClose={onClose} />;

  if (selectedApplication === null) {
    return (
      <ScrollView style={[sc.emptyScroll, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} contentContainerStyle={sc.emptyContainer} showsVerticalScrollIndicator={false}>
        <View style={[sc.summaryCard, { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
          <View style={[sc.summaryHeader, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <Lucide name="layout" size={20} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
            <Text style={[sc.summaryTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Work Queue Summary</Text>
          </View>
          <View style={[sc.guideBox, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <Lucide name="info" size={16} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
            <Text style={[sc.guideText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>Select an application from the left feed to start reviewing details, endorsing, or approving requests.</Text>
          </View>
        </View>
        <View style={sc.actionPrompt}>
          <Lucide name="mouse-pointer" size={32} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
          <Text style={[sc.emptyTitle, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>No Application Selected</Text>
          <Text style={[sc.emptySub, { color: isDark ? colors.neutral[600] : colors.neutral[300] }]}>Select an application from the queue to view full details and perform evaluation actions.</Text>
        </View>
      </ScrollView>
    );
  }

  const app = selectedApplication;

  const isSubmitted = app.status === "Submitted";
  const isForAccountant = app.status === "ForAccountant";
  const isPendingPayment = app.status === "PendingPayment";

  const {
    isEvaluating,
    evaluatingOfficer,
    isEndorsed,
    isEndorsedToMe,
    isEndorsedAwayFromMe,
    isEvaluatedByMe,
    isEvaluatedByOther,
  } = computeOfficerEvaluationState({
    application: app,
    identifiers: currentUserIdentifiers,
  });

  const isEditable = !isEndorsedAwayFromMe && !isEvaluatedByOther && app.queueTab !== "history" && app.status !== "Completed" && app.status !== "Approved" && app.status !== "Returned";

  // ── Workflow-aware action handlers ──────────────────────────────────────────

  /** Evaluator starts evaluation -> changes status from Submitted to Evaluating */
  const handleStartEvaluation = async () => {
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'Evaluating',
      action: 'Evaluating',
      staffName: officerName,
      staffRole: currentRole || 'Evaluator',
      remarks: `Evaluation started by ${officerName}.`,
    });
    if (err !== null) {
      toast.error('Failed to start evaluation.');
      return;
    }
    await updateApplication(app.id, {
      assignedTo: officerName,
    });
    toast.success('Evaluation started. Application status changed to Evaluating.');
    await mutateApplications(app.id);
    await refetch();
  };

  /** Evaluator releases evaluation back to For Evaluation queue */
  const handleReleaseEvaluation = async () => {
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'Submitted',
      action: 'Returned to Queue',
      staffName: officerName,
      staffRole: currentRole || 'Evaluator',
      remarks: `Evaluation released by ${officerName}. Status reverted to For Evaluation.`,
    });
    if (err !== null) {
      toast.error('Failed to release evaluation.');
      return;
    }
    toast.success('Evaluation released. Application returned to For Evaluation queue.');
    await mutateApplications(app.id);
    await refetch();
  };

  /** Evaluator / Chief / Director → Approves evaluation, background advances to Accountant */
  const handleForwardToAccountant = async () => {
    setShowApprove(false);
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'ForAccountant',
      action: 'Approved & Forwarded to Accountant',
      staffName: officerName,
      staffRole: currentRole || 'Evaluator',
      remarks: 'Evaluation approved. Advanced to Accountant for SOA review.',
    });
    if (err !== null) { toast.error('Failed to approve application.'); return; }
    toast.success('Application approved and advanced to Accountant.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Accountant → Approves SOA, background advances to PendingPayment (visible on client portal) */
  const handleAccountantApprove = async () => {
    setShowApprove(false);
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'PendingPayment',
      action: 'SOA Approved by Accountant',
      staffName: officerName,
      staffRole: currentRole || 'Accountant',
      remarks: 'SOA and assessment approved by Accountant. Ready for client payment.',
    });
    if (err !== null) { toast.error('Failed to approve SOA.'); return; }
    toast.success('SOA approved. Application is now ready for payment.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Cashier → issues official receipt via IssueReceiptModal and marks the application Completed */
  const handleCashierReceiptSuccess = async () => {
    setShowCashier(false);
    const [, statusErr] = await applicationService.updateStatus(app.id, {
      status: 'Completed',
      action: 'Payment Collected & OR Issued',
      staffName: officerName,
      staffRole: currentRole || 'Cashier',
      remarks: `Official Receipt issued by Cashier ${officerName}. Application marked as Paid & Completed.`,
    });
    if (statusErr !== null) {
      toast.error('Failed to update application status.');
      return;
    }
    toast.success('Official Receipt issued successfully. Application completed.');
    await mutateApplications(app.id);
    await mutateNextOr();
    await refetch();
    onClose();
  };

  /** Return / decline — multi-tier return in background based on workflow stage or endorsement */
  const handleDecline = async (notice: string) => {
    setShowDecline(false);
    const trimmedNotice = notice.trim() || 'Application returned with notice.';

    let targetStatus: ApplicationStatus = 'Returned';
    let successMessage = 'Application returned to applicant with notice.';
    let auditRemarks = `Notice of Discrepancy: ${trimmedNotice}`;
    let actionTitle = 'Returned with Notice';

    if (isEndorsedToMe && app.endorsedBy) {
      // Endorsed officer returns -> goes back to endorsing evaluator
      targetStatus = 'Evaluating';
      successMessage = `Application returned to ${app.endorsedBy}.`;
      auditRemarks = `Returned by ${officerName} to ${app.endorsedBy}: ${trimmedNotice}`;
      actionTitle = `Returned to ${app.endorsedBy}`;
    } else if (app.status === 'PendingPayment') {
      // Cashier returns -> goes back to Accountant (previous touch)
      targetStatus = 'ForAccountant';
      successMessage = 'Application returned to Accountant for SOA review.';
      auditRemarks = `Returned by Cashier to Accountant: ${trimmedNotice}`;
      actionTitle = 'Returned to Accountant';
    } else if (app.status === 'ForAccountant') {
      // Accountant returns -> goes back to Evaluator (previous touch)
      targetStatus = 'Evaluating';
      successMessage = 'Application returned to Evaluator for review.';
      auditRemarks = `Returned by Accountant to Evaluator: ${trimmedNotice}`;
      actionTitle = 'Returned to Evaluator';
    } else {
      // Evaluator / Chief / Director returns -> goes back to Applicant
      targetStatus = 'Returned';
      successMessage = 'Application returned to applicant with notice.';
      auditRemarks = `Notice of Discrepancy: ${trimmedNotice}`;
      actionTitle = 'Returned with Notice';
    }

    const [, err] = await applicationService.updateStatus(app.id, {
      status: targetStatus,
      action: actionTitle,
      staffName: officerName,
      staffRole: currentRole || 'Officer',
      remarks: auditRemarks,
    });
    if (err !== null) { toast.error('Failed to return application.'); return; }
    if (isEndorsedToMe && app.endorsedBy) {
      await updateApplication(app.id, {
        assignedTo: app.endorsedBy,
      });
    }
    toast.success(successMessage);
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Endorse to a specific person/evaluator for review */
  const handleEndorse = async (submission: EndorsementSubmission) => {
    setShowEndorse(false);
    const { person, notes } = submission;
    const notesSuffix = notes && notes.trim().length > 0 ? ` Instructions: ${notes.trim()}` : '';
    const roleLabel = person.position || person.role || 'Evaluator';
    const remarks = `Application endorsed to ${person.name} (${roleLabel}) by ${officerName}.${notesSuffix}`;

    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'Evaluating',
      action: `Endorsed to ${person.name}`,
      staffName: officerName,
      staffRole: currentRole || 'Evaluating Officer',
      remarks,
    });
    if (err !== null) {
      toast.error('Failed to endorse application.');
      return;
    }
    await updateApplication(app.id, {
      assignedTo: person.name,
    });
    toast.success(`Application endorsed to ${person.name}.`);
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Admin-only direct approve (bypasses normal cycle) */
  const handleAdminDirectApprove = async () => {
    setShowApprove(false);
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'Approved',
      action: 'Directly Approved by Administrator',
      staffName: officerName,
      staffRole: 'Admin',
      remarks: 'Application directly approved by administrator.',
    });
    if (err !== null) { toast.error('Failed to approve application.'); return; }
    toast.success('Application approved directly by administrator.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  // ── Contextual action bar state ─────────────────────────────────────────────
  const isBulkApp = (app.mode || '').toUpperCase() === 'BULK' || (app.applicantsList && app.applicantsList.length > 1);
  const uncompletedApplicantsCount = app.applicantsList?.filter(a => !a.status || a.status === 'Incomplete').length ?? 0;
  const endorsementApplicantsCount = app.applicantsList?.filter(a => a.status === 'ForEndorsement').length ?? 0;
  const hasIncompleteApplicants = isBulkApp
    ? uncompletedApplicantsCount > 0 || endorsementApplicantsCount > 0
    : false;

  /** Start evaluation button for Submitted applications */
  const showStartEvalBtn = isSubmitted && !isEndorsedAwayFromMe;
  /** Show Cashier-specific payment verify button */
  const showCashierBtn = isPendingPayment && !isEndorsedAwayFromMe && (currentRole === 'Cashier' || canVerifyCashier || isAdmin);
  /** Show Accountant-specific SOA approve button */
  const showAccountantBtn = isForAccountant && !isEndorsedAwayFromMe && (currentRole === 'Accountant' || canApproveAsAccountant || isAdmin);
  /** Show Evaluator forward-to-accountant button (Only if actively evaluating and current evaluator or endorsed officer) */
  const showForwardBtn = isEvaluating && (isEvaluatedByMe || !isEvaluatedByOther || isEndorsedToMe) && !isEndorsedAwayFromMe;

  let approveButtonLabel = 'Approve';
  let approveButtonIcon: 'check-circle' | 'credit-card' | 'play-circle' = 'check-circle';

  if (showStartEvalBtn) {
    approveButtonLabel = 'Start Evaluation';
    approveButtonIcon = 'play-circle';
  } else if (showCashierBtn) {
    approveButtonLabel = 'Collect & Issue OR';
    approveButtonIcon = 'credit-card';
  } else if (showAccountantBtn) {
    approveButtonLabel = 'Approve SOA';
    approveButtonIcon = 'check-circle';
  } else if (showForwardBtn) {
    approveButtonLabel = 'Approve Evaluation';
    approveButtonIcon = 'check-circle';
  }

  // Primary action button (Approve / Start Evaluation / Verify Payment / Approve SOA)
  const canApproveAction = isEditable && (showStartEvalBtn || showCashierBtn || showAccountantBtn || showForwardBtn);

  // Return button: Only available when actively evaluating (or endorsed to me), or in Accountant / Cashier stage
  const canDeclineAction = isEditable && (
    (isEvaluating && (isEvaluatedByMe || isEndorsedToMe || !isEvaluatedByOther)) ||
    (isForAccountant && (currentRole === 'Accountant' || canApproveAsAccountant || isAdmin)) ||
    (isPendingPayment && (currentRole === 'Cashier' || canVerifyCashier || isAdmin))
  );

  // Endorse button: ONLY available when actively evaluating (by current evaluator or endorsed officer)
  const canEndorseAction = isEditable && isEvaluating && (isEvaluatedByMe || isEndorsedToMe || !isEvaluatedByOther) && canEndorse;

  const handlePrimaryAction = () => {
    if (showStartEvalBtn) {
      void handleStartEvaluation();
    } else if (showCashierBtn) {
      setShowCashier(true);
    } else {
      setShowApprove(true);
    }
  };

  return (
    <Animated.View style={[sc.panel, { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, opacity: fadeAnim }]}>
      {/* Tab Bar */}
      <View style={[sc.tabBarWrapper, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
        {isNarrow ? (
          <>
            <ScrollView ref={tabScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sc.tabScrollContent} style={sc.tabScroll}>
              {INNER_TABS.map((tab) => {
                const isActive = innerTab === tab.key;
                return (
                  <Pressable key={tab.key} style={sc.tabItem} onPress={() => setInnerTab(tab.key)}>
                    <Lucide name={tab.icon} size={13} color={isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[500] : COLORS.neutral[400])} />
                    <Text style={[sc.tabText, { color: isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[400] : COLORS.neutral[500]) }]}>{tab.label}</Text>
                    {isActive && <View style={[sc.tabUnderline, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]} />}
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={[sc.tabActionsRow, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
              <View style={sc.tabSpacer} />
              {onCollapse !== undefined && (
                <Pressable style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]} onPress={onCollapse}>
                  <Lucide name={isCollapsed ? "minimize-2" : "maximize-2"} size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                </Pressable>
              )}
              <Pressable style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]} onPress={handleCloseAnimated}>
                <Lucide name="x" size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </Pressable>
            </View>
          </>
        ) : (
          <View style={sc.tabBar}>
            {INNER_TABS.map((tab) => {
              const isActive = innerTab === tab.key;
              return (
                <Pressable key={tab.key} style={sc.tabItem} onPress={() => setInnerTab(tab.key)}>
                  <Lucide name={tab.icon} size={13} color={isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[500] : COLORS.neutral[400])} />
                  <Text style={[sc.tabText, { color: isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[400] : COLORS.neutral[500]) }]}>{tab.label}</Text>
                  {isActive && <View style={[sc.tabUnderline, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]} />}
                </Pressable>
              );
            })}
            <View style={sc.tabSpacer} />
            {onCollapse !== undefined && (
              <Pressable style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]} onPress={onCollapse}>
                <Lucide name={isCollapsed ? "minimize-2" : "maximize-2"} size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </Pressable>
            )}
            <Pressable style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]} onPress={handleCloseAnimated}>
              <Lucide name="x" size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Endorsed away banner */}
      {isEndorsedAwayFromMe && (
        <View style={[sc.endorsedBanner, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', borderBottomColor: isDark ? '#4338CA' : '#C7D2FE' }]}>
          <Lucide name="share-2" size={14} color={isDark ? '#A5B4FC' : '#4F46E5'} />
          <Text style={[sc.endorsedText, { color: isDark ? '#E0E7FF' : '#3730A3' }]}>
            This application has been endorsed to <Text style={{ fontWeight: '700' }}>{app.endorsedTo}</Text>{app.endorsedBy ? ` by ${app.endorsedBy}` : ''}. Actions are restricted to the endorsed officer until reviewed or returned.
          </Text>
        </View>
      )}

      {/* Endorsed to me banner */}
      {isEndorsedToMe && (
        <View style={[sc.endorsedBanner, { backgroundColor: isDark ? '#14532D' : '#F0FDF4', borderBottomColor: isDark ? '#15803D' : '#BBF7D0' }]}>
          <Lucide name="share-2" size={14} color={isDark ? '#4ADE80' : '#16A34A'} />
          <Text style={[sc.endorsedText, { color: isDark ? '#DCFCE7' : '#14532D' }]}>
            This application has been endorsed to you{app.endorsedBy ? ` by ${app.endorsedBy}` : ''} for technical evaluation and decision.
          </Text>
        </View>
      )}

      {/* Locked / Under Evaluation by another officer banner */}
      {!isEndorsedAwayFromMe && !isEndorsedToMe && isEvaluatedByOther && (
        <View style={[sc.lockedBanner, { backgroundColor: isDark ? '#3E2415' : '#FEF3C7', borderBottomColor: isDark ? '#B45309' : '#F59E0B' }]}>
          <Lucide name="lock" size={14} color={isDark ? '#FBBF24' : '#D97706'} />
          <Text style={[sc.lockedText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
            This application is currently being evaluated by <Text style={{ fontWeight: '700' }}>{evaluatingOfficer}</Text>. Actions are locked to prevent duplicate simultaneous evaluations.
          </Text>
        </View>
      )}

      {/* Read-only banner */}
      {!isEditable && !isEndorsedAwayFromMe && (
        <View style={[sc.readOnlyBanner, { backgroundColor: colors.brand.yellowLight }]}>
          <Lucide name="lock" size={12} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
          <Text style={[sc.readOnlyText, { color: COLORS.semantic.warningText }]}>
            Read-only — actions only available on Pending applications with actionable status
          </Text>
        </View>
      )}

      {/* Tab Content */}
      {innerTab === "details" && (
        <ApplicationDetailsTab
          key={app.id}
          app={app}
          isEditable={isEditable}
          updateApplication={updateApplication}
          selectedApplicantIndex={selectedApplicantIndex}
          onSelectApplicantIndex={(idx) => setSelectedApplicantIndex(idx)}
          onInspectApplicant={(idx) => { setSelectedApplicantIndex(idx); setInnerTab("applicant-record"); }}
          onPreviewFile={handlePreviewFile}
        />
      )}
      {innerTab === "applicant-record" && (
        <ApplicantRecordTab
          key={app.id}
          app={app}
          selectedApplicantIndex={selectedApplicantIndex}
          onSelectApplicantIndex={(idx) => setSelectedApplicantIndex(idx)}
          updateApplication={updateApplication}
          isEditable={isEditable}
          onPreviewFile={handlePreviewFile}
        />
      )}
      {innerTab === "soa" && (
        <SoaPaymentTab
          key={app.id}
          app={app}
          isEditable={isEditable}
          updateApplication={updateApplication}
          onOpenGenerateSoa={() => setShowGenerateSoa(true)}
          onPrintSoa={handlePrintSoa}
          onPrintOp={handlePrintOp}
          onPreviewReport={handlePreviewReport}
        />
      )}

      {/* ── Bottom Action Bar ── */}
      <WorkflowActionBar
        isEditable={isEditable}
        isDark={isDark}
        colors={colors}
        canApprove={canApproveAction}
        canDecline={canDeclineAction}
        canEndorse={canEndorseAction}
        isApproveDisabled={showForwardBtn && hasIncompleteApplicants}
        approveLabel={approveButtonLabel}
        approveIcon={approveButtonIcon}
        onApprove={handlePrimaryAction}
        onReturn={() => setShowDecline(true)}
        onEndorse={() => setShowEndorse(true)}
      />

      {/* ── Modals ── */}
      <CustomDocPreviewModal previewCustomDoc={previewCustomDoc} onClose={handleClosePreviewDoc} />

      {/* ApproveModal is reused for evaluation and accountant approval */}
      <ApproveModal
        visible={showApprove}
        applicantName={app.applicant}
        onConfirm={
          showCashierBtn ? () => { /* handled by CashierModal */ } :
          showAccountantBtn ? handleAccountantApprove :
          showForwardBtn ? handleForwardToAccountant :
          isAdmin ? handleAdminDirectApprove :
          handleForwardToAccountant
        }
        onCancel={() => setShowApprove(false)}
      />
      <DeclineModal
        visible={showDecline}
        applicantName={app.applicant}
        title={
          isEndorsedToMe && app.endorsedBy
            ? `Return to ${app.endorsedBy}`
            : app.status === 'PendingPayment'
              ? 'Return to Accountant'
              : app.status === 'ForAccountant'
                ? 'Return to Evaluator'
                : 'Return Application'
        }
        confirmText="Confirm Return"
        reasonLabel={
          isEndorsedToMe && app.endorsedBy
            ? `Return Reason for ${app.endorsedBy}`
            : app.status === 'PendingPayment'
              ? 'Return Reason for Accountant'
              : app.status === 'ForAccountant'
                ? 'Return Reason for Evaluator'
                : 'Reason / Notice of Discrepancy'
        }
        placeholder={
          isEndorsedToMe && app.endorsedBy
            ? `Describe findings, reasons, or remarks for returning to ${app.endorsedBy}...`
            : app.status === 'PendingPayment'
              ? 'Describe fee adjustments or discrepancy for the Accountant...'
              : app.status === 'ForAccountant'
                ? 'Describe findings or missing details for the Evaluator...'
                : 'Describe the discrepancy or reason for returning this application...'
        }
        onConfirm={handleDecline}
        onCancel={() => setShowDecline(false)}
      />
      <EndorseModal
        visible={showEndorse}
        applicantName={app.applicant}
        tenantId={app.tenantId}
        appliedFieldOffice={app.office || app.assignedTo}
        onConfirm={handleEndorse}
        onCancel={() => setShowEndorse(false)}
      />
      <IssueReceiptModal
        visible={showCashier}
        tenantId={app.tenantId || user?.tenantId || '00000000-0000-0000-0000-000000000001'}
        nextOr={nextOr}
        pendingPayment={pendingPaymentPayload}
        onClose={() => setShowCashier(false)}
        onSuccess={handleCashierReceiptSuccess}
      />
      <GenerateSoaModal visible={showGenerateSoa} app={app} onClose={() => setShowGenerateSoa(false)} onSuccess={async () => { await mutateApplications(app.id); await refetch(); }} />
      <SoaReportPreviewModal visible={showReportPreview} app={app} initialDocType={reportPreviewInitialDoc} onClose={() => setShowReportPreview(false)} onOpenGenerateSoa={() => setShowGenerateSoa(true)} />
    </Animated.View>
  );
}

// ── Unified WorkflowActionBar sub-component ───────────────────────────────────

interface WorkflowActionBarProps {
  isEditable: boolean;
  isDark: boolean;
  colors: ReturnType<typeof import('@edge/ui').useTheme>['colors'];
  canApprove: boolean;
  canDecline: boolean;
  canEndorse: boolean;
  isApproveDisabled: boolean;
  approveLabel: string;
  approveIcon: 'check-circle' | 'credit-card' | 'play-circle';
  onApprove: () => void;
  onReturn: () => void;
  onEndorse: () => void;
}

function WorkflowActionBar({
  isEditable,
  isDark,
  colors,
  canApprove,
  canDecline,
  canEndorse,
  isApproveDisabled,
  approveLabel,
  approveIcon,
  onApprove,
  onReturn,
  onEndorse,
}: WorkflowActionBarProps) {
  const primaryGreen = isDark ? '#166534' : '#15803D';
  const primaryBlue = isDark ? colors.brand[600] : colors.brand[700];
  const primaryColor = approveIcon === 'credit-card' ? primaryBlue : primaryGreen;
  const disabledBg = isDark ? '#1E293B' : '#E2E8F0';
  const disabledText = isDark ? '#64748B' : '#94A3B8';
  const disabledBorder = isDark ? '#334155' : '#CBD5E1';
  const outlineBg = isDark ? colors.neutral[800] : COLORS.neutral.white;
  const outlineText = isDark ? colors.neutral[100] : COLORS.neutral[900];
  const outlineBorder = isDark ? colors.neutral[300] : COLORS.neutral[900];

  const approveEnabled = isEditable && canApprove && !isApproveDisabled;
  const returnEnabled = isEditable && canDecline;
  const endorseEnabled = isEditable && canEndorse;

  if (!canApprove && !returnEnabled && !endorseEnabled) {
    return null;
  }

  return (
    <View
      style={[
        sc.actionBar,
        {
          borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        },
      ]}
    >
      {/* ── Return Button ── */}
      {returnEnabled && (
        <Pressable
          style={[
            sc.actionBtnOutline,
            { backgroundColor: outlineBg, borderColor: outlineBorder, borderWidth: 1.5 },
            Platform.select({ web: { cursor: 'pointer' } as object }),
          ]}
          onPress={onReturn}
        >
          <Lucide name="rotate-ccw" size={14} color={outlineText} />
          <Text style={[sc.actionBtnOutlineText, { color: outlineText }]}>Return</Text>
        </Pressable>
      )}

      {/* ── Endorse Button ── */}
      {endorseEnabled && (
        <Pressable
          style={[
            sc.actionBtnOutline,
            {
              backgroundColor: outlineBg,
              borderColor: isDark ? colors.brand[400] : colors.brand[600],
              borderWidth: 1.5,
            },
            Platform.select({ web: { cursor: 'pointer' } as object }),
          ]}
          onPress={onEndorse}
        >
          <Lucide name="share-2" size={14} color={isDark ? colors.brand[400] : colors.brand[600]} />
          <Text
            style={[
              sc.actionBtnOutlineText,
              { color: isDark ? colors.brand[400] : colors.brand[600] },
            ]}
          >
            Endorse
          </Text>
        </Pressable>
      )}

      {/* ── Approve Button (Primary) ── */}
      {canApprove && (
        <Pressable
          style={[
            sc.actionBtnPrimary,
            {
              backgroundColor: approveEnabled ? primaryColor : disabledBg,
              borderColor: approveEnabled ? 'transparent' : disabledBorder,
              borderWidth: 1,
            },
            !approveEnabled && sc.actionBtnDisabled,
            Platform.select({
              web: { cursor: approveEnabled ? 'pointer' : 'not-allowed' } as object,
            }),
          ]}
          onPress={onApprove}
          disabled={!approveEnabled}
        >
          <Lucide
            name={approveIcon}
            size={15}
            color={approveEnabled ? COLORS.neutral.white : disabledText}
          />
          <Text
            style={[
              sc.actionBtnPrimaryText,
              { color: approveEnabled ? COLORS.neutral.white : disabledText },
            ]}
          >
            {approveLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const sc = StyleSheet.create({
  emptyScroll: { flex: 1 },
  emptyContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING[16], paddingVertical: SPACING[24] },
  summaryCard: { borderRadius: RADIUS.card, padding: SPACING[16], width: '100%', maxWidth: 500, marginBottom: SPACING[24] },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[10], marginBottom: SPACING[16], borderBottomWidth: 1, paddingBottom: SPACING[12] },
  summaryTitle: { flex: 1, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: TYPOGRAPHY.weights.bold },
  guideBox: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING[10], padding: SPACING[12], borderRadius: RADIUS.input },
  guideText: { flex: 1, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, lineHeight: 18 },
  actionPrompt: { alignItems: 'center', gap: SPACING[12] },
  emptyTitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'center' },
  emptySub: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 22 },
  panel: { flex: 1 },
  tabBarWrapper: { borderBottomWidth: 1 },
  tabBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING[16], height: 46 },
  tabScroll: { flexGrow: 0 },
  tabScrollContent: { flexDirection: 'row', paddingHorizontal: SPACING[16], alignItems: 'center', height: 46 },
  tabActionsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING[16], paddingVertical: SPACING[6], borderTopWidth: 1 },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING[12], paddingVertical: SPACING[8], position: 'relative', marginRight: SPACING[4] },
  tabText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.label, fontWeight: TYPOGRAPHY.weights.medium },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: 1 },
  tabSpacer: { flex: 1 },
  iconBtn: { padding: SPACING[8], borderRadius: RADIUS.button },
  endorsedBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING[8], paddingHorizontal: SPACING[16], paddingVertical: SPACING[10], borderBottomWidth: 1 },
  endorsedText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.label, flex: 1 },
  lockedBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING[8], paddingHorizontal: SPACING[16], paddingVertical: SPACING[10], borderBottomWidth: 1 },
  lockedText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.label, flex: 1 },
  readOnlyBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING[8], paddingHorizontal: SPACING[16], paddingVertical: SPACING[8] },
  readOnlyText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.label, flex: 1 },
  actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: SPACING[8], paddingHorizontal: SPACING[16], paddingVertical: SPACING[12], borderTopWidth: 1, flexWrap: 'wrap' },
  actionBtnPrimary: { flexDirection: 'row', alignItems: 'center', gap: SPACING[6], paddingHorizontal: SPACING[16], paddingVertical: SPACING[8], borderRadius: RADIUS.button },
  actionBtnPrimaryText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.body, fontWeight: TYPOGRAPHY.weights.semibold },
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', gap: SPACING[6], paddingHorizontal: SPACING[16], paddingVertical: SPACING[8], borderRadius: RADIUS.button },
  actionBtnOutlineText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.body, fontWeight: TYPOGRAPHY.weights.semibold },
  actionBtnDisabled: { opacity: 0.5 },
});
