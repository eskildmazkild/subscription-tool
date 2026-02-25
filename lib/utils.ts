import type { Subscription, CategoryGroup, GrandTotals } from './types';

export const CURRENCY_SYMBOL = '£';

/**
 * Normalizes a subscription cost to its monthly equivalent.
 * Yearly costs are divided by 12, rounded to 2 decimal places.
 */
export function calcMonthlyCostEquivalent(cost: number, billingCycle: 'monthly' | 'yearly'): number {
  if (billingCycle === 'yearly') {
    return Math.round((cost / 12) * 100) / 100;
  }
  return Math.round(cost * 100) / 100;
}

/**
 * Returns only non-cancelled subscriptions (active + trial).
 */
export function filterNonCancelled(subscriptions: Subscription[]): Subscription[] {
  return subscriptions.filter((s) => s.status !== 'cancelled');
}

/**
 * Sums the monthly cost equivalents for an array of subscriptions.
 */
export function sumMonthlyCosts(subscriptions: Subscription[]): number {
  const total = subscriptions.reduce((acc, s) => acc + s.monthlyCostEquivalent, 0);
  return Math.round(total * 100) / 100;
}

/**
 * Groups subscriptions by category, each group containing non-cancelled subscriptions.
 * Cancelled subscriptions are still shown in their category but excluded from totals.
 */
export function groupByCategory(subscriptions: Subscription[]): CategoryGroup[] {
  const map = new Map<string, Subscription[]>();

  for (const sub of subscriptions) {
    const existing = map.get(sub.category);
    if (existing) {
      existing.push(sub);
    } else {
      map.set(sub.category, [sub]);
    }
  }

  const groups: CategoryGroup[] = [];
  map.forEach((subs, category) => {
    const nonCancelled = filterNonCancelled(subs);
    groups.push({
      category,
      subscriptions: subs,
      totalMonthlyCost: sumMonthlyCosts(nonCancelled),
    });
  });

  return groups.sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Calculates grand totals from all non-cancelled subscriptions.
 */
export function calcGrandTotals(subscriptions: Subscription[]): GrandTotals {
  const nonCancelled = filterNonCancelled(subscriptions);
  const totalMonthly = sumMonthlyCosts(nonCancelled);
  const totalYearly = Math.round(totalMonthly * 12 * 100) / 100;
  return { totalMonthly, totalYearly };
}

/**
 * Formats a number as a currency string with the configured symbol.
 */
export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}
