import { describe, it, expect } from 'vitest';
import {
  parseDelimitedTokens,
  extractOrNumbers,
  formatOrDisplay,
  STRING_LIST_DELIMITERS,
} from './orNumberUtils';

describe('orNumberUtils', () => {
  describe('parseDelimitedTokens', () => {
    it('should return an empty array for null or undefined input', () => {
      expect(parseDelimitedTokens(null)).toEqual([]);
      expect(parseDelimitedTokens(undefined)).toEqual([]);
    });

    it('should split comma and semicolon separated strings and trim whitespace', () => {
      const input = ' OR-1001 , OR-1002 ; OR-1003 ';
      expect(parseDelimitedTokens(input)).toEqual(['OR-1001', 'OR-1002', 'OR-1003']);
    });

    it('should discard empty tokens and trailing delimiters', () => {
      const input = 'OR-1001, , OR-1002,;';
      expect(parseDelimitedTokens(input)).toEqual(['OR-1001', 'OR-1002']);
    });

    it('should deduplicate case-insensitively while preserving original casing', () => {
      const input = ['OR-1001', 'or-1001', 'OR-2002'];
      expect(parseDelimitedTokens(input)).toEqual(['OR-1001', 'OR-2002']);
    });
  });

  describe('extractOrNumbers', () => {
    it('should handle multiple varied inputs seamlessly', () => {
      const result = extractOrNumbers(
        'OR-1001, OR-1002',
        null,
        ['OR-1003', 'OR-1001'],
        undefined,
        'OR-1004; OR-1002'
      );
      expect(result).toEqual(['OR-1001', 'OR-1002', 'OR-1003', 'OR-1004']);
    });

    it('should return empty list when all inputs are empty or null', () => {
      expect(extractOrNumbers('', null, undefined, [])).toEqual([]);
    });
  });

  describe('formatOrDisplay', () => {
    it('should format multiple inputs into a clean comma-separated string', () => {
      const formatted = formatOrDisplay('OR-999, ', 'OR-888', null);
      expect(formatted).toBe('OR-999, OR-888');
    });

    it('should return empty string when no valid OR numbers exist', () => {
      expect(formatOrDisplay(null, '', undefined)).toBe('');
    });
  });
});
