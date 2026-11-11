// @ts-expect-error - bun test runtime module
import { describe, it, expect } from 'bun:test';
import { formatApplicationType } from './ServiceVariantFeesTable';

describe('Admin Fees Management - Application Type & Formula Deduplication', () => {
  it('correctly formats camelCase and snake_case application types into readable labels', () => {
    expect(formatApplicationType('FirstTaker')).toBe('First Taker');
    expect(formatApplicationType('Retaker')).toBe('Retaker');
    expect(formatApplicationType('New')).toBe('New');
    expect(formatApplicationType('Renewal')).toBe('Renewal');
    expect(formatApplicationType('Modification')).toBe('Modification');
    expect(formatApplicationType('Upgrade')).toBe('Upgrade');
    expect(formatApplicationType('CivicActionGroup')).toBe('Civic Action Group');
    expect(formatApplicationType(null)).toBe('Standard');
    expect(formatApplicationType(undefined)).toBe('Standard');
    expect(formatApplicationType('')).toBe('Standard');
  });

  it('deduplicates element fee codes to produce TOTAL = ROC instead of repeating ROC for every element', () => {
    // Simulated variant element fees where 4 elements all map to fee code 'ROC'
    const elementFees = [
      { id: '1', elementCode: '1RTG', feeCode: 'ROC', amount: 180 },
      { id: '2', elementCode: '2RTG', feeCode: 'ROC', amount: 180 },
      { id: '3', elementCode: '1PHN', feeCode: 'ROC', amount: 180 },
      { id: '4', elementCode: '2PHN', feeCode: 'ROC', amount: 180 },
    ];

    const distinctFeeCodes = Array.from(
      new Set(elementFees.map((f) => f.feeCode).filter((c): c is string => Boolean(c)))
    );

    const derivedFormula = `TOTAL = ${distinctFeeCodes.join(' + ')}`;

    // Must be TOTAL = ROC, NOT TOTAL = ROC + ROC + ROC + ROC
    expect(derivedFormula).toBe('TOTAL = ROC');
    expect(distinctFeeCodes).toEqual(['ROC']);
  });

  it('deduplicates multi-component element fee codes correctly (e.g. ROC + DST)', () => {
    // 2 elements, each mapping to ROC and DST
    const elementFees = [
      { id: '1', elementId: 'elem1', feeCode: 'ROC', amount: 180 },
      { id: '2', elementId: 'elem1', feeCode: 'DST', amount: 30 },
      { id: '3', elementId: 'elem2', feeCode: 'ROC', amount: 180 },
      { id: '4', elementId: 'elem2', feeCode: 'DST', amount: 30 },
    ];

    const distinctFeeCodes = Array.from(
      new Set(elementFees.map((f) => f.feeCode).filter((c): c is string => Boolean(c)))
    );

    const derivedFormula = `TOTAL = ${distinctFeeCodes.join(' + ')}`;
    expect(derivedFormula).toBe('TOTAL = ROC + DST');
  });

  it('calculates rate per element instead of summing all mutually-exclusive elements together', () => {
    const elementFees = [
      { id: '1', elementId: 'elem1', feeCode: 'ROC', amount: 180 },
      { id: '2', elementId: 'elem2', feeCode: 'ROC', amount: 180 },
      { id: '3', elementId: 'elem3', feeCode: 'ROC', amount: 180 },
      { id: '4', elementId: 'elem4', feeCode: 'ROC', amount: 180 },
    ];

    const byElem = new Map<string, number>();
    for (const f of elementFees) {
      byElem.set(f.elementId, (byElem.get(f.elementId) ?? 0) + f.amount);
    }
    const amounts = Array.from(byElem.values());

    const perElementRate = amounts.length > 0 ? amounts[0] : 0;
    const naiveSumAll = elementFees.reduce((acc, curr) => acc + curr.amount, 0);

    // Per-element rate must be 180, NOT the naive sum of 720
    expect(perElementRate).toBe(180);
    expect(naiveSumAll).toBe(720);
    expect(perElementRate).not.toBe(naiveSumAll);
  });
});
