/**
 * Shared utilities and regex constants for parsing, cleaning, and formatting
 * Official Receipt (OR) numbers and delimited lists across web and mobile.
 */

/**
 * Standard delimiter pattern matching commas or semicolons with optional surrounding whitespace.
 */
export const STRING_LIST_DELIMITERS = /[,;]/;

/**
 * Splits a delimited string or list of strings by comma or semicolon,
 * trims whitespace from each token, removes empty tokens, and deduplicates
 * case-insensitively while preserving original casing.
 */
export function parseDelimitedTokens(
  input: string | string[] | null | undefined,
  delimiter: RegExp | string = STRING_LIST_DELIMITERS
): string[] {
  if (input === null || input === undefined) {
    return [];
  }

  const rawList: string[] = Array.isArray(input) ? input : [input];

  const tokens = rawList.flatMap((item) => {
    if (typeof item !== 'string') {
      return [];
    }
    return item.split(delimiter);
  });

  const cleaned = tokens
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const token of cleaned) {
    const lower = token.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(token);
    }
  }

  return result;
}

/**
 * Normalizes one or more OR number inputs (delimited strings or arrays)
 * into a clean, deduplicated list of valid OR numbers.
 */
export function extractOrNumbers(
  ...inputs: (string | string[] | null | undefined)[]
): string[] {
  const flattened: string[] = [];

  for (const input of inputs) {
    if (input === null || input === undefined) {
      continue;
    }
    if (Array.isArray(input)) {
      for (const item of input) {
        if (typeof item === 'string') {
          flattened.push(item);
        }
      }
    } else if (typeof input === 'string') {
      flattened.push(input);
    }
  }

  return parseDelimitedTokens(flattened);
}

/**
 * Joins a list of OR numbers into a clean comma-separated display string.
 * Automatically trims trailing delimiters and removes duplicates.
 */
export function formatOrDisplay(
  ...inputs: (string | string[] | null | undefined)[]
): string {
  return extractOrNumbers(...inputs).join(', ');
}
