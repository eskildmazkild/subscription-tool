export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'trial' | 'cancelled';

export interface Subscription {
  id: number;
  name: string;
  category: string;
  cost: number;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  trialEndDate: string | null;
  cancellationDate: string | null;
  startDate: string;
  monthlyCostEquivalent: number;
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
