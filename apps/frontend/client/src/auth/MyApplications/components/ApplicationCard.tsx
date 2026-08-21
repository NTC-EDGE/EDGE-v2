import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { Icon } from '@edge/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';
import {
  Application,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
  getAppDocuments,
  ApplicationDocument,
} from '../data/applicationsData';
import {
  FIELD_ID_TYPE_OF_CERT,
  FIELD_ID_PERMIT_TYPE,
  FIELD_ID_APP_TYPE,
} from '../../../shared/constants/fieldIds';

interface ApplicationCardProps {
  app: Application;
  onPress: () => void;
  onPreviewDoc?: (doc: ApplicationDocument) => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
  style?: object;
}

export function ApplicationCard({
  app,
  onPress,
  onPreviewDoc,
  onDownloadDoc,
  style,
}: ApplicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardPreviewDoc, setCardPreviewDoc] = useState<ApplicationDocument | null>(null);

  const isBulk = app.mode === 'BULK';
  const primaryName = isBulk ? app.companyName : app.applicantName;
  const statusColor = getStatusColor(app.status);
  const statusBg = getStatusBgColor(app.status);
  const docs = getAppDocuments(app);
  const totalApplicants = isBulk ? app.applicants.length : 1;

  const resolvedVariant =
    app.serviceVariantName ||
    app.variant ||
    (app.formFieldValues?.find(
      (fv) =>
        fv.fieldId === FIELD_ID_TYPE_OF_CERT ||
        fv.fieldId === FIELD_ID_PERMIT_TYPE ||
        fv.fieldId === FIELD_ID_APP_TYPE ||
        (fv.fieldId !== undefined && fv.fieldId.toLowerCase().includes('variant')) ||
        (fv.fieldLabel !== undefined && (
          fv.fieldLabel.toLowerCase().includes('permit / license type') ||
          fv.fieldLabel.toLowerCase().includes('type of certificate') ||
          fv.fieldLabel.toLowerCase().includes('application variant') ||
          fv.fieldLabel.toLowerCase().includes('application type')
        ))
    )?.value) ||
    (!isBulk && Array.isArray(app.applicants) && app.applicants.length > 0 && app.applicants[0].applicationType && app.applicants[0].applicationType !== 'Individual' ? app.applicants[0].applicationType : undefined) ||
    (app.element !== 'New' ? app.element : '');

  return (
    <View style={[styles.card, style]}>
      {/* ── Card Top Header (Matching Screenshot 1) ────────────────────── */}
      <View style={styles.cardTopHeader}>
        <View style={styles.leftBadges}>
          <View
            style={[
              styles.modeBadge,
              isBulk ? styles.bulkBadge : styles.singleBadge,
            ]}
          >
            <View
              style={[
                styles.modeDot,
                { backgroundColor: isBulk ? '#D97706' : '#1D4ED8' },
              ]}
            />
            <Text
              style={[
                styles.modeBadgeText,
                { color: isBulk ? '#D97706' : '#1D4ED8' },
              ]}
            >
              {isBulk ? `BULK (${totalApplicants})` : 'SINGLE'}
            </Text>
          </View>

          <Text style={styles.refNumber}>#{app.referenceNumber}</Text>
        </View>

        <View style={styles.rightHeaderGroup}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {getStatusLabel(app.status)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsExpanded((prev) => !prev)}
            style={styles.chevronToggleBtn}
            activeOpacity={0.7}
          >
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Content Body ──────────────────── */}
      <View style={styles.cardBody}>
        {/* Service Category & Service Variant Badges */}
        <View style={styles.serviceMetaRow}>
          {app.serviceCategory ? (
            <View style={styles.categoryBadge}>
              <Icon name="grid" size={11} color="#0369A1" />
              <Text style={styles.categoryBadgeText}>
                {app.serviceCategory.toUpperCase()}
              </Text>
            </View>
          ) : null}

          {resolvedVariant ? (
            <View style={styles.variantBadge}>
              <Icon name="layers" size={11} color="#4338CA" />
              <Text style={styles.variantBadgeText} numberOfLines={1}>
                {resolvedVariant}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.serviceName} numberOfLines={2}>
          {app.serviceName}
        </Text>

        <View style={styles.detailsMetaRow}>
          <View style={styles.metaItem}>
            <Icon name="user" size={14} color="#64748B" />
            <Text style={styles.primaryName} numberOfLines={1}>
              {primaryName}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="clock" size={14} color="#64748B" />
            <Text style={styles.metaText}>{formatRelativeTime(app.submittedAt)}</Text>
          </View>
        </View>
      </View>

      {/* ── Card Footer Actions Bar (Screenshot 1 Layout: NO Download Btn) ── */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          onPress={() => setIsExpanded((prev) => !prev)}
          style={styles.docsSummary}
          activeOpacity={0.7}
        >
          <Icon name="file-text" size={15} color="#475569" />
          <Text style={styles.docsSummaryText}>
            {docs.length} Document{docs.length === 1 ? '' : 's'} available
          </Text>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#64748B"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPress}
          style={styles.viewDetailsBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.viewDetailsBtnText}>View Details</Text>
          <Icon name="chevron-right" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Expanded Quick Document Roster (Screenshot 3 Items) ───────── */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          <View style={styles.dividerLine} />

          <View style={styles.docsListContainer}>
            {docs.map((doc, idx) => {
              const categoryLabel = getDocCategoryGroupLabel(doc.category);
              const actionText = getDocActionText(doc.name, doc.category);
              const isLast = idx === docs.length - 1;

              return (
                <View
                  key={doc.id}
                  style={[
                    styles.docRowItem,
                    isLast && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.docCategoryText}>{categoryLabel}</Text>

                  <View style={styles.docActionsGroup}>
                    <TouchableOpacity
                      onPress={() => {
                        if (onPreviewDoc !== undefined) {
                          onPreviewDoc(doc);
                        } else {
                          setCardPreviewDoc(doc);
                        }
                      }}
                      style={styles.docOutlinePillBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.docOutlinePillText}>
                        {actionText}
                      </Text>
                      <Icon name="chevron-right" size={14} color="#64748B" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        if (onDownloadDoc !== undefined) {
                          onDownloadDoc(doc);
                        }
                      }}
                      style={styles.docDownloadIconBtn}
                      activeOpacity={0.8}
                    >
                      <Icon name="download" size={15} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Internal Quick Document Preview Modal ───────────────────────── */}
      <Modal
        visible={cardPreviewDoc !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCardPreviewDoc(null)}
      >
        {cardPreviewDoc !== null && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleGroup}>
                  <Icon name="file-text" size={20} color="#1D4ED8" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle} numberOfLines={1}>
                      {getDocActionText(cardPreviewDoc.name, cardPreviewDoc.category)}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {getDocCategoryGroupLabel(cardPreviewDoc.category)} · REF #{app.referenceNumber}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setCardPreviewDoc(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBodyContent}>
                <View style={styles.docSheetHeader}>
                  <Text style={styles.docSheetGovText}>REPUBLIC OF THE PHILIPPINES</Text>
                  <Text style={styles.docSheetAgencyText}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                  <Text style={styles.docSheetSubAgency}>NTC Building, BIR Road, East Triangle, Diliman, Quezon City</Text>
                </View>

                <View style={styles.docSheetDivider} />

                <View style={styles.docSheetTitleBox}>
                  <Text style={styles.docSheetTitleText}>
                    {getDocActionText(cardPreviewDoc.name, cardPreviewDoc.category).toUpperCase()}
                  </Text>
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
                    <Text style={styles.docSheetLabel}>Category:</Text>
                    <Text style={styles.docSheetValue}>
                      {getDocCategoryGroupLabel(cardPreviewDoc.category)}
                    </Text>
                  </View>

                  <View style={styles.docSheetDataRow}>
                    <Text style={styles.docSheetLabel}>Uploaded Date:</Text>
                    <Text style={styles.docSheetValue}>
                      {formatRelativeTime(cardPreviewDoc.uploadedAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.docSheetStampRow}>
                  <View style={styles.officialStampBadge}>
                    <Icon name="check-circle" size={16} color="#16A34A" />
                    <Text style={styles.officialStampText}>OFFICIALLY VERIFIED & VALID</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => {
                    if (onDownloadDoc !== undefined) onDownloadDoc(cardPreviewDoc);
                  }}
                  style={styles.modalDownloadBtn}
                  activeOpacity={0.85}
                >
                  <Icon name="download" size={15} color="#FFFFFF" />
                  <Text style={styles.modalDownloadBtnText}>Download File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCardPreviewDoc(null)}
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
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getDocCategoryGroupLabel(category: string): string {
  if (category === 'RECEIPT' || category === 'SOA') return 'PAYMENT';
  if (category === 'ADMISSION_SLIP') return 'ADMISSION SLIP';
  return 'FORM DOCUMENT';
}

function getDocActionText(docName: string, category: string): string {
  const nameLower = docName.toLowerCase();
  if (nameLower.includes('official_receipt') || nameLower.includes('payment_receipt')) {
    return 'Official Receipt';
  }
  if (category === 'SOA' || nameLower.includes('statement_of_account')) {
    return 'SOA';
  }
  if (nameLower.includes('order_of_payment')) {
    return 'Order of Payment';
  }
  return 'Preview';
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles (Matching Screenshot 1 Base Card Layout)
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 6,
    borderLeftColor: '#1D4ED8', // Colored left border on EVERY card
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 200,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
      },
    }),
  },

  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  leftBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    flex: 1,
  },

  rightHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  singleBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bulkBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
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

  refNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#334155',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
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

  chevronToggleBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardBody: {
    padding: SPACING[20],
    flex: 1,
    justifyContent: 'center',
  },

  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  categoryBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    maxWidth: 280,
  },
  variantBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#4338CA',
  },

  serviceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 14,
    lineHeight: 24,
  },

  detailsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
    maxWidth: 200,
  },
  metaText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },

  docsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docsSummaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#475569',
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.brand[700],
    gap: 6,
  },
  viewDetailsBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },

  /* Expanded Roster */
  expandedSection: {
    paddingHorizontal: SPACING[20],
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  docsListContainer: {
    gap: 4,
  },
  docRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  docCategoryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  docActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docOutlinePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docOutlinePillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#475569',
  },
  docDownloadIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Modal Overlay & Quick Preview */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
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
  modalBodyContent: {
    padding: 20,
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
    marginTop: 4,
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
});
