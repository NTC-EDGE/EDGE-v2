import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { PendingPaymentDto, parsePaymentBreakdown } from '@edge/api';
import { styles } from './officialReceiptsStyles';

interface PendingPaymentsViewProps {
  pendingPayments: PendingPaymentDto[];
  isLoadingPendingPayments: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  canIssueReceipt: boolean;
  onIssueReceiptForPendingPayment: (p: PendingPaymentDto) => void;
}

export function PendingPaymentsView({
  pendingPayments,
  isLoadingPendingPayments,
  searchQuery,
  onSearchChange,
  onRefresh,
  canIssueReceipt,
  onIssueReceiptForPendingPayment,
}: PendingPaymentsViewProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, gap: 12 }}>
      {/* Search bar */}
      <View style={[styles.filterBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.searchContainer, { borderColor: colors.border }]}>
          <Lucide name="search" size={16} color={colors.neutral[400]} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by applicant, OP #, App #, or service..."
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearSearchBtn}>
              <Lucide name="x" size={14} color={colors.neutral[500]} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onRefresh} style={[styles.refreshBtn, { borderColor: colors.border }]}>
          <Lucide name="refresh-cw" size={14} color={colors.neutral[700]} />
          <Text style={[styles.refreshBtnText, { color: colors.neutral[700] }]}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Payments List */}
      {isLoadingPendingPayments ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading applications subject for payment...</Text>
        </View>
      ) : pendingPayments.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="check-circle" size={40} color={colors.semantic.success} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Pending Payments</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {searchQuery
              ? 'No applications matched your search query.'
              : 'There are currently no applications awaiting payment collection.'}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
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
                  style={[styles.paymentCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                >
                  {/* Card Header */}
                  <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                    <View style={styles.headerLeft}>
                      <View style={[styles.statusBadgePending, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                        <View style={[styles.statusDot, { backgroundColor: '#16A34A' }]} />
                        <Text style={[styles.statusTextPending, { color: '#166534' }]}>SUBJECT FOR PAYMENT</Text>
                      </View>
                      <Text style={[styles.opNumber, { color: colors.brand.primary }]}>{payment.opNumber}</Text>
                    </View>
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>Billed: {formattedDate}</Text>
                  </View>

                  {/* Card Body */}
                  <View style={styles.cardBody}>
                    <View style={styles.detailsRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>APPLICANT / PAYEE</Text>
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
                        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Service</Text>
                        <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={1}>
                          {payment.serviceName}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>SOA Ref</Text>
                        <Text style={[styles.metaValue, { color: colors.text }]}>{payment.soaNumber || 'N/A'}</Text>
                      </View>
                    </View>

                    {/* Particulars preview */}
                    {payment.lineItems && payment.lineItems.length > 0 && (
                      <View style={styles.lineItemsBox}>
                        <Text style={[styles.lineItemsTitle, { color: colors.textMuted }]}>PARTICULARS & SOA BREAKDOWN</Text>
                        {payment.lineItems.map((li, idx) => (
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
                      if (breakdown) {
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
                      }

                      const hasCheck = Boolean(payment.checkBank || payment.checkNumber || payment.paymentMethod === 'Check');
                      const hasOnline = Boolean(payment.paymentReferenceNumber || payment.paymentMethod === 'Online');

                      if (hasCheck) {
                        return (
                          <View style={[styles.clientPrefBanner, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                            <View style={styles.clientPrefHeader}>
                              <Lucide name="credit-card" size={13} color="#0284C7" />
                              <Text style={[styles.clientPrefTitle, { color: '#0369A1' }]}>
                                Client Payment: Check
                              </Text>
                            </View>
                            <View style={styles.clientPrefPills}>
                              <View style={[styles.clientPrefPill, { backgroundColor: '#FFFFFF', borderColor: '#BAE6FD' }]}>
                                <Text style={[styles.clientPrefPillText, { color: '#0369A1' }]}>
                                  <Text style={{ fontWeight: '700' }}>Bank:</Text> {payment.checkBank || 'Not Specified'}
                                  {payment.checkNumber ? ` • Check #: ${payment.checkNumber}` : ''}
                                  {payment.checkDate ? ` • Date: ${new Date(payment.checkDate).toLocaleDateString('en-US')}` : ''}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      }

                      if (hasOnline) {
                        return (
                          <View style={[styles.clientPrefBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                            <View style={styles.clientPrefHeader}>
                              <Lucide name="globe" size={13} color="#16A34A" />
                              <Text style={[styles.clientPrefTitle, { color: '#15803D' }]}>
                                Client Payment: Online
                              </Text>
                            </View>
                            <View style={styles.clientPrefPills}>
                              <View style={[styles.clientPrefPill, { backgroundColor: '#FFFFFF', borderColor: '#BBF7D0' }]}>
                                <Text style={[styles.clientPrefPillText, { color: '#15803D' }]}>
                                  <Text style={{ fontWeight: '700' }}>Reference #:</Text> {payment.paymentReferenceNumber || 'Pending Gateway Verification'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      }

                      return null;
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

                  {/* Card Footer Action */}
                  {canIssueReceipt && (
                    <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                      <TouchableOpacity
                        onPress={() => onIssueReceiptForPendingPayment(payment)}
                        style={[styles.issueActionBtn, { backgroundColor: colors.brand.primary }]}
                      >
                        <Lucide name="printer" size={14} color="#fff" />
                        <Text style={styles.issueActionBtnText}>Collect & Issue Official Receipt</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
