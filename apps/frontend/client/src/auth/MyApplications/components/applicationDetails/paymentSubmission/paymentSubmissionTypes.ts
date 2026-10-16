import { PaymentItemMode } from '@edge/api';

export type ModeOfPayment =
  | 'LandBank'
  | 'GCashMaya'
  | 'BankTransfer'
  | 'CashierOTC'
  | 'Check'
  | 'Combination';

export interface CombinationRow {
  id: string;
  mode: PaymentItemMode;
  amount: string;
  checkNumber: string;
  checkBank: string;
  checkDate: string;
  referenceNumber: string;
}
