import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Text, useWindowDimensions } from 'react-native';
import { Icon, SPACING } from '@edge/ui';
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
import { DocumentsSection } from './applicationDetails/DocumentsSection';
import { DocumentPreviewSection } from './applicationDetails/DocumentPreviewSection';
import { BulkApplicantModal } from './applicationDetails/BulkApplicantModal';
import { CustomDocPreviewModal } from './applicationDetails/CustomDocPreviewModal';

export { ApplicationDetailsPageProps };

export function ApplicationDetailsPage({
  app: initialApp,
  onBack,
  onDownloadDoc,
}: ApplicationDetailsPageProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    app,
    isBulk,
    singleApplicant,
    isExamService,
    scheduleSummaryText,
    variantLabel,
    formFieldValues,
    appApplicants,
    totalSubmitted,
    approvedCount,
    declinedCount,
    pendingCount,
    docs,
    primaryName,
    resolvedServiceVariant,
    currentStepIndex,
  } = useApplicationDetailsData(initialApp);

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);
  const [previewCustomDoc, setPreviewCustomDoc] = useState<{ uri: string; name: string } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const handleSetPreviewCustomDoc = React.useCallback((doc: { uri: string; name: string } | null) => {
    setPreviewCustomDoc((prev) => {
      if (prev?.uri && prev.uri.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(prev.uri);
      }
      return doc;
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (previewCustomDoc?.uri && previewCustomDoc.uri.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(previewCustomDoc.uri);
      }
    };
  }, [previewCustomDoc]);

  const TABLE_PAGE_SIZE = 6;
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<BulkApplicant | null>(null);

  const { selectedApplicantFormFields, selectedApplicantDocs } = useSelectedBulkApplicant(
    app,
    selectedApplicant
  );

  const filteredApplicants = useMemo(() => {
    if (!isBulk) return [];
    if (tableSearch.trim() === '') return appApplicants;
    const q = tableSearch.toLowerCase();
    return appApplicants.filter((a) => a.name.toLowerCase().includes(q) || a.applicationType.toLowerCase().includes(q));
  }, [appApplicants, isBulk, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / TABLE_PAGE_SIZE));
  const pagedApplicants = filteredApplicants.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);
  const statusColor = safeGetStatusColor(app.status, getStatusColor);
  const statusBg = safeGetStatusBgColor(app.status, getStatusBgColor);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.mainWrapper, { paddingHorizontal: isDesktop ? SPACING[32] : SPACING[16] }]}>
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === 'DETAILS' && (
          <View style={styles.tabContentList}>
            <ApplicationProgressStepper currentStepIndex={currentStepIndex} />

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
                onSelectApplicant={setSelectedApplicant}
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
                onPreviewDoc={setPreviewDoc}
                onPreviewCustomDoc={handleSetPreviewCustomDoc}
                setPreviewLoadingId={setPreviewLoadingId}
              />
            )}
          </View>
        )}

        {activeTab === 'DOCUMENTS' && (
          <DocumentsSection
            app={app}
            docs={docs}
            onPreviewDoc={setPreviewDoc}
            onPreviewCustomDoc={handleSetPreviewCustomDoc}
            onDownloadDoc={onDownloadDoc}
            previewLoadingId={previewLoadingId}
            setPreviewLoadingId={setPreviewLoadingId}
          />
        )}
      </View>

      <DocumentPreviewSection
        app={app}
        primaryName={primaryName}
        previewDoc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownloadDoc={onDownloadDoc}
      />
      <BulkApplicantModal
        app={app}
        selectedApplicant={selectedApplicant}
        selectedApplicantFormFields={selectedApplicantFormFields}
        selectedApplicantDocs={selectedApplicantDocs}
        onClose={() => setSelectedApplicant(null)}
        onPreviewDoc={setPreviewDoc}
        onPreviewCustomDoc={handleSetPreviewCustomDoc}
      />
      <CustomDocPreviewModal
        previewCustomDoc={previewCustomDoc}
        onClose={() => handleSetPreviewCustomDoc(null)}
      />
    </ScrollView>
  );
}
