export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'free_trial' | 'cancelled';
export type SortBy = 'name' | 'monthlyCost' | 'startDate';
export type SortOrder = 'asc' | 'desc';

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

export interface StatusHistoryEntry {
  id: string;
  subscriptionId: string;
  fromStatus: string;
  toStatus: string;
  changedAt: string;
}

export interface SubscriptionDetail extends Subscription {
  statusHistory: StatusHistoryEntry[];
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
  data: Subscription[];
  total: number;
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

export interface FilterState {
  statuses: SubscriptionStatus[];
  categories: string[];
  sortBy: SortBy;
  sortOrder: SortOrder;
}
