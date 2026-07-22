import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { Icon, COLORS, TYPOGRAPHY, SPACING } from '@edge/ui';
import {
  Application,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
  getAppDocuments,
  ApplicationDocument,
  BulkApplicant,
  getEnrichedApplicant,
} from '../data/applicationsData';

interface ApplicationDetailsPageProps {
  app: Application;
  onBack: () => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
}

export function ApplicationDetailsPage({
  app,
  onBack,
  onDownloadDoc,
}: ApplicationDetailsPageProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Active Tab: 'DETAILS' | 'DOCUMENTS'
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

  const isBulk = app.mode === 'BULK';
  
  // Bulk application table search, pagination & modal states
  const TABLE_PAGE_SIZE = 6;
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<BulkApplicant | null>(null);

  // Bulk stats and calculations
  const totalSubmitted = isBulk ? app.applicants.length : 0;
  const approvedCount = isBulk ? app.applicants.filter((a) => a.status === 'APPROVED').length : 0;
  const declinedCount = isBulk ? app.applicants.filter((a) => a.status === 'DECLINED').length : 0;
  const pendingCount = isBulk ? app.applicants.filter((a) => a.status !== 'APPROVED' && a.status !== 'DECLINED').length : 0;

  const filteredApplicants = useMemo<BulkApplicant[]>(() => {
    if (!isBulk) return [];
    if (tableSearch.trim() === '') return app.applicants;
    const q = tableSearch.toLowerCase();
    return app.applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.applicationType.toLowerCase().includes(q) ||
        getStatusLabel(a.status).toLowerCase().includes(q),
    );
  }, [app, isBulk, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / TABLE_PAGE_SIZE));
  const pagedApplicants = filteredApplicants.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE,
  );
  const statusColor = getStatusColor(app.status);
  const statusBg = getStatusBgColor(app.status);
  const docs = getAppDocuments(app);

  // Derived applicant info
  const primaryName = isBulk ? app.companyName : app.applicantName;
  const submissionTime = formatRelativeTime(app.submittedAt);

  // Determine stepper progress indices (1 = Submitted, 2 = Evaluation, 3 = For Approval, 4 = Approved & Issued)
  const getStepProgress = () => {
    switch (app.status) {
      case 'PENDING':
        return 1;
      case 'FOR_EVALUATION':
        return 2;
      case 'FOR_APPROVAL':
        return 3;
      case 'APPROVED':
      case 'READY_FOR_PAYMENT':
        return 4;
      case 'DECLINED':
      case 'EXPIRING_SOON':
        return 2;
      default:
        return 3;
    }
  };

  const currentStepIndex = getStepProgress();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.mainWrapper, { maxWidth: isMobile ? '100%' : 900 }]}>
        {/* ── Top Back Button Bar ────────────────────────────────────────── */}
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="arrow-left" size={18} color="#1D4ED8" />
          <Text style={styles.backBtnText}>Back to My Applications</Text>
        </TouchableOpacity>

        {/* ── Header Card ───────────────────────────────────────────────── */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.modeBadge, isBulk ? styles.bulkBadge : styles.singleBadge]}>
              <View style={[styles.modeDot, { backgroundColor: isBulk ? '#D97706' : '#1D4ED8' }]} />
              <Text style={[styles.modeBadgeText, { color: isBulk ? '#D97706' : '#1D4ED8' }]}>
                {isBulk ? `BULK APPLICATION (${app.applicants.length})` : 'SINGLE APPLICATION'}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {getStatusLabel(app.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.appRefId}>
            {isBulk ? `Bulk Application #${app.referenceNumber}` : `#${app.referenceNumber}`}
          </Text>
          <Text style={styles.appTitle}>{app.serviceName}</Text>
          {isBulk && (
            <Text style={styles.appSubtitleCompany}>
              {app.companyName} [BULK] Submitted {formatRelativeTime(app.submittedAt)}
            </Text>
          )}

          {/* ── Navigation Tabs ─────────────────────────────────────────── */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('DETAILS')}
              style={[styles.tabItem, activeTab === 'DETAILS' && styles.tabItemActive]}
              activeOpacity={0.8}
            >
              <Icon
                name="user"
                size={16}
                color={activeTab === 'DETAILS' ? '#1D4ED8' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'DETAILS' && styles.tabTextActive]}>
                Applicant Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('DOCUMENTS')}
              style={[styles.tabItem, activeTab === 'DOCUMENTS' && styles.tabItemActive]}
              activeOpacity={0.8}
            >
              <Icon
                name="file-text"
                size={16}
                color={activeTab === 'DOCUMENTS' ? '#1D4ED8' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'DOCUMENTS' && styles.tabTextActive]}>
                Documents ({docs.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tab Content: Applicant Details ────────────────────────────── */}
        {activeTab === 'DETAILS' && (
          <View style={styles.tabContentList}>
            {/* APPLICATION PROGRESS Stepper */}
            <View style={styles.sectionCard}>
              <Text style={styles.progressHeaderTitle}>APPLICATION PROGRESS</Text>
              <View style={styles.stepperRow}>
                {/* Step 1 */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStepIndex >= 1 ? styles.stepCircleDone : styles.stepCirclePending,
                    ]}
                  >
                    {currentStepIndex >= 1 ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>1</Text>
                    )}
                  </View>
                  <Text style={styles.stepLabel}>Submitted</Text>
                </View>

                <View
                  style={[
                    styles.stepLine,
                    currentStepIndex >= 2 ? styles.stepLineDone : styles.stepLinePending,
                  ]}
                />

                {/* Step 2 */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStepIndex >= 2 ? styles.stepCircleDone : styles.stepCirclePending,
                    ]}
                  >
                    {currentStepIndex >= 2 ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>2</Text>
                    )}
                  </View>
                  <Text style={styles.stepLabel}>Evaluation</Text>
                </View>

                <View
                  style={[
                    styles.stepLine,
                    currentStepIndex >= 3 ? styles.stepLineDone : styles.stepLinePending,
                  ]}
                />

                {/* Step 3 */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStepIndex >= 3 ? styles.stepCircleDone : styles.stepCirclePending,
                    ]}
                  >
                    {currentStepIndex >= 3 ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>3</Text>
                    )}
                  </View>
                  <Text style={styles.stepLabel}>For Approval</Text>
                </View>

                <View
                  style={[
                    styles.stepLine,
                    currentStepIndex >= 4 ? styles.stepLineDone : styles.stepLinePending,
                  ]}
                />

                {/* Step 4 */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStepIndex >= 4 ? styles.stepCircleDone : styles.stepCirclePending,
                    ]}
                  >
                    {currentStepIndex >= 4 ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>4</Text>
                    )}
                  </View>
                  <Text style={styles.stepLabel}>Approved & Issued</Text>
                </View>
              </View>
            </View>

            {isBulk ? (
              <>
                {/* ── Bulk Metrics Grid ──────────────────────────────────────── */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>TOTAL SUBMITTED</Text>
                      <Icon name="users" size={16} color="#475569" />
                    </View>
                    <Text style={styles.metricValue}>{totalSubmitted}</Text>
                    <Text style={styles.metricSub}>applicants</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>APPROVED</Text>
                      <Icon name="check-circle" size={16} color="#16A34A" />
                    </View>
                    <Text style={[styles.metricValue, { color: '#16A34A' }]}>{approvedCount}</Text>
                    <Text style={styles.metricSub}>applicants</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>DECLINED</Text>
                      <Icon name="x-circle" size={16} color="#DC2626" />
                    </View>
                    <Text style={[styles.metricValue, { color: '#DC2626' }]}>{declinedCount}</Text>
                    <Text style={styles.metricSub}>applicants</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricLabel}>GENERATED DOCUMENT</Text>
                      <Icon name="file-text" size={16} color="#2563EB" />
                    </View>
                    <Text style={styles.soaValue} numberOfLines={1}>
                      {app.soaNumber ?? `SOA #${app.referenceNumber}`}
                    </Text>
                    <TouchableOpacity
                      style={styles.viewSoaBtn}
                      onPress={() => {
                        if (onDownloadDoc) {
                          const soaDoc = docs.find((d) => d.category === 'SOA');
                          if (soaDoc) onDownloadDoc(soaDoc);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewSoaBtnText}>View SOA</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── Alert Warning Banner ───────────────────────────────────── */}
                <View style={styles.alertBanner}>
                  <Icon name="alert-circle" size={16} color="#B45309" />
                  <Text style={styles.alertBannerText}>
                    {approvedCount} applicants were approved and included in the Statement of Account. {declinedCount} were declined.
                  </Text>
                </View>

                {/* ── Approved Applicants Table ───────────────────────────────── */}
                <View style={styles.tableSectionCard}>
                  <View style={styles.tableSectionHeader}>
                    <View style={styles.tableHeaderTitleRow}>
                      <Text style={styles.tableSectionTitle}>Approved Applicants</Text>
                      <View style={styles.tableCountBadge}>
                        <Text style={styles.tableCountBadgeText}>{filteredApplicants.length}</Text>
                      </View>
                    </View>

                    <View style={styles.tableSearchBox}>
                      <Icon name="search" size={14} color="#94A3B8" />
                      <TextInput
                        style={styles.tableSearchInput}
                        placeholder="Search approved..."
                        placeholderTextColor="#94A3B8"
                        value={tableSearch}
                        onChangeText={(text) => {
                          setTableSearch(text);
                          setTablePage(1);
                        }}
                      />
                      {tableSearch.length > 0 && (
                        <TouchableOpacity onPress={() => setTableSearch('')}>
                          <Icon name="x" size={14} color="#94A3B8" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Responsive Grid/Table layout */}
                  <View style={styles.tableWrapper}>
                    <View style={styles.tableThRow}>
                      <Text style={[styles.thCol, { flex: 0.5 }]}>#</Text>
                      <Text style={[styles.thCol, { flex: 2.5 }]}>APPLICANT NAME</Text>
                      <Text style={[styles.thCol, { flex: 1.5 }]}>APPLICATION TYPE</Text>
                      <Text style={[styles.thCol, { flex: 1.5 }]}>STATUS</Text>
                      <Text style={[styles.thCol, { flex: 1.5 }]}>INCLUDED IN SOA</Text>
                      <Text style={[styles.thCol, { flex: 1.5, textAlign: 'right' }]}>ACTION</Text>
                    </View>

                    {pagedApplicants.length === 0 ? (
                      <View style={styles.emptyTableState}>
                        <Text style={styles.emptyTableText}>No applicants found matching "{tableSearch}"</Text>
                      </View>
                    ) : (
                      pagedApplicants.map((applicant, idx) => {
                        const absoluteIndex = (tablePage - 1) * TABLE_PAGE_SIZE + idx + 1;
                        return (
                          <View key={applicant.id} style={[styles.tableTdRow, idx % 2 === 1 && styles.tableTdRowAlt]}>
                            <Text style={[styles.tdCol, { flex: 0.5, color: '#64748B' }]}>{absoluteIndex}</Text>
                            <Text style={[styles.tdCol, { flex: 2.5, fontWeight: '600', color: '#0F172A' }]} numberOfLines={1}>
                              {applicant.name}
                            </Text>
                            <Text style={[styles.tdCol, { flex: 1.5 }]}>{applicant.applicationType}</Text>
                            <View style={{ flex: 1.5, alignItems: 'flex-start' }}>
                              <View style={[styles.tableStatusChip, { backgroundColor: getStatusBgColor(applicant.status) }]}>
                                <Text style={[styles.tableStatusChipText, { color: getStatusColor(applicant.status) }]}>
                                  {getStatusLabel(applicant.status)}
                                </Text>
                              </View>
                            </View>
                            <Text style={[styles.tdCol, { flex: 1.5, fontWeight: '500', color: '#334155' }]}>
                              {applicant.includedInSOA ? 'Yes' : 'No'}
                            </Text>
                            <TouchableOpacity
                              onPress={() => setSelectedApplicant(applicant)}
                              style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.viewDetailsLinkText}>View Details</Text>
                              <Icon name="external-link" size={11} color="#1D4ED8" />
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    )}
                  </View>

                  {/* Table Pagination */}
                  {totalPages > 1 && (
                    <View style={styles.tablePaginationBar}>
                      <Text style={styles.tablePaginationSummary}>
                        Showing {(tablePage - 1) * TABLE_PAGE_SIZE + 1} to{' '}
                        {Math.min(tablePage * TABLE_PAGE_SIZE, filteredApplicants.length)} of{' '}
                        {filteredApplicants.length} applicants
                      </Text>

                      <View style={styles.tablePaginationBtns}>
                        <TouchableOpacity
                          onPress={() => setTablePage((p) => Math.max(1, p - 1))}
                          disabled={tablePage === 1}
                          style={[styles.tablePageNavBtn, tablePage === 1 && styles.tablePageNavBtnDisabled]}
                        >
                          <Icon name="chevron-left" size={14} color={tablePage === 1 ? '#CBD5E1' : '#334155'} />
                        </TouchableOpacity>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                          <TouchableOpacity
                            key={pg}
                            onPress={() => setTablePage(pg)}
                            style={[styles.tablePageNumberBtn, pg === tablePage && styles.tablePageNumberBtnActive]}
                          >
                            <Text style={[styles.tablePageNumberText, pg === tablePage && styles.tablePageNumberTextActive]}>
                              {pg}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          onPress={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                          disabled={tablePage === totalPages}
                          style={[styles.tablePageNavBtn, tablePage === totalPages && styles.tablePageNavBtnDisabled]}
                        >
                          <Icon name="chevron-right" size={14} color={tablePage === totalPages ? '#CBD5E1' : '#334155'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                {/* Section 1: Applicant Profile */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionCardHeader}>
                    <Icon name="user" size={18} color="#1D4ED8" />
                    <Text style={styles.sectionCardTitle}>1. Applicant Profile</Text>
                  </View>

                  <View style={styles.sectionCardBody}>
                    <DetailRow label="Full Name" value={primaryName} />
                    <DetailRow label="Sex" value={app.sex} />
                    <DetailRow label="Nationality" value={app.nationality} />
                    <DetailRow label="Element Type" value={app.element} />
                    <DetailRow label="Submission Date" value={submissionTime} isLast />
                  </View>
                </View>

                {/* Section 2: Contact Details */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionCardHeader}>
                    <Icon name="mail" size={18} color="#1D4ED8" />
                    <Text style={styles.sectionCardTitle}>2. Contact Details</Text>
                  </View>

                  <View style={styles.sectionCardBody}>
                    <DetailRow label="Mobile Number" value={app.mobileNumber} />
                    <DetailRow label="Email Address" value={app.email} isLast />
                  </View>
                </View>

                {/* Section 3: Permanent Address */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionCardHeader}>
                    <Icon name="map-pin" size={18} color="#1D4ED8" />
                    <Text style={styles.sectionCardTitle}>3. Permanent Address</Text>
                  </View>

                  <View style={styles.sectionCardBody}>
                    <DetailRow label="Street Address" value={app.streetAddress} />
                    <DetailRow label="Barangay" value={app.barangay ?? 'Brgy 4'} />
                    <DetailRow label="City / Municipality" value={app.cityMunicipality} />
                    <DetailRow label="Province" value={app.province} />
                    <DetailRow label="Region" value={app.region} />
                    <DetailRow label="Zip Code" value={app.zipCode ?? '9506'} isLast />
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* ── Tab Content: Documents ────────────────────────────────────── */}
        {activeTab === 'DOCUMENTS' && (
          <View style={styles.tabContentList}>
            <View style={styles.docHeaderContainer}>
              <Text style={styles.docHeaderTitle}>Attached & Issued Documents</Text>
              <Text style={styles.docHeaderSubtitle}>
                Preview official application documents, admission slips, receipts, and permits below.
              </Text>
            </View>

            {docs.map((doc) => (
              <View key={doc.id} style={styles.docRowCard}>
                <View style={styles.docIconBox}>
                  <Icon name="file-text" size={20} color="#1D4ED8" />
                </View>

                <View style={styles.docInfoCol}>
                  <Text style={styles.docNameText} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text style={styles.docSubtext}>
                    {doc.category.replace('_', ' ')} · {doc.size} · {doc.type}
                  </Text>
                </View>

                <View style={styles.docActionsRowGroup}>
                  <TouchableOpacity
                    onPress={() => setPreviewDoc(doc)}
                    style={styles.docPreviewPillBtn}
                    activeOpacity={0.8}
                  >
                    <Icon name="eye" size={14} color="#1D4ED8" />
                    <Text style={styles.docPreviewPillBtnText}>Preview</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (onDownloadDoc !== undefined) onDownloadDoc(doc);
                    }}
                    style={styles.docDownloadBtn}
                    activeOpacity={0.8}
                  >
                    <Icon name="download" size={14} color="#475569" />
                    <Text style={styles.docDownloadBtnText}>Download</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── Document Preview Modal ───────────────────────────────────────── */}
      <Modal
        visible={previewDoc !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewDoc(null)}
      >
        {previewDoc !== null && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: isMobile ? '95%' : 600 }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleGroup}>
                  <Icon name="file-text" size={20} color="#1D4ED8" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle} numberOfLines={1}>
                      {previewDoc.name}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {previewDoc.category.replace('_', ' ')} · {previewDoc.size} · {previewDoc.type}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setPreviewDoc(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent}>
                <View style={styles.docSheetHeader}>
                  <Text style={styles.docSheetGovText}>REPUBLIC OF THE PHILIPPINES</Text>
                  <Text style={styles.docSheetAgencyText}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                  <Text style={styles.docSheetSubAgency}>NTC Building, BIR Road, East Triangle, Diliman, Quezon City</Text>
                </View>

                <View style={styles.docSheetDivider} />

                <View style={styles.docSheetTitleBox}>
                  <Text style={styles.docSheetTitleText}>{previewDoc.name}</Text>
                  <Text style={styles.docSheetRefText}>REF NO: #{app.referenceNumber}</Text>
                </View>

                <View style={styles.docSheetDataGrid}>
                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Service Name:</Text>
                    <Text style={styles.docSheetValue}>{app.serviceName}</Text>
                  </View>

                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Applicant / Company:</Text>
                    <Text style={styles.docSheetValue}>{primaryName}</Text>
                  </View>

                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Document Category:</Text>
                    <Text style={styles.docSheetValue}>{previewDoc.category.replace('_', ' ')}</Text>
                  </View>

                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Uploaded Date:</Text>
                    <Text style={styles.docSheetValue}>{formatRelativeTime(previewDoc.uploadedAt)}</Text>
                  </View>
                </View>

                <View style={styles.docSheetStampRow}>
                  <View style={styles.officialStampBadge}>
                    <Icon name="check-circle" size={16} color="#16A34A" />
                    <Text style={styles.officialStampText}>OFFICIALLY VERIFIED & VALID</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => {
                    if (onDownloadDoc !== undefined) onDownloadDoc(previewDoc);
                  }}
                  style={styles.modalDownloadBtn}
                  activeOpacity={0.85}
                >
                  <Icon name="download" size={15} color="#FFFFFF" />
                  <Text style={styles.modalDownloadBtnText}>Download File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPreviewDoc(null)}
                  style={styles.modalCloseFooterBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseFooterBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* ── Applicant Details Modal (for Bulk Applicants) ────────────────── */}
      <Modal
        visible={selectedApplicant !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedApplicant(null)}
      >
        {selectedApplicant !== null && (() => {
          const enriched = getEnrichedApplicant(selectedApplicant, app.serviceName);
          return (
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { maxWidth: isMobile ? '95%' : 600 }]}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTitleGroup}>
                    <Icon name="user" size={20} color="#1D4ED8" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle} numberOfLines={1}>
                        Applicant Application Details
                      </Text>
                      <Text style={styles.modalSubtitle}>
                        Details for applicant: {enriched.name}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedApplicant(null)}
                    style={styles.modalCloseBtn}
                  >
                    <Icon name="x" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent}>
                  {/* Status Banner */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: '#475569' }}>APPLICATION STATUS</Text>
                    <View style={{ backgroundColor: getStatusBgColor(enriched.status), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: getStatusColor(enriched.status) }}>
                        {getStatusLabel(enriched.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Section 1: Profile */}
                  <View style={styles.subModalSection}>
                    <View style={styles.subModalSectionHeader}>
                      <Icon name="user" size={14} color="#1D4ED8" />
                      <Text style={styles.subModalSectionTitle}>1. Applicant Profile</Text>
                    </View>
                    <View style={styles.subModalSectionBody}>
                      <DetailRow label="Full Name" value={enriched.name} />
                      <DetailRow label="Sex" value={enriched.sex} />
                      <DetailRow label="Nationality" value={enriched.nationality} />
                      <DetailRow label="Element / Application Type" value={enriched.applicationType} isLast />
                    </View>
                  </View>

                  {/* Section 2: Contacts */}
                  <View style={styles.subModalSection}>
                    <View style={styles.subModalSectionHeader}>
                      <Icon name="mail" size={14} color="#1D4ED8" />
                      <Text style={styles.subModalSectionTitle}>2. Contact Details</Text>
                    </View>
                    <View style={styles.subModalSectionBody}>
                      <DetailRow label="Mobile Number" value={enriched.mobileNumber} />
                      <DetailRow label="Email Address" value={enriched.email} isLast />
                    </View>
                  </View>

                  {/* Section 3: Address */}
                  <View style={styles.subModalSection}>
                    <View style={styles.subModalSectionHeader}>
                      <Icon name="map-pin" size={14} color="#1D4ED8" />
                      <Text style={styles.subModalSectionTitle}>3. Permanent Address</Text>
                    </View>
                    <View style={styles.subModalSectionBody}>
                      <DetailRow label="Street Address" value={enriched.streetAddress} />
                      <DetailRow label="Barangay" value={enriched.barangay} />
                      <DetailRow label="City / Municipality" value={enriched.cityMunicipality} />
                      <DetailRow label="Province" value={enriched.province} />
                      <DetailRow label="Region" value={enriched.region} />
                      <DetailRow label="Zip Code" value={enriched.zipCode} isLast />
                    </View>
                  </View>

                  {/* Section 4: Schedule */}
                  <View style={styles.subModalSection}>
                    <View style={styles.subModalSectionHeader}>
                      <Icon name="calendar" size={14} color="#1D4ED8" />
                      <Text style={styles.subModalSectionTitle}>4. Examination Schedule</Text>
                    </View>
                    <View style={styles.subModalSectionBody}>
                      <DetailRow label="Scheduled Date" value={enriched.schedule.date} />
                      <DetailRow label="Scheduled Time" value={enriched.schedule.time} />
                      <DetailRow label="Venue Location" value={enriched.schedule.venue} isLast />
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={() => setSelectedApplicant(null)}
                    style={styles.modalCloseFooterBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalCloseFooterBtnText}>Close Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })()}
      </Modal>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface DetailRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function DetailRow({ label, value, isLast = false }: DetailRowProps) {
  return (
    <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingVertical: SPACING[24],
    paddingHorizontal: SPACING[16],
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    alignSelf: 'center',
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    marginBottom: 16,
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#1D4ED8',
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
      },
    }),
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  singleBadge: {
    backgroundColor: '#EFF6FF',
  },
  bulkBadge: {
    backgroundColor: '#FFFBEB',
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  modeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  appRefId: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    marginBottom: 4,
  },
  appTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 20,
    lineHeight: 30,
  },

  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 24,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#1D4ED8',
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1D4ED8',
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  tabContentList: {
    gap: 16,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      },
    }),
  },

  progressHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepNode: {
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: {
    backgroundColor: '#16A34A',
  },
  stepCirclePending: {
    backgroundColor: '#E2E8F0',
  },
  stepNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
  },
  stepLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginBottom: 20,
  },
  stepLineDone: {
    backgroundColor: '#16A34A',
  },
  stepLinePending: {
    backgroundColor: '#E2E8F0',
  },

  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  sectionCardBody: {},

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    textAlign: 'right',
  },

  bulkApplicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  bulkApplicantName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  bulkApplicantMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },

  docHeaderContainer: {
    marginBottom: 8,
  },
  docHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  docHeaderSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },

  docRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      },
    }),
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfoCol: {
    flex: 1,
  },
  docNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 3,
  },
  docSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  docActionsRowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docPreviewPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  docPreviewPillBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
  },
  docDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  docDownloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
  },

  /* Modal Overlay & Sheet */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  modalBodyScroll: {
    maxHeight: 450,
  },
  modalBodyContent: {
    padding: 20,
  },
  docSheetMockup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 24,
  },
  docSheetHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  docSheetGovText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    letterSpacing: 0.6,
  },
  docSheetAgencyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  docSheetSubAgency: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  docSheetDivider: {
    height: 2,
    backgroundColor: '#1D4ED8',
    marginVertical: 12,
  },
  docSheetTitleBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  docSheetTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  docSheetRefText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#64748B',
    marginTop: 2,
  },
  docSheetDataGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  docSheetDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docSheetLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  docSheetValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  docSheetStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  officialStampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  officialStampText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#16A34A',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  modalDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalDownloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  modalCloseFooterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  modalCloseFooterBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
  },

  // ── Redesigned Bulk Application Details Styles ───────────────────────
  appSubtitleCompany: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#64748B',
    marginTop: -14,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(0,0,0,0.02)',
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  metricSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  soaValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
    marginBottom: 4,
  },
  viewSoaBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  viewSoaBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  alertBannerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#B45309',
    fontWeight: '500',
    flex: 1,
  },
  tableSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(0,0,0,0.02)',
      },
    }),
  },
  tableSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  tableHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  tableCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tableCountBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  tableSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    minWidth: 180,
  },
  tableSearchInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#0F172A',
    flex: 1,
    padding: 0,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableThRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  thCol: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tableTdRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableTdRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tdCol: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#475569',
  },
  tableStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  tableStatusChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  viewDetailsLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  emptyTableState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTableText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },
  tablePaginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  tablePaginationSummary: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  tablePaginationBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tablePageNavBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  tablePageNavBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#F1F5F9',
  },
  tablePageNumberBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  tablePageNumberBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1D4ED8',
  },
  tablePageNumberText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tablePageNumberTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  subModalSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
  },
  subModalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  subModalSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  subModalSectionBody: {
    gap: 8,
  },
});
