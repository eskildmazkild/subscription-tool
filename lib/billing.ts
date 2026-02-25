import type { BillingCycle } from './types';

/**
 * Calculates the normalized monthly cost for a subscription.
 * For yearly subscriptions: cost / 12
 * For monthly subscriptions: cost as-is
 * Result is rounded to 2 decimal places.
 */
export function normalizeToMonthly(cost: number, billingCycle: BillingCycle): number {
  if (billingCycle === 'yearly') {
    return Math.round((cost / 12) * 100) / 100;
  }
  return Math.round(cost * 100) / 100;
}

/**
 * Calculates the annualized yearly cost for a subscription.
 * For monthly subscriptions: cost * 12
 * For yearly subscriptions: cost as-is
 * Result is rounded to 2 decimal places.
 */
export function normalizeToYearly(cost: number, billingCycle: BillingCycle): number {
  if (billingCycle === 'monthly') {
    return Math.round((cost * 12) * 100) / 100;
  }
  return Math.round(cost * 100) / 100;
}

/**
 * Formats a cost as a Euro string with 2 decimal places.
 */
export function formatCost(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
