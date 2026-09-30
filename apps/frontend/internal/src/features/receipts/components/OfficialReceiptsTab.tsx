import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { usePermissions } from '../../shell/context/PermissionContext';
import { OfficialReceiptDto, NextAvailableOrDto, PendingPaymentDto } from '@edge/api';

interface OfficialReceiptsTabProps {
  receipts: OfficialReceiptDto[];
  isLoadingReceipts: boolean;
  pendingPayments: PendingPaymentDto[];
  isLoadingPendingPayments: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  paymentMethodFilter: string;
  onPaymentMethodFilterChange: (m: string) => void;
  nextOr?: NextAvailableOrDto;
  onOpenIssueModal: () => void;
  onIssueReceiptForPendingPayment: (p: PendingPaymentDto) => void;
  onViewReceipt: (r: OfficialReceiptDto) => void;
  onEditReceipt: (r: OfficialReceiptDto) => void;
  onCancelReceipt: (r: OfficialReceiptDto) => void;
  onRefresh: () => void;
}

type ReceiptsSubView = 'pending' | 'issued';

const isReceiptIssued = (status: unknown): boolean => status === 'Issued' || status === 0;
const isReceiptDeposited = (status: unknown): boolean => status === 'Deposited' || status === 1;
const isReceiptCancelled = (status: unknown): boolean => status === 'Cancelled' || status === 2;

const getReceiptStatusLabel = (status: unknown): string => {
  if (isReceiptIssued(status)) return 'ISSUED';
  if (isReceiptDeposited(status)) return 'DEPOSITED';
  if (isReceiptCancelled(status)) return 'CANCELLED';
  return String(status ?? '').toUpperCase();
};

export function OfficialReceiptsTab({
  receipts,
  isLoadingReceipts,
  pendingPayments,
  isLoadingPendingPayments,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentMethodFilter,
  onPaymentMethodFilterChange,
  nextOr,
  onOpenIssueModal,
  onIssueReceiptForPendingPayment,
  onViewReceipt,
  onEditReceipt,
  onCancelReceipt,
  onRefresh,
}: OfficialReceiptsTabProps) {
  const { colors } = useTheme();
  const [activeSubView, setActiveSubView] = useState<ReceiptsSubView>('pending');
  const { hasPermission, isSuperAdmin, isAdmin } = usePermissions();

  const canIssueReceipt = isSuperAdmin || isAdmin || hasPermission('receipts.issue') || hasPermission('billing.collect');
  const canEditReceiptPerm = isSuperAdmin || isAdmin || hasPermission('receipts.edit');
  const canCancelReceiptPerm = isSuperAdmin || isAdmin || hasPermission('receipts.cancel');

  const totalCollections = receipts
    .filter((r) => !isReceiptCancelled(r.status))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const issuedCount = receipts.filter((r) => isReceiptIssued(r.status)).length;
  const depositedCount = receipts.filter((r) => isReceiptDeposited(r.status)).length;
  const cancelledCount = receipts.filter((r) => isReceiptCancelled(r.status)).length;

  return (
    <View style={styles.container}>
      {/* Top Banner & Active Booklet Series Summary */}
      <View style={styles.bannerRow}>
        <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL REVENUE COLLECTED</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            ₱{(totalCollections ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.statBadges}>
            <Text style={[styles.statSubText, { color: colors.neutral[600] }]}>{receipts.length} total receipts</Text>
            <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
            <Text style={[styles.statSubText, { color: '#D97706' }]}>{issuedCount} on-hand</Text>
            <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
            <Text style={[styles.statSubText, { color: '#059669' }]}>{depositedCount} deposited</Text>
            {cancelledCount > 0 && (
              <>
                <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
                <Text style={[styles.statSubText, { color: '#DC2626' }]}>{cancelledCount} void</Text>
              </>
            )}
          </View>
        </View>

        {/* Active Booklet Series Card */}
        {nextOr && nextOr.hasActiveBooklet ? (
          <View style={[styles.bookletStatusCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
            <View style={styles.bookletCardHeader}>
              <Lucide name="layers" size={16} color={colors.brand.primary} />
              <Text style={[styles.bookletCardTitle, { color: colors.brand.primary }]}>Active Booklet Series</Text>
              {nextOr.isShared && (
                <View style={[styles.sharedBadge, { backgroundColor: colors.brand.indigoLight }]}>
                  <Text style={[styles.sharedBadgeText, { color: colors.brand.primary }]}>
                    Shared ({nextOr.assignedUserNames?.length ?? 2})
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.bookletNextOr, { color: colors.text }]}>
              Next OR: <Text style={{ color: colors.brand.primary, fontWeight: '800' }}>#{nextOr.formattedOrNumber}</Text>
            </Text>
            <Text style={[styles.bookletMeta, { color: colors.neutral[600] }]}>
              Booklet #{nextOr.bookletNumber} • Series: {nextOr.formattedStartNumber}–{nextOr.formattedEndNumber} ({nextOr.remainingCount} forms left)
            </Text>
          </View>
        ) : (
          <View style={[styles.bookletStatusCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <View style={styles.bookletCardHeader}>
              <Lucide name="alert-triangle" size={16} color={colors.semantic.error} />
              <Text style={[styles.bookletCardTitle, { color: colors.semantic.error }]}>No Active Booklet</Text>
            </View>
            <Text style={[styles.bookletMeta, { color: colors.neutral[600], marginTop: 4 }]}>
              Please register an Accountable Form 51 booklet before collecting payments.
            </Text>
          </View>
        )}

        {canIssueReceipt && (
          <TouchableOpacity
            onPress={onOpenIssueModal}
            style={[styles.issueOrBtn, { backgroundColor: colors.brand.primary }]}
          >
            <View style={styles.issueIconCircle}>
              <Lucide name="plus" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.issueBtnTitle}>Issue Walk-in OR</Text>
              <Text style={styles.issueBtnSubtitle}>Direct Cashier Entry</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Segmented Sub-View Switcher */}
      <View style={[styles.subViewSwitcher, { backgroundColor: colors.neutral[100], borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveSubView('pending')}
          style={[
            styles.subViewBtn,
            activeSubView === 'pending' && { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
          ]}
        >
          <Lucide
            name="clock"
            size={15}
            color={activeSubView === 'pending' ? colors.brand.primary : colors.neutral[600]}
          />
          <Text
            style={[
              styles.subViewBtnText,
              { color: colors.neutral[600] },
              activeSubView === 'pending' && { color: colors.brand.primary, fontWeight: '800' },
            ]}
          >
            Subject for Payment
          </Text>
          {pendingPayments.length > 0 && (
            <View style={[styles.subViewBadge, { backgroundColor: activeSubView === 'pending' ? colors.brand.primary : colors.neutral[300] }]}>
              <Text style={styles.subViewBadgeText}>{pendingPayments.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSubView('issued')}
          style={[
            styles.subViewBtn,
            activeSubView === 'issued' && { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
          ]}
        >
          <Lucide
            name="file-text"
            size={15}
            color={activeSubView === 'issued' ? colors.brand.primary : colors.neutral[600]}
          />
          <Text
            style={[
              styles.subViewBtnText,
              { color: colors.neutral[600] },
              activeSubView === 'issued' && { color: colors.brand.primary, fontWeight: '800' },
            ]}
          >
            Official Receipts Registry
          </Text>
          <View style={[styles.subViewBadge, { backgroundColor: activeSubView === 'issued' ? colors.brand.primary : colors.neutral[300] }]}>
            <Text style={styles.subViewBadgeText}>{receipts.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SUB-VIEW 1: SUBJECT FOR PAYMENT */}
      {activeSubView === 'pending' && (
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
      )}

      {/* SUB-VIEW 2: OFFICIAL RECEIPTS REGISTRY */}
      {activeSubView === 'issued' && (
        <View style={{ flex: 1, gap: 12 }}>
          {/* Filter Bar */}
          <View style={[styles.filterBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.searchContainer, { borderColor: colors.border }]}>
              <Lucide name="search" size={16} color={colors.neutral[400]} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search by OR number, payor name, check number..."
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

            {/* Status Chips */}
            <View style={styles.chipsRow}>
              {['all', 'Issued', 'Deposited', 'Cancelled'].map((st) => {
                const isSelected = statusFilter === st;
                return (
                  <TouchableOpacity
                    key={st}
                    onPress={() => onStatusFilterChange(st)}
                    style={[styles.filterChip, isSelected && { backgroundColor: colors.brand.primary }]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: colors.neutral[700] },
                        isSelected && { color: '#fff' },
                      ]}
                    >
                      {st === 'all' ? 'All Status' : st}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Payment Method Chips */}
            <View style={styles.chipsRow}>
              {['all', 'Cash', 'Check', 'Online'].map((pm) => {
                const isSelected = paymentMethodFilter === pm;
                return (
                  <TouchableOpacity
                    key={pm}
                    onPress={() => onPaymentMethodFilterChange(pm)}
                    style={[styles.filterChip, isSelected && { backgroundColor: colors.brand.primary }]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: colors.neutral[700] },
                        isSelected && { color: '#fff' },
                      ]}
                    >
                      {pm === 'all' ? 'All Methods' : pm}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Table */}
          {isLoadingReceipts ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.brand.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading Official Receipts...</Text>
            </View>
          ) : receipts.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Lucide name="printer" size={40} color={colors.neutral[400]} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Official Receipts Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {searchQuery || statusFilter !== 'all' || paymentMethodFilter !== 'all'
                  ? 'No official receipts matched your search filters.'
                  : 'Start by collecting a pending application payment or issuing a walk-in official receipt.'}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.tableCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                {/* Table Header */}
                <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>OR NUMBER</Text>
                  <Text style={[styles.th, { flex: 1.8, color: colors.neutral[600] }]}>PAYOR</Text>
                  <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>MODE / REF</Text>
                  <Text style={[styles.th, { flex: 1.2, textAlign: 'right', color: colors.neutral[600] }]}>AMOUNT</Text>
                  <Text style={[styles.th, { flex: 1.2, textAlign: 'center', color: colors.neutral[600] }]}>STATUS</Text>
                  <Text style={[styles.th, { flex: 1.4, textAlign: 'center', color: colors.neutral[600] }]}>ACTIONS</Text>
                </View>

                {/* Rows */}
                {receipts.map((r) => {
                  const isIssued = isReceiptIssued(r.status);
                  const isDeposited = isReceiptDeposited(r.status);
                  const isCancelled = isReceiptCancelled(r.status);

                  return (
                    <View
                      key={r.id}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: colors.neutral[100] },
                        isCancelled && styles.tableRowCancelled,
                      ]}
                    >
                      <View style={{ flex: 1.2 }}>
                        <Text
                          style={[
                            styles.orNum,
                            { color: colors.text },
                            isCancelled && styles.textCancelled,
                          ]}
                        >
                          {r.officialReceiptNumber}
                        </Text>
                        <Text style={[styles.orDate, { color: colors.textMuted }]}>
                          {new Date(r.issuedAt).toLocaleDateString()}
                        </Text>
                      </View>

                      <View style={{ flex: 1.8 }}>
                        <Text
                          style={[
                            styles.payorName,
                            { color: colors.text },
                            isCancelled && styles.textCancelled,
                          ]}
                          numberOfLines={1}
                        >
                          {r.payorName}
                        </Text>
                        {r.opNumber && (
                          <Text style={[styles.opRef, { color: colors.textMuted }]}>OP: {r.opNumber}</Text>
                        )}
                        {r.issuedByUserName && (
                          <Text style={[styles.opRef, { color: colors.brand.primary, fontWeight: '600' }]} numberOfLines={1}>
                            Cashier: {r.issuedByUserName}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1.2 }}>
                        <Text style={[styles.payMethod, { color: colors.text }]}>{r.paymentMethod}</Text>
                        {r.checkNumber && (
                          <Text style={styles.checkRef} numberOfLines={1}>
                            #{r.checkNumber} ({r.checkBank})
                          </Text>
                        )}
                        {r.depositSlipNumber && (
                          <Text style={styles.depositRef} numberOfLines={1}>
                            DEP: {r.depositSlipNumber}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                        <Text
                          style={[
                            styles.amountText,
                            { color: colors.text },
                            isCancelled && styles.textCancelled,
                          ]}
                        >
                          ₱{(r.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>

                      <View style={{ flex: 1.2, alignItems: 'center' }}>
                        <View
                          style={[
                            styles.statusBadge,
                            isIssued && styles.statusIssued,
                            isDeposited && styles.statusDeposited,
                            isCancelled && styles.statusCancelled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              isIssued && styles.statusTextIssued,
                              isDeposited && styles.statusTextDeposited,
                              isCancelled && styles.statusTextCancelled,
                            ]}
                          >
                            {getReceiptStatusLabel(r.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flex: 1.4, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                        {/* View / Print Button */}
                        <TouchableOpacity
                          onPress={() => onViewReceipt(r)}
                          style={[styles.actionIconBtn, { backgroundColor: colors.neutral[100] }]}
                          accessibilityLabel="Preview Receipt"
                        >
                          <Lucide name="printer" size={15} color={colors.brand.primary} />
                        </TouchableOpacity>

                        {/* Edit Button */}
                        {canEditReceiptPerm && isIssued && (
                          <TouchableOpacity
                            onPress={() => onEditReceipt(r)}
                            style={[styles.actionIconBtn, { backgroundColor: colors.neutral[100] }]}
                            accessibilityLabel="Edit Receipt"
                          >
                            <Lucide name="edit-2" size={15} color={colors.neutral[700]} />
                          </TouchableOpacity>
                        )}

                        {/* Cancel Button */}
                        {canCancelReceiptPerm && isIssued && (
                          <TouchableOpacity
                            onPress={() => onCancelReceipt(r)}
                            style={[styles.actionIconBtn, { backgroundColor: colors.neutral[100] }]}
                            accessibilityLabel="Cancel Receipt"
                          >
                            <Lucide name="slash" size={15} color={colors.semantic.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1.5,
    minWidth: 240,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4,
  },
  statBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  statSubText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statDot: {
    fontSize: 10,
  },
  bookletStatusCard: {
    flex: 1.5,
    minWidth: 240,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  bookletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookletCardTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  sharedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  sharedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  bookletNextOr: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bookletMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  issueOrBtn: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  issueIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  issueBtnSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  subViewSwitcher: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  subViewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: 6,
  },
  subViewBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subViewBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  subViewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchContainer: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 34,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    marginLeft: 6,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 380,
  },
  grid: {
    gap: 10,
  },
  paymentCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusTextPending: {
    fontSize: 10,
    fontWeight: '700',
  },
  opNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
  },
  cardBody: {
    padding: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  applicantName: {
    fontSize: 13,
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
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    borderRadius: 6,
    padding: 8,
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  lineItemsBox: {
    marginTop: 4,
  },
  lineItemsTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  lineItemCode: {
    fontSize: 10,
    fontWeight: '700',
    width: 60,
  },
  lineItemDesc: {
    flex: 1,
    fontSize: 11,
  },
  lineItemAmt: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  issueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  issueActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  tableScroll: {
    flex: 1,
  },
  tableCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableRowCancelled: {
    backgroundColor: '#FEF2F2',
    opacity: 0.75,
  },
  textCancelled: {
    textDecorationLine: 'line-through',
  },
  orNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  orDate: {
    fontSize: 10,
    marginTop: 2,
  },
  payorName: {
    fontSize: 12,
    fontWeight: '600',
  },
  opRef: {
    fontSize: 10,
    marginTop: 1,
  },
  payMethod: {
    fontSize: 11,
    fontWeight: '600',
  },
  checkRef: {
    fontSize: 10,
    color: '#6B7280',
  },
  depositRef: {
    fontSize: 10,
    color: '#059669',
  },
  amountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  statusIssued: {
    backgroundColor: '#FEF3C7',
  },
  statusDeposited: {
    backgroundColor: '#D1FAE5',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
  },
  statusTextIssued: {
    color: '#92400E',
  },
  statusTextDeposited: {
    color: '#065F46',
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 4,
  },
});
