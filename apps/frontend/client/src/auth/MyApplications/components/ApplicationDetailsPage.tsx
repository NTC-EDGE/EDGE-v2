import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Text, useWindowDimensions } from 'react-native';
import { Icon, SPACING, TYPOGRAPHY } from '@edge/ui';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@clerk/expo';
import { apiClient } from '@edge/api';
import {
  ApiApplicationDto,
  ApplicationDocument,
  BulkApplicant,
  RawRequirement,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  mapApiApplicationToApplication,
} from '../data/applicationsData';
import {
  ApplicationDetailsPageProps,
  safeGetStatusColor,
  safeGetStatusBgColor,
} from './applicationDetails/applicationDetailsTypes';
import { styles } from './applicationDetails/applicationDetailsStyles';
import { useApplicationDetailsData } from './applicationDetails/useApplicationDetailsData';
import { useSelectedBulkApplicant } from './applicationDetails/useSelectedBulkApplicant';
import { ApplicationHeaderCard } from './applicationDetails/ApplicationHeaderCard';
import { ApplicationProgressStepper } from './applicationDetails/ApplicationProgressStepper';
import { BulkApplicantsSection } from './applicationDetails/BulkApplicantsSection';
import { SingleApplicantSection } from './applicationDetails/SingleApplicantSection';
import { DocumentPreviewSection } from './applicationDetails/DocumentPreviewSection';
import { CustomDocPreviewModal } from './applicationDetails/CustomDocPreviewModal';
import { ClientBillingNoticeCard } from './applicationDetails/ClientBillingNoticeCard';
import { ClientPaymentSubmissionModal } from './applicationDetails/ClientPaymentSubmissionModal';
import { ClientSoaOpPreviewModal, ClientReportTab } from './applicationDetails/ClientSoaOpPreviewModal';
import { DocumentPreviewFile } from '../../../shared/components/DocumentPreviewModal';
import { useApi } from '../../../shared/hooks/useApi';
import { useToast, extractApiErrorMessage } from '../../../shared/components/Toast';
import { ConvertToRealModal } from './applicationDetails/ConvertToRealModal';
import { isEligibleForRenewal, getRenewalDaysRemaining } from '../data/applicationsData';
import { ReassessmentModal } from './applicationDetails/ReassessmentModal';
import { EditReturnedApplicationModal } from './applicationDetails/EditReturnedApplicationModal';
import { resolveApplicationTenantId, isGuid } from '../../../shared/helpers/tenantHelper';
import { openApplicationDetail } from '../../../shared/helpers/applicationNavigationHelper';
import { resolveFileFromUpload } from '../../Services/shared/helpers/requirementUploadHelper';

interface SingleApplicationResponse {
  succeeded?: boolean;
  data?: ApiApplicationDto;
  message?: string;
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

const TABLE_PAGE_SIZE = 6;

export { ApplicationDetailsPageProps };

export function ApplicationDetailsPage({
  app: initialApp,
  onBack,
  onRenew,
  onDownloadDoc,
}: ApplicationDetailsPageProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 992;
  const api = useApi();
  const { getToken } = useAuth();
  const toast = useToast();

  const [appState, setAppState] = useState(initialApp);
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [soaOpModalVisible, setSoaOpModalVisible] = useState(false);
  const [soaOpInitialTab, setSoaOpInitialTab] = useState<ClientReportTab>('soa');
  const [isConvertToRealModalOpen, setIsConvertToRealModalOpen] = useState(false);
  const [isReassessmentModalOpen, setIsReassessmentModalOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [isEditReturnedModalOpen, setIsEditReturnedModalOpen] = useState(false);

  useEffect(() => {
    setAppState(initialApp);
    setSelectedApplicant(null);
    setTablePage(1);
  }, [initialApp.id]);

  const {
    app,
    isBulk,
    isExamService,
    appApplicants,
    totalSubmitted,
    approvedCount,
    declinedCount,
    pendingCount,
    docs,
    primaryName,
    singleApplicant,
    resolvedServiceVariant,
    applicationTypeLabel,
    elementsLabel,
    formFieldValues,
    currentStepIndex,
    isAssessmentOnly,
    variantLabel,
    scheduleSummaryText,
    refetch,
  } = useApplicationDetailsData(appState);

  const filteredApplicants = useMemo(() => {
    if (!tableSearch.trim()) return appApplicants;
    const q = tableSearch.toLowerCase().trim();
    return appApplicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.applicationType.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
    );
  }, [appApplicants, tableSearch]);

  const totalPages = Math.ceil(filteredApplicants.length / TABLE_PAGE_SIZE) || 1;
  const pagedApplicants = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return filteredApplicants.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredApplicants, tablePage]);

  const [selectedApplicant, setSelectedApplicant] = useState<BulkApplicant | null>(null);
  const effectiveSelectedApplicant = selectedApplicant || (appApplicants.length > 0 ? appApplicants[0] : null);

  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);
  const [previewCustomDoc, setPreviewCustomDoc] = useState<DocumentPreviewFile | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const handlePreviewDoc = (doc: ApplicationDocument | null) => {
    if (doc) {
      const lowerName = doc.name.toLowerCase();
      const isSoa = doc.category === 'SOA' || lowerName.includes('soa') || lowerName.includes('statement');
      const isOr = lowerName.includes('official receipt') || lowerName.includes('or_') || (doc.category === 'RECEIPT' && !lowerName.includes('order of payment') && !lowerName.includes('op'));
      const isOp = lowerName.includes('order of payment') || lowerName.includes('op') || doc.category === 'RECEIPT';
      if (isSoa) {
        setSoaOpInitialTab('soa');
        setSoaOpModalVisible(true);
        return;
      }
      if (isOr) {
        setSoaOpInitialTab('or');
        setSoaOpModalVisible(true);
        return;
      }
      if (isOp) {
        setSoaOpInitialTab('op');
        setSoaOpModalVisible(true);
        return;
      }
    }
    setPreviewDoc(doc);
  };

  const { selectedApplicantFormFields, selectedApplicantDocs } = useSelectedBulkApplicant(
    app,
    effectiveSelectedApplicant
  );

  const statusBg = useMemo(
    () => safeGetStatusBgColor(app.status, getStatusBgColor),
    [app.status]
  );
  const statusColor = useMemo(
    () => safeGetStatusColor(app.status, getStatusColor),
    [app.status]
  );

  const handleSetPreviewCustomDoc = (doc: DocumentPreviewFile | null) => {
    setPreviewCustomDoc(doc);
  };

  const handleConvertToReal = async () => {
    if (!app.id) return;
    setIsConverting(true);
    try {
      const convertRes = await api.post<unknown>(`/api/v2/applications/${app.id}/convert-to-real`, {});
      const resObj = isRecord(convertRes) ? convertRes : {};
      if (resObj.succeeded === false) {
        const failMsg =
          typeof resObj.message === 'string' && resObj.message.length > 0
            ? resObj.message
            : 'Failed to create official application.';
        toast.error('Submission Failed', failMsg);
        return;
      }

      const newAppId =
        typeof resObj.data === 'string' && resObj.data.trim() !== ''
          ? resObj.data.trim()
          : null;

      toast.success(
        'Official Application Created',
        'A new official application has been created and submitted for evaluation while preserving your pre-assessment record.'
      );
      setIsConvertToRealModalOpen(false);

      if (newAppId !== null && newAppId !== app.id) {
        try {
          const detailRes = await api.get<SingleApplicationResponse>(`/api/v2/applications/${newAppId}`);
          if (detailRes !== null && detailRes.succeeded === true && detailRes.data !== undefined) {
            const mappedNewApp = mapApiApplicationToApplication(detailRes.data);
            setAppState(mappedNewApp);
          }
        } catch {
          // openApplicationDetail below will navigate to the new application
        }
        openApplicationDetail(newAppId);
      } else {
        setAppState((prev) => ({
          ...prev,
          convertedToRegularAt: new Date().toISOString(),
          hasActiveRenewal: true,
        }));
        refetch();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message.length > 0
          ? err.message
          : 'Failed to create official application.';
      toast.error('Submission Failed', message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleRequestReassessment = async (remarks: string) => {
    if (!app.id) return;
    setIsReprocessing(true);
    try {
      await api.post(`/api/v2/applications/${app.id}/reprocess-assessment`, { remarks });
      toast.success(
        'Re-assessment Requested',
        'Your re-assessment request has been submitted to the evaluator.'
      );
      setIsReassessmentModalOpen(false);
      setAppState((prev) => ({
        ...prev,
        status: 'FOR_EVALUATION',
        remarks: `Re-assessment requested: ${remarks}`,
      }));
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message.length > 0
          ? err.message
          : 'Failed to submit re-assessment request.';
      toast.error('Request Failed', message);
      throw err;
    } finally {
      setIsReprocessing(false);
    }
  };

  const isReturnedForCorrection =
    app.status === 'DECLINED' ||
    (typeof app.rawStatus === 'string' && app.rawStatus.toLowerCase().includes('return'));

  const handleUploadRequirement = async (doc: ApplicationDocument, matchedReq?: RawRequirement) => {
    if (!app.id || uploadingDocId !== null) return;

    const tenantId = resolveApplicationTenantId(app);
    if (!tenantId) {
      toast.error('Upload Failed', 'Unable to determine regional office context for this application.');
      return;
    }

    try {
      const pickerRes = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (pickerRes.canceled || !pickerRes.assets || pickerRes.assets.length === 0) {
        return;
      }

      const asset = pickerRes.assets[0];
      if (!asset) return;

      setUploadingDocId(doc.id);

      const rawWebFile = 'file' in asset && asset.file instanceof Blob ? asset.file : undefined;
      const fileName = asset.name || (doc.name && doc.name.trim() !== '' ? doc.name : `requirement_${Date.now()}.pdf`);
      const mimeType = (typeof asset.mimeType === 'string' && asset.mimeType) || rawWebFile?.type || undefined;

      const resolvedFile =
        rawWebFile ??
        (await resolveFileFromUpload({
          name: fileName,
          uri: asset.uri,
          type: mimeType,
        }));

      if (!resolvedFile) {
        toast.error('Upload Failed', `Could not read selected file "${fileName}".`);
        return;
      }

      let authHeaders: Record<string, string> = {};
      try {
        const token = await getToken();
        if (token && token.trim() !== '') {
          authHeaders = { Authorization: `Bearer ${token}` };
        }
      } catch {
        // ignore
      }

      const formData = new FormData();
      formData.append('file', resolvedFile, fileName);
      formData.append('category', 'requirements');

      const uploadRes = await apiClient.post<unknown>(
        `/api/v2/tenants/${tenantId}/storage/upload`,
        formData,
        {
          headers: {
            ...authHeaders,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );

      const uploadResObj = isRecord(uploadRes.data) ? uploadRes.data : {};
      const uploadPayload =
        uploadResObj.succeeded === true && isRecord(uploadResObj.data)
          ? uploadResObj.data
          : uploadResObj;
      const storedFileId = typeof uploadPayload.id === 'string' && uploadPayload.id.trim() !== ''
        ? uploadPayload.id.trim()
        : null;

      if (!storedFileId) {
        toast.error('Upload Failed', 'Storage service did not return a file identifier.');
        return;
      }

      const targetApplicantId =
        doc.applicantId ||
        matchedReq?.applicantId ||
        (isBulk ? effectiveSelectedApplicant?.id : undefined) ||
        app.applicants?.[0]?.id ||
        app.Applicants?.[0]?.id ||
        app.id;

      let reqId = isGuid(doc.requirementId)
        ? doc.requirementId
        : isGuid(matchedReq?.requirementId)
          ? matchedReq?.requirementId
          : undefined;
      let svrId = isGuid(doc.serviceVariantRequirementId)
        ? doc.serviceVariantRequirementId
        : isGuid(matchedReq?.serviceVariantRequirementId)
          ? matchedReq?.serviceVariantRequirementId
          : undefined;

      if (!reqId && !svrId && isGuid(doc.id)) {
        reqId = doc.id;
      }

      if (!reqId && !svrId) {
        try {
          const liveReqRes = await api.get<unknown>(`/api/v2/applications/${app.id}/applicants/${targetApplicantId}/requirements`);
          const liveObj = isRecord(liveReqRes) ? liveReqRes : {};
          const liveList = liveObj.succeeded === true && Array.isArray(liveObj.data) ? liveObj.data : [];
          const docLabelLower = (doc.requirementName || doc.name || '').trim().toLowerCase();
          const foundLive = liveList.find((item: unknown) => {
            if (!isRecord(item)) return false;
            const rName = typeof item.requirementName === 'string' ? item.requirementName.trim().toLowerCase() : '';
            const fName = typeof item.fileName === 'string' ? item.fileName.trim().toLowerCase() : '';
            return (docLabelLower !== '' && (rName === docLabelLower || fName === docLabelLower));
          });
          if (isRecord(foundLive)) {
            if (typeof foundLive.requirementId === 'string' && isGuid(foundLive.requirementId)) {
              reqId = foundLive.requirementId;
            }
            if (typeof foundLive.serviceVariantRequirementId === 'string' && isGuid(foundLive.serviceVariantRequirementId)) {
              svrId = foundLive.serviceVariantRequirementId;
            }
          }
        } catch {
          // fallback handled below
        }
      }

      const body: Record<string, unknown> = { storedFileId };
      if (svrId) body.serviceVariantRequirementId = svrId;
      if (reqId) body.requirementId = reqId;

      const linkRes = await api.post<unknown>(
        `/api/v2/applications/${app.id}/applicants/${targetApplicantId}/requirements`,
        body
      );
      const linkObj = isRecord(linkRes) ? linkRes : {};
      if (linkObj.succeeded === false) {
        const msg = typeof linkObj.message === 'string' ? linkObj.message : 'Failed to link uploaded requirement document.';
        toast.error('Attachment Link Failed', msg);
        return;
      }

      toast.success('Document Updated', `"${fileName}" has been uploaded and attached.`);
      refetch();
    } catch (err: unknown) {
      toast.error('Upload Failed', extractApiErrorMessage(err) || 'Could not upload the selected document.');
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleOpenEditReturnedModal = () => {
    setIsEditReturnedModalOpen(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View
        style={[
          styles.mainWrapper,
          {
            paddingHorizontal: isDesktop ? SPACING[32] : SPACING[16],
            width: '100%',
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="arrow-left" size={18} color="#1D4ED8" />
          <Text style={styles.backBtnText}>Back to My Applications</Text>
        </TouchableOpacity>

        <ApplicationHeaderCard
          app={app}
          isBulk={isBulk}
          isDesktop={isDesktop}
          appApplicantsCount={appApplicants.length}
          statusBg={statusBg}
          statusColor={statusColor}
          resolvedServiceVariant={resolvedServiceVariant}
          applicationType={applicationTypeLabel}
          elements={elementsLabel}
          primaryName={primaryName}
          docsCount={docs.length}
        />

        {/* Active Renewal or Proceeded Official Application Banner */}
        {app.hasActiveRenewal && (
          <View
            style={{
              backgroundColor: '#EFF6FF',
              borderColor: '#60A5FA',
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              flexDirection: isDesktop ? 'row' : 'column',
              alignItems: isDesktop ? 'center' : 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <Icon name={isAssessmentOnly ? 'check-circle' : 'refresh-cw'} size={20} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E40AF' }}>
                  {isAssessmentOnly ? 'Official Application Submitted' : 'Renewal Application in Progress'}
                </Text>
                <Text style={{ fontSize: 13, color: '#1E3A8A', marginTop: 2 }}>
                  {isAssessmentOnly
                    ? `An official application has been created from this pre-assessment (Reference #${app.activeRenewalReferenceNumber ?? 'N/A'}).`
                    : `A renewal application has been filed for this license (Reference #${app.activeRenewalReferenceNumber ?? 'N/A'}).`}
                </Text>
              </View>
            </View>
            {app.activeRenewalApplicationId ? (
              <TouchableOpacity
                onPress={() => {
                  if (app.activeRenewalApplicationId) {
                    openApplicationDetail(app.activeRenewalApplicationId);
                  }
                }}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#1D4ED8',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: isDesktop ? 'auto' : 'flex-end',
                }}
              >
                <Icon name="external-link" size={13} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                  {isAssessmentOnly ? 'View Official Application' : 'View Renewal'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Eligible for Renewal Banner */}
        {isEligibleForRenewal(app) && (() => {
          const daysRemaining = getRenewalDaysRemaining(app);
          const isExpired = daysRemaining !== null && daysRemaining <= 0;
          const isOnDay = daysRemaining === 0;
          const latestDoc = Array.isArray(app.issuedDocumentDetails) && app.issuedDocumentDetails.length > 0
            ? app.issuedDocumentDetails.find((d) => d.expiryDate) ?? app.issuedDocumentDetails[0]
            : undefined;
          const formattedExpiry = latestDoc?.expiryDate
            ? new Date(latestDoc.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : undefined;

          return (
            <View
              style={{
                backgroundColor: isExpired ? '#FEF2F2' : '#FFFBEB',
                borderColor: isExpired ? '#FECACA' : '#FDE68A',
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                flexDirection: isDesktop ? 'row' : 'column',
                alignItems: isDesktop ? 'center' : 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Icon
                  name={isExpired ? 'alert-triangle' : 'refresh-cw'}
                  size={22}
                  color={isExpired ? '#DC2626' : '#D97706'}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: isExpired ? '#991B1B' : '#92400E',
                    }}
                  >
                    {isOnDay
                      ? 'Notice: Permit / License Expires Today'
                      : isExpired
                      ? 'Notice: Permit / License Has Expired'
                      : `Permit / License Expiring Soon (${daysRemaining} Days Remaining)`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: isExpired ? '#B91C1C' : '#B45309',
                      marginTop: 2,
                    }}
                  >
                    {isExpired && formattedExpiry
                      ? `Your application has been expired on ${formattedExpiry}. Please submit your renewal application immediately.`
                      : 'Statutory renewal is available now. The new validity period will attach directly to the original expiration date.'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onRenew?.(app)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isExpired ? '#DC2626' : '#D97706',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: isDesktop ? 'auto' : 'flex-end',
                }}
              >
                <Icon name="refresh-cw" size={14} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                  Renew Application
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* Returned for Correction Alert Banner */}
        {(isReturnedForCorrection ||
          (app.status === 'PENDING' &&
            typeof app.remarks === 'string' &&
            (app.remarks.toLowerCase().includes('notice of discrepancy') ||
              app.remarks.toLowerCase().includes('returned')))) && (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#F87171',
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              flexDirection: isDesktop ? 'row' : 'column',
              alignItems: isDesktop ? 'center' : 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 }}>
              <Icon name="alert-triangle" size={20} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 15,
                    fontWeight: TYPOGRAPHY.weights.bold,
                    color: '#991B1B',
                    marginBottom: 4,
                  }}
                >
                  Application Returned for Correction
                </Text>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 13,
                    color: '#7F1D1D',
                    lineHeight: 18,
                  }}
                >
                  {app.remarks || 'The evaluating officer has returned this application. Please review the deficiency notice and update any required documents below before resubmitting.'}
                </Text>
              </View>
            </View>

            {isReturnedForCorrection && (
              <TouchableOpacity
                onPress={handleOpenEditReturnedModal}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#DC2626',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: isDesktop ? 'center' : 'flex-end',
                }}
              >
                <Icon name="edit-3" size={14} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                  Edit Application
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.tabContentList}>
          <ApplicationProgressStepper
            currentStepIndex={currentStepIndex}
            serviceCategory={app.serviceCategory}
            serviceName={app.serviceName}
            status={app.rawStatus || app.status}
            remarks={app.remarks}
            isAssessmentOnly={isAssessmentOnly}
          />

          <ClientBillingNoticeCard
            app={app}
            isDesktop={isDesktop}
            onProceedToPayment={() => setIsPaymentModalOpen(true)}
            onViewReports={(tab) => {
              const orNum = app.officialReceiptNumber || app.op?.officialReceiptNumber;
              const hasOr = Boolean(typeof orNum === 'string' && orNum.trim().length > 0);
              const defaultTab: 'soa' | 'op' | 'or' = hasOr
                ? 'or'
                : (app.isAssessmentOnly || app.intent === 'AssessmentOnly' ? 'soa' : 'op');
              setSoaOpInitialTab(tab || defaultTab);
              setSoaOpModalVisible(true);
            }}
            onViewSoa={() => {
              setSoaOpInitialTab('soa');
              setSoaOpModalVisible(true);
            }}
            onViewOp={() => {
              setSoaOpInitialTab('op');
              setSoaOpModalVisible(true);
            }}
            onViewOr={() => {
              setSoaOpInitialTab('or');
              setSoaOpModalVisible(true);
            }}
            onConvertToReal={() => setIsConvertToRealModalOpen(true)}
            onRequestReassessment={() => setIsReassessmentModalOpen(true)}
            onOpenOfficialApplication={(targetId) => openApplicationDetail(targetId)}
          />

          {isBulk ? (
            <BulkApplicantsSection
              app={app}
              appApplicants={appApplicants}
              totalSubmitted={totalSubmitted}
              approvedCount={approvedCount}
              declinedCount={declinedCount}
              pendingCount={pendingCount}
              tableSearch={tableSearch}
              setTableSearch={setTableSearch}
              tablePage={tablePage}
              setTablePage={setTablePage}
              totalPages={totalPages}
              pagedApplicants={pagedApplicants}
              selectedApplicant={effectiveSelectedApplicant}
              onSelectApplicant={setSelectedApplicant}
              selectedApplicantFormFields={selectedApplicantFormFields}
              selectedApplicantDocs={selectedApplicantDocs}
              isExamService={isExamService}
              scheduleSummaryText={scheduleSummaryText}
              variantLabel={variantLabel}
              isDesktop={isDesktop}
              onPreviewFile={(uri, name) => handleSetPreviewCustomDoc({ uri, name })}
              onPreviewDoc={handlePreviewDoc}
              onPreviewCustomDoc={handleSetPreviewCustomDoc}
              onDownloadDoc={onDownloadDoc}
              previewLoadingId={previewLoadingId}
              setPreviewLoadingId={setPreviewLoadingId}
              canEditRequirements={isReturnedForCorrection}
              uploadingDocId={uploadingDocId}
              onUploadRequirement={handleUploadRequirement}
            />
          ) : (
            <SingleApplicantSection
              app={app}
              singleApplicant={singleApplicant}
              primaryName={primaryName}
              formFieldValues={formFieldValues}
              isExamService={isExamService}
              scheduleSummaryText={scheduleSummaryText}
              variantLabel={variantLabel}
              applicationType={applicationTypeLabel}
              elements={elementsLabel}
              isDesktop={isDesktop}
              docs={docs}
              onPreviewFile={(uri, name) => handleSetPreviewCustomDoc({ uri, name })}
              onPreviewDoc={handlePreviewDoc}
              onPreviewCustomDoc={handleSetPreviewCustomDoc}
              onDownloadDoc={onDownloadDoc}
              previewLoadingId={previewLoadingId}
              setPreviewLoadingId={setPreviewLoadingId}
              canEditRequirements={isReturnedForCorrection}
              uploadingDocId={uploadingDocId}
              onUploadRequirement={handleUploadRequirement}
            />
          )}
        </View>
      </View>

      <DocumentPreviewSection
        app={app}
        primaryName={primaryName}
        previewDoc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownloadDoc={onDownloadDoc}
      />
      <CustomDocPreviewModal
        previewCustomDoc={previewCustomDoc}
        onClose={() => handleSetPreviewCustomDoc(null)}
        onDownload={(file) => {
          if (typeof file === 'object' && file !== null && 'name' in file) {
            const rawCategory = typeof file?.category === 'string' ? file.category : 'ATTACHMENT';
            let catVal: ApplicationDocument['category'] = 'ATTACHMENT';
            if (rawCategory === 'ADMISSION_SLIP' || rawCategory === 'RECEIPT' || rawCategory === 'SOA' || rawCategory === 'ISSUED_PERMIT') {
              catVal = rawCategory;
            }
            const docToDownload: ApplicationDocument = {
              id: previewCustomDoc?.referenceNumber || 'doc-preview',
              name: typeof file?.name === 'string' ? file.name : 'document',
              category: catVal,
              type: file?.type === 'IMAGE' ? 'IMAGE' : file?.type === 'DOCX' ? 'DOCX' : file?.type === 'ZIP' ? 'ZIP' : 'PDF',
              size: (typeof file?.size === 'string' || typeof file?.size === 'number') ? String(file.size) : '350 KB',
              uploadedAt: (typeof file?.uploadedAt === 'string' ? file.uploadedAt : null) || app.submittedAt || new Date().toISOString(),
              url: typeof file?.uri === 'string' ? file.uri : '',
            };
            if (onDownloadDoc !== undefined) {
              onDownloadDoc(docToDownload);
            }
          }
        }}
      />
      <ClientSoaOpPreviewModal
        visible={soaOpModalVisible}
        app={app}
        initialTab={soaOpInitialTab}
        onClose={() => setSoaOpModalVisible(false)}
        onProceedToPayment={() => setIsPaymentModalOpen(true)}
      />
      <ClientPaymentSubmissionModal
        visible={isPaymentModalOpen}
        app={app}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setAppState((prev) => ({
            ...prev,
            status: 'PAYMENT_SUBMITTED',
            remarks: 'Payment submitted via client. Waiting for Cashier verification.',
            op: prev.op ? { ...prev.op, status: 'Processing' } : {
              id: 'op-submitted',
              opNumber: prev.opNumber || '',
              status: 'Processing',
              amountDue: prev.totalAmountDue || 0,
              amountReceived: prev.totalAmountDue || 0,
            },
          }));
          refetch();
        }}
      />
      <ConvertToRealModal
        visible={isConvertToRealModalOpen}
        app={app}
        onClose={() => setIsConvertToRealModalOpen(false)}
        onConfirm={handleConvertToReal}
        isLoading={isConverting}
      />
      <ReassessmentModal
        visible={isReassessmentModalOpen}
        onClose={() => setIsReassessmentModalOpen(false)}
        onSubmit={handleRequestReassessment}
        isLoading={isReprocessing}
      />
      <EditReturnedApplicationModal
        visible={isEditReturnedModalOpen}
        app={app}
        onClose={() => setIsEditReturnedModalOpen(false)}
        onSuccess={() => {
          setIsEditReturnedModalOpen(false);
          setAppState((prev) => ({
            ...prev,
            status: 'FOR_EVALUATION',
            rawStatus: 'Evaluating',
          }));
          toast.success(
            'Application Updated & Resubmitted',
            'Your updated application has been returned directly to the evaluating officer for continued review.'
          );
          refetch();
        }}
      />
    </ScrollView>
  );
}
