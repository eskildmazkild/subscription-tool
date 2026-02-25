import { describe, it, expect } from 'vitest';
import { normalizeToMonthly } from './utils';

describe('normalizeToMonthly', () => {
  it('returns cost as-is for monthly billing', () => {
    expect(normalizeToMonthly(10, 'monthly')).toBe(10);
  });

  it('divides cost by 12 for yearly billing', () => {
    expect(normalizeToMonthly(120, 'yearly')).toBe(10);
  });

  it('rounds to avoid floating-point drift', () => {
    expect(normalizeToMonthly(100, 'yearly')).toBe(8.33);
  });

  it('handles zero cost', () => {
    expect(normalizeToMonthly(0, 'monthly')).toBe(0);
    expect(normalizeToMonthly(0, 'yearly')).toBe(0);
  });

  it('handles decimal monthly cost', () => {
    expect(normalizeToMonthly(15.99, 'monthly')).toBe(15.99);
  });

  it('handles yearly cost that does not divide evenly', () => {
    // 10 / 12 = 0.8333... → rounds to 0.83
    expect(normalizeToMonthly(10, 'yearly')).toBe(0.83);
  });
});
