import { ApplicationStatus } from './applicationBaseTypes';
import { Application } from './applicationModelTypes';

export function getStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'FOR_APPROVAL':
      return 'For Issuance';
    case 'FOR_EVALUATION':
      return 'For Evaluation';
    case 'APPROVED':
      return 'Complete';
    case 'DECLINED':
      return 'Returned';
    case 'EXPIRING_SOON':
      return 'Expiring Soon';
    case 'READY_FOR_PAYMENT':
      return 'For Payment';
    case 'PAYMENT_SUBMITTED':
      return 'Verification in Progress';
    case 'PENDING':
      return 'Submitted';
  }
}

export function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'FOR_APPROVAL':
      return '#2563EB';
    case 'FOR_EVALUATION':
      return '#D97706';
    case 'APPROVED':
      return '#16A34A';
    case 'DECLINED':
      return '#DC2626';
    case 'EXPIRING_SOON':
      return '#EA580C';
    case 'READY_FOR_PAYMENT':
      return '#059669';
    case 'PAYMENT_SUBMITTED':
      return '#0284C7';
    case 'PENDING':
      return '#64748B';
  }
}

export function getStatusBgColor(status: ApplicationStatus): string {
  switch (status) {
    case 'FOR_APPROVAL':
      return '#EFF6FF';
    case 'FOR_EVALUATION':
      return '#FEF3C7';
    case 'APPROVED':
      return '#DCFCE7';
    case 'DECLINED':
      return '#FEE2E2';
    case 'EXPIRING_SOON':
      return '#FFF7ED';
    case 'READY_FOR_PAYMENT':
      return '#D1FAE5';
    case 'PAYMENT_SUBMITTED':
      return '#E0F2FE';
    case 'PENDING':
      return '#F1F5F9';
  }
}

export function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHr < 24) return `about ${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
}

export function normalizeApplicationStatus(rawStatus: string | undefined | null): ApplicationStatus {
  if (!rawStatus) return 'PENDING';
  const s = rawStatus.toUpperCase().replace(/\s+/g, '_').replace(/_/g, '');
  if (s.includes('FORISSUANCE') || s.includes('ISSUANCE') || s.includes('FORAPPROVAL') || s.includes('APPROVAL')) {
    return 'FOR_APPROVAL';
  }
  if (
    s.includes('FORORDEROFPAYMENT') ||
    s.includes('FORACCOUNTANT') ||
    s.includes('EVALUAT') ||
    s.includes('UNDEREVALUATION')
  ) {
    return 'FOR_EVALUATION';
  }
  if (s.includes('DECLIN') || s.includes('REJECT') || s.includes('RETURN')) return 'DECLINED';
  if (
    s.includes('PAYMENTSUBMITTED') ||
    s.includes('VERIFICATIONINPROGRESS') ||
    s.includes('AWAITINGVERIFICATION') ||
    s.includes('PAYMENTPROCESSING')
  ) {
    return 'PAYMENT_SUBMITTED';
  }
  if (
    s.includes('PENDINGPAYMENT') ||
    s.includes('READYFORPAYMENT') ||
    s.includes('FORPAYMENT') ||
    s === 'PAYMENT' ||
    s === 'FOR_PAYMENT'
  ) {
    return 'READY_FOR_PAYMENT';
  }
  if (s.includes('EXPIR')) return 'EXPIRING_SOON';
  if (s.includes('DRAFT') || s.includes('SUBMIT')) return 'PENDING';
  if (s === 'APPROVED' || s === 'COMPLETED' || s === 'ISSUED') return 'APPROVED';
  return 'PENDING';
}

export function isApplicationPaymentSubmitted(app: Application): boolean {
  const orNumber = app.officialReceiptNumber || app.op?.officialReceiptNumber || null;
  const hasOr = Boolean(typeof orNumber === 'string' && orNumber.trim().length > 0);
  if (hasOr) return false;

  const opStatusLower = (app.op?.status ?? '').toLowerCase();
  const isOpBilled = opStatusLower === 'billed' || opStatusLower === 'active';
  const isOpReturned = opStatusLower === 'returned';
  if (isOpBilled || isOpReturned) return false;

  if (opStatusLower === 'processing' || opStatusLower === 'paid') {
    return true;
  }

  const hasPaymentKeyword = (text: string): boolean =>
    text.includes('payment submitted') ||
    text.includes('waiting for cashier verification') ||
    text.includes('awaiting cashier verification') ||
    text.includes('verification in progress');

  const remarksLower = (typeof app.remarks === 'string' ? app.remarks : '').toLowerCase();
  if (hasPaymentKeyword(remarksLower)) return true;

  const opRemarksLower = (typeof app.op?.remarks === 'string' ? app.op.remarks : '').toLowerCase();
  if (hasPaymentKeyword(opRemarksLower)) return true;

  const rawStatusLower = (typeof app.rawStatus === 'string' ? app.rawStatus : '').toLowerCase();
  if (
    rawStatusLower === 'payment_submitted' ||
    rawStatusLower === 'paymentsubmitted' ||
    rawStatusLower === 'payment_processing' ||
    rawStatusLower === 'paymentprocessing' ||
    rawStatusLower === 'awaiting_verification'
  ) {
    return true;
  }

  const statusStr = (typeof app.status === 'string' ? app.status : '').toUpperCase();
  if (statusStr === 'PAYMENT_SUBMITTED') {
    return true;
  }

  const histories = app.histories || app.history || [];
  if (Array.isArray(histories) && histories.length > 0) {
    return histories.some((h) => {
      const act = (h.action || '').toLowerCase();
      const rem = (h.remarks || '').toLowerCase();
      return (
        act.includes('awaiting cashier verification') ||
        act.includes('submitted payment') ||
        act.includes('payment submitted') ||
        rem.includes('awaiting cashier verification') ||
        rem.includes('payment submitted')
      );
    });
  }

  return false;
}
