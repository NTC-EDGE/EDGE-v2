import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';

export type BookletStatus = 'Active' | 'Exhausted' | 'Cancelled' | 'Archived';
export type ReceiptStatus = 'Issued' | 'Deposited' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Check' | 'Online';
export type DepositStatus = 'Pending' | 'Deposited' | 'Reconciled';

export interface BookletCashierDto {
  userId: string;
  fullName: string;
  isPrimary?: boolean;
}

export interface OrBookletDto {
  id: string;
  tenantId: string;
  bookletNumber: string;
  prefix?: string | null;
  startNumber: number;
  endNumber: number;
  currentNumber: number;
  totalCount: number;
  issuedCount: number;
  remainingCount: number;
  formattedStartNumber: string;
  formattedEndNumber: string;
  formattedCurrentNumber: string;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  status: BookletStatus;
  receivedDate: string;
  remarks?: string | null;
  assignedUserIds?: string[];
  assignedUserNames?: string[];
  assignedCashiers?: BookletCashierDto[];
}

export interface NextAvailableOrDto {
  bookletId?: string | null;
  bookletNumber?: string | null;
  prefix?: string | null;
  formattedOrNumber?: string | null;
  rawNumber?: number | null;
  startNumber?: number | null;
  endNumber?: number | null;
  formattedStartNumber?: string | null;
  formattedEndNumber?: string | null;
  totalCount?: number;
  issuedCount?: number;
  remainingCount: number;
  hasActiveBooklet: boolean;
  assignedUserNames?: string[];
  isShared?: boolean;
}

export interface PendingPaymentLineItemDto {
  feeCode: string;
  description: string;
  amount: number;
}

export interface ReceiptFeeItemDto {
  id: string;
  feeCode: string;
  name: string;
  description: string;
  amount: number;
  sourceType: string;
  serviceName?: string | null;
  variantName?: string | null;
  elementName?: string | null;
}

export interface PendingPaymentDto {
  orderOfPaymentId: string;
  applicationId: string;
  statementOfAccountId: string;
  tenantId: string;
  opNumber: string;
  soaNumber: string;
  applicationNumber: string;
  referenceNumber: string;
  applicantName: string;
  applicantType: string;
  serviceName: string;
  serviceCategory: string;
  amountDue: number;
  billedAt: string;
  remarks?: string | null;
  lineItems: PendingPaymentLineItemDto[];
}

export interface OfficialReceiptLineItemDto {
  id: string;
  feeCode: string;
  description: string;
  amount: number;
}

export interface OfficialReceiptDto {
  id: string;
  tenantId: string;
  officialReceiptNumber: string;
  bookletId?: string | null;
  bookletNumber?: string | null;
  orderOfPaymentId?: string | null;
  opNumber?: string | null;
  applicationId?: string | null;
  applicationNumber?: string | null;
  payorName: string;
  payorAddress?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  checkNumber?: string | null;
  checkBank?: string | null;
  checkDate?: string | null;
  depositId?: string | null;
  depositSlipNumber?: string | null;
  status: ReceiptStatus;
  issuedAt: string;
  issuedByUserId?: string | null;
  issuedByUserName?: string | null;
  cancelledAt?: string | null;
  cancelledByUserId?: string | null;
  cancelledByUserName?: string | null;
  cancellationReason?: string | null;
  remarks?: string | null;
  lineItems: OfficialReceiptLineItemDto[];
}

export interface AgencyBankAccountDto {
  id: string;
  tenantId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string | null;
  fundCluster: string;
  isActive: boolean;
  remarks?: string | null;
}

export interface BankDepositDto {
  id: string;
  tenantId: string;
  depositSlipNumber: string;
  bankAccountId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  fundCluster: string;
  depositDate: string;
  totalAmount: number;
  cashAmount: number;
  checkAmount: number;
  linkedReceiptsCount: number;
  status: DepositStatus;
  depositedByUserId?: string | null;
  depositedByUserName?: string | null;
  verifiedByUserId?: string | null;
  verifiedByUserName?: string | null;
  depositSlipAttachmentId?: string | null;
  remarks?: string | null;
  receipts: OfficialReceiptDto[];
}

export interface CashierRcdSummaryDto {
  totalCollections: number;
  totalCash: number;
  totalCheck: number;
  totalOnline: number;
  totalDeposited: number;
  netUndepositedCashOnHand: number;
  totalTransactionsCount: number;
  cancelledOrCount: number;
}

export interface CashierRcdReportDto {
  tenantId: string;
  tenantName: string;
  fromDate: string;
  toDate: string;
  cashierUserId?: string | null;
  cashierName?: string | null;
  summary: CashierRcdSummaryDto;
  activeBooklets: OrBookletDto[];
  collections: OfficialReceiptDto[];
  deposits: BankDepositDto[];
  cancelledReceipts: OfficialReceiptDto[];
}

export interface CancelledOrItemDto {
  id: string;
  officialReceiptNumber: string;
  issuedAt: string;
  cancelledAt?: string | null;
  payorName: string;
  amount: number;
  cancelledByUserName?: string | null;
  cancellationReason?: string | null;
}

export interface CancelledOrReportDto {
  tenantId: string;
  tenantName: string;
  fromDate: string;
  toDate: string;
  totalCancelledCount: number;
  totalCancelledAmount: number;
  items: CancelledOrItemDto[];
}

export interface CreateOrBookletPayload {
  tenantId: string;
  bookletNumber: string;
  prefix?: string | null;
  startNumber: number;
  endNumber?: number | null;
  totalCount?: number;
  assignedUserId?: string | null;
  assignedUserIds?: string[];
  remarks?: string | null;
}

export interface UpdateOrBookletPayload {
  id: string;
  tenantId: string;
  bookletNumber: string;
  prefix?: string | null;
  startNumber: number;
  endNumber?: number | null;
  totalCount?: number;
  assignedUserId?: string | null;
  assignedUserIds?: string[];
  remarks?: string | null;
}

export interface TransferOrBookletPayload {
  id: string;
  tenantId: string;
  newAssignedUserId: string;
  additionalUserIds?: string[];
  transferReason?: string | null;
}

export interface IssueReceiptLineItemInput {
  feeCode: string;
  description: string;
  amount: number;
}

export interface IssueOfficialReceiptPayload {
  tenantId: string;
  orderOfPaymentId?: string | null;
  bookletId?: string | null;
  manualOrNumber?: string | null;
  payorName: string;
  payorAddress?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  checkNumber?: string | null;
  checkBank?: string | null;
  checkDate?: string | null;
  remarks?: string | null;
  lineItems?: IssueReceiptLineItemInput[];
}

export interface EditOfficialReceiptPayload {
  id: string;
  payorName: string;
  payorAddress?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  checkNumber?: string | null;
  checkBank?: string | null;
  checkDate?: string | null;
  remarks?: string | null;
  lineItems?: IssueReceiptLineItemInput[];
}

export interface CreateAgencyBankAccountPayload {
  tenantId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string | null;
  fundCluster?: string;
  isActive?: boolean;
  remarks?: string | null;
}

export interface UpdateAgencyBankAccountPayload {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string | null;
  fundCluster?: string;
  isActive?: boolean;
  remarks?: string | null;
}

export interface CreateBankDepositPayload {
  tenantId: string;
  depositSlipNumber: string;
  bankAccountId: string;
  depositDate: string;
  cashAmount: number;
  checkAmount: number;
  officialReceiptIds: string[];
  depositSlipAttachmentId?: string | null;
  remarks?: string | null;
}

export const receiptService = {
  getFeeCatalog: async (params?: { search?: string }) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: ReceiptFeeItemDto[] }>('/api/v2/receipts/fee-catalog', { params });
      return res.data.data;
    });
  },

  getPendingPayments: async (params?: { tenantId?: string; search?: string }) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: PendingPaymentDto[] }>('/api/v2/receipts/pending-payments', { params });
      return res.data.data;
    });
  },

  getOrBooklets: async (tenantId: string, status?: BookletStatus) => {
    return safeAsync(async () => {
      const params: Record<string, string> = { tenantId };
      if (status) params.status = status;
      const res = await apiClient.get<{ data: OrBookletDto[] }>('/api/v2/receipts/booklets', { params });
      return res.data.data;
    });
  },

  createOrBooklet: async (payload: CreateOrBookletPayload) => {
    return safeAsync(async () => {
      const res = await apiClient.post<{ data: OrBookletDto }>('/api/v2/receipts/booklets', payload);
      return res.data.data;
    });
  },

  updateOrBooklet: async (payload: UpdateOrBookletPayload) => {
    return safeAsync(async () => {
      const { id, ...data } = payload;
      const res = await apiClient.put<{ data: OrBookletDto }>(`/api/v2/receipts/booklets/${id}`, data);
      return res.data.data;
    });
  },

  transferOrBooklet: async (payload: TransferOrBookletPayload) => {
    return safeAsync(async () => {
      const { id, ...data } = payload;
      const res = await apiClient.post<{ data: OrBookletDto }>(`/api/v2/receipts/booklets/${id}/transfer`, data);
      return res.data.data;
    });
  },

  getNextAvailableOrNumber: async (tenantId: string, cashierUserId?: string) => {
    return safeAsync(async () => {
      const params: Record<string, string> = { tenantId };
      if (cashierUserId) params.cashierUserId = cashierUserId;
      const res = await apiClient.get<{ data: NextAvailableOrDto }>('/api/v2/receipts/booklets/next-available', { params });
      return res.data.data;
    });
  },

  getOfficialReceipts: async (params: {
    tenantId: string;
    status?: ReceiptStatus;
    paymentMethod?: PaymentMethod;
    fromDate?: string;
    toDate?: string;
    cashierUserId?: string;
    search?: string;
  }) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: OfficialReceiptDto[] }>('/api/v2/receipts', { params });
      return res.data.data;
    });
  },

  getUndepositedReceipts: async (tenantId: string) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: OfficialReceiptDto[] }>('/api/v2/receipts/undeposited', {
        params: { tenantId },
      });
      return res.data.data;
    });
  },

  getOfficialReceiptById: async (id: string) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: OfficialReceiptDto }>(`/api/v2/receipts/${id}`);
      return res.data.data;
    });
  },

  issueOfficialReceipt: async (payload: IssueOfficialReceiptPayload) => {
    return safeAsync(async () => {
      const res = await apiClient.post<{ data: OfficialReceiptDto }>('/api/v2/receipts', payload);
      return res.data.data;
    });
  },

  editOfficialReceipt: async (id: string, payload: EditOfficialReceiptPayload) => {
    return safeAsync(async () => {
      const res = await apiClient.put<{ data: OfficialReceiptDto }>(`/api/v2/receipts/${id}`, payload);
      return res.data.data;
    });
  },

  cancelOfficialReceipt: async (id: string, cancellationReason: string) => {
    return safeAsync(async () => {
      const res = await apiClient.post<{ data: OfficialReceiptDto }>(`/api/v2/receipts/${id}/cancel`, {
        cancellationReason,
      });
      return res.data.data;
    });
  },

  getAgencyBankAccounts: async (tenantId: string, activeOnly?: boolean) => {
    return safeAsync(async () => {
      const params: Record<string, string | boolean> = { tenantId };
      if (typeof activeOnly === 'boolean') params.activeOnly = activeOnly;
      const res = await apiClient.get<{ data: AgencyBankAccountDto[] }>('/api/v2/receipts/bank-accounts', { params });
      return res.data.data;
    });
  },

  createAgencyBankAccount: async (payload: CreateAgencyBankAccountPayload) => {
    return safeAsync(async () => {
      const res = await apiClient.post<{ data: AgencyBankAccountDto }>('/api/v2/receipts/bank-accounts', payload);
      return res.data.data;
    });
  },

  updateAgencyBankAccount: async (id: string, payload: UpdateAgencyBankAccountPayload) => {
    return safeAsync(async () => {
      const res = await apiClient.put<{ data: AgencyBankAccountDto }>(`/api/v2/receipts/bank-accounts/${id}`, payload);
      return res.data.data;
    });
  },

  getBankDeposits: async (params: {
    tenantId: string;
    bankAccountId?: string;
    status?: DepositStatus;
    fromDate?: string;
    toDate?: string;
  }) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: BankDepositDto[] }>('/api/v2/receipts/deposits', { params });
      return res.data.data;
    });
  },

  getBankDepositById: async (id: string) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: BankDepositDto }>(`/api/v2/receipts/deposits/${id}`);
      return res.data.data;
    });
  },

  createBankDeposit: async (payload: CreateBankDepositPayload) => {
    return safeAsync(async () => {
      const res = await apiClient.post<{ data: BankDepositDto }>('/api/v2/receipts/deposits', payload);
      return res.data.data;
    });
  },

  getCashierRcdReport: async (params: {
    tenantId: string;
    fromDate?: string;
    toDate?: string;
    cashierUserId?: string;
  }) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: CashierRcdReportDto }>('/api/v2/receipts/reports/rcd', { params });
      return res.data.data;
    });
  },

  getCancelledOrReport: async (params: { tenantId: string; fromDate?: string; toDate?: string }) => {
    return safeAsync(async () => {
      const res = await apiClient.get<{ data: CancelledOrReportDto }>('/api/v2/receipts/reports/cancelled', { params });
      return res.data.data;
    });
  },
};
