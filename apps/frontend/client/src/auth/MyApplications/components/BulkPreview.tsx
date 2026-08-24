import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Icon } from '@edge/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';
import {
  BulkApplication,
  BulkApplicant,
  ApplicationStatus,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
  getAppDocuments,
  ApplicationDocument,
} from '../data/applicationsData';

interface BulkPreviewProps {
  app: BulkApplication;
  onClose: () => void;
  onDownloadDocument: (doc: ApplicationDocument) => void;
}

const TABLE_PAGE_SIZE = 6;

function StatusChip({ status }: { status: ApplicationStatus }) {
  return (
    <View
      style={[
        styles.statusChip,
        { backgroundColor: getStatusBgColor(status) },
      ]}
    >
      <Text
        style={[
          styles.statusChipText,
          { color: getStatusColor(status) },
        ]}
      >
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

export function BulkPreview({ app, onClose, onDownloadDocument }: BulkPreviewProps) {
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'DOCUMENTS'>('ROSTER');
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<BulkApplicant | null>(null);

  const statusColor = getStatusColor(app.status);
  const statusBg = getStatusBgColor(app.status);
  const documents = getAppDocuments(app);

  // Derived metrics
  const totalSubmitted = app.applicants.length;
  const approvedCount = app.applicants.filter((a) => a.status === 'APPROVED').length;
  const pendingCount = app.applicants.filter((a) => a.status === 'PENDING' || a.status === 'FOR_APPROVAL' || a.status === 'FOR_EVALUATION').length;
  const declinedCount = app.applicants.filter((a) => a.status === 'DECLINED').length;

  // Filter batch applicants
  const filteredApplicants = useMemo<BulkApplicant[]>(() => {
    if (tableSearch.trim() === '') return app.applicants;
    const q = tableSearch.toLowerCase();
    return app.applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.applicationType.toLowerCase().includes(q) ||
        getStatusLabel(a.status).toLowerCase().includes(q),
    );
  }, [app.applicants, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / TABLE_PAGE_SIZE));
  const pagedApplicants = filteredApplicants.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE,
  );

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalContainer}>
        {/* ── Modal Header ────────────────────────────────────────────────── */}
        <View style={styles.modalHeader}>
          <View style={styles.headerTitleGroup}>
            <View style={styles.badgeRow}>
              <View style={styles.bulkBadge}>
                <View style={styles.bulkDot} />
                <Text style={styles.bulkBadgeText}>BULK APPLICATION ({totalSubmitted})</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                  {getStatusLabel(app.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.refNumber}>#{app.referenceNumber}</Text>
            <Text style={styles.companyName}>{app.companyName}</Text>
            <Text style={styles.serviceName}>{app.serviceName}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Icon name="x" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* ── Modal Tabs Bar ──────────────────────────────────────────────── */}
        <View style={styles.tabsBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('ROSTER')}
            style={[styles.tabBtn, activeTab === 'ROSTER' && styles.tabBtnActive]}
          >
            <Icon
              name="users"
              size={15}
              color={activeTab === 'ROSTER' ? COLORS.brand[700] : '#64748B'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'ROSTER' && styles.tabBtnTextActive]}>
              Applicant Roster ({totalSubmitted})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('DOCUMENTS')}
            style={[styles.tabBtn, activeTab === 'DOCUMENTS' && styles.tabBtnActive]}
          >
            <Icon
              name="file-text"
              size={15}
              color={activeTab === 'DOCUMENTS' ? COLORS.brand[700] : '#64748B'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'DOCUMENTS' && styles.tabBtnTextActive]}>
              Batch Documents ({documents.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Modal Body ─────────────────────────────────────────────────── */}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {activeTab === 'ROSTER' ? (
            <>
              {/* Batch Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>TOTAL APPLICANTS</Text>
                  <Text style={styles.metricValue}>{totalSubmitted}</Text>
                  <Text style={styles.metricSub}>In this batch</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>APPROVED</Text>
                  <Text style={[styles.metricValue, { color: '#16A34A' }]}>{approvedCount}</Text>
                  <Text style={styles.metricSub}>Clearance granted</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>PENDING / EVALUATION</Text>
                  <Text style={[styles.metricValue, { color: '#D97706' }]}>{pendingCount}</Text>
                  <Text style={styles.metricSub}>In progress</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>STATEMENT OF ACCOUNT</Text>
                  <Text style={styles.soaValue}>{app.soaNumber ?? 'Pending'}</Text>
                  <Text style={styles.metricSub}>SOA Reference</Text>
                </View>
              </View>

              {/* Roster Search Bar */}
              <View style={styles.tableSearchRow}>
                <View style={styles.tableSearchInputWrap}>
                  <Icon name="search" size={15} color="#94A3B8" />
                  <TextInput
                    placeholder="Search applicant name or status in batch..."
                    placeholderTextColor="#94A3B8"
                    value={tableSearch}
                    onChangeText={(text) => {
                      setTableSearch(text);
                      setTablePage(1);
                    }}
                    style={styles.tableSearchInput}
                  />
                  {tableSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setTableSearch('')}>
                      <Icon name="x" size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Applicants Table */}
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableTh, { flex: 2.2 }]}>APPLICANT NAME</Text>
                  <Text style={[styles.tableTh, { flex: 1.3 }]}>TYPE</Text>
                  <Text style={[styles.tableTh, { flex: 1.3 }]}>STATUS</Text>
                  <Text style={[styles.tableTh, { flex: 1 }]}>SOA</Text>
                  <Text style={[styles.tableTh, { flex: 1.2, textAlign: 'right' }]}>ACTION</Text>
                </View>

                {pagedApplicants.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <Text style={styles.emptyTableText}>No applicants match your search query.</Text>
                  </View>
                ) : (
                  pagedApplicants.map((applicant, idx) => (
                    <View
                      key={applicant.id}
                      style={[
                        styles.tableRow,
                        idx % 2 === 1 && styles.tableRowAlt,
                      ]}
                    >
                      <View style={{ flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={styles.applicantAvatar}>
                          <Text style={styles.avatarText}>{applicant.name.charAt(0)}</Text>
                        </View>
                        <Text style={styles.applicantName}>{applicant.name}</Text>
                      </View>

                      <Text style={[styles.tableTd, { flex: 1.3 }]}>{applicant.applicationType}</Text>

                      <View style={{ flex: 1.3 }}>
                        <StatusChip status={applicant.status} />
                      </View>

                      <Text style={[styles.tableTd, { flex: 1, fontWeight: '600' }]}>
                        {applicant.includedInSOA ? 'Included' : 'Excluded'}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setSelectedApplicant(applicant)}
                        style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: '600', color: '#1D4ED8' }}>View Details</Text>
                        <Icon name="external-link" size={11} color="#1D4ED8" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                {/* Table Pagination */}
                {totalPages > 1 && (
                  <View style={styles.tablePagination}>
                    <Text style={styles.pageInfoText}>
                      Showing {pagedApplicants.length} of {filteredApplicants.length} applicants
                    </Text>

                    <View style={styles.pageBtns}>
                      <TouchableOpacity
                        disabled={tablePage === 1}
                        onPress={() => setTablePage((p) => Math.max(1, p - 1))}
                        style={[styles.pageBtn, tablePage === 1 && styles.pageBtnDisabled]}
                      >
                        <Icon name="chevron-left" size={14} color={tablePage === 1 ? '#CBD5E1' : '#334155'} />
                      </TouchableOpacity>

                      <Text style={styles.pageNumberText}>
                        Page {tablePage} of {totalPages}
                      </Text>

                      <TouchableOpacity
                        disabled={tablePage === totalPages}
                        onPress={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                        style={[styles.pageBtn, tablePage === totalPages && styles.pageBtnDisabled]}
                      >
                        <Icon name="chevron-right" size={14} color={tablePage === totalPages ? '#CBD5E1' : '#334155'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </>
          ) : (
            /* Documents Tab */
            <View style={styles.documentsContainer}>
              <Text style={styles.documentsSectionTitle}>Batch Files & Statement of Account</Text>
              <Text style={styles.documentsSectionSubtitle}>
                Download SOA, corporate rosters, payment receipts, and bundled approved permits.
              </Text>

              {documents.length === 0 ? (
                <View style={{ padding: 24, backgroundColor: '#F8FAFC', borderRadius: 10, alignItems: 'center', marginVertical: 12 }}>
                  <Icon name="file-text" size={32} color="#94A3B8" />
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: '#64748B', marginTop: 8 }}>
                    No attached batch documents or files submitted with this application.
                  </Text>
                </View>
              ) : (
                documents.map((doc) => (
                  <View key={doc.id} style={styles.documentCard}>
                    <View style={styles.docIconWrap}>
                      <Icon
                        name={doc.type === 'ZIP' ? 'folder' : 'file-text'}
                        size={20}
                        color={COLORS.brand[700]}
                      />
                    </View>

                    <View style={styles.docInfoWrap}>
                      <Text style={styles.docName}>{doc.name}</Text>
                      <View style={styles.docMetaRow}>
                        <Text style={styles.docCategory}>{doc.category.replace('_', ' ')}</Text>
                        <Text style={styles.docDot}>•</Text>
                        <Text style={styles.docSize}>{doc.size}</Text>
                        <Text style={styles.docDot}>•</Text>
                        <Text style={styles.docFormat}>{doc.type}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => onDownloadDocument(doc)}
                      style={styles.docDownloadBtn}
                      activeOpacity={0.8}
                    >
                      <Icon name="download" size={14} color={COLORS.brand[700]} />
                      <Text style={styles.docDownloadBtnText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    width: '96%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    }),
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: SPACING[20],
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleGroup: {
    flex: 1,
    paddingRight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },

  bulkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bulkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginRight: 6,
  },
  bulkBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#D97706',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
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

  refNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    marginBottom: 2,
  },
  companyName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  serviceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: SPACING[20],
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  tabBtnActive: {
    borderBottomColor: COLORS.brand[700],
  },
  tabBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  scrollBody: {
    padding: SPACING[20],
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING[16],
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[16],
  },
  metricLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  soaValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  metricSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Table Search
  tableSearchRow: {
    marginBottom: 12,
  },
  tableSearchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tableSearchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },

  // Table Card
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableTh: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },

  applicantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  applicantName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0F172A',
  },
  tableTd: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#475569',
  },

  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  emptyTable: {
    padding: SPACING[20],
    alignItems: 'center',
  },
  emptyTableText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },

  tablePagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pageInfoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  pageBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#F1F5F9',
  },
  pageNumberText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#334155',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Documents Tab
  documentsContainer: {
    gap: 12,
  },
  documentsSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  documentsSectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },

  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[16],
    gap: 12,
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfoWrap: {
    flex: 1,
  },
  docName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docCategory: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#D97706',
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  docDot: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  docSize: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
  },
  docFormat: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  docDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  docDownloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
});
