import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
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
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionTitleRow}>
        <Icon name={icon as unknown as any} size={16} color={COLORS.brand[700]} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionDivider} />
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function SinglePreview({ app, onClose, onDownloadDocument }: SinglePreviewProps) {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');
  const statusColor = getStatusColor(app.status);
  const statusBg = getStatusBgColor(app.status);
  const documents = getAppDocuments(app);

  // Status timeline steps
  const steps = [
    { label: 'Submitted', done: true },
    { label: 'Evaluation', done: app.status !== 'PENDING' },
    { label: 'For Approval', done: app.status === 'FOR_APPROVAL' || app.status === 'APPROVED' },
    { label: 'Approved & Issued', done: app.status === 'APPROVED' },
  ];

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalContainer}>
        {/* ── Modal Header ────────────────────────────────────────────────── */}
        <View style={styles.modalHeader}>
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
            <Text style={styles.serviceName}>{app.serviceName}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Icon name="x" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* ── Modal Tabs Bar ──────────────────────────────────────────────── */}
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

        {/* ── Modal Scrollable Body ───────────────────────────────────────── */}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {activeTab === 'DETAILS' ? (
            <>
              {/* Status Stepper Timeline */}
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
                          <Icon name="check" size={11} color="#FFFFFF" />
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

              {/* Basic Information (1 Applicant) */}
              <SectionCard title="1. Applicant Profile" icon="user">
                <InfoRow label="Full Name" value={app.applicantName} />
                <InfoRow label="Sex" value={app.sex} />
                <InfoRow label="Nationality" value={app.nationality} />
                <InfoRow label="Element Type" value={app.element} />
                <InfoRow label="Submission Date" value={formatRelativeTime(app.submittedAt)} />
              </SectionCard>

              {/* Contact Information */}
              <SectionCard title="2. Contact Details" icon="mail">
                <InfoRow label="Mobile Number" value={app.mobileNumber} />
                <InfoRow label="Email Address" value={app.email} />
              </SectionCard>

              {/* Location & Address */}
              <SectionCard title="3. Permanent Address" icon="map-pin">
                <InfoRow label="Street Address" value={app.streetAddress} />
                <InfoRow label="Barangay" value={app.barangay ?? 'Brgy 4'} />
                <InfoRow label="City / Municipality" value={app.cityMunicipality} />
                <InfoRow label="Province" value={app.province} />
                <InfoRow label="Region" value={app.region} />
                <InfoRow label="Zip Code" value={app.zipCode ?? '9506'} />
              </SectionCard>

              {/* Examination Schedule */}
              <SectionCard title="4. Examination Schedule" icon="calendar">
                <InfoRow label="Scheduled Date" value={app.schedule.date} />
                <InfoRow label="Scheduled Time" value={app.schedule.time} />
                <InfoRow label="Venue Location" value={app.schedule.venue} />
              </SectionCard>
            </>
          ) : (
            /* Documents & Downloads Tab */
            <View style={styles.documentsContainer}>
              <Text style={styles.documentsSectionTitle}>Attached & Issued Documents</Text>
              <Text style={styles.documentsSectionSubtitle}>
                Download official application documents, admission slips, receipts, and permits below.
              </Text>

              {documents.map((doc) => (
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
              ))}
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
    padding: SPACING[16],
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
    maxWidth: 720,
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

  singleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  singleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2F56E8',
    marginRight: 6,
  },
  singleBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#2F56E8',
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
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    marginBottom: 2,
  },
  serviceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
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

  // Stepper
  stepperContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: SPACING[16],
    marginBottom: SPACING[16],
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#334155',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 2,
  },
  stepDotDone: {
    backgroundColor: '#16A34A',
  },
  stepDotPending: {
    backgroundColor: '#CBD5E1',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    textAlign: 'center',
  },
  stepLabelDone: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  stepLabelPending: {
    color: '#94A3B8',
  },
  stepConnector: {
    position: 'absolute',
    top: 11,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepConnectorDone: {
    backgroundColor: '#16A34A',
  },

  // Section card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[16],
    marginBottom: SPACING[16],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  sectionBody: {
    gap: 10,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0F172A',
  },

  // Documents tab
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
    backgroundColor: '#EFF6FF',
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
    color: COLORS.brand[700],
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
