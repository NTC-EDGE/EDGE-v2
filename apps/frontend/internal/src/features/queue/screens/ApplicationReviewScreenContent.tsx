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
  OfficialReceiptDto,
  parsePaymentBreakdown,
} from "@edge/api";
import { mapApplicationDtoToUI, isEvaluatorOrSupervisorRole } from "../data/applicationMapper";
import { ApproveModal } from "../components/modals/ApproveModal";
import { DeclineModal } from "../components/modals/DeclineModal";
import { EndorseModal, EndorsementSubmission } from "../components/modals/EndorseModal";
import { IssueReceiptModal } from "../../receipts/components/IssueReceiptModal";
import { IssueDocumentModal } from "../components/modals/IssueDocumentModal";
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
import { IssuedDocumentPrintModal } from "../components/modals/IssuedDocumentPrintModal";
import { DocumentPrintOptions } from "../types/documentPrintTypes";
import { ApplicationFormAttachment } from "../../../types/application";
import { ApplicationReviewSkeleton } from "../components/review/ApplicationReviewSkeleton";
import { ApplicationDetailsTab } from "../components/review/ApplicationDetailsTab";
import { ApplicantRecordTab } from "../components/review/ApplicantRecordTab";
import { SoaPaymentTab } from "../components/review/SoaPaymentTab";
import { InnerTab, INNER_TABS } from "../components/review/reviewTypes";
import {
  resolveUserIdentifiers,
  matchesUserIdentifier,
  computeOfficerEvaluationState,
  getApprovingEvaluator,
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
  const [showIssueDoc, setShowIssueDoc] = useState(false);
  const [showGenerateSoa, setShowGenerateSoa] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportPreviewInitialDoc, setReportPreviewInitialDoc] = useState<ReportDocumentType>("soa");
  const [previewCustomDoc, setPreviewCustomDoc] = useState<DocumentPreviewFile | null>(null);
  const [showIssuedPrintModal, setShowIssuedPrintModal] = useState(false);
  const [issuedPrintInitialOptions, setIssuedPrintInitialOptions] = useState<Partial<DocumentPrintOptions> | undefined>(undefined);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tabScrollRef = useRef<ScrollView>(null);

  const cashierTenantId = (selectedApplication?.tenantId || user?.tenantId || '');
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

    const effectiveRemarks = itemApp.payment?.remarks || itemApp.note || null;
    const parsedBreakdown = parsePaymentBreakdown(effectiveRemarks);

    const originalApplicantName =
      itemApp.applicantsList?.[selectedApplicantIndex]?.name ||
      itemApp.applicant ||
      itemApp.companyDetails?.name ||
      'Applicant';

    const effectivePayorName =
      parsedBreakdown?.payorName ||
      itemApp.payment?.payorName ||
      itemApp.payment?.checkName ||
      undefined;

    return {
      orderOfPaymentId: itemApp.payment?.orderOfPaymentId || itemApp.id,
      applicationId: itemApp.id,
      statementOfAccountId: itemApp.id,
      tenantId: itemApp.tenantId || user?.tenantId || '',
      opNumber: itemApp.payment?.opNumber || `OP-${refOrId}`,
      soaNumber: `SOA-${refOrId}`,
      applicationNumber: itemApp.applicationNumber || '',
      referenceNumber: itemApp.referenceNumber || '',
      applicantName: originalApplicantName,
      payorName: effectivePayorName,
      applicantType: itemApp.applicantType || 'Individual',
      serviceName: itemApp.serviceName || itemApp.permitTitle || itemApp.category || 'NTC Service',
      serviceCategory: itemApp.serviceCategory || itemApp.category || 'Licensing',
      amountDue: itemApp.totalAmountDue || itemApp.payment?.amountReceived || 0,
      billedAt: itemApp.createdAt || new Date().toISOString(),
      remarks: effectiveRemarks,
      lineItems,
      paymentMethod: itemApp.payment?.paymentMethod || (itemApp.payment?.method === 'check' ? 'Check' : 'Cash'),
      checkNumber: itemApp.payment?.checkNumber || undefined,
      checkBank: itemApp.payment?.checkBank || undefined,
      checkDate: itemApp.payment?.checkDate || undefined,
    };
  }, [selectedApplication, user?.tenantId, selectedApplicantIndex]);

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
    if (selectedApplication !== null) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const url = applicationService.getSoaPrintUrl(selectedApplication.id);
        const printWin = window.open(url, '_blank');
        if (printWin !== null) {
          printWin.focus();
          return;
        }
      }
      openPrintableDocumentWindow(generateSoaPrintableHtml(selectedApplication));
    }
  }, [selectedApplication]);

  const handlePrintOp = useCallback(() => {
    if (selectedApplication !== null) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const url = applicationService.getOpPrintUrl(selectedApplication.id);
        const printWin = window.open(url, '_blank');
        if (printWin !== null) {
          printWin.focus();
          return;
        }
      }
      openPrintableDocumentWindow(generateOpPrintableHtml(selectedApplication));
    }
  }, [selectedApplication]);

  const handlePreviewReport = useCallback((docType: ReportDocumentType) => {
    setReportPreviewInitialDoc(docType);
    setShowReportPreview(true);
  }, []);

  const handlePrintAccountableForm = useCallback((form?: ApplicationFormAttachment) => {
    let templateId: string | undefined;
    if (form?.name) {
      const nameLower = form.name.toLowerCase();
      if (nameLower.includes('101') || nameLower.includes('radio station') || nameLower.includes('rsl')) {
        templateId = 'NTC-FORM-101';
      } else if (nameLower.includes('102') || nameLower.includes('operator') || nameLower.includes('amateur')) {
        templateId = 'NTC-FORM-102';
      } else if (nameLower.includes('301') || nameLower.includes('permit') || nameLower.includes('registration')) {
        templateId = 'NTC-FORM-301';
      } else if (nameLower.includes('51') || nameLower.includes('receipt') || nameLower.includes('official receipt')) {
        templateId = 'AF-51';
      }
    }
    setIssuedPrintInitialOptions({
      outputMode: form?.section === 'ACCOUNTABLE FORM' ? 'accountable_form' : 'plain_paper',
      selectedTemplateId: templateId,
    });
    setShowIssuedPrintModal(true);
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
  const isReturned = app.status === "Returned";
  const isForAccountant = app.status === "ForAccountant";
  const isPendingPayment = app.status === "PendingPayment";
  const isForIssuance = app.status === "ForIssuance";

  const {
    isEvaluating,
    evaluatingOfficer,
    isEndorsed,
    isEndorsedToMe,
    isEndorsedAwayFromMe,
    isEvaluatedByMe,
    isEvaluatedByOther,
    currentStageOfficer,
    isStageClaimedByMe,
    isStageClaimedByOther,
    isStageUnclaimed,
  } = computeOfficerEvaluationState({
    application: app,
    identifiers: currentUserIdentifiers,
    isAdmin,
  });

  const isActivelyEvaluating = (isEvaluating || isReturned) && (isEvaluatedByMe || !isEvaluatedByOther || isEndorsedToMe);
  const isEditable = isActivelyEvaluating && !isEndorsedAwayFromMe && app.queueTab !== "history";

  // ── Workflow-aware action handlers ──────────────────────────────────────────

  /** Evaluator starts/resumes evaluation -> changes status from Submitted/Returned to Evaluating */
  const handleStartEvaluation = async () => {
    const isReturning = isReturned;
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'Evaluating',
      action: isReturning ? 'Evaluation Resumed' : 'Evaluating',
      staffName: officerName,
      staffRole: currentRole || 'Evaluator',
      remarks: isReturning ? `Evaluation resumed by ${officerName}.` : `Evaluation started by ${officerName}.`,
    });
    if (err !== null) {
      toast.error(isReturning ? 'Failed to resume evaluation.' : 'Failed to start evaluation.');
      return;
    }
    await updateApplication(app.id, {
      assignedTo: officerName,
    });
    toast.success(isReturning ? 'Evaluation resumed. Application status changed to Evaluating.' : 'Evaluation started. Application status changed to Evaluating.');
    await mutateApplications(app.id);
    await refetch();
  };

  /** Officer claims exclusive authority over this application at the current stage */
  const handleClaimAuthority = async () => {
    if (isSubmitted || isReturned) {
      void handleStartEvaluation();
      return;
    }

    let actionTitle = 'Review Started';
    let roleLabel = currentRole || 'Evaluator';
    let remarks = `Application authority claimed by ${officerName}.`;

    if (isForAccountant) {
      actionTitle = 'Financial Review Started';
      roleLabel = 'Accountant';
      remarks = `Financial review started by ${officerName}. Authority claimed.`;
    } else if (isPendingPayment) {
      actionTitle = 'Payment Verification Started';
      roleLabel = 'Cashier';
      remarks = `Payment verification started by ${officerName}. Authority claimed.`;
    } else if (isForIssuance) {
      actionTitle = 'Document Issuance Started';
      roleLabel = currentRole || 'Evaluator';
      remarks = `Document release process started by ${officerName}. Authority claimed.`;
    }

    const [, err] = await applicationService.updateStatus(app.id, {
      status: app.status,
      action: actionTitle,
      staffName: officerName,
      staffRole: roleLabel,
      remarks,
    });
    if (err !== null) {
      toast.error('Failed to claim application authority.');
      return;
    }
    await updateApplication(app.id, {
      assignedTo: officerName,
      ...(isForAccountant ? { accountingOfficer: officerName } : {}),
      ...(isPendingPayment ? { cashierOfficer: officerName } : {}),
      ...(isForIssuance ? { issuingOfficer: officerName } : {}),
      ...(isEvaluating || isSubmitted || isReturned ? { evaluatingOfficer: officerName } : {}),
    });
    toast.success(`Application authority claimed by ${officerName}. Actions unlocked.`);
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
    toast.success('Evaluation released.');
    await mutateApplications(app.id);
    await refetch();
  };

  /** Evaluator / Chief / Director → Approves evaluation, background advances to Accountant */
  const handleForwardToAccountant = async () => {
    const hasSoa = (app.soaItems && app.soaItems.length > 0) || (app.totalAmountDue !== undefined && app.totalAmountDue > 0);
    if (!hasSoa) {
      setShowApprove(false);
      toast.error('Generate SOA first before approving evaluation.');
      setInnerTab('soa');
      setShowGenerateSoa(true);
      return;
    }
    setShowApprove(false);
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'ForAccountant',
      action: isReturned ? 'Evaluation Re-submitted to Accountant' : 'Approved & Forwarded to Accountant',
      staffName: officerName,
      staffRole: currentRole || 'Evaluator',
      remarks: isReturned ? 'Evaluation re-submitted. Forwarded to Accountant.' : 'Evaluation approved. Forwarded to Accountant.',
    });
    if (err !== null) { toast.error('Failed to approve application.'); return; }
    toast.success(isReturned ? 'Evaluation re-submitted and forwarded to Accountant.' : 'Evaluation approved (Requirements & SOA). Forwarded to Accountant.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Accountant → Approves Application & SOA, background advances to PendingPayment and issues Order of Payment */
  const handleAccountantApprove = async () => {
    setShowApprove(false);
    const targetId = app.soaId || app.statementOfAccountId || app.id;
    const [, soaErr] = await applicationService.approveSoa(targetId, 'Application and SOA approved by Accountant. Order of Payment generated.');
    if (soaErr !== null) {
      const errMsg = typeof soaErr === 'object' && soaErr !== null && Reflect.has(soaErr, 'message')
        ? String(Reflect.get(soaErr, 'message'))
        : 'Please try again.';
      toast.error(`Approval failed: ${errMsg}`);
      return;
    }
    await updateApplication(app.id, {
      accountingOfficer: officerName,
    });
    toast.success('Application and SOA approved. Order of Payment generated.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Cashier → issues official receipt via IssueReceiptModal; backend advances to ForIssuance */
  const handleCashierReceiptSuccess = async (receipt?: OfficialReceiptDto) => {
    setShowCashier(false);
    toast.success('Official Receipt issued successfully. Application forwarded for document issuance.');
    if (receipt && receipt.officialReceiptNumber) {
      updateApplication(app.id, {
        status: 'ForIssuance',
        cashierOfficer: officerName,
        payment: {
          ...app.payment,
          orNumber: receipt.officialReceiptNumber,
          amountReceived: receipt.amount > 0 ? receipt.amount : app.payment.amountReceived,
          method: receipt.paymentMethod === 'Check' ? 'check' : 'cash',
          checkNumber: receipt.checkNumber ?? '',
          checkName: receipt.checkBank ?? '',
          paidAt: receipt.issuedAt,
        },
      });
    }
    await mutateApplications(app.id);
    await mutateNextOr();
    await refetch();
    onClose();
  };

  /** Return / decline — multi-tier return in background based on workflow stage or endorsement */
  const handleDecline = async (notice: string) => {
    const trimmedNotice = notice.trim();
    if (!trimmedNotice || trimmedNotice.length < 5) {
      toast.error('A return reason must be provided (minimum 5 characters).');
      return;
    }

    if (!canDeclineAction) {
      toast.warning('You do not have authority to return this application at this stage.');
      return;
    }
    setShowDecline(false);

    let targetStatus: ApplicationStatus = 'Returned';
    let successMessage = 'Application returned to applicant with notice.';
    let auditRemarks = `Notice of Discrepancy: ${trimmedNotice}`;
    let actionTitle = 'Returned with Notice';

    if (isEndorsedToMe && app.endorsedBy) {
      // Endorsed officer returns -> goes back to endorsing officer in current stage
      targetStatus = isPendingPayment ? 'PendingPayment' : isForAccountant ? 'ForAccountant' : 'Evaluating';
      successMessage = `Application returned to ${app.endorsedBy}.`;
      auditRemarks = `Returned by ${officerName} to ${app.endorsedBy}: ${trimmedNotice}`;
      actionTitle = `Returned to ${app.endorsedBy}`;
    } else if (app.status === 'ForIssuance') {
      // Issuing officer returns -> goes back to Evaluating
      targetStatus = 'Evaluating';
      successMessage = 'Application returned to Evaluator for document adjustments.';
      auditRemarks = `Returned by Issuance Officer to Evaluator: ${trimmedNotice}`;
      actionTitle = 'Returned to Evaluator';
    } else if (app.status === 'PendingPayment') {
      // Cashier returns -> goes back to Accountant (previous touch)
      targetStatus = 'ForAccountant';
      successMessage = 'Application returned to Accountant for SOA review.';
      auditRemarks = `Returned by Cashier to Accountant: ${trimmedNotice}`;
      actionTitle = 'Returned to Accountant';
    } else if (app.status === 'ForAccountant') {
      // Accountant returns -> goes back to Evaluator (previous touch) with status Returned
      const prevEvaluator = getApprovingEvaluator(app);
      targetStatus = 'Returned';
      successMessage = prevEvaluator
        ? `Application returned to ${prevEvaluator} for review.`
        : 'Application returned to Evaluator for review.';
      auditRemarks = prevEvaluator
        ? `Returned by Accountant to ${prevEvaluator}: ${trimmedNotice}`
        : `Returned by Accountant to Evaluator: ${trimmedNotice}`;
      actionTitle = prevEvaluator
        ? `Application Returned to ${prevEvaluator}`
        : 'Application Returned to Evaluator';
    } else {
      // Evaluator / Chief / Director returns -> goes back to Applicant
      targetStatus = 'Returned';
      successMessage = 'Application returned to applicant with notice.';
      auditRemarks = `Notice of Discrepancy: ${trimmedNotice}`;
      actionTitle = 'Returned with Notice';
    }

    const targetSoaId = app.soaId || app.statementOfAccountId;
    if (app.status === 'ForAccountant' && targetSoaId) {
      const [, soaErr] = await applicationService.returnSoa(targetSoaId, trimmedNotice);
      if (soaErr !== null) {
        const errMsg = typeof soaErr === 'object' && soaErr !== null && Reflect.has(soaErr, 'message')
          ? String(Reflect.get(soaErr, 'message'))
          : 'Please try again.';
        toast.error(`Failed to return SOA: ${errMsg}`);
        return;
      }
    } else {
      const [, err] = await applicationService.updateStatus(app.id, {
        status: targetStatus,
        action: actionTitle,
        staffName: officerName,
        staffRole: currentRole || 'Officer',
        remarks: auditRemarks,
      });
      if (err !== null) {
        const errMsg = typeof err === 'object' && err !== null && Reflect.has(err, 'message')
          ? String(Reflect.get(err, 'message'))
          : 'Please try again.';
        toast.error(`Failed to return application: ${errMsg}`);
        return;
      }
    }

    if (isEndorsedToMe && app.endorsedBy) {
      await updateApplication(app.id, {
        assignedTo: app.endorsedBy,
        ...(isPendingPayment ? { cashierOfficer: app.endorsedBy } : {}),
      });
    } else if (app.status === 'PendingPayment') {
      const prevAccountant = app.accountingOfficer;
      if (prevAccountant) {
        await updateApplication(app.id, {
          assignedTo: prevAccountant,
          accountingOfficer: prevAccountant,
        });
      }
    } else if (app.status === 'ForAccountant' || app.status === 'ForIssuance') {
      const prevEvaluator = getApprovingEvaluator(app);
      if (prevEvaluator) {
        await updateApplication(app.id, {
          assignedTo: prevEvaluator,
        });
      }
    }
    toast.success(successMessage);
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Endorse to a specific person/officer for review */
  const handleEndorse = async (submission: EndorsementSubmission) => {
    setShowEndorse(false);
    const { person, notes } = submission;
    const notesSuffix = notes && notes.trim().length > 0 ? ` Instructions: ${notes.trim()}` : '';
    const roleLabel = person.position || person.role || (isPendingPayment ? 'Cashier' : 'Evaluator');
    const remarks = `Application endorsed to ${person.name} (${roleLabel}) by ${officerName}.${notesSuffix}`;

    const targetStatus = isPendingPayment ? 'PendingPayment' : isForAccountant ? 'ForAccountant' : 'Evaluating';

    const [, err] = await applicationService.updateStatus(app.id, {
      status: targetStatus,
      action: `Endorsed to ${person.name}`,
      staffName: officerName,
      staffRole: currentRole || (isPendingPayment ? 'Cashier' : 'Evaluating Officer'),
      remarks,
    });
    if (err !== null) {
      toast.error('Failed to endorse application.');
      return;
    }
    await updateApplication(app.id, {
      assignedTo: person.name,
      ...(isPendingPayment ? { cashierOfficer: person.name } : {}),
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
  const isPaymentSubmitted = Boolean(
    (app.payment && (app.payment.amountReceived > 0 || app.payment.orNumber.trim().length > 0 || (app.payment.checkNumber && app.payment.checkNumber.trim().length > 0))) ||
    (app.note && (app.note.toLowerCase().includes('payment submitted') || app.note.toLowerCase().includes('ref:'))) ||
    (() => {
      if (!app.history || app.history.length === 0) return false;
      const paymentIdx = app.history.findIndex(h => h.action.toLowerCase().includes('payment submitted') || h.action.toLowerCase().includes('submit payment'));
      if (paymentIdx === -1) return false;
      const resetIdx = app.history.findIndex(h => h.action.toLowerCase().includes('returned') || h.action.toLowerCase().includes('soa approved by accountant'));
      if (resetIdx !== -1 && resetIdx < paymentIdx) return false;
      return true;
    })()
  );
  const canActAsAccountant = currentRole === 'Accountant' || canApproveAsAccountant || isAdmin;
  const canActAsCashier = currentRole === 'Cashier' || canVerifyCashier || isAdmin;
  const canActAsReleasing = isEvaluatorOrSupervisorRole(currentRole) || isAdmin;

  /** Claim button for unclaimed stages */
  const showClaimBtn = !isEndorsedAwayFromMe && !isStageClaimedByOther && (
    showStartEvalBtn ||
    ((isEvaluating || isReturned) && isStageUnclaimed && (isEvaluatorOrSupervisorRole(currentRole) || isAdmin)) ||
    (isForAccountant && isStageUnclaimed && canActAsAccountant) ||
    (isPendingPayment && isStageUnclaimed && canActAsCashier)
  );

  /** Show Cashier-specific payment verify button */
  const showCashierBtn = isPendingPayment && !isEndorsedAwayFromMe && canActAsCashier && isStageClaimedByMe;
  /** Show Accountant-specific SOA approve button */
  const showAccountantBtn = isForAccountant && !isEndorsedAwayFromMe && canActAsAccountant && isStageClaimedByMe;
  /** Show Issuing Officer document issue button (Available to all regional Evaluators, Chief of EOD, Regional Director, and Admin) */
  const showIssueBtn = isForIssuance && !isEndorsedAwayFromMe && canActAsReleasing;
  /** Show Evaluator forward-to-accountant button (Only if actively evaluating and current evaluator or endorsed officer) */
  const showForwardBtn = (isEvaluating || isReturned) && isStageClaimedByMe && !isEndorsedAwayFromMe;

  const hasSoa = (app.soaItems && app.soaItems.length > 0) || (app.totalAmountDue !== undefined && app.totalAmountDue > 0);

  let approveButtonLabel = 'Approve';
  let approveButtonIcon: 'check-circle' | 'credit-card' | 'play-circle' = 'check-circle';

  if (showClaimBtn) {
    approveButtonLabel = showStartEvalBtn ? 'Start Evaluation' : isReturned ? 'Resume Evaluation' : 'Take Application';
    approveButtonIcon = 'play-circle';
  } else if (showCashierBtn) {
    approveButtonLabel = isPaymentSubmitted ? 'Verify & Issue OR' : 'Issue Official Receipt';
    approveButtonIcon = 'credit-card';
  } else if (showAccountantBtn) {
    approveButtonLabel = 'Approve & Issue OP';
    approveButtonIcon = 'check-circle';
  } else if (showIssueBtn) {
    approveButtonLabel = 'Release Document';
    approveButtonIcon = 'check-circle';
  } else if (showForwardBtn) {
    if (!hasSoa) {
      approveButtonLabel = 'Generate SOA';
      approveButtonIcon = 'play-circle';
    } else {
      approveButtonLabel = 'Approve & Forward';
      approveButtonIcon = 'check-circle';
    }
  }

  // Primary action button (Approve / Start Evaluation / Take Application / Verify Payment / Approve SOA / Issue Document)
  const canApproveAction = !isEndorsedAwayFromMe && (
    (isForIssuance && canActAsReleasing) ||
    (!isStageClaimedByOther && (showClaimBtn || showCashierBtn || showAccountantBtn || showForwardBtn || showIssueBtn))
  );

  // Return button: Enabled for authorized officers reviewing an application across workflow stages.
  // Enforces the rule: "No one can transact an application without taking/claiming it first".
  // The Return button is ONLY enabled once the officer has claimed authority (or started evaluation).
  // On unclaimed applications (showClaimBtn is true), only Start Evaluation / Take Application is enabled.
  const canDeclineAction = !isEndorsedAwayFromMe && (
    (isForIssuance && canActAsReleasing) ||
    (!isStageClaimedByOther && !showClaimBtn && (
      ((isEvaluating || isReturned) && isStageClaimedByMe) ||
      (isForAccountant && canActAsAccountant && isStageClaimedByMe) ||
      (isPendingPayment && canActAsCashier && isStageClaimedByMe)
    ))
  );

  const showReturnBtn = canDecline && !isEndorsedAwayFromMe && app.queueTab !== "history" && (
    (isForIssuance && canActAsReleasing) || !isStageClaimedByOther
  );
  const isReturnDisabled = !canDeclineAction;

  // Endorse button: Available when actively evaluating, or when Cashier is reviewing in PendingPayment
  const canEndorseAction =
    canEndorse &&
    !isEndorsedAwayFromMe &&
    !isStageClaimedByOther &&
    (
      isActivelyEvaluating ||
      (isPendingPayment && canActAsCashier && isStageClaimedByMe)
    );

  const handlePrimaryAction = () => {
    if (showClaimBtn) {
      void handleClaimAuthority();
    } else if (showCashierBtn) {
      if (!isPaymentSubmitted) {
        toast.warning("Awaiting client payment. Cannot issue OR until payment is made.");
        return;
      }
      setShowCashier(true);
    } else if (showIssueBtn) {
      setShowIssueDoc(true);
    } else if (showForwardBtn) {
      if (!hasSoa) {
        toast.info("Please generate SOA to approve evaluation.");
        setInnerTab("soa");
        setShowGenerateSoa(true);
        return;
      }
      setShowApprove(true);
    } else if (showAccountantBtn) {
      setShowApprove(true);
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
              <Pressable
                style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]}
                onPress={() => handlePrintAccountableForm()}
                accessibilityLabel="Print Document or Accountable Form"
              >
                <Lucide name="printer" size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </Pressable>
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
            <Pressable
              style={[sc.iconBtn, { marginRight: 4 }, Platform.select({ web: { cursor: "pointer" } as object })]}
              onPress={() => handlePrintAccountableForm()}
              accessibilityLabel="Print Document or Accountable Form"
            >
              <Lucide name="printer" size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
            </Pressable>
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
            Endorsed to <Text style={{ fontWeight: '700' }}>{app.endorsedTo}</Text>{app.endorsedBy ? ` by ${app.endorsedBy}` : ''}. Actions restricted to endorsed officer.
          </Text>
        </View>
      )}

      {/* Endorsed to me banner */}
      {isEndorsedToMe && (
        <View style={[sc.endorsedBanner, { backgroundColor: isDark ? '#14532D' : '#F0FDF4', borderBottomColor: isDark ? '#15803D' : '#BBF7D0' }]}>
          <Lucide name="share-2" size={14} color={isDark ? '#4ADE80' : '#16A34A'} />
          <Text style={[sc.endorsedText, { color: isDark ? '#DCFCE7' : '#14532D' }]}>
            Endorsed to you{app.endorsedBy ? ` by ${app.endorsedBy}` : ''}{isPendingPayment ? ' for payment verification.' : ' for evaluation.'}
          </Text>
        </View>
      )}

      {/* Ready for document release banner for ForIssuance */}
      {!isEndorsedAwayFromMe && isForIssuance && canActAsReleasing && (
        <View style={[sc.endorsedBanner, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderBottomColor: isDark ? '#047857' : '#A7F3D0' }]}>
          <Lucide name="award" size={14} color={isDark ? '#6EE7B7' : '#059669'} />
          <Text style={[sc.endorsedText, { color: isDark ? '#D1FAE5' : '#065F46' }]}>
            Application is verified and awaiting release. Click <Text style={{ fontWeight: '700' }}>"Release Document"</Text> to generate control numbers and issue document.
          </Text>
        </View>
      )}

      {/* Locked / Under Review by another officer banner */}
      {!isEndorsedAwayFromMe && !isEndorsedToMe && !isForIssuance && (isEvaluatedByOther || isStageClaimedByOther) && (
        <View style={[sc.lockedBanner, { backgroundColor: isDark ? '#3E2415' : '#FEF3C7', borderBottomColor: isDark ? '#B45309' : '#F59E0B' }]}>
          <Lucide name="lock" size={14} color={isDark ? '#FBBF24' : '#D97706'} />
          <Text style={[sc.lockedText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
            Under {isForAccountant ? 'financial review' : isPendingPayment ? 'payment processing' : 'evaluation'} by{' '}
            <Text style={{ fontWeight: '700' }}>{currentStageOfficer || evaluatingOfficer || 'another officer'}</Text>. Actions locked.
          </Text>
        </View>
      )}

      {/* Awaiting evaluation or authority claim banner for applications in queue */}
      {!isEndorsedAwayFromMe && isStageUnclaimed && !isForIssuance && (
        <View style={[sc.endorsedBanner, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderBottomColor: isDark ? '#334155' : '#BFDBFE' }]}>
          <Lucide name="play-circle" size={14} color={isDark ? '#93C5FD' : '#2563EB'} />
          <Text style={[sc.endorsedText, { color: isDark ? '#DBEAFE' : '#1E40AF' }]}>
            Application is in queue. Click <Text style={{ fontWeight: '700' }}>{isSubmitted ? '"Start Evaluation"' : '"Take Application"'}</Text> to claim authority and begin {isForAccountant ? 'financial review' : isPendingPayment ? 'payment verification' : 'evaluation'}.
          </Text>
        </View>
      )}

      {/* Read-only banner */}
      {!isEditable && !isEndorsedAwayFromMe && !isStageUnclaimed && !isEvaluatedByOther && !isStageClaimedByOther && app.queueTab === 'history' && (
        <View style={[sc.readOnlyBanner, { backgroundColor: colors.brand.yellowLight }]}>
          <Lucide name="lock" size={12} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
          <Text style={[sc.readOnlyText, { color: COLORS.semantic.warningText }]}>
            Read-only (Processed / History)
          </Text>
        </View>
      )}

      {/* Returned application notice banner */}
      {app.status === 'Returned' && (
        <View style={[sc.lockedBanner, { backgroundColor: isDark ? '#3F1A1A' : '#FEF2F2', borderBottomColor: isDark ? '#991B1B' : '#F87171' }]}>
          <Lucide name="rotate-ccw" size={14} color={isDark ? '#F87171' : '#DC2626'} />
          <Text style={[sc.lockedText, { color: isDark ? '#FECACA' : '#991B1B' }]}>
            Returned Application Notice: <Text style={{ fontWeight: '700' }}>{app.note || 'Returned to applicant with notice of discrepancy.'}</Text>
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
          onPrintAccountableForm={handlePrintAccountableForm}
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
          onPreviewReport={handlePreviewReport}
        />
      )}

      {/* ── Bottom Action Bar ── */}
      <WorkflowActionBar
        isEditable={isEditable}
        isDark={isDark}
        colors={colors}
        canApprove={canApproveAction}
        canDecline={showReturnBtn}
        canEndorse={canEndorseAction}
        isApproveDisabled={
          (showForwardBtn && hasIncompleteApplicants)
        }
        isReturnDisabled={isReturnDisabled}
        approveLabel={approveButtonLabel}
        approveIcon={approveButtonIcon}
        isCompleted={app.status === 'Completed' || app.status === 'Approved' || app.queueTab === 'history'}
        onApprove={handlePrimaryAction}
        onReturn={() => setShowDecline(true)}
        onEndorse={() => setShowEndorse(true)}
        onPrintAccountableForm={() => handlePrintAccountableForm()}
        onPrintSoa={() => handlePreviewReport('soa')}
      />

      {/* ── Modals ── */}
      <CustomDocPreviewModal previewCustomDoc={previewCustomDoc} onClose={handleClosePreviewDoc} />

      {/* ApproveModal is reused for evaluation and accountant approval */}
      <ApproveModal
        visible={showApprove}
        applicantName={app.applicant}
        title={
          showAccountantBtn
            ? "Approve Application & Issue Order of Payment"
            : showForwardBtn
              ? "Approve Evaluation & Forward to Accountant"
              : "Approve Application"
        }
        confirmText={
          showAccountantBtn
            ? "Approve & Issue OP"
            : showForwardBtn
              ? "Approve & Forward"
              : "Approve"
        }
        subtitleText={
          showAccountantBtn
            ? `Confirm financial review and issue official Order of Payment for ${app.applicant}.`
            : showForwardBtn
              ? `Approve application requirements and SOA fee calculations for ${app.applicant}, then forward to Accountant.`
              : undefined
        }
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
      <IssueDocumentModal
        visible={showIssueDoc}
        app={app}
        currentOfficerName={officerName}
        onClose={() => setShowIssueDoc(false)}
        onSuccess={async () => {
          await updateApplication(app.id, {
            issuingOfficer: officerName,
            status: 'Completed',
          });
          await mutateApplications(app.id);
          await refetch();
          onClose();
        }}
      />
      <GenerateSoaModal visible={showGenerateSoa} app={app} onClose={() => setShowGenerateSoa(false)} onSuccess={async () => { await mutateApplications(app.id); await refetch(); }} />
      <SoaReportPreviewModal visible={showReportPreview} app={app} initialDocType={reportPreviewInitialDoc} onClose={() => setShowReportPreview(false)} onOpenGenerateSoa={() => setShowGenerateSoa(true)} />
      <IssuedDocumentPrintModal
        visible={showIssuedPrintModal}
        app={app}
        initialOptions={issuedPrintInitialOptions}
        onClose={() => setShowIssuedPrintModal(false)}
      />
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
  isReturnDisabled?: boolean;
  approveLabel: string;
  approveIcon: 'check-circle' | 'credit-card' | 'play-circle';
  isCompleted?: boolean;
  onApprove: () => void;
  onReturn: () => void;
  onEndorse: () => void;
  onPrintAccountableForm?: () => void;
  onPrintSoa?: () => void;
}

function WorkflowActionBar({
  isEditable,
  isDark,
  colors,
  canApprove,
  canDecline,
  canEndorse,
  isApproveDisabled,
  isReturnDisabled = false,
  approveLabel,
  approveIcon,
  isCompleted = false,
  onApprove,
  onReturn,
  onEndorse,
  onPrintAccountableForm,
  onPrintSoa,
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

  const isClaimOrSpecial = approveIcon === 'play-circle' || approveLabel.includes('Start') || approveLabel.includes('Take') || approveLabel.includes('Verify') || approveLabel.includes('Issue') || approveLabel.includes('Approve');
  const approveEnabled = canApprove && !isApproveDisabled && (isEditable || isClaimOrSpecial);
  const returnEnabled = canDecline && !isReturnDisabled;
  const endorseEnabled = canEndorse;

  if (!canApprove && !canDecline && !endorseEnabled) {
    if (isCompleted) {
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
          {onPrintSoa !== undefined && (
            <Pressable
              style={[
                sc.actionBtnOutline,
                {
                  backgroundColor: outlineBg,
                  borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                  borderWidth: 1.5,
                },
                Platform.select({ web: { cursor: 'pointer' } as object }),
              ]}
              onPress={onPrintSoa}
            >
              <Lucide name="file-text" size={14} color={isDark ? colors.neutral[300] : colors.neutral[700]} />
              <Text style={[sc.actionBtnOutlineText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                View Application Reports
              </Text>
            </Pressable>
          )}

          {onPrintAccountableForm !== undefined && (
            <Pressable
              style={[
                sc.actionBtnPrimary,
                {
                  backgroundColor: isDark ? colors.brand[600] : colors.brand[700],
                  borderColor: 'transparent',
                  borderWidth: 1,
                },
                Platform.select({ web: { cursor: 'pointer' } as object }),
              ]}
              onPress={onPrintAccountableForm}
            >
              <Lucide name="printer" size={15} color={COLORS.neutral.white} />
              <Text style={[sc.actionBtnPrimaryText, { color: COLORS.neutral.white }]}>
                Re-print Accountable Form
              </Text>
            </Pressable>
          )}
        </View>
      );
    }
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
      {canDecline && (
        <Pressable
          style={[
            sc.actionBtnOutline,
            {
              backgroundColor: returnEnabled ? outlineBg : disabledBg,
              borderColor: returnEnabled ? outlineBorder : disabledBorder,
              borderWidth: 1.5,
              opacity: returnEnabled ? 1 : 0.5,
            },
            !returnEnabled && sc.actionBtnDisabled,
            Platform.select({ web: { cursor: returnEnabled ? 'pointer' : 'not-allowed' } as object }),
          ]}
          onPress={returnEnabled ? onReturn : undefined}
          disabled={!returnEnabled}
        >
          <Lucide name="rotate-ccw" size={14} color={returnEnabled ? outlineText : disabledText} />
          <Text style={[sc.actionBtnOutlineText, { color: returnEnabled ? outlineText : disabledText }]}>Return</Text>
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
