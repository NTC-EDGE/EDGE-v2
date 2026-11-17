import { PaymentItemMode } from '@edge/api';

export type ModeOfPayment =
  | 'Online'
  | 'Check'
  | 'CashierOTC'
  | 'Combination';

export type OnlinePaymentChannel =
  | 'LandBank'
  | 'GCash'
  | 'Maya'
  | 'BankTransfer';

export interface OnlineChannelOption {
  id: OnlinePaymentChannel;
  label: string;
  shortLabel: string;
  refLabel: string;
  placeholder: string;
}

export const ONLINE_PAYMENT_CHANNELS: OnlineChannelOption[] = [
  {
    id: 'LandBank',
    label: 'LandBank Link.BizPortal',
    shortLabel: 'LandBank Link.Biz',
    refLabel: 'LandBank Link.Biz Reference / E-Receipt No.',
    placeholder: 'e.g. LBP-EPAY-2026-XXXXX',
  },
  {
    id: 'GCash',
    label: 'GCash',
    shortLabel: 'GCash',
    refLabel: 'GCash Reference Number',
    placeholder: 'e.g. 9012345678901',
  },
  {
    id: 'Maya',
    label: 'Maya',
    shortLabel: 'Maya',
    refLabel: 'Maya Reference / Transaction ID',
    placeholder: 'e.g. MAYA-2026-XXXXXXXX',
  },
  {
    id: 'BankTransfer',
    label: 'Bank Transfer (InstaPay / PESONet)',
    shortLabel: 'Bank Transfer',
    refLabel: 'Bank Transfer / Deposit Reference No.',
    placeholder: 'e.g. FT-INSTAPAY-XXXXXXXX',
  },
];

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
  onlineChannel?: OnlinePaymentChannel;
  checkProofFile?: CheckProofFile | null;
}

