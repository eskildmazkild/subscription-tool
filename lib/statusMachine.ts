import { SubscriptionStatus } from './types';

// Single source of truth for allowed status transitions
export const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  active: ['free_trial', 'cancelled'],
  free_trial: ['active', 'cancelled'],
  cancelled: ['active'],
};

export function isTransitionAllowed(
  from: SubscriptionStatus,
  to: SubscriptionStatus
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  free_trial: 'Free Trial',
  cancelled: 'Cancelled',
};

export const STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'free_trial', label: 'Free Trial' },
  { value: 'cancelled', label: 'Cancelled' },
];
