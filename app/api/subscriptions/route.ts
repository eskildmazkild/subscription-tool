import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeToMonthly } from '@/lib/billing';
import type { BillingCycle } from '@/lib/types';

export async function GET() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ subscriptions });
}

export async function POST(req: NextRequest) {
  const data = await req.json() as {
    name: string;
    category: string;
    cost: number;
    billingCycle: BillingCycle;
    startDate: string;
    status: string;
    trialEndDate?: string | null;
    cancellationDate?: string | null;
    lastActiveDate?: string | null;
  };

  const normalizedMonthlyCost = normalizeToMonthly(data.cost, data.billingCycle);

  const subscription = await prisma.subscription.create({
    data: {
      name: data.name,
      category: data.category,
      cost: data.cost,
      billingCycle: data.billingCycle,
      normalizedMonthlyCost,
      status: data.status,
      startDate: data.startDate ?? '',
      trialEndDate: data.trialEndDate ?? null,
      cancellationDate: data.cancellationDate ?? null,
      lastActiveDate: data.lastActiveDate ?? null,
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}
