import { COLORS } from "@edge/ui";

export function getStatusStyle(status: string): { bg: string; text: string } {
  const s = status.toLowerCase();
  if (s === "completed" || s === "approved") {
    return { bg: COLORS.brand[800], text: COLORS.neutral.white };
  }
  if (s === "for approval" || s === "evaluating") {
    return { bg: COLORS.semantic.warning, text: COLORS.neutral.white };
  }
  if (s === "for verification" || s === "submitted") {
    return { bg: COLORS.semantic.info, text: COLORS.neutral.white };
  }
  if (s === "returned" || s === "declined") {
    return { bg: COLORS.semantic.error, text: COLORS.neutral.white };
  }
  if (s === "in process") {
    return { bg: COLORS.brand.purple, text: COLORS.neutral.white };
  }
  return { bg: COLORS.neutral[200], text: COLORS.neutral[700] };
}

export function formatAmount(n: number): string {
  return `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
    if (num < 20) {
      const w = ones[num];
      return (w !== undefined ? w : "") + " ";
    }
    if (num < 100) {
      const t = tens[Math.floor(num / 10)];
      return (t !== undefined ? t : "") + " " + toWords(num % 10);
    }
    const h = ones[Math.floor(num / 100)];
    return (h !== undefined ? h : "") + " Hundred " + toWords(num % 100);
  };

  let result = "";
  if (intPart >= 1000) {
    result += toWords(Math.floor(intPart / 1000)) + "Thousand ";
  }
  result += toWords(intPart % 1000);
  return result.trim() + " Pesos Only";
}
