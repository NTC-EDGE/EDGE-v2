import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { ApplicationData } from '../data/mockApplications';

interface ActivitiesDetailPaneProps {
  application: ApplicationData | undefined;
  activeTab: 'bulk' | 'details' | 'payment';
  onTabChange: (tab: 'bulk' | 'details' | 'payment') => void;
}

interface ApplicantRow {
  name: string;
  status: string;
}

export function ActivitiesDetailPane({
  application,
  activeTab,
  onTabChange,
}: ActivitiesDetailPaneProps) {
  // Local state to track which applicant rows are selected
  const [selectedApplicants, setSelectedApplicants] = useState<Record<string, boolean>>({});

  // Reset selected applicants when active application changes
  useEffect(() => {
    setSelectedApplicants({});
  }, [application]);

  if (application === undefined) {
    return (
      <View style={styles.placeholderContainer}>
        <View style={styles.placeholderIconWrapper}>
          <Lucide name="inbox" size={48} color={COLORS.neutral[300]} />
        </View>
        <Text style={styles.placeholderTitle}>No activity selected</Text>
        <Text style={styles.placeholderText}>
          Select an item from the feed list on the left to view its verification history, applicant list, and payment records.
        </Text>
      </View>
    );
  }

  // Get applicants list based on flow type
  const applicants: ApplicantRow[] =
    application.flowType === 'BULK'
      ? [
          { name: 'Edissa Amante', status: 'Pending' },
          { name: 'Dezza Lorilla', status: 'Pending' },
          { name: 'Juan Dela Cruz', status: 'Approved' },
        ]
      : [{ name: application.applicant, status: application.status === 'APPROVED' || application.status === 'COMPLETED' ? 'Approved' : 'Pending' }];

  const toggleSelectApplicant = (name: string) => {
    setSelectedApplicants((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const isAllSelected = applicants.every((app) => selectedApplicants[app.name] === true);
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedApplicants({});
    } else {
      const updated: Record<string, boolean> = {};
      applicants.forEach((app) => {
        updated[app.name] = true;
      });
      setSelectedApplicants(updated);
    }
  };

  const selectedCount = Object.values(selectedApplicants).filter(Boolean).length;
  const isAnySelected = selectedCount > 0;

  return (
    <View style={styles.container}>
      {/* Detail Pane Header Tabs */}
      <View style={styles.tabBar}>
        {(['bulk', 'details', 'payment'] as const).map((tabKey) => {
          const isActive = activeTab === tabKey;
          const label =
            tabKey === 'bulk'
              ? 'Bulk Applications'
              : tabKey === 'details'
              ? 'Application Details'
              : 'SOA & Payment';
          return (
            <Pressable
              key={tabKey}
              onPress={() => onTabChange(tabKey)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'bulk' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Applicants</Text>

            {/* Applicants Table */}
            <View style={[styles.tableContainer, SHADOWS.card]}>
              <View style={styles.tableHeaderRow}>
                <Pressable onPress={toggleSelectAll} style={styles.checkboxCell}>
                  <View style={[styles.checkbox, isAllSelected && styles.checkboxChecked]}>
                    {isAllSelected && <Lucide name="check" size={10} color={COLORS.neutral.white} />}
                  </View>
                </Pressable>
                <Text style={[styles.headerCell, { flex: 3 }]}>Name</Text>
                <Text style={[styles.headerCell, { flex: 2 }]}>Status</Text>
                <Text style={[styles.headerCell, { flex: 2, textAlign: 'right' }]}>Preview Application</Text>
              </View>

              {applicants.map((row) => {
                const isRowSelected = selectedApplicants[row.name] === true;
                return (
                  <View key={row.name} style={[styles.tableRow, isRowSelected && styles.tableRowSelected]}>
                    <Pressable
                      onPress={() => toggleSelectApplicant(row.name)}
                      style={styles.checkboxCell}
                    >
                      <View style={[styles.checkbox, isRowSelected && styles.checkboxChecked]}>
                        {isRowSelected && <Lucide name="check" size={10} color={COLORS.neutral.white} />}
                      </View>
                    </Pressable>
                    <Text style={[styles.rowCellText, { flex: 3, fontWeight: '600' }]}>{row.name}</Text>
                    <View style={[{ flex: 2, flexDirection: 'row' }]}>
                      <View
                        style={[
                          styles.statusBadge,
                          row.status === 'Approved' ? styles.badgeSuccess : styles.badgeWarning,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            row.status === 'Approved' ? styles.textSuccess : styles.textWarning,
                          ]}
                        >
                          {row.status}
                        </Text>
                      </View>
                    </View>
                    <Pressable style={[styles.previewLink, { flex: 2 }]}>
                      <Text style={styles.previewLinkText}>View Details</Text>
                      <Lucide name="external-link" size={12} color={COLORS.brand[700]} />
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {/* Pagination / Summary Row */}
            <View style={styles.tableFooter}>
              <View style={styles.paginationButtons}>
                <Pressable style={styles.pageBtnDisabled}>
                  <Text style={styles.pageBtnTextDisabled}>Previous</Text>
                </Pressable>
                <Pressable style={styles.pageBtnDisabled}>
                  <Text style={styles.pageBtnTextDisabled}>Next</Text>
                </Pressable>
              </View>
              <Text style={styles.footerCount}>
                {selectedCount} over {applicants.length} applications selected
              </Text>
            </View>

            {/* Actions Footer */}
            <View style={styles.actionsPanel}>
              <Pressable
                style={[
                  styles.actionBtn,
                  isAnySelected ? styles.btnApproveActive : styles.btnDisabled,
                ]}
                disabled={!isAnySelected}
              >
                <Text style={[styles.actionBtnText, isAnySelected && styles.btnTextWhite]}>Approve</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionBtn,
                  isAnySelected ? styles.btnDeclineActive : styles.btnDisabled,
                ]}
                disabled={!isAnySelected}
              >
                <Text style={[styles.actionBtnText, isAnySelected && styles.btnTextWhite]}>Decline</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionBtnOutline,
                  isAnySelected ? styles.btnEndorseActive : styles.btnOutlineDisabled,
                ]}
                disabled={!isAnySelected}
              >
                <Text style={[styles.actionBtnOutlineText, isAnySelected && styles.btnTextBrand]}>Endorse</Text>
                <Lucide
                  name="arrow-right"
                  size={14}
                  color={isAnySelected ? COLORS.brand[700] : COLORS.neutral[400]}
                  style={{ marginLeft: 6 }}
                />
              </Pressable>

              <Pressable
                style={[
                  styles.actionBtnOutline,
                  isAnySelected ? styles.btnConfirmActive : styles.btnOutlineDisabled,
                ]}
                disabled={!isAnySelected}
              >
                <Text style={[styles.actionBtnOutlineText, isAnySelected && styles.btnTextBrand]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        )}

        {activeTab === 'details' && (
          <View style={styles.tabContent}>
            {/* Application Form Details */}
            <View style={[styles.detailsCard, SHADOWS.card]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardSectionTitle}>Application Form</Text>
                <Text style={styles.cardTimeAgo}>Submitted {application.timeAgo}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.formContent}>
                <Text style={styles.formMainTitle}>{application.title}</Text>
                <Text style={styles.formSubtitle}>Amateur - Class A - Elements 8, 9, 10 & Code (5 wpm)</Text>
              </View>
            </View>

            {/* Document Attachments */}
            <View style={[styles.detailsCard, SHADOWS.card]}>
              <Text style={styles.cardSectionTitle}>Document Attachment</Text>
              <View style={styles.divider} />

              {/* Document Rows */}
              {(['SOA Report', 'Order of Payment'] as const).map((docTitle) => (
                <View key={docTitle} style={styles.docRow}>
                  <View style={styles.docInfo}>
                    <Lucide name="file-text" size={18} color={COLORS.brand[800]} style={{ marginRight: 8 }} />
                    <Text style={styles.docTitleText}>{docTitle}</Text>
                  </View>
                  <View style={styles.docActions}>
                    <Pressable style={styles.docTextLink}>
                      <Text style={styles.docTextLinkText}>View</Text>
                    </Pressable>
                    <Pressable style={styles.docTextLink}>
                      <Text style={styles.docTextLinkText}>Print</Text>
                    </Pressable>
                    <Pressable style={styles.docOutlineBtn}>
                      <Lucide name="download" size={12} color={COLORS.neutral[600]} style={{ marginRight: 4 }} />
                      <Text style={styles.docOutlineBtnText}>Download</Text>
                    </Pressable>
                    <Pressable style={styles.docOutlineBtn}>
                      <Lucide name="rotate-cw" size={12} color={COLORS.neutral[600]} style={{ marginRight: 4 }} />
                      <Text style={styles.docOutlineBtnText}>Refresh</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {/* History logs */}
            <View style={[styles.detailsCard, SHADOWS.card]}>
              <Text style={styles.cardSectionTitle}>History</Text>
              <View style={styles.divider} />
              <View style={styles.historyTimeline}>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View style={styles.timelineNode} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Application Submitted</Text>
                    <Text style={styles.timelineTime}>Time: July 16, 2026 - 10:34 AM</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Payment logs */}
            <View style={[styles.detailsCard, SHADOWS.card]}>
              <Text style={styles.cardSectionTitle}>Payment</Text>
              <View style={styles.divider} />
              <View style={styles.emptyPaymentContainer}>
                <Text style={styles.emptyPaymentText}>No Payment Logs Available</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'payment' && (
          <View style={styles.tabContent}>
            {/* Statement of Account (SOA) breakdown */}
            <View style={[styles.detailsCard, SHADOWS.card]}>
              <Text style={styles.cardSectionTitle}>Statement of Account</Text>
              <View style={styles.divider} />
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Application & Processing Fee</Text>
                <Text style={styles.billingValue}>500.00 PHP</Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Radio Permit Fee</Text>
                <Text style={styles.billingValue}>300.00 PHP</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.billingRow}>
                <Text style={[styles.billingLabel, { fontWeight: '700', color: COLORS.neutral[900] }]}>Total Due</Text>
                <Text style={[styles.billingValue, { fontWeight: '700', color: COLORS.brand[800] }]}>800.00 PHP</Text>
              </View>
            </View>

            {/* Payment Transaction Details */}
            <View style={[styles.detailsCard, SHADOWS.card]}>
              <Text style={styles.cardSectionTitle}>Payment Transaction Details</Text>
              <View style={styles.divider} />
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Transaction Reference ID</Text>
                <Text style={[styles.billingValue, { fontWeight: '600' }]}>TXN-2026-00948</Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Payment Method</Text>
                <Text style={styles.billingValue}>Dragonpay Online</Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Payment Date</Text>
                <Text style={styles.billingValue}>July 16, 2026 - 10:45 AM</Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Status</Text>
                <View style={[styles.statusBadge, styles.badgeSuccess]}>
                  <Text style={[styles.statusBadgeText, styles.textSuccess]}>PAID</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    flexDirection: 'column',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[16],
  },
  tabItem: {
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[20],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  tabItemActive: {
    borderBottomColor: COLORS.brand[700],
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING[24],
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[40],
    backgroundColor: COLORS.bg,
    minHeight: 400,
  },
  placeholderIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[24],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  placeholderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    marginBottom: 8,
  },
  placeholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
  tabContent: {
    width: '100%',
  },
  sectionHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING[12],
  },
  tableContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[16],
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[16],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        transition: 'background-color 150ms ease-out',
      },
    }),
  },
  tableRowSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.02)',
  },
  checkboxCell: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  checkboxChecked: {
    borderColor: COLORS.brand[700],
    backgroundColor: COLORS.brand[700],
  },
  headerCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowCellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[800],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  badgeSuccess: {
    backgroundColor: COLORS.semantic.successBg,
    borderColor: COLORS.semantic.successBorder,
  },
  badgeWarning: {
    backgroundColor: COLORS.semantic.warningBg,
    borderColor: COLORS.semantic.warningBorder,
  },
  textSuccess: {
    color: COLORS.semantic.success,
  },
  textWarning: {
    color: COLORS.semantic.warning,
  },
  previewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  previewLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  tableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[16],
    paddingHorizontal: 4,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  pageBtnDisabled: {
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    opacity: 0.6,
  },
  pageBtnTextDisabled: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  footerCount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actionsPanel: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: SPACING[32],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: SPACING[24],
  },
  actionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  actionBtnOutline: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  btnDisabled: {
    backgroundColor: COLORS.neutral[100],
    borderWidth: 0,
  },
  btnOutlineDisabled: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
  },
  actionBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
  },
  actionBtnOutlineText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
  },
  btnApproveActive: {
    backgroundColor: COLORS.semantic.success,
  },
  btnDeclineActive: {
    backgroundColor: COLORS.semantic.error,
  },
  btnEndorseActive: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.brand[700],
  },
  btnConfirmActive: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.brand[700],
  },
  btnTextWhite: {
    color: COLORS.neutral.white,
  },
  btnTextBrand: {
    color: COLORS.brand[700],
  },
  detailsCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    marginBottom: SPACING[20],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTimeAgo: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
    marginVertical: SPACING[12],
  },
  formContent: {
    paddingVertical: 4,
  },
  formMainTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  formSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[50],
  },
  docInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  docActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docTextLink: {
    paddingHorizontal: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  docTextLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  docOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  docOutlineBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    fontWeight: '500',
  },
  historyTimeline: {
    position: 'relative',
    paddingLeft: 16,
    paddingVertical: 8,
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 12,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.neutral[200],
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 8,
  },
  timelineNode: {
    position: 'absolute',
    left: -16,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand[700],
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  timelineContent: {
    paddingLeft: 8,
  },
  timelineTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  timelineTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  emptyPaymentContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPaymentText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  billingLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  billingValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[800],
  },
});
