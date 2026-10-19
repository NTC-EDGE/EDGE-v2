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
  isIssued?: boolean;
  orNumber?: string | null;
  issuedAt?: string | null;
}

export interface PaymentBreakdown {
  isCombination: boolean;
  totalAmount: number;
  items: PaymentBreakdownItem[];
  payorName?: string;
  userNotes?: string;
}

const BREAKDOWN_TAG_START = '[PAYMENT_BREAKDOWN:';
const BREAKDOWN_TAG_END = ']';
const EXPLICIT_TAG_END = ':END_PAYMENT_BREAKDOWN]';

/**
 * Serializes a PaymentBreakdown into a human-readable string with embedded JSON metadata.
 */
export function serializePaymentBreakdown(breakdown: PaymentBreakdown): string {
  const modeSummaries = breakdown.items.map((item) => {
    const formattedAmount = `₱${item.amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const issuedTag = item.isIssued && item.orNumber ? ` [Issued OR #${item.orNumber}]` : '';

    if (item.mode === 'Check') {
      const bankInfo = item.checkBank ? ` (${item.checkBank}` : '';
      const numInfo = item.checkNumber ? ` #${item.checkNumber}` : '';
      const dateInfo = item.checkDate ? `, ${item.checkDate}` : '';
      const closeParen = bankInfo || numInfo || dateInfo ? ')' : '';
      return `Check${bankInfo}${numInfo}${dateInfo}${closeParen}: ${formattedAmount}${issuedTag}`;
    }

    if (item.mode === 'Online') {
      const refInfo = item.referenceNumber ? ` (Ref: ${item.referenceNumber})` : '';
      return `Online${refInfo}: ${formattedAmount}${issuedTag}`;
    }

    return `Cash: ${formattedAmount}${issuedTag}`;
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

  return `${humanReadable}.${notesPart} ${BREAKDOWN_TAG_START}${jsonPayload}${EXPLICIT_TAG_END}`.trim();
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
    let jsonString: string | null = null;

    // Check for explicit end delimiter first
    const explicitEnd = remarks.indexOf(EXPLICIT_TAG_END, jsonStartIndex);
    if (explicitEnd !== -1) {
      jsonString = remarks.substring(jsonStartIndex, explicitEnd).trim();
    } else {
      // Find matching root JSON object by counting braces
      let braceCount = 0;
      let started = false;
      for (let i = jsonStartIndex; i < remarks.length; i++) {
        if (remarks[i] === '{') {
          braceCount++;
          started = true;
        } else if (remarks[i] === '}') {
          braceCount--;
          if (started && braceCount === 0) {
            jsonString = remarks.substring(jsonStartIndex, i + 1).trim();
            break;
          }
        }
      }

      // Fallback: look for last closing bracket in remarks
      if (!jsonString) {
        const lastBracket = remarks.lastIndexOf(']');
        if (lastBracket > jsonStartIndex) {
          jsonString = remarks.substring(jsonStartIndex, lastBracket).trim();
        }
      }
    }

    if (jsonString) {
      try {
        const parsed = JSON.parse(jsonString) as unknown;
        if (isValidPaymentBreakdown(parsed)) {
          return parsed;
        }
      } catch {
        // Fall back to text parsing below
      }
    }
  }

  // Fallback: extract combination amounts and modes from human-readable text if JSON was stripped
  const lower = remarks.toLowerCase();
  if (lower.includes('combination payment:')) {
    const items: PaymentBreakdownItem[] = [];
    const checkMatch = remarks.match(/Check(?:\s*\(([^#)]*?)(?:\s*#([^\s,)]+))?(?:,\s*([^\s)]+))?\))?:\s*₱?([0-9,.]+)/i);
    if (checkMatch) {
      const parsedAmt = parseFloat((checkMatch[4] ?? '0').replace(/,/g, ''));
      if (parsedAmt > 0) {
        items.push({
          id: 'text-check',
          mode: 'Check',
          amount: parsedAmt,
          checkBank: checkMatch[1]?.trim() || undefined,
          checkNumber: checkMatch[2]?.trim() || undefined,
          checkDate: checkMatch[3]?.trim() || undefined,
        });
      }
    }

    const cashMatch = remarks.match(/Cash:\s*₱?([0-9,.]+)/i);
    if (cashMatch) {
      const parsedAmt = parseFloat((cashMatch[1] ?? '0').replace(/,/g, ''));
      if (parsedAmt > 0) {
        items.push({
          id: 'text-cash',
          mode: 'Cash',
          amount: parsedAmt,
        });
      }
    }

    const onlineMatch = remarks.match(/Online(?:\s*\(Ref:\s*([^)]+)\))?:\s*₱?([0-9,.]+)/i);
    if (onlineMatch) {
      const parsedAmt = parseFloat((onlineMatch[2] ?? '0').replace(/,/g, ''));
      if (parsedAmt > 0) {
        items.push({
          id: 'text-online',
          mode: 'Online',
          amount: parsedAmt,
          referenceNumber: onlineMatch[1]?.trim() || undefined,
        });
      }
    }

    if (items.length > 0) {
      const totalAmount = items.reduce((sum, it) => sum + it.amount, 0);
      return {
        isCombination: true,
        totalAmount,
        items,
      };
    }
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
