import { prisma } from './prisma';
import type { Subscription, CategoryGroup, GrandTotals } from './types';

function mapPrismaSubscription(sub: {
  id: number;
  name: string;
  category: string;
  cost: number;
  billingCycle: string;
  normalizedMonthlyCost: number;
  status: string;
  trialEndDate: string | null;
  cancellationDate: string | null;
  startDate: string;
  createdAt: Date;
  updatedAt: Date;
}): Subscription {
  return {
    id: sub.id,
    name: sub.name,
    category: sub.category,
    cost: sub.cost,
    billingCycle: sub.billingCycle as Subscription['billingCycle'],
    normalizedMonthlyCost: sub.normalizedMonthlyCost,
    status: sub.status as Subscription['status'],
    trialEndDate: sub.trialEndDate,
    cancellationDate: sub.cancellationDate,
    startDate: sub.startDate,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  };
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return subs.map(mapPrismaSubscription);
}

export async function getSubscriptionsByCategory(): Promise<CategoryGroup[]> {
  const subscriptions = await getAllSubscriptions();

  const grouped = subscriptions.reduce<Record<string, Subscription[]>>((acc, sub) => {
    if (!acc[sub.category]) {
      acc[sub.category] = [];
    }
    acc[sub.category].push(sub);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, subs]) => ({
    category,
    subscriptions: subs,
    totalMonthlyCost: subs.reduce((sum, s) => sum + s.normalizedMonthlyCost, 0),
  }));
}

export async function getGrandTotals(): Promise<GrandTotals> {
  const subscriptions = await getAllSubscriptions();
  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.normalizedMonthlyCost, 0);
  return {
    totalMonthly,
    totalYearly: totalMonthly * 12,
  };
}
