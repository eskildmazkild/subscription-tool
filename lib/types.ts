export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'free_trial' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  category: string;
  cost: number;
  billingCycle: BillingCycle;
  normalizedMonthlyCost: number;
  status: SubscriptionStatus;
  startDate: string;
  trialEndDate: string | null;
  cancellationDate: string | null;
  lastActiveDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryGroup {
  category: string;
  subscriptions: Subscription[];
  totalMonthlyCost: number;
}

export interface GrandTotals {
  totalMonthly: number;
  totalYearly: number;
}

export interface ApiSubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface ApiErrorResponse {
  errors: Record<string, string>;
}

export interface CreateSubscriptionInput {
  name: string;
  category: string;
  cost: number;
  billingCycle: BillingCycle;
  startDate: string;
  status: SubscriptionStatus;
  trialEndDate?: string | null;
  cancellationDate?: string | null;
  lastActiveDate?: string | null;
}

export type UpdateSubscriptionInput = CreateSubscriptionInput;

export interface SubscriptionFormValues {
  name: string;
  category: string;
  cost: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: string;
  trialEndDate: string;
  cancellationDate: string;
  lastActiveDate: string;
}
