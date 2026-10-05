import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Text, useWindowDimensions } from 'react-native';
import { Icon, SPACING, TYPOGRAPHY } from '@edge/ui';
import {
  ApplicationDocument,
  BulkApplicant,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
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

const TABLE_PAGE_SIZE = 6;

export { ApplicationDetailsPageProps };

export function ApplicationDetailsPage({
  app: initialApp,
  onBack,
  onDownloadDoc,
}: ApplicationDetailsPageProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 992;

  const [appState, setAppState] = useState(initialApp);
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [soaOpModalVisible, setSoaOpModalVisible] = useState(false);
  const [soaOpInitialTab, setSoaOpInitialTab] = useState<ClientReportTab>('soa');

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
    formFieldValues,
    currentStepIndex,
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
      const isSoa = doc.category === 'SOA' || doc.name.toLowerCase().includes('soa') || doc.name.toLowerCase().includes('statement');
      const isOp = doc.category === 'RECEIPT' || doc.name.toLowerCase().includes('order of payment') || doc.name.toLowerCase().includes('op');
      if (isSoa) {
        setSoaOpInitialTab('soa');
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
          primaryName={primaryName}
          docsCount={docs.length}
        />

        {/* Returned for Correction Alert Banner */}
        {(app.status === 'DECLINED' ||
          (typeof app.rawStatus === 'string' && app.rawStatus.toLowerCase().includes('return')) ||
          (typeof app.remarks === 'string' && (
            app.remarks.toLowerCase().includes('notice of discrepancy') ||
            app.remarks.toLowerCase().includes('returned')
          ))) && (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#F87171',
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
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
                {app.remarks || 'The evaluating officer has returned this application. Please review the deficiency notice.'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.tabContentList}>
          <ApplicationProgressStepper
            currentStepIndex={currentStepIndex}
            serviceCategory={app.serviceCategory}
            serviceName={app.serviceName}
            status={app.status}
            remarks={app.remarks}
          />

          <ClientBillingNoticeCard
            app={app}
            isDesktop={isDesktop}
            onProceedToPayment={() => setIsPaymentModalOpen(true)}
            onViewSoa={() => {
              setSoaOpInitialTab('soa');
              setSoaOpModalVisible(true);
            }}
            onViewOp={() => {
              setSoaOpInitialTab('op');
              setSoaOpModalVisible(true);
            }}
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
              isDesktop={isDesktop}
              docs={docs}
              onPreviewFile={(uri, name) => handleSetPreviewCustomDoc({ uri, name })}
              onPreviewDoc={handlePreviewDoc}
              onPreviewCustomDoc={handleSetPreviewCustomDoc}
              onDownloadDoc={onDownloadDoc}
              previewLoadingId={previewLoadingId}
              setPreviewLoadingId={setPreviewLoadingId}
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
            const rawCategory = typeof file.category === 'string' ? file.category : 'ATTACHMENT';
            let catVal: ApplicationDocument['category'] = 'ATTACHMENT';
            if (rawCategory === 'ADMISSION_SLIP' || rawCategory === 'RECEIPT' || rawCategory === 'SOA' || rawCategory === 'ISSUED_PERMIT') {
              catVal = rawCategory;
            }
            const docToDownload: ApplicationDocument = {
              id: previewCustomDoc?.referenceNumber || 'doc-preview',
              name: file.name,
              category: catVal,
              type: file.type === 'IMAGE' ? 'IMAGE' : file.type === 'DOCX' ? 'DOCX' : file.type === 'ZIP' ? 'ZIP' : 'PDF',
              size: file.size || '350 KB',
              uploadedAt: file.uploadedAt || app.submittedAt || new Date().toISOString(),
              url: file.uri,
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
            remarks: 'Payment submitted via client. Waiting for Cashier verification.',
          }));
          refetch();
        }}
      />
    </ScrollView>
  );
}
