import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
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

  const isBulk = app.mode === 'BULK';
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

          <Text style={styles.appRefId}>#{app.referenceNumber}</Text>
          <Text style={styles.appTitle}>{app.serviceName}</Text>

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

            {/* Section 1: Applicant Profile */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <Icon name="user" size={18} color="#1D4ED8" />
                <Text style={styles.sectionCardTitle}>
                  1. {isBulk ? 'Company & Service Profile' : 'Applicant Profile'}
                </Text>
              </View>

              <View style={styles.sectionCardBody}>
                {isBulk ? (
                  <>
                    <DetailRow label="Company Name" value={app.companyName} />
                    <DetailRow label="Service Category" value={app.serviceCategory} />
                    <DetailRow label="Element Type" value={app.element} />
                    <DetailRow label="Total Applicants" value={`${app.applicants.length} Applicants`} />
                    <DetailRow label="SOA Reference" value={app.soaNumber ?? 'Pending Generation'} />
                    <DetailRow label="Submission Date" value={submissionTime} isLast />
                  </>
                ) : (
                  <>
                    <DetailRow label="Full Name" value={primaryName} />
                    <DetailRow label="Sex" value={app.sex} />
                    <DetailRow label="Nationality" value={app.nationality} />
                    <DetailRow label="Element Type" value={app.element} />
                    <DetailRow label="Submission Date" value={submissionTime} isLast />
                  </>
                )}
              </View>
            </View>

            {/* Section 2: Contact Details */}
            {!isBulk && (
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
            )}

            {/* Section 3: Permanent Address */}
            {!isBulk && (
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
            )}

            {/* Bulk Applicants Roster (for Bulk Applications) */}
            {isBulk && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <Icon name="users" size={18} color="#1D4ED8" />
                  <Text style={styles.sectionCardTitle}>
                    2. Bulk Applicants Roster ({app.applicants.length})
                  </Text>
                </View>

                <View style={styles.sectionCardBody}>
                  {app.applicants.map((applicant, idx) => (
                    <View
                      key={applicant.id}
                      style={[
                        styles.bulkApplicantRow,
                        idx === app.applicants.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bulkApplicantName}>{applicant.name}</Text>
                        <Text style={styles.bulkApplicantMeta}>
                          {applicant.applicationType} · {applicant.includedInSOA ? 'Included in SOA' : 'Separate Payment'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusBgColor(applicant.status) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: getStatusColor(applicant.status) },
                          ]}
                        >
                          {getStatusLabel(applicant.status)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Tab Content: Documents ────────────────────────────────────── */}
        {activeTab === 'DOCUMENTS' && (
          <View style={styles.tabContentList}>
            <View style={styles.docHeaderContainer}>
              <Text style={styles.docHeaderTitle}>Attached & Issued Documents</Text>
              <Text style={styles.docHeaderSubtitle}>
                Download official application documents, admission slips, receipts, and permits below.
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

                <TouchableOpacity
                  onPress={() => {
                    if (onDownloadDoc !== undefined) onDownloadDoc(doc);
                  }}
                  style={styles.docDownloadBtn}
                  activeOpacity={0.8}
                >
                  <Icon name="download" size={14} color="#1D4ED8" />
                  <Text style={styles.docDownloadBtnText}>Download</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
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
  docDownloadBtn: {
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
  docDownloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1D4ED8',
  },
});
