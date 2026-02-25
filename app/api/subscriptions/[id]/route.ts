import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateNormalizedMonthlyCost } from '@/lib/utils';
import { subscriptionSchema } from '@/lib/subscriptionSchema';
import { isTransitionAllowed } from '@/lib/statusMachine';
import { SubscriptionStatus } from '@/lib/types';
import { ZodError } from 'zod';

type RouteParams = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
    });
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('GET /api/subscriptions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const existing = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const body = await request.json();

    const newStatus: SubscriptionStatus =
      body.status ?? (existing.status as SubscriptionStatus);
    const currentStatus = existing.status as SubscriptionStatus;

    // Check forbidden transition: Cancelled → Free Trial
    if (!isTransitionAllowed(currentStatus, newStatus)) {
      return NextResponse.json(
        {
          errors: {
            status:
              'A cancelled subscription cannot be moved back to Free Trial. Set it to Active first.',
          },
        },
        { status: 422 }
      );
    }

    // Parse and validate full payload
    const parseResult = subscriptionSchema.safeParse({
      name: body.name ?? existing.name,
      category: body.category ?? existing.category,
      cost:
        typeof body.cost === 'string'
          ? parseFloat(body.cost)
          : body.cost ?? existing.cost,
      billingCycle: body.billingCycle ?? existing.billingCycle,
      status: newStatus,
      startDate: body.startDate ?? existing.startDate,
      trialEndDate: body.trialEndDate ?? null,
      cancellationDate: body.cancellationDate ?? null,
      lastActiveDate: body.lastActiveDate ?? null,
    });

    if (!parseResult.success) {
      const errors = formatZodErrors(parseResult.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const data = parseResult.data;
    const normalizedMonthlyCost = calculateNormalizedMonthlyCost(data.cost, data.billingCycle);

    // Clear inapplicable date fields
    const trialEndDate = data.status === 'free_trial' ? (data.trialEndDate ?? null) : null;
    const cancellationDate = data.status === 'cancelled' ? (data.cancellationDate ?? null) : null;
    const lastActiveDate = data.status === 'cancelled' ? (data.lastActiveDate ?? null) : null;

    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        name: data.name,
        category: data.category,
        cost: data.cost,
        billingCycle: data.billingCycle,
        normalizedMonthlyCost,
        status: data.status,
        startDate: data.startDate,
        trialEndDate,
        cancellationDate,
        lastActiveDate,
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('PATCH /api/subscriptions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.subscription.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/subscriptions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}

function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
