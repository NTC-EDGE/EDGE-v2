/**
 * Canonical Application Status constants matching EDGE.Domain.Enums.ApplicationStatus.
 * Guarantees consistent status references across client and internal applications.
 */
export const APPLICATION_STATUS = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  Evaluating: 'Evaluating',
  Returned: 'Returned',
  Approved: 'Approved',
  Completed: 'Completed',
  ForAccountant: 'ForAccountant',
  PendingPayment: 'PendingPayment',
  ForIssuance: 'ForIssuance',
} as const;

export type ApplicationStatusConstant = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];
