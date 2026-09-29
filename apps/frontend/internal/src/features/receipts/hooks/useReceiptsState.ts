import { useState, useMemo, useCallback } from 'react';
import {
  usePendingPayments,
  useOrBooklets,
  useNextAvailableOrNumber,
  useOfficialReceipts,
  useUndepositedReceipts,
  useAgencyBankAccounts,
  useBankDeposits,
  useCashierRcdReport,
  useCancelledOrReport,
  receiptService,
  PendingPaymentDto,
  OrBookletDto,
  OfficialReceiptDto,
  AgencyBankAccountDto,
  BankDepositDto,
  BookletStatus,
  ReceiptStatus,
  PaymentMethod,
} from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';

export type ReceiptTab = 'pending_payments' | 'receipts' | 'booklets' | 'deposits' | 'accounts' | 'reports';

export function useReceiptsState() {
  const { user } = useAuthContext();
  const tenantId = user?.tenantId ?? '';
  const currentUserId = user?.id ?? user?.email ?? null;

  const [activeTab, setActiveTab] = useState<ReceiptTab>('receipts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // Modals
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingBooklet, setEditingBooklet] = useState<OrBookletDto | null>(null);
  const [transferringBooklet, setTransferringBooklet] = useState<OrBookletDto | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedPendingPayment, setSelectedPendingPayment] = useState<PendingPaymentDto | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<OfficialReceiptDto | null>(null);
  const [cancellingReceipt, setCancellingReceipt] = useState<OfficialReceiptDto | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<AgencyBankAccountDto | null>(null);
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<OfficialReceiptDto | null>(null);
  const [viewingDeposit, setViewingDeposit] = useState<BankDepositDto | null>(null);

  // Report Date Filters
  const [reportDateRange, setReportDateRange] = useState<'today' | 'this_week' | 'this_month'>('today');
  const [reportSubTab, setReportSubTab] = useState<'rcd' | 'cancelled'>('rcd');

  // Compute ISO dates for reports
  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (reportDateRange === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (reportDateRange === 'this_week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return { fromDate: start.toISOString(), toDate: end.toISOString() };
  }, [reportDateRange]);

  // Conditional tenant IDs to lazily call endpoints only when the tab or modal is active
  const isReceiptsActive = activeTab === 'receipts' || activeTab === 'pending_payments';
  const pendingPaymentsTenantId = isReceiptsActive ? tenantId : null;
  const bookletsTenantId = (activeTab === 'booklets' || isBundleModalOpen || isIssueModalOpen) ? tenantId : null;
  const nextOrTenantId = (isReceiptsActive || isIssueModalOpen) ? tenantId : null;
  const receiptsTenantId = isReceiptsActive ? tenantId : null;
  const depositsTenantId = activeTab === 'deposits' ? tenantId : null;
  const undepositedTenantId = (activeTab === 'deposits' || isDepositModalOpen) ? tenantId : null;
  const bankAccountsTenantId = (activeTab === 'accounts' || activeTab === 'deposits' || isDepositModalOpen || isBankAccountModalOpen) ? tenantId : null;
  const rcdReportTenantId = (activeTab === 'reports' && reportSubTab === 'rcd') ? tenantId : null;
  const cancelledReportTenantId = (activeTab === 'reports' && reportSubTab === 'cancelled') ? tenantId : null;

  // SWR hooks (Invoked on-demand per tab to prevent backend overload)
  const {
    pendingPayments,
    isLoading: isLoadingPendingPayments,
    mutate: mutatePendingPayments,
  } = usePendingPayments(pendingPaymentsTenantId, searchQuery.trim().length > 0 ? searchQuery.trim() : undefined);

  const {
    booklets,
    isLoading: isLoadingBooklets,
    mutate: mutateBooklets,
  } = useOrBooklets(bookletsTenantId);

  const {
    nextOr,
    isLoading: isLoadingNextOr,
    mutate: mutateNextOr,
  } = useNextAvailableOrNumber(nextOrTenantId, currentUserId);

  const {
    receipts,
    isLoading: isLoadingReceipts,
    mutate: mutateReceipts,
  } = useOfficialReceipts({
    tenantId: receiptsTenantId,
    status: statusFilter !== 'all' ? (statusFilter as ReceiptStatus) : undefined,
    paymentMethod: paymentMethodFilter !== 'all' ? (paymentMethodFilter as PaymentMethod) : undefined,
    search: searchQuery.trim().length > 0 ? searchQuery.trim() : undefined,
  });

  const {
    undepositedReceipts,
    isLoading: isLoadingUndeposited,
    mutate: mutateUndeposited,
  } = useUndepositedReceipts(undepositedTenantId);

  const {
    bankAccounts,
    isLoading: isLoadingBankAccounts,
    mutate: mutateBankAccounts,
  } = useAgencyBankAccounts(bankAccountsTenantId);

  const {
    deposits,
    isLoading: isLoadingDeposits,
    mutate: mutateDeposits,
  } = useBankDeposits({ tenantId: depositsTenantId });

  const {
    rcdReport,
    isLoading: isLoadingRcd,
    mutate: mutateRcd,
  } = useCashierRcdReport({
    tenantId: rcdReportTenantId,
    fromDate,
    toDate,
  });

  const {
    cancelledReport,
    isLoading: isLoadingCancelled,
    mutate: mutateCancelled,
  } = useCancelledOrReport({
    tenantId: cancelledReportTenantId,
    fromDate,
    toDate,
  });

  const handleOpenIssueWithPendingPayment = useCallback((payment: PendingPaymentDto) => {
    setSelectedPendingPayment(payment);
    setIsIssueModalOpen(true);
  }, []);

  const handleOpenIssueNew = useCallback(() => {
    setSelectedPendingPayment(null);
    setIsIssueModalOpen(true);
  }, []);

  const handleCloseIssueModal = useCallback(() => {
    setIsIssueModalOpen(false);
    setSelectedPendingPayment(null);
  }, []);

  const refreshAll = useCallback(() => {
    mutatePendingPayments();
    mutateBooklets();
    mutateNextOr();
    mutateReceipts();
    mutateUndeposited();
    mutateBankAccounts();
    mutateDeposits();
    mutateRcd();
    mutateCancelled();
  }, [
    mutatePendingPayments,
    mutateBooklets,
    mutateNextOr,
    mutateReceipts,
    mutateUndeposited,
    mutateBankAccounts,
    mutateDeposits,
    mutateRcd,
    mutateCancelled,
  ]);

  return {
    tenantId,
    currentUserId,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    reportDateRange,
    setReportDateRange,
    reportSubTab,
    setReportSubTab,

    // Data
    pendingPayments,
    isLoadingPendingPayments,
    booklets,
    isLoadingBooklets,
    nextOr,
    isLoadingNextOr,
    receipts,
    isLoadingReceipts,
    undepositedReceipts,
    isLoadingUndeposited,
    bankAccounts,
    isLoadingBankAccounts,
    deposits,
    isLoadingDeposits,
    rcdReport,
    isLoadingRcd,
    cancelledReport,
    isLoadingCancelled,

    // Modal states
    isBundleModalOpen,
    setIsBundleModalOpen,
    editingBooklet,
    setEditingBooklet,
    transferringBooklet,
    setTransferringBooklet,
    isIssueModalOpen,
    setIsIssueModalOpen,
    selectedPendingPayment,
    setSelectedPendingPayment,
    handleOpenIssueWithPendingPayment,
    handleOpenIssueNew,
    handleCloseIssueModal,
    editingReceipt,
    setEditingReceipt,
    cancellingReceipt,
    setCancellingReceipt,
    isDepositModalOpen,
    setIsDepositModalOpen,
    editingBankAccount,
    setEditingBankAccount,
    isBankAccountModalOpen,
    setIsBankAccountModalOpen,
    viewingReceipt,
    setViewingReceipt,
    viewingDeposit,
    setViewingDeposit,

    refreshAll,
  };
}
