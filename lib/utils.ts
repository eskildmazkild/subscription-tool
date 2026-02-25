import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SubscriptionStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateNormalizedMonthlyCost(
  cost: number,
  billingCycle: 'monthly' | 'yearly'
): number {
  if (billingCycle === 'yearly') {
    return parseFloat((cost / 12).toFixed(2));
  }
  return parseFloat(cost.toFixed(2));
}

/**
 * Format a date string (YYYY-MM-DD) to "DD MMM YYYY"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getStatusBadgeClasses(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'free_trial':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-500 border border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
}
