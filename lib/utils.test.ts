import { describe, it, expect } from 'vitest';
import { calculateNormalizedMonthlyCost, formatDate, getStatusBadgeClasses } from './utils';
import { computeGrandTotals, groupByCategory } from './queries';
import type { Subscription } from './types';

describe('calculateNormalizedMonthlyCost', () => {
  it('returns cost as-is for monthly billing', () => {
    expect(calculateNormalizedMonthlyCost(9.99, 'monthly')).toBe(9.99);
  });

  it('divides yearly cost by 12', () => {
    expect(calculateNormalizedMonthlyCost(120, 'yearly')).toBe(10);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateNormalizedMonthlyCost(10, 'yearly')).toBe(0.83);
  });
});

describe('formatDate', () => {
  it('formats a date string to DD MMM YYYY', () => {
    const result = formatDate('2025-08-15');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/Aug/);
    expect(result).toMatch(/2025/);
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });
});

describe('getStatusBadgeClasses', () => {
  it('returns green classes for active', () => {
    expect(getStatusBadgeClasses('active')).toContain('green');
  });

  it('returns amber classes for free_trial', () => {
    expect(getStatusBadgeClasses('free_trial')).toContain('amber');
  });

  it('returns gray classes for cancelled', () => {
    expect(getStatusBadgeClasses('cancelled')).toContain('gray');
  });
});

const makeSubscription = (overrides: Partial<Subscription>): Subscription => ({
  id: 'test-id',
  name: 'Test',
  category: 'Entertainment',
  cost: 10,
  billingCycle: 'monthly',
  normalizedMonthlyCost: 10,
  status: 'active',
  startDate: '2025-01-01',
  trialEndDate: null,
  cancellationDate: null,
  lastActiveDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('computeGrandTotals', () => {
  it('includes active and free_trial subscriptions', () => {
    const subs = [
      makeSubscription({ normalizedMonthlyCost: 10, status: 'active' }),
      makeSubscription({ normalizedMonthlyCost: 20, status: 'free_trial' }),
    ];
    const totals = computeGrandTotals(subs);
    expect(totals.totalMonthly).toBe(30);
    expect(totals.totalYearly).toBe(360);
  });

  it('excludes cancelled subscriptions (AC-7)', () => {
    const subs = [
      makeSubscription({ normalizedMonthlyCost: 10, status: 'active' }),
      makeSubscription({ normalizedMonthlyCost: 20, status: 'free_trial' }),
      makeSubscription({ normalizedMonthlyCost: 15, status: 'cancelled' }),
    ];
    const totals = computeGrandTotals(subs);
    expect(totals.totalMonthly).toBe(30);
    expect(totals.totalYearly).toBe(360);
  });

  it('returns zero totals for empty list', () => {
    const totals = computeGrandTotals([]);
    expect(totals.totalMonthly).toBe(0);
    expect(totals.totalYearly).toBe(0);
  });

  it('returns zero when all subscriptions are cancelled', () => {
    const subs = [
      makeSubscription({ normalizedMonthlyCost: 15, status: 'cancelled' }),
      makeSubscription({ normalizedMonthlyCost: 5, status: 'cancelled' }),
    ];
    const totals = computeGrandTotals(subs);
    expect(totals.totalMonthly).toBe(0);
    expect(totals.totalYearly).toBe(0);
  });
});

describe('groupByCategory', () => {
  it('excludes cancelled subscriptions from category totals', () => {
    const subs = [
      makeSubscription({ id: '1', category: 'Entertainment', normalizedMonthlyCost: 10, status: 'active' }),
      makeSubscription({ id: '2', category: 'Entertainment', normalizedMonthlyCost: 15, status: 'cancelled' }),
    ];
    const groups = groupByCategory(subs);
    const entertainment = groups.find((g) => g.category === 'Entertainment');
    expect(entertainment?.totalMonthlyCost).toBe(10);
  });

  it('includes free_trial subscriptions in category totals', () => {
    const subs = [
      makeSubscription({ id: '1', category: 'Music', normalizedMonthlyCost: 8, status: 'free_trial' }),
    ];
    const groups = groupByCategory(subs);
    const music = groups.find((g) => g.category === 'Music');
    expect(music?.totalMonthlyCost).toBe(8);
  });
});
