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
import { Icon } from '@edge/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';
import {
  SingleApplication,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
  getAppDocuments,
  ApplicationDocument,
} from '../data/applicationsData';

interface SinglePreviewProps {
  app: SingleApplication;
  onClose: () => void;
  onDownloadDocument: (doc: ApplicationDocument) => void;
}

interface InfoRowProps {
  label: string;
  value: string;
  isEven?: boolean;
}

function InfoRow({ label, value, isEven = false }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, isEven && styles.infoRowEven]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionIconWrap}>
          <Icon name={icon as unknown as any} size={15} color={COLORS.brand[700]} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionDivider} />
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function SinglePreview({ app, onClose, onDownloadDocument }: SinglePreviewProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');
  const statusColor = getStatusColor(app.status);
  const statusBg = getStatusBgColor(app.status);
  const documents = getAppDocuments(app);

  // Status timeline steps
  const steps = [
    { label: 'Submitted', sub: 'Received', done: true },
    { label: 'Evaluation', sub: 'Under review', done: app.status !== 'PENDING' },
    { label: 'For Approval', sub: 'Awaiting decision', done: app.status === 'FOR_APPROVAL' || app.status === 'APPROVED' },
    { label: 'Approved', sub: 'License ready', done: app.status === 'APPROVED' },
  ];

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.modalContainer, { width: '96%' }]}>

        {/* ── Modal Header ── */}
        <View style={styles.modalHeader}>
          <View style={styles.headerAccentBar} />
          <View style={styles.headerContent}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.badgeRow}>
                <View style={styles.singleBadge}>
                  <View style={styles.singleDot} />
                  <Text style={styles.singleBadgeText}>SINGLE APPLICATION</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                    {getStatusLabel(app.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.refNumber}>#{app.referenceNumber}</Text>
              <Text style={[styles.serviceName, { fontSize: isDesktop ? 22 : 18 }]}>
                {app.serviceName}
              </Text>
              <Text style={styles.submittedAt}>
                Submitted {formatRelativeTime(app.submittedAt)}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Icon name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tab Bar ── */}
        <View style={styles.tabsBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('DETAILS')}
            style={[styles.tabBtn, activeTab === 'DETAILS' && styles.tabBtnActive]}
          >
            <Icon
              name="user"
              size={15}
              color={activeTab === 'DETAILS' ? COLORS.brand[700] : '#64748B'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'DETAILS' && styles.tabBtnTextActive]}>
              Applicant Details
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
              Documents ({documents.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Scrollable Body ── */}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {activeTab === 'DETAILS' ? (
            <>
              {/* Status Stepper */}
              <View style={styles.stepperContainer}>
                <Text style={styles.stepperHeaderTitle}>Application Progress</Text>
                <View style={styles.stepperTrack}>
                  {steps.map((step, idx) => (
                    <View key={step.label} style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          step.done ? styles.stepDotDone : styles.stepDotPending,
                        ]}
                      >
                        {step.done ? (
                          <Icon name="check" size={13} color="#FFFFFF" />
                        ) : (
                          <Text style={styles.stepNumber}>{idx + 1}</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          step.done ? styles.stepLabelDone : styles.stepLabelPending,
                        ]}
                      >
                        {step.label}
                      </Text>
                      <Text style={styles.stepSub}>{step.sub}</Text>
                      {idx < steps.length - 1 && (
                        <View
                          style={[
                            styles.stepConnector,
                            steps[idx + 1].done && styles.stepConnectorDone,
                          ]}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* 2-column layout on desktop */}
              <View style={isDesktop ? styles.twoColRow : styles.oneColStack}>
                {/* Left column */}
                <View style={isDesktop ? styles.twoColLeft : undefined}>
                  <SectionCard title="1. Applicant Profile" icon="user">
                    <InfoRow label="Full Name" value={app.applicantName} isEven={false} />
                    <InfoRow label="Sex" value={app.sex} isEven={true} />
                    <InfoRow label="Nationality" value={app.nationality} isEven={false} />
                    <InfoRow label="Element Type" value={app.element} isEven={true} />
                    <InfoRow label="Submission Date" value={formatRelativeTime(app.submittedAt)} isEven={false} />
                  </SectionCard>

                  <SectionCard title="2. Contact Details" icon="mail">
                    <InfoRow label="Mobile Number" value={app.mobileNumber} isEven={false} />
                    <InfoRow label="Email Address" value={app.email} isEven={true} />
                  </SectionCard>
                </View>

                {/* Right column */}
                <View style={isDesktop ? styles.twoColRight : undefined}>
                  <SectionCard title="3. Permanent Address" icon="map-pin">
                    <InfoRow label="Street Address" value={app.streetAddress} isEven={false} />
                    <InfoRow label="Barangay" value={app.barangay ?? 'Brgy 4'} isEven={true} />
                    <InfoRow label="City / Municipality" value={app.cityMunicipality} isEven={false} />
                    <InfoRow label="Province" value={app.province} isEven={true} />
                    <InfoRow label="Region" value={app.region} isEven={false} />
                    <InfoRow label="Zip Code" value={app.zipCode ?? '9506'} isEven={true} />
                  </SectionCard>

                  <SectionCard title="4. Examination Schedule" icon="calendar">
                    <InfoRow label="Scheduled Date" value={app.schedule.date} isEven={false} />
                    <InfoRow label="Scheduled Time" value={app.schedule.time} isEven={true} />
                    <InfoRow label="Venue Location" value={app.schedule.venue} isEven={false} />
                  </SectionCard>
                </View>
              </View>
            </>
          ) : (
            /* Documents Tab */
            <View style={styles.documentsContainer}>
              <View style={styles.docHeaderWrap}>
                <Text style={styles.documentsSectionTitle}>Attached & Issued Documents</Text>
                <Text style={styles.documentsSectionSubtitle}>
                  Download official application documents, admission slips, receipts, and permits below.
                </Text>
              </View>

              {documents.map((doc) => {
                const isZip = doc.type === 'ZIP';
                return (
                  <View key={doc.id} style={styles.documentCard}>
                    <View style={[styles.docIconWrap, isZip && styles.docIconWrapAmber]}>
                      <Icon
                        name={isZip ? 'folder' : 'file-text'}
                        size={20}
                        color={isZip ? '#D97706' : COLORS.brand[700]}
                      />
                    </View>

                    <View style={styles.docInfoWrap}>
                      <Text style={styles.docName}>{doc.name}</Text>
                      <View style={styles.docMetaRow}>
                        <View style={[styles.docTypeBadge, isZip && styles.docTypeBadgeAmber]}>
                          <Text style={[styles.docTypeText, isZip && styles.docTypeTextAmber]}>
                            {doc.type}
                          </Text>
                        </View>
                        <Text style={styles.docDot}>•</Text>
                        <Text style={styles.docCategory}>{doc.category.replace('_', ' ')}</Text>
                        <Text style={styles.docDot}>•</Text>
                        <Text style={styles.docSize}>{doc.size}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => onDownloadDocument(doc)}
                      style={styles.docDownloadBtn}
                      activeOpacity={0.8}
                    >
                      <Icon name="download" size={14} color="#FFFFFF" />
                      <Text style={styles.docDownloadBtnText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.18), 0 10px 20px -8px rgba(0,0,0,0.08)',
      },
    }),
  },

  // Header
  modalHeader: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  headerAccentBar: {
    width: 4,
    backgroundColor: COLORS.brand[700],
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: SPACING[20],
    gap: 12,
  },
  headerTitleGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  singleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  singleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.brand[700],
    marginRight: 6,
  },
  singleBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    letterSpacing: 0.4,
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
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#475569',
    marginBottom: 2,
  },
  serviceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 4,
  },
  submittedAt: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  // Tab bar
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: SPACING[20],
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
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

  // Scroll body
  scrollBody: {
    padding: SPACING[20],
    paddingBottom: 32,
  },

  // Stepper
  stepperContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: SPACING[20],
    marginBottom: SPACING[20],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#334155',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  stepDotDone: {
    backgroundColor: '#16A34A',
  },
  stepDotPending: {
    backgroundColor: '#CBD5E1',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    textAlign: 'center',
  },
  stepLabelDone: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  stepLabelPending: {
    color: '#94A3B8',
  },
  stepSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  stepConnector: {
    position: 'absolute',
    top: 15,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepConnectorDone: {
    backgroundColor: '#16A34A',
  },

  // Two-column layout
  twoColRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  oneColStack: {
    flexDirection: 'column',
  },
  twoColLeft: {
    flex: 1,
    gap: 16,
  },
  twoColRight: {
    flex: 1,
    gap: 16,
  },

  // Section card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand[700],
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING[16],
    paddingTop: 14,
    paddingBottom: 12,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  sectionBody: {
    paddingBottom: 4,
  },

  // Info rows with alternating background
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: SPACING[16],
    backgroundColor: '#FFFFFF',
  },
  infoRowEven: {
    backgroundColor: '#F8FAFC',
  },
  infoLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  infoValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0F172A',
    textAlign: 'right',
    flex: 1,
  },

  // Documents tab
  documentsContainer: {
    gap: 12,
  },
  docHeaderWrap: {
    marginBottom: 4,
  },
  documentsSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  documentsSectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },

  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[20],
    gap: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px -2px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docIconWrapAmber: {
    backgroundColor: '#FFFBEB',
  },
  docInfoWrap: {
    flex: 1,
  },
  docName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 6,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  docTypeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  docTypeBadgeAmber: {
    backgroundColor: '#FFFBEB',
  },
  docTypeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    letterSpacing: 0.3,
  },
  docTypeTextAmber: {
    color: '#D97706',
  },
  docDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  docCategory: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  docSize: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#94A3B8',
  },

  docDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[700],
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    gap: 6,
  },
  docDownloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});
