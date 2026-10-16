import { COLORS } from "@edge/ui";

export function getStatusStyle(status: string): { bg: string; text: string } {
  const s = status.toLowerCase();
  if (s === "completed" || s === "approved")
    return { bg: COLORS.brand[800], text: COLORS.neutral.white };
  if (s === "for approval")
    return { bg: COLORS.semantic.warning, text: COLORS.neutral.white };
  if (s === "for verification")
    return { bg: COLORS.semantic.info, text: COLORS.neutral.white };
  if (s === "returned") return { bg: COLORS.semantic.error, text: COLORS.neutral.white };
  if (s === "declined") return { bg: COLORS.semantic.error, text: COLORS.neutral.white };
  if (s === "in process") return { bg: COLORS.brand.purple, text: COLORS.neutral.white };
  return { bg: COLORS.neutral[200], text: COLORS.neutral[700] };
}

export function formatAmount(n: number): string {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function amountToWords(n: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const intPart = Math.floor(n);
  if (intPart === 0) return "Zero Pesos Only";

  const toWords = (num: number): string => {
    if (num === 0) return "";
    const oneVal = ones[num];
    if (num < 20) return (oneVal !== undefined ? oneVal : "") + " ";
    const tenVal = tens[Math.floor(num / 10)];
    if (num < 100)
      return (tenVal !== undefined ? tenVal : "") + " " + toWords(num % 10);
    const hundredVal = ones[Math.floor(num / 100)];
    return (
      (hundredVal !== undefined ? hundredVal : "") + " Hundred " + toWords(num % 100)
    );
  };

  let result = "";
  if (intPart >= 1000) {
    result += toWords(Math.floor(intPart / 1000)) + "Thousand ";
  }
  result += toWords(intPart % 1000);
  return result.trim() + " Pesos Only";
}

export function formatDisplayDueDate(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim().length === 0) return '30 days from issuance';
  try {
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const d = new Date(Date.UTC(year, month, day));
        return d.toLocaleDateString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function formatDisplayDateTime(dateStr?: string | null): string {
  if (dateStr === null || dateStr === undefined || dateStr.trim().length === 0) return '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}
