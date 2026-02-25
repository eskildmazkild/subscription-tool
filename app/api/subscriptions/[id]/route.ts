import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeToMonthly } from '@/lib/billing';
import type { BillingCycle } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  const result = {
    ...subscription,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
    statusHistory: subscription.statusHistory.map((entry) => ({
      ...entry,
      changedAt: entry.changedAt.toISOString(),
    })),
  };

  return NextResponse.json(result);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const body = await req.json() as {
    name?: string;
    category?: string;
    cost?: number;
    billingCycle?: BillingCycle;
    startDate?: string;
    status?: string;
    trialEndDate?: string | null;
    cancellationDate?: string | null;
    lastActiveDate?: string | null;
  };

  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  const oldStatus = existing.status;
  const newStatus = body.status ?? existing.status;

  const cost = body.cost ?? existing.cost;
  const billingCycle = (body.billingCycle ?? existing.billingCycle) as BillingCycle;
  const normalizedMonthlyCost = normalizeToMonthly(cost, billingCycle);

  const updated = await prisma.subscription.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      category: body.category ?? existing.category,
      cost,
      billingCycle,
      normalizedMonthlyCost,
      status: newStatus,
      startDate: body.startDate ?? existing.startDate,
      trialEndDate: body.trialEndDate !== undefined ? body.trialEndDate : existing.trialEndDate,
      cancellationDate: body.cancellationDate !== undefined ? body.cancellationDate : existing.cancellationDate,
      lastActiveDate: body.lastActiveDate !== undefined ? body.lastActiveDate : existing.lastActiveDate,
    },
    include: {
      statusHistory: {
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  if (oldStatus !== newStatus) {
    await prisma.statusHistory.create({
      data: {
        subscriptionId: id,
        fromStatus: oldStatus,
        toStatus: newStatus,
      },
    });
  }

  const result = {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    statusHistory: updated.statusHistory.map((entry) => ({
      ...entry,
      changedAt: entry.changedAt.toISOString(),
    })),
  };

  return NextResponse.json(result);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  await prisma.subscription.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
