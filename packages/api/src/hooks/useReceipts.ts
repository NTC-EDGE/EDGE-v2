import useSWR from 'swr';
import { apiClient } from '../apiClient';
import {
  PendingPaymentDto,
  ReceiptFeeItemDto,
  OrBookletDto,
  OfficialReceiptDto,
  AgencyBankAccountDto,
  BankDepositDto,
  CashierRcdReportDto,
  CancelledOrReportDto,
  NextAvailableOrDto,
  BookletStatus,
  ReceiptStatus,
  PaymentMethod,
  DepositStatus,
} from '../services/receiptService';

const fetcher = <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
  apiClient.get<{ data: T }>(url, { params }).then((res) => res.data.data);

export function useReceiptFeeCatalog(search?: string, enabled = true) {
  const key = enabled ? ['/api/v2/receipts/fee-catalog', search ?? ''] : null;

  const { data, error, isLoading, mutate } = useSWR<ReceiptFeeItemDto[]>(
    key,
    () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      return fetcher<ReceiptFeeItemDto[]>('/api/v2/receipts/fee-catalog', params);
    },
    { revalidateOnFocus: false }
  );

  return {
    feeCatalog: data ?? [],
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function usePendingPayments(tenantId?: string | null, search?: string) {
  const shouldFetch = tenantId !== null;
  const key = shouldFetch ? ['/api/v2/receipts/pending-payments', tenantId ?? '', search ?? ''] : null;

  const { data, error, isLoading, mutate } = useSWR<PendingPaymentDto[]>(
    key,
    () => {
      const params: Record<string, string> = { tenantId: tenantId ?? '' };
      if (search) params.search = search;
      return fetcher<PendingPaymentDto[]>('/api/v2/receipts/pending-payments', params);
    },
    { revalidateOnFocus: true, refreshInterval: 15000 }
  );

  return {
    pendingPayments: data ?? [],
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function useOrBooklets(tenantId?: string | null, status?: BookletStatus) {
  const shouldFetch = tenantId !== null;
  const key = shouldFetch ? ['/api/v2/receipts/booklets', tenantId ?? '', status ?? 'all'] : null;

  const { data, error, isLoading, mutate } = useSWR<OrBookletDto[]>(
    key,
    () => {
      const params: Record<string, string> = { tenantId: tenantId ?? '' };
      if (status) params.status = status;
      return fetcher<OrBookletDto[]>('/api/v2/receipts/booklets', params);
    },
    { revalidateOnFocus: false }
  );

  return {
    booklets: data ?? [],
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function useNextAvailableOrNumber(tenantId?: string | null, cashierUserId?: string | null) {
  const shouldFetch = tenantId !== null;
  const key = shouldFetch ? ['/api/v2/receipts/booklets/next-available', tenantId ?? '', cashierUserId ?? 'current'] : null;

  const { data, error, isLoading, mutate } = useSWR<NextAvailableOrDto>(
    key,
    () => {
      const params: Record<string, string> = { tenantId: tenantId ?? '' };
      if (cashierUserId) params.cashierUserId = cashierUserId;
      return fetcher<NextAvailableOrDto>('/api/v2/receipts/booklets/next-available', params);
    },
    { revalidateOnFocus: false }
  );

  return {
    nextOr: data,
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function useOfficialReceipts(params: {
  tenantId?: string | null;
  status?: ReceiptStatus;
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  cashierUserId?: string;
  search?: string;
}) {
  const shouldFetch = params.tenantId !== null;
  const key = shouldFetch
    ? [
        '/api/v2/receipts',
        params.tenantId ?? '',
        params.status ?? 'all',
        params.paymentMethod ?? 'all',
        params.fromDate ?? '',
        params.toDate ?? '',
        params.cashierUserId ?? '',
        params.search ?? '',
      ]
    : null;

  const { data, error, isLoading, mutate } = useSWR<OfficialReceiptDto[]>(
    key,
    () => {
      const queryParams: Record<string, string> = { tenantId: params.tenantId ?? '' };
      if (params.status) queryParams.status = params.status;
      if (params.paymentMethod) queryParams.paymentMethod = params.paymentMethod;
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.cashierUserId) queryParams.cashierUserId = params.cashierUserId;
      if (params.search) queryParams.search = params.search;
      return fetcher<OfficialReceiptDto[]>('/api/v2/receipts', queryParams);
    },
    { revalidateOnFocus: true, refreshInterval: 15000 }
  );

  return {
    receipts: data ?? [],
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function useUndepositedReceipts(tenantId?: string | null) {
  const shouldFetch = tenantId !== null;
  const key = shouldFetch ? ['/api/v2/receipts/undeposited', tenantId ?? ''] : null;

  const { data, error, isLoading, mutate } = useSWR<OfficialReceiptDto[]>(
    key,
    () => fetcher<OfficialReceiptDto[]>('/api/v2/receipts/undeposited', { tenantId: tenantId ?? '' }),
    { revalidateOnFocus: false }
  );

  return {
    undepositedReceipts: data ?? [],
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function useAgencyBankAccounts(tenantId?: string | null, activeOnly?: boolean) {
  const shouldFetch = tenantId !== null;
  const key = shouldFetch ? ['/api/v2/receipts/bank-accounts', tenantId ?? '', activeOnly ? 'active' : 'all'] : null;

  const { data, error, isLoading, mutate } = useSWR<AgencyBankAccountDto[]>(
    key,
    () => {
      const queryParams: Record<string, string | boolean> = { tenantId: tenantId ?? '' };
      if (typeof activeOnly === 'boolean') queryParams.activeOnly = activeOnly;
      return fetcher<AgencyBankAccountDto[]>('/api/v2/receipts/bank-accounts', queryParams);
    },
    { revalidateOnFocus: false }
  );

  return {
    bankAccounts: data ?? [],
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function useBankDeposits(params: {
  tenantId?: string | null;
  bankAccountId?: string;
  status?: DepositStatus;
  fromDate?: string;
  toDate?: string;
}) {
  const shouldFetch = params.tenantId !== null;
  const key = shouldFetch
    ? [
        '/api/v2/receipts/deposits',
        params.tenantId ?? '',
        params.bankAccountId ?? 'all',
        params.status ?? 'all',
        params.fromDate ?? '',
        params.toDate ?? '',
      ]
    : null;

  const { data, error, isLoading, mutate } = useSWR<BankDepositDto[]>(
    key,
    () => {
      const queryParams: Record<string, string> = { tenantId: params.tenantId ?? '' };
      if (params.bankAccountId) queryParams.bankAccountId = params.bankAccountId;
      if (params.status) queryParams.status = params.status;
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      return fetcher<BankDepositDto[]>('/api/v2/receipts/deposits', queryParams);
    },
    { revalidateOnFocus: false }
  );

  return {
    deposits: data ?? [],
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function useCashierRcdReport(params: {
  tenantId?: string | null;
  fromDate?: string;
  toDate?: string;
  cashierUserId?: string;
}) {
  const shouldFetch = params.tenantId !== null;
  const key = shouldFetch
    ? [
        '/api/v2/receipts/reports/rcd',
        params.tenantId ?? '',
        params.fromDate ?? '',
        params.toDate ?? '',
        params.cashierUserId ?? '',
      ]
    : null;

  const { data, error, isLoading, mutate } = useSWR<CashierRcdReportDto>(
    key,
    () => {
      const queryParams: Record<string, string> = { tenantId: params.tenantId ?? '' };
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.cashierUserId) queryParams.cashierUserId = params.cashierUserId;
      return fetcher<CashierRcdReportDto>('/api/v2/receipts/reports/rcd', queryParams);
    },
    { revalidateOnFocus: false }
  );

  return {
    rcdReport: data,
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}

export function useCancelledOrReport(params: { tenantId?: string | null; fromDate?: string; toDate?: string }) {
  const shouldFetch = params.tenantId !== null;
  const key = shouldFetch
    ? ['/api/v2/receipts/reports/cancelled', params.tenantId ?? '', params.fromDate ?? '', params.toDate ?? '']
    : null;

  const { data, error, isLoading, mutate } = useSWR<CancelledOrReportDto>(
    key,
    () => {
      const queryParams: Record<string, string> = { tenantId: params.tenantId ?? '' };
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      return fetcher<CancelledOrReportDto>('/api/v2/receipts/reports/cancelled', queryParams);
    },
    { revalidateOnFocus: false }
  );

  return {
    cancelledReport: data,
    isLoading,
    isError: error !== undefined && error !== null,
    error,
    mutate,
  };
}
