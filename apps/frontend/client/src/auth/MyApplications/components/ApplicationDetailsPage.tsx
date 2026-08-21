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
import { DocumentsSection } from './applicationDetails/DocumentsSection';
import { DocumentPreviewSection } from './applicationDetails/DocumentPreviewSection';
import { CustomDocPreviewModal } from './applicationDetails/CustomDocPreviewModal';

const TABLE_PAGE_SIZE = 6;

export { ApplicationDetailsPageProps };

export function ApplicationDetailsPage({
  app: initialApp,
  onBack,
  onDownloadDoc,
}: ApplicationDetailsPageProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');
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
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);
  const [previewCustomDoc, setPreviewCustomDoc] = useState<{ uri: string; name: string } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const { selectedApplicantFormFields, selectedApplicantDocs } = useSelectedBulkApplicant(
    app,
    selectedApplicant
  );

  const statusBg = useMemo(
    () => safeGetStatusBgColor(app.status, getStatusBgColor),
    [app.status]
  );
  const statusColor = useMemo(
    () => safeGetStatusColor(app.status, getStatusColor),
    [app.status]
  );

  const handleSetPreviewCustomDoc = (doc: { uri: string; name: string } | null) => {
    setPreviewCustomDoc(doc);
  };

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
              selectedApplicant ? (
                <View style={{ gap: 16 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedApplicant(null)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: '#EFF6FF',
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      alignSelf: 'flex-start',
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="arrow-left" size={16} color="#1D4ED8" />
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 13,
                        fontWeight: '700',
                        color: '#1D4ED8',
                      }}
                    >
                      Back to Bulk Applicants List
                    </Text>
                  </TouchableOpacity>

                  <SingleApplicantSection
                    app={app}
                    singleApplicant={{
                      applicantName: selectedApplicant.name,
                      sex: selectedApplicant.sex || 'Male',
                      nationality: selectedApplicant.nationality || 'Filipino',
                      streetAddress: selectedApplicant.streetAddress || '',
                      barangay: selectedApplicant.barangay || '',
                      cityMunicipality: selectedApplicant.cityMunicipality || '',
                      province: selectedApplicant.province || '',
                      region: selectedApplicant.region || '',
                      zipCode: selectedApplicant.zipCode || '',
                      mobileNumber: selectedApplicant.mobileNumber || '',
                      email: selectedApplicant.email || '',
                      examineeType: selectedApplicant.applicationType || '',
                      birthDate: selectedApplicant.birthDate || null,
                      civilStatus: selectedApplicant.civilStatus || null,
                      companyName: selectedApplicant.companyName || null,
                      representativeName: selectedApplicant.representativeName || null,
                      notes: selectedApplicant.notes || null,
                    }}
                    primaryName={selectedApplicant.name}
                    formFieldValues={selectedApplicantFormFields}
                    isExamService={isExamService}
                    scheduleSummaryText={
                      selectedApplicant.schedule
                        ? `${selectedApplicant.schedule.date} • ${selectedApplicant.schedule.time} (${selectedApplicant.schedule.venue})`
                        : scheduleSummaryText
                    }
                    variantLabel={selectedApplicant.applicationType || variantLabel}
                    isDesktop={isDesktop}
                    docs={selectedApplicantDocs}
                    onPreviewFile={(uri, name) => handleSetPreviewCustomDoc({ uri, name })}
                    onPreviewDoc={setPreviewDoc}
                    onPreviewCustomDoc={handleSetPreviewCustomDoc}
                    setPreviewLoadingId={setPreviewLoadingId}
                  />
                </View>
              ) : (
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
              )
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
      <CustomDocPreviewModal
        previewCustomDoc={previewCustomDoc}
        onClose={() => handleSetPreviewCustomDoc(null)}
      />
    </ScrollView>
  );
}
