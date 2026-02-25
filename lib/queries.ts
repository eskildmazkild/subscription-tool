import { prisma } from './prisma';
import { calcMonthlyCostEquivalent } from './utils';
import type { Subscription, BillingCycle, SubscriptionStatus } from './types';

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const rows = await prisma.subscription.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    cost: row.cost,
    billingCycle: row.billingCycle as BillingCycle,
    status: row.status as SubscriptionStatus,
    trialEndDate: row.trialEndDate,
    cancellationDate: row.cancellationDate,
    startDate: row.startDate,
    monthlyCostEquivalent: calcMonthlyCostEquivalent(row.cost, row.billingCycle as BillingCycle),
  }));
}
