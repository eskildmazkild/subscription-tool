import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeToMonthly } from '@/lib/utils';
import { BillingCycle, SubscriptionStatus } from '@/lib/types';

const VALID_BILLING_CYCLES: BillingCycle[] = ['monthly', 'yearly'];
const VALID_STATUSES: SubscriptionStatus[] = ['active', 'free_trial', 'cancelled'];

function validateSubscriptionPayload(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!body.category || typeof body.category !== 'string' || body.category.trim() === '') {
    errors.category = 'Category is required';
  }

  const cost = Number(body.cost);
  if (body.cost === undefined || body.cost === null || body.cost === '') {
    errors.cost = 'Cost is required';
  } else if (isNaN(cost) || cost < 0) {
    errors.cost = 'Cost must be a positive number';
  } else if (!/^\d+(\.\d{1,2})?$/.test(String(body.cost))) {
    errors.cost = 'Cost must have at most 2 decimal places';
  }

  if (!body.billingCycle || !VALID_BILLING_CYCLES.includes(body.billingCycle as BillingCycle)) {
    errors.billingCycle = 'Billing cycle must be monthly or yearly';
  }

  if (!body.status || !VALID_STATUSES.includes(body.status as SubscriptionStatus)) {
    errors.status = 'Status must be active, free_trial, or cancelled';
  }

  if (!body.startDate || typeof body.startDate !== 'string' || body.startDate.trim() === '') {
    errors.startDate = 'Start date is required';
  } else if (isNaN(Date.parse(body.startDate as string))) {
    errors.startDate = 'Start date must be a valid date';
  }

  // Cross-field date validation
  if (!errors.startDate) {
    const startDate = new Date(body.startDate as string);

    if (body.cancellationDate && typeof body.cancellationDate === 'string' && body.cancellationDate.trim() !== '') {
      if (isNaN(Date.parse(body.cancellationDate))) {
        errors.cancellationDate = 'Cancellation date must be a valid date';
      } else if (new Date(body.cancellationDate) < startDate) {
        errors.cancellationDate = 'Cancellation date must not precede start date';
      }
    }

    if (body.trialEndDate && typeof body.trialEndDate === 'string' && body.trialEndDate.trim() !== '') {
      if (isNaN(Date.parse(body.trialEndDate))) {
        errors.trialEndDate = 'Trial end date must be a valid date';
      } else if (new Date(body.trialEndDate) < startDate) {
        errors.trialEndDate = 'Trial end date must not precede start date';
      }
    }

    if (body.lastActiveDate && typeof body.lastActiveDate === 'string' && body.lastActiveDate.trim() !== '') {
      if (isNaN(Date.parse(body.lastActiveDate))) {
        errors.lastActiveDate = 'Last active date must be a valid date';
      } else if (new Date(body.lastActiveDate) < startDate) {
        errors.lastActiveDate = 'Last active date must not precede start date';
      }
    }
  }

  return errors;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check subscription exists
    const existing = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const errors = validateSubscriptionPayload(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const cost = Number(body.cost);
    const billingCycle = body.billingCycle as BillingCycle;
    const normalizedMonthlyCost = normalizeToMonthly(cost, billingCycle);

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        name: (body.name as string).trim(),
        category: (body.category as string).trim(),
        cost,
        billingCycle,
        normalizedMonthlyCost,
        status: body.status as string,
        startDate: body.startDate as string,
        trialEndDate: (body.trialEndDate as string | null | undefined) || null,
        cancellationDate: (body.cancellationDate as string | null | undefined) || null,
        lastActiveDate: (body.lastActiveDate as string | null | undefined) || null,
      },
    });

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    await prisma.subscription.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}
