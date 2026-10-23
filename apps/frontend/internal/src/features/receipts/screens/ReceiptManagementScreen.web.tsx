import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { useRole } from '../../shell/context/RoleContext';
import { usePermissions } from '../../shell/context/PermissionContext';
import { useAppNavigation } from '../../../navigation/types';
import { useReceiptsState, ReceiptTab } from '../hooks/useReceiptsState';
import { OrBookletsTab } from '../components/OrBookletsTab';
import { OfficialReceiptsTab } from '../components/OfficialReceiptsTab';
import { BankDepositsTab } from '../components/BankDepositsTab';
import { BankAccountsTab } from '../components/BankAccountsTab';
import { CashierReportsTab } from '../components/CashierReportsTab';
import { BundleEntryModal } from '../components/BundleEntryModal';
import { EditBookletModal } from '../components/EditBookletModal';
import { TransferBookletModal } from '../components/TransferBookletModal';
import { IssueReceiptModal } from '../components/IssueReceiptModal';
import { EditReceiptModal } from '../components/EditReceiptModal';
import { CancelReceiptModal } from '../components/CancelReceiptModal';
import { CreateDepositModal } from '../components/CreateDepositModal';
import { BankAccountModal } from '../components/BankAccountModal';
import { ReceiptPrintPreviewModal } from '../components/ReceiptPrintPreviewModal';
import { PendingPaymentDetailsModal } from '../components/PendingPaymentDetailsModal';
import { EndorseReReviewModal } from '../components/EndorseReReviewModal';

type LucideIconName = React.ComponentProps<typeof Lucide>['name'];

interface TabDefinition {
  id: ReceiptTab;
  label: string;
  icon: LucideIconName;
  badge?: number;
}

export function ReceiptManagementScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useAppNavigation();

  const { currentRole } = useRole();
  const { isSuperAdmin, isAdmin, canVerifyCashier, hasAnyPermission } = usePermissions();

  const isCashier = currentRole === 'Cashier';
  const hasCashierPermission =
    canVerifyCashier ||
    hasAnyPermission(
      'receipts.read',
      'receipts.issue',
      'receipts.edit',
      'receipts.cancel',
      'receipts.report',
      'receipts.bundle',
      'receipts.deposit',
      'billing.collect',
      'billing.op_return'
    );
  const hasOverallAccess =
    isSuperAdmin ||
    isAdmin ||
    currentRole === 'Regional Director' ||
    isCashier ||
    hasCashierPermission;

  const state = useReceiptsState();

  if (!hasOverallAccess) {
    return (
      <View style={[styles.root, styles.restrictedContainer, { backgroundColor: colors.bg }]}>
        <View style={[styles.restrictedCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.restrictedIconBox, { backgroundColor: '#FEE2E2' }]}>
            <Lucide name="lock" size={28} color="#DC2626" />
          </View>
          <Text style={[styles.restrictedTitle, { color: colors.text }]}>Access Restricted</Text>
          <Text style={[styles.restrictedSubtitle, { color: colors.textMuted }]}>
            Receipt & Cashiering Management is restricted to Cashiers and authorized collections personnel.
            Your current role ({currentRole}) does not have permission to access official receipts and cashiering modules.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            style={[styles.returnDashboardBtn, { backgroundColor: colors.brand.primary }]}
          >
            <Lucide name="home" size={15} color="#FFFFFF" />
            <Text style={styles.returnDashboardBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const TABS: TabDefinition[] = [
    {
      id: 'receipts',
      label: 'Official Receipts & Collections',
      icon: 'printer',
      badge: state.pendingPayments.length > 0 ? state.pendingPayments.length : undefined,
    },
    {
      id: 'booklets',
      label: 'OR Booklets (Bundles)',
      icon: 'book',
      badge: state.booklets.filter((b) => b.status === 'Active' || (b.status as unknown) === 0).length,
    },
    {
      id: 'deposits',
      label: 'Bank Deposits & Remittance',
      icon: 'dollar-sign',
      badge: state.undepositedReceipts.length > 0 ? state.undepositedReceipts.length : undefined,
    },
    {
      id: 'accounts',
      label: 'Depositary Accounts (AGDB)',
      icon: 'credit-card',
      badge: state.bankAccounts.length,
    },
    {
      id: 'reports',
      label: 'Cashier Reports (RCD & Voids)',
      icon: 'file-text',
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Page Title Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconBox, { backgroundColor: colors.brand.indigoLight }]}>
            <Lucide name="printer" size={24} color={colors.brand.primary} />
          </View>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Receipt & Cashiering Management</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
              Government Accountable Form 51, sequential OR booklets, collections remittance, and RCD reporting
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={state.refreshAll}
          style={[styles.refreshBtn, { backgroundColor: colors.neutral[100] }]}
        >
          <Lucide name="refresh-cw" size={16} color={colors.neutral[700]} />
          <Text style={[styles.refreshBtnText, { color: colors.neutral[700] }]}>Refresh Data</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navScroll}
        >
          {TABS.map((tab) => {
            const isActive = state.activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => state.setActiveTab(tab.id)}
                style={[
                  styles.tabButton,
                  isActive && { backgroundColor: colors.brand.indigoLight },
                ]}
              >
                <Lucide
                  name={tab.icon}
                  size={16}
                  color={isActive ? colors.brand.primary : colors.neutral[600]}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: colors.neutral[600] },
                    isActive && { color: colors.brand.primary, fontWeight: '800' },
                  ]}
                >
                  {tab.label}
                </Text>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <View
                    style={[
                      styles.tabBadge,
                      { backgroundColor: colors.neutral[200] },
                      isActive && { backgroundColor: colors.brand.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        { color: colors.neutral[700] },
                        isActive && { color: '#fff' },
                      ]}
                    >
                      {tab.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <View style={[styles.contentArea, { width: '100%' }]}>
        {state.activeTab === 'receipts' && (
          <OfficialReceiptsTab
            receipts={state.receipts}
            isLoadingReceipts={state.isLoadingReceipts}
            pendingPayments={state.pendingPayments}
            isLoadingPendingPayments={state.isLoadingPendingPayments}
            searchQuery={state.searchQuery}
            onSearchChange={state.setSearchQuery}
            statusFilter={state.statusFilter}
            onStatusFilterChange={state.setStatusFilter}
            paymentMethodFilter={state.paymentMethodFilter}
            onPaymentMethodFilterChange={state.setPaymentMethodFilter}
            nextOr={state.nextOr}
            onOpenIssueModal={state.handleOpenIssueNew}
            onIssueReceiptForPendingPayment={(p) => state.handleOpenIssueWithPendingPayment(p)}
            onViewDetailsForPendingPayment={(p) => state.setSelectedDetailsPayment(p)}
            onEndorsePendingPayment={(p) => state.setSelectedEndorsePayment(p)}
            onViewReceipt={(r) => state.setViewingReceipt(r)}
            onEditReceipt={(r) => state.setEditingReceipt(r)}
            onCancelReceipt={(r) => state.setCancellingReceipt(r)}
            onRefresh={state.refreshAll}
          />
        )}

        {state.activeTab === 'booklets' && (
          <OrBookletsTab
            booklets={state.booklets}
            isLoading={state.isLoadingBooklets}
            onOpenBundleModal={() => state.setIsBundleModalOpen(true)}
            onEditBooklet={(b) => state.setEditingBooklet(b)}
            onTransferBooklet={(b) => state.setTransferringBooklet(b)}
          />
        )}

        {state.activeTab === 'deposits' && (
          <BankDepositsTab
            deposits={state.deposits}
            isLoading={state.isLoadingDeposits}
            undepositedReceipts={state.undepositedReceipts}
            onOpenDepositModal={() => state.setIsDepositModalOpen(true)}
            onViewDeposit={(d) => state.setViewingDeposit(d)}
          />
        )}

        {state.activeTab === 'accounts' && (
          <BankAccountsTab
            bankAccounts={state.bankAccounts}
            isLoading={state.isLoadingBankAccounts}
            onOpenAccountModal={() => {
              state.setEditingBankAccount(null);
              state.setIsBankAccountModalOpen(true);
            }}
            onEditAccount={(acc) => {
              state.setEditingBankAccount(acc);
              state.setIsBankAccountModalOpen(true);
            }}
          />
        )}

        {state.activeTab === 'reports' && (
          <CashierReportsTab
            reportSubTab={state.reportSubTab}
            onReportSubTabChange={state.setReportSubTab}
            reportDateRange={state.reportDateRange}
            onReportDateRangeChange={state.setReportDateRange}
            rcdReport={state.rcdReport}
            isLoadingRcd={state.isLoadingRcd}
            cancelledReport={state.cancelledReport}
            isLoadingCancelled={state.isLoadingCancelled}
          />
        )}
      </View>

      {/* Modals */}
      <>
        <BundleEntryModal
          visible={state.isBundleModalOpen}
          tenantId={state.tenantId}
          onClose={() => state.setIsBundleModalOpen(false)}
          onSuccess={state.refreshAll}
        />

        <EditBookletModal
          visible={state.editingBooklet !== null}
          booklet={state.editingBooklet}
          onClose={() => state.setEditingBooklet(null)}
          onSuccess={state.refreshAll}
        />

        <TransferBookletModal
          visible={state.transferringBooklet !== null}
          tenantId={state.tenantId}
          booklet={state.transferringBooklet}
          onClose={() => state.setTransferringBooklet(null)}
          onSuccess={state.refreshAll}
        />

        <IssueReceiptModal
          visible={state.isIssueModalOpen}
          tenantId={state.tenantId}
          nextOr={state.nextOr}
          pendingPayment={state.selectedPendingPayment}
          onClose={state.handleCloseIssueModal}
          onSuccess={state.refreshAll}
        />

        <EditReceiptModal
          visible={state.editingReceipt !== null}
          receipt={state.editingReceipt}
          onClose={() => state.setEditingReceipt(null)}
          onSuccess={state.refreshAll}
        />

        <CancelReceiptModal
          visible={state.cancellingReceipt !== null}
          receipt={state.cancellingReceipt}
          onClose={() => state.setCancellingReceipt(null)}
          onSuccess={state.refreshAll}
        />

        <CreateDepositModal
          visible={state.isDepositModalOpen}
          tenantId={state.tenantId}
          bankAccounts={state.bankAccounts}
          undepositedReceipts={state.undepositedReceipts}
          onClose={() => state.setIsDepositModalOpen(false)}
          onSuccess={state.refreshAll}
        />

        <BankAccountModal
          visible={state.isBankAccountModalOpen}
          tenantId={state.tenantId}
          account={state.editingBankAccount}
          onClose={() => {
            state.setIsBankAccountModalOpen(false);
            state.setEditingBankAccount(null);
          }}
          onSuccess={state.refreshAll}
        />

        <ReceiptPrintPreviewModal
          visible={state.viewingReceipt !== null}
          receipt={state.viewingReceipt}
          onClose={() => state.setViewingReceipt(null)}
        />

        <PendingPaymentDetailsModal
          visible={state.selectedDetailsPayment !== null}
          payment={state.selectedDetailsPayment}
          onClose={() => state.setSelectedDetailsPayment(null)}
          onEndorse={(payment) => {
            state.setSelectedDetailsPayment(null);
            state.setSelectedEndorsePayment(payment);
          }}
          onIssueReceipt={(payment) => {
            state.setSelectedDetailsPayment(null);
            state.handleOpenIssueWithPendingPayment(payment);
          }}
        />

        <EndorseReReviewModal
          visible={state.selectedEndorsePayment !== null}
          payment={state.selectedEndorsePayment}
          onClose={() => state.setSelectedEndorsePayment(null)}
          onSuccess={state.refreshAll}
        />
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },
  restrictedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  restrictedCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 14,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: 12,
  },
  restrictedIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  restrictedSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  returnDashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  returnDashboardBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 280,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navBar: {
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
  },
  navScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  contentArea: {
    flex: 1,
  },
});
