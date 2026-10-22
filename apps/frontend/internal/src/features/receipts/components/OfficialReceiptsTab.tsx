import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { usePermissions } from '../../shell/context/PermissionContext';
import { OfficialReceiptDto, NextAvailableOrDto, PendingPaymentDto } from '@edge/api';
import { styles } from './officialReceipts/officialReceiptsStyles';
import { OfficialReceiptsBanner } from './officialReceipts/OfficialReceiptsBanner';
import { PendingPaymentsView } from './officialReceipts/PendingPaymentsView';
import { IssuedReceiptsView } from './officialReceipts/IssuedReceiptsView';

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

  return (
    <View style={styles.container}>
      {/* Top Banner & Active Booklet Series Summary */}
      <OfficialReceiptsBanner
        receipts={receipts}
        nextOr={nextOr}
        canIssueReceipt={canIssueReceipt}
        onOpenIssueModal={onOpenIssueModal}
      />

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
        <PendingPaymentsView
          pendingPayments={pendingPayments}
          isLoadingPendingPayments={isLoadingPendingPayments}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onRefresh={onRefresh}
          canIssueReceipt={canIssueReceipt}
          onIssueReceiptForPendingPayment={onIssueReceiptForPendingPayment}
        />
      )}

      {/* SUB-VIEW 2: OFFICIAL RECEIPTS REGISTRY */}
      {activeSubView === 'issued' && (
        <IssuedReceiptsView
          receipts={receipts}
          isLoadingReceipts={isLoadingReceipts}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          paymentMethodFilter={paymentMethodFilter}
          onPaymentMethodFilterChange={onPaymentMethodFilterChange}
          canEditReceiptPerm={canEditReceiptPerm}
          canCancelReceiptPerm={canCancelReceiptPerm}
          onViewReceipt={onViewReceipt}
          onEditReceipt={onEditReceipt}
          onCancelReceipt={onCancelReceipt}
        />
      )}
    </View>
  );
}
