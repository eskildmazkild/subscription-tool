import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BillingCycle } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a cost to its monthly equivalent.
 * monthly → cost as-is
 * yearly  → cost / 12
 * Uses Math.round to avoid floating-point drift.
 */
export function normalizeToMonthly(cost: number, cycle: BillingCycle): number {
  if (cycle === 'yearly') {
    return Math.round((cost / 12) * 100) / 100;
  }
  return Math.round(cost * 100) / 100;
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
