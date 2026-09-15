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
import { DocumentPreviewSection } from './applicationDetails/DocumentPreviewSection';
import { CustomDocPreviewModal } from './applicationDetails/CustomDocPreviewModal';
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

  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);

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
  } = useApplicationDetailsData(initialApp);

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
              selectedApplicant={effectiveSelectedApplicant}
              onSelectApplicant={setSelectedApplicant}
              selectedApplicantFormFields={selectedApplicantFormFields}
              selectedApplicantDocs={selectedApplicantDocs}
              isExamService={isExamService}
              scheduleSummaryText={scheduleSummaryText}
              variantLabel={variantLabel}
              isDesktop={isDesktop}
              onPreviewFile={(uri, name) => handleSetPreviewCustomDoc({ uri, name })}
              onPreviewDoc={setPreviewDoc}
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
              onPreviewDoc={setPreviewDoc}
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
      />
    </ScrollView>
  );
}
