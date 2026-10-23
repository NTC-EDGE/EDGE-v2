import { PaymentItemMode } from '@edge/api';

export type ModeOfPayment =
  | 'LandBank'
  | 'GCashMaya'
  | 'BankTransfer'
  | 'CashierOTC'
  | 'Check'
  | 'Combination';

export interface CheckProofFile {
  name: string;
  uri: string;
  type?: string;
  size?: number;
  file?: File | Blob;
}

export interface CombinationRow {
  id: string;
  mode: PaymentItemMode;
  amount: string;
  checkNumber: string;
  checkBank: string;
  checkDate: string;
  referenceNumber: string;
  checkProofFile?: CheckProofFile | null;
}
