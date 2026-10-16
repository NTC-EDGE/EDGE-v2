import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { PendingPaymentDto, NextAvailableOrDto, parsePaymentBreakdown } from '@edge/api';

interface PendingPaymentsTabProps {
  pendingPayments: PendingPaymentDto[];
  isLoading: boolean;
  searchQuery: string;
  nextOr?: NextAvailableOrDto;
  onSearchChange: (text: string) => void;
  onRefresh: () => void;
  onIssueReceipt: (payment: PendingPaymentDto) => void;
}

export function PendingPaymentsTab({
  pendingPayments,
  isLoading,
  searchQuery,
  nextOr,
  onSearchChange,
  onRefresh,
  onIssueReceipt,
}: PendingPaymentsTabProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Search & Actions Bar */}
      <View style={[styles.actionBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.searchBox, { borderColor: colors.neutral[300] }]}>
          <Lucide name="search" size={16} color={colors.neutral[400]} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by applicant, OP #, App #, or service..."
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Lucide name="x" size={14} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={onRefresh} style={[styles.actionBtn, { borderColor: colors.border }]}>
            <Lucide name="refresh-cw" size={14} color={colors.neutral[700]} />
            <Text style={[styles.actionBtnText, { color: colors.neutral[700] }]}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Booklet Series Status Banner */}
      {nextOr && nextOr.hasActiveBooklet ? (
        <View style={[styles.bookletBanner, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
          <Lucide name="layers" size={18} color={colors.brand.primary} />
          <View style={{ flex: 1 }}>
            <View style={styles.bookletBannerTitleRow}>
              <Text style={[styles.bookletBannerTitle, { color: colors.brand.primary }]}>
                Next OR Number to Issue: #{nextOr.formattedOrNumber}
              </Text>
              <View style={[styles.bookletBadge, { backgroundColor: colors.brand.indigoLight }]}>
                <Text style={[styles.bookletBadgeText, { color: colors.brand.primary }]}>
                  Booklet #{nextOr.bookletNumber}
                </Text>
              </View>
              {nextOr.isShared && (
                <View style={[styles.bookletBadge, { backgroundColor: '#E0E7FF' }]}>
                  <Text style={[styles.bookletBadgeText, { color: colors.brand.primary }]}>
                    Shared ({nextOr.assignedUserNames?.length ?? 2} Cashiers)
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.bookletBannerSubtitle, { color: colors.neutral[600] }]}>
              Active Series: {nextOr.formattedStartNumber} – {nextOr.formattedEndNumber} • {nextOr.remainingCount} forms remaining in booklet
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.bookletBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <Lucide name="alert-triangle" size={18} color={colors.semantic.error} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bookletBannerTitle, { color: colors.semantic.error }]}>
              No Active OR Booklet Registered
            </Text>
            <Text style={[styles.bookletBannerSubtitle, { color: colors.neutral[600] }]}>
              Please register a new OR Booklet bundle in the &quot;OR Booklets&quot; tab before collecting payments.
            </Text>
          </View>
        </View>
      )}

      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <Lucide name="credit-card" size={18} color="#16A34A" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: '#166534' }]}>
            Applications Subject for Payment ({pendingPayments.length})
          </Text>
          <Text style={[styles.infoSubtitle, { color: '#15803D' }]}>
            These applications have approved Statements of Account and active Orders of Payment awaiting cashier collection.
          </Text>
        </View>
      </View>

      {/* List / Table */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading pending payments...</Text>
        </View>
      ) : pendingPayments.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.neutral[100] }]}>
            <Lucide name="check-circle" size={32} color={colors.semantic.success} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Pending Payments</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {searchQuery
              ? 'No pending payments matched your search query.'
              : 'There are currently no applications awaiting payment collection.'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {pendingPayments.map((payment) => {
              const formattedDate = new Date(payment.billedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <View
                  key={payment.orderOfPaymentId}
                  style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                >
                  {/* Card Header */}
                  <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                    <View style={styles.headerLeft}>
                      <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                        <View style={[styles.statusDot, { backgroundColor: '#16A34A' }]} />
                        <Text style={[styles.statusText, { color: '#166534' }]}>SUBJECT FOR PAYMENT</Text>
                      </View>
                      <Text style={[styles.opNumber, { color: colors.brand.primary }]}>{payment.opNumber}</Text>
                    </View>
                    <View style={styles.headerRight}>
                      <Text style={[styles.dateText, { color: colors.textMuted }]}>Billed: {formattedDate}</Text>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.cardBody}>
                    <View style={styles.detailsRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>APPLICANT / PAYOR</Text>
                        <Text style={[styles.applicantName, { color: colors.text }]}>{payment.applicantName}</Text>
                        <Text style={[styles.applicantType, { color: colors.textMuted }]}>{payment.applicantType}</Text>
                      </View>
                      <View style={styles.amountBox}>
                        <Text style={[styles.amountLabel, { color: colors.textMuted }]}>AMOUNT DUE</Text>
                        <Text style={[styles.amountValue, { color: colors.semantic.successText }]}>
                          ₱{(payment.amountDue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.metaGrid, { backgroundColor: colors.neutral[50] }]}>
                      <View style={styles.metaItem}>
                        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Application No.</Text>
                        <Text style={[styles.metaValue, { color: colors.text }]}>
                          {payment.applicationNumber || payment.referenceNumber || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Service / Category</Text>
                        <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={1}>
                          {payment.serviceName} ({payment.serviceCategory})
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>SOA Number</Text>
                        <Text style={[styles.metaValue, { color: colors.text }]}>{payment.soaNumber || 'N/A'}</Text>
                      </View>
                    </View>

                    {/* Particulars preview */}
                    {(payment.lineItems ?? []).length > 0 && (
                      <View style={styles.lineItemsBox}>
                        <Text style={[styles.lineItemsTitle, { color: colors.textMuted }]}>PARTICULARS</Text>
                        {(payment.lineItems ?? []).map((li, idx) => (
                          <View key={idx} style={styles.lineItemRow}>
                            <Text style={[styles.lineItemCode, { color: colors.textMuted }]}>{li.feeCode}</Text>
                            <Text style={[styles.lineItemDesc, { color: colors.text }]} numberOfLines={1}>
                              {li.description}
                            </Text>
                            <Text style={[styles.lineItemAmt, { color: colors.text }]}>
                              ₱{(li.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Client Preferred Payment Banner */}
                    {(() => {
                      const breakdown = parsePaymentBreakdown(payment.remarks);
                      if (!breakdown) return null;
                      return (
                        <View style={[styles.clientPrefBanner, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                          <View style={styles.clientPrefHeader}>
                            <Lucide name="layers" size={13} color="#6D28D9" />
                            <Text style={[styles.clientPrefTitle, { color: '#4C1D95' }]}>
                              Client Preference: {breakdown.isCombination ? 'Combination / Split Payment' : breakdown.items[0]?.mode}
                            </Text>
                          </View>
                          <View style={styles.clientPrefPills}>
                            {breakdown.items.map((item, iIdx) => (
                              <View key={iIdx} style={[styles.clientPrefPill, { backgroundColor: '#FFFFFF', borderColor: '#E9D5FF' }]}>
                                <Text style={[styles.clientPrefPillText, { color: '#5B21B6' }]}>
                                  <Text style={{ fontWeight: '700' }}>{item.mode}:</Text> ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  {item.mode === 'Check' && item.checkNumber ? ` (${item.checkBank || 'Bank'} #${item.checkNumber})` : ''}
                                  {item.mode === 'Online' && item.referenceNumber ? ` (Ref: ${item.referenceNumber})` : ''}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    })()}

                    {/* Partial Payment Banner if already partially paid */}
                    {typeof payment.amountReceived === 'number' && payment.amountReceived > 0 && (
                      <View style={[styles.clientPrefBanner, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                        <View style={styles.clientPrefHeader}>
                          <Lucide name="clock" size={13} color="#B45309" />
                          <Text style={[styles.clientPrefTitle, { color: '#92400E' }]}>
                            Partial OR Issued: ₱{payment.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {' • '}Remaining: ₱{(payment.remainingBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Card Footer */}
                  <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      onPress={() => onIssueReceipt(payment)}
                      style={[styles.issueBtn, { backgroundColor: colors.brand.primary }]}
                    >
                      <Lucide name="printer" size={14} color="#fff" />
                      <Text style={styles.issueBtnText}>Collect & Issue Official Receipt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  bookletBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  bookletBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  bookletBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bookletBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookletBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookletBannerSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },
  scrollList: {
    flex: 1,
  },
  grid: {
    gap: 12,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  opNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerRight: {},
  dateText: {
    fontSize: 11,
  },
  cardBody: {
    padding: 14,
    gap: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  applicantType: {
    fontSize: 11,
    marginTop: 1,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 6,
    gap: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  lineItemsBox: {
    gap: 4,
  },
  lineItemsTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  lineItemCode: {
    fontSize: 11,
    fontWeight: '600',
    width: 80,
  },
  lineItemDesc: {
    flex: 1,
    fontSize: 11,
    marginHorizontal: 8,
  },
  lineItemAmt: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  issueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  issueBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 360,
  },
  clientPrefBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  clientPrefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientPrefTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  clientPrefPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  clientPrefPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  clientPrefPillText: {
    fontSize: 10,
  },
});
