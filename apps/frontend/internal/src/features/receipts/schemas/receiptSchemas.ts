import { z } from 'zod';

export const createBookletSchema = z.object({
  bookletNumber: z.string().min(1, 'Booklet number is required'),
  prefix: z.string().optional(),
  startNumber: z.coerce.number().int().positive('Start number must be a positive integer'),
  endNumber: z.coerce.number().int().positive().optional(),
  totalCount: z.coerce.number().int().positive().default(50),
  assignedUserId: z.string().optional(),
  remarks: z.string().optional(),
});

export type CreateBookletFormValues = z.infer<typeof createBookletSchema>;

export const receiptLineItemSchema = z.object({
  feeCode: z.string().min(1, 'Fee code is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
});

export const issueReceiptSchema = z.object({
  orderOfPaymentId: z.string().optional(),
  bookletId: z.string().optional(),
  manualOrNumber: z.string().optional(),
  payorName: z.string().min(1, 'Payor name is required'),
  payorAddress: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentMethod: z.enum(['Cash', 'Check', 'Online']).default('Cash'),
  checkNumber: z.string().optional(),
  checkBank: z.string().optional(),
  checkDate: z.string().optional(),
  remarks: z.string().optional(),
  lineItems: z.array(receiptLineItemSchema).optional(),
});

export type IssueReceiptFormValues = z.infer<typeof issueReceiptSchema>;

export const editReceiptSchema = z.object({
  payorName: z.string().min(1, 'Payor name is required'),
  payorAddress: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentMethod: z.enum(['Cash', 'Check', 'Online']).default('Cash'),
  checkNumber: z.string().optional(),
  checkBank: z.string().optional(),
  checkDate: z.string().optional(),
  remarks: z.string().optional(),
  lineItems: z.array(receiptLineItemSchema).optional(),
});

export type EditReceiptFormValues = z.infer<typeof editReceiptSchema>;

export const cancelReceiptSchema = z.object({
  cancellationReason: z.string().min(5, 'Please provide a detailed cancellation reason (min 5 characters)'),
});

export type CancelReceiptFormValues = z.infer<typeof cancelReceiptSchema>;

export const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  branch: z.string().optional(),
  fundCluster: z.string().min(1, 'Fund cluster is required').default('01'),
  isActive: z.boolean().default(true),
  remarks: z.string().optional(),
});

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

export const createDepositSchema = z.object({
  depositSlipNumber: z.string().min(1, 'Deposit slip number is required'),
  bankAccountId: z.string().min(1, 'Bank account is required'),
  depositDate: z.string().min(1, 'Deposit date is required'),
  cashAmount: z.coerce.number().min(0).default(0),
  checkAmount: z.coerce.number().min(0).default(0),
  officialReceiptIds: z.array(z.string()).default([]),
  remarks: z.string().optional(),
});

export type CreateDepositFormValues = z.infer<typeof createDepositSchema>;
