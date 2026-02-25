import { prisma } from './prisma';
import { CategoryGroup, GrandTotals, Subscription } from './types';

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const rows = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    ...r,
    billingCycle: r.billingCycle as 'monthly' | 'yearly',
    status: r.status as 'active' | 'free_trial' | 'cancelled',
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const r = await prisma.subscription.findUnique({ where: { id } });
  if (!r) return null;
  return {
    ...r,
    billingCycle: r.billingCycle as 'monthly' | 'yearly',
    status: r.status as 'active' | 'free_trial' | 'cancelled',
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * Groups subscriptions by category and computes totals.
 * Cancelled subscriptions are excluded from cost totals (AC-7).
 */
export function groupByCategory(subscriptions: Subscription[]): CategoryGroup[] {
  const map = new Map<string, Subscription[]>();

  for (const sub of subscriptions) {
    const existing = map.get(sub.category) ?? [];
    existing.push(sub);
    map.set(sub.category, existing);
  }

  return Array.from(map.entries()).map(([category, subs]) => ({
    category,
    subscriptions: subs,
    totalMonthlyCost: subs
      .filter((s) => s.status !== 'cancelled')
      .reduce((sum, s) => sum + s.normalizedMonthlyCost, 0),
  }));
}

/**
 * Computes grand totals excluding cancelled subscriptions (AC-7).
 */
export function computeGrandTotals(subscriptions: Subscription[]): GrandTotals {
  const activeSubscriptions = subscriptions.filter((s) => s.status !== 'cancelled');
  const totalMonthly = activeSubscriptions.reduce(
    (sum, s) => sum + s.normalizedMonthlyCost,
    0
  );
  return {
    totalMonthly: parseFloat(totalMonthly.toFixed(2)),
    totalYearly: parseFloat((totalMonthly * 12).toFixed(2)),
  };
}
