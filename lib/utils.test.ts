import { describe, it, expect } from 'vitest';
import {
  calcMonthlyCostEquivalent,
  filterNonCancelled,
  sumMonthlyCosts,
  groupByCategory,
  calcGrandTotals,
  formatCurrency,
} from './utils';
import type { Subscription } from './types';

const makeSubscription = (overrides: Partial<Subscription> & { id: number; name: string }): Subscription => ({
  id: overrides.id,
  name: overrides.name,
  category: overrides.category ?? 'General',
  cost: overrides.cost ?? 10,
  billingCycle: overrides.billingCycle ?? 'monthly',
  status: overrides.status ?? 'active',
  trialEndDate: overrides.trialEndDate ?? null,
  cancellationDate: overrides.cancellationDate ?? null,
  startDate: overrides.startDate ?? '2024-01-01',
  monthlyCostEquivalent: overrides.monthlyCostEquivalent ?? overrides.cost ?? 10,
});

describe('calcMonthlyCostEquivalent', () => {
  it('returns the same cost for monthly billing', () => {
    expect(calcMonthlyCostEquivalent(20, 'monthly')).toBe(20);
  });

  it('divides by 12 for yearly billing', () => {
    expect(calcMonthlyCostEquivalent(120, 'yearly')).toBe(10);
  });

  it('rounds to 2 decimal places for yearly billing', () => {
    expect(calcMonthlyCostEquivalent(100, 'yearly')).toBe(8.33);
  });

  it('handles zero cost', () => {
    expect(calcMonthlyCostEquivalent(0, 'monthly')).toBe(0);
    expect(calcMonthlyCostEquivalent(0, 'yearly')).toBe(0);
  });
});

describe('filterNonCancelled', () => {
  it('excludes cancelled subscriptions', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'A', status: 'active', monthlyCostEquivalent: 10 }),
      makeSubscription({ id: 2, name: 'B', status: 'cancelled', monthlyCostEquivalent: 15 }),
      makeSubscription({ id: 3, name: 'C', status: 'trial', monthlyCostEquivalent: 5 }),
    ];
    const result = filterNonCancelled(subs);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toEqual([1, 3]);
  });

  it('returns empty array if all cancelled', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'A', status: 'cancelled', monthlyCostEquivalent: 10 }),
    ];
    expect(filterNonCancelled(subs)).toHaveLength(0);
  });
});

describe('sumMonthlyCosts', () => {
  it('sums monthlyCostEquivalent values', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'A', monthlyCostEquivalent: 10 }),
      makeSubscription({ id: 2, name: 'B', monthlyCostEquivalent: 20 }),
      makeSubscription({ id: 3, name: 'C', monthlyCostEquivalent: 10 }),
    ];
    expect(sumMonthlyCosts(subs)).toBe(40);
  });

  it('returns 0 for empty array', () => {
    expect(sumMonthlyCosts([])).toBe(0);
  });

  it('excludes cancelled subscriptions when filtering first', () => {
    const active = makeSubscription({ id: 1, name: 'A', status: 'active', monthlyCostEquivalent: 20 });
    const cancelled = makeSubscription({ id: 2, name: 'B', status: 'cancelled', monthlyCostEquivalent: 15 });
    const result = sumMonthlyCosts(filterNonCancelled([active, cancelled]));
    expect(result).toBe(20);
  });
});

describe('groupByCategory', () => {
  it('groups subscriptions by category', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'Netflix', category: 'Streaming', monthlyCostEquivalent: 10 }),
      makeSubscription({ id: 2, name: 'Spotify', category: 'Streaming', monthlyCostEquivalent: 10 }),
      makeSubscription({ id: 3, name: 'Gym', category: 'Fitness', monthlyCostEquivalent: 30 }),
    ];
    const groups = groupByCategory(subs);
    expect(groups).toHaveLength(2);
    const streaming = groups.find((g) => g.category === 'Streaming');
    expect(streaming?.subscriptions).toHaveLength(2);
    expect(streaming?.totalMonthlyCost).toBe(20);
    const fitness = groups.find((g) => g.category === 'Fitness');
    expect(fitness?.totalMonthlyCost).toBe(30);
  });

  it('excludes cancelled subscriptions from category totals', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'Active', category: 'Software', status: 'active', monthlyCostEquivalent: 20 }),
      makeSubscription({ id: 2, name: 'Cancelled', category: 'Software', status: 'cancelled', monthlyCostEquivalent: 15 }),
    ];
    const groups = groupByCategory(subs);
    expect(groups).toHaveLength(1);
    expect(groups[0].totalMonthlyCost).toBe(20);
    // Both subscriptions should still appear in the group
    expect(groups[0].subscriptions).toHaveLength(2);
  });

  it('sorts groups alphabetically by category', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'Z', category: 'Zebra', monthlyCostEquivalent: 5 }),
      makeSubscription({ id: 2, name: 'A', category: 'Apple', monthlyCostEquivalent: 5 }),
    ];
    const groups = groupByCategory(subs);
    expect(groups[0].category).toBe('Apple');
    expect(groups[1].category).toBe('Zebra');
  });
});

describe('calcGrandTotals', () => {
  it('calculates total monthly and yearly from non-cancelled subscriptions', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'A', status: 'active', monthlyCostEquivalent: 10 }),
      makeSubscription({ id: 2, name: 'B', status: 'active', monthlyCostEquivalent: 20 }),
      makeSubscription({ id: 3, name: 'C', status: 'active', monthlyCostEquivalent: 10 }),
      makeSubscription({ id: 4, name: 'D', status: 'cancelled', monthlyCostEquivalent: 15 }),
    ];
    const totals = calcGrandTotals(subs);
    expect(totals.totalMonthly).toBe(40);
    expect(totals.totalYearly).toBe(480);
  });

  it('includes trial subscriptions in totals', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'A', status: 'active', monthlyCostEquivalent: 10 }),
      makeSubscription({ id: 2, name: 'B', status: 'trial', monthlyCostEquivalent: 15 }),
    ];
    const totals = calcGrandTotals(subs);
    expect(totals.totalMonthly).toBe(25);
    expect(totals.totalYearly).toBe(300);
  });

  it('returns zeros for empty array', () => {
    const totals = calcGrandTotals([]);
    expect(totals.totalMonthly).toBe(0);
    expect(totals.totalYearly).toBe(0);
  });

  it('returns zeros when all subscriptions are cancelled', () => {
    const subs: Subscription[] = [
      makeSubscription({ id: 1, name: 'A', status: 'cancelled', monthlyCostEquivalent: 20 }),
    ];
    const totals = calcGrandTotals(subs);
    expect(totals.totalMonthly).toBe(0);
    expect(totals.totalYearly).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('formats with £ symbol and 2 decimal places', () => {
    expect(formatCurrency(40)).toBe('£40.00');
    expect(formatCurrency(10.5)).toBe('£10.50');
    expect(formatCurrency(0)).toBe('£0.00');
  });
});
