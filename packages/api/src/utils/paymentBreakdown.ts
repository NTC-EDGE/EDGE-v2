export type PaymentItemMode = 'Cash' | 'Check' | 'Online';

export interface PaymentBreakdownItem {
  id: string;
  mode: PaymentItemMode;
  amount: number;
  checkNumber?: string;
  checkBank?: string;
  checkDate?: string;
  referenceNumber?: string;
  remarks?: string;
}

export interface PaymentBreakdown {
  isCombination: boolean;
  totalAmount: number;
  items: PaymentBreakdownItem[];
  userNotes?: string;
}

const BREAKDOWN_TAG_START = '[PAYMENT_BREAKDOWN:';
const BREAKDOWN_TAG_END = ']';

/**
 * Serializes a PaymentBreakdown into a human-readable string with embedded JSON metadata.
 */
export function serializePaymentBreakdown(breakdown: PaymentBreakdown): string {
  const modeSummaries = breakdown.items.map((item) => {
    const formattedAmount = `₱${item.amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    if (item.mode === 'Check') {
      const bankInfo = item.checkBank ? ` (${item.checkBank}` : '';
      const numInfo = item.checkNumber ? ` #${item.checkNumber}` : '';
      const dateInfo = item.checkDate ? `, ${item.checkDate}` : '';
      const closeParen = bankInfo || numInfo || dateInfo ? ')' : '';
      return `Check${bankInfo}${numInfo}${dateInfo}${closeParen}: ${formattedAmount}`;
    }

    if (item.mode === 'Online') {
      const refInfo = item.referenceNumber ? ` (Ref: ${item.referenceNumber})` : '';
      return `Online${refInfo}: ${formattedAmount}`;
    }

    return `Cash: ${formattedAmount}`;
  });

  const humanReadable = breakdown.isCombination
    ? `Combination Payment: ${modeSummaries.join(' + ')} (Total: ₱${breakdown.totalAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })})`
    : modeSummaries.join(', ');

  const notesPart = breakdown.userNotes && breakdown.userNotes.trim().length > 0
    ? ` Note: ${breakdown.userNotes.trim()}`
    : '';

  const jsonPayload = JSON.stringify(breakdown);

  return `${humanReadable}.${notesPart} ${BREAKDOWN_TAG_START}${jsonPayload}${BREAKDOWN_TAG_END}`.trim();
}

/**
 * Parses a PaymentBreakdown from remarks text if present.
 */
export function parsePaymentBreakdown(remarks?: string | null): PaymentBreakdown | null {
  if (!remarks || typeof remarks !== 'string') {
    return null;
  }

  const startIndex = remarks.indexOf(BREAKDOWN_TAG_START);
  if (startIndex !== -1) {
    const jsonStartIndex = startIndex + BREAKDOWN_TAG_START.length;
    const endIndex = remarks.indexOf(BREAKDOWN_TAG_END, jsonStartIndex);
    if (endIndex !== -1) {
      const jsonString = remarks.substring(jsonStartIndex, endIndex).trim();
      try {
        const parsed = JSON.parse(jsonString) as unknown;
        if (isValidPaymentBreakdown(parsed)) {
          return parsed;
        }
      } catch {
        // Fall back to text parsing
      }
    }
  }

  // Fallback: heuristic check if the text mentions Check details
  const lower = remarks.toLowerCase();
  if (lower.includes('check') && (lower.includes('bank') || lower.includes('ref:'))) {
    return {
      isCombination: lower.includes('combination') || (lower.includes('cash') && lower.includes('check')),
      totalAmount: 0,
      items: [
        {
          id: 'heuristic-1',
          mode: 'Check',
          amount: 0,
          remarks: remarks,
        },
      ],
    };
  }

  return null;
}

function isValidPaymentBreakdown(data: unknown): data is PaymentBreakdown {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.isCombination === 'boolean' &&
    typeof obj.totalAmount === 'number' &&
    Array.isArray(obj.items)
  );
}
