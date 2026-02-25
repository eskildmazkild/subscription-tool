import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { CreateSubscriptionInput } from '@/lib/types';

const VALID_CATEGORIES = [
  'streaming',
  'music',
  'software',
  'gaming',
  'news',
  'fitness',
  'education',
  'productivity',
  'cloud',
  'other',
];

const VALID_BILLING_CYCLES = ['monthly', 'yearly'];
const VALID_STATUSES = ['active', 'free_trial', 'cancelled'];

function computeNormalizedMonthlyCost(cost: number, billingCycle: string): number {
  if (billingCycle === 'yearly') {
    return Math.round((cost / 12) * 100) / 100;
  }
  return Math.round(cost * 100) / 100;
}

function validateSubscriptionInput(body: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  // Name
  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.name = 'Name is required';
  }

  // Category
  if (!body.category || typeof body.category !== 'string') {
    errors.category = 'Category is required';
  } else if (!VALID_CATEGORIES.includes(body.category.toLowerCase())) {
    errors.category = `Category must be one of: ${VALID_CATEGORIES.join(', ')}`;
  }

  // Cost
  if (body.cost === undefined || body.cost === null || body.cost === '') {
    errors.cost = 'Cost is required';
  } else {
    const cost = Number(body.cost);
    if (isNaN(cost)) {
      errors.cost = 'Cost must be a number greater than 0';
    } else if (cost <= 0) {
      errors.cost = 'Cost must be a number greater than 0';
    }
  }

  // Billing cycle
  if (!body.billingCycle || typeof body.billingCycle !== 'string') {
    errors.billingCycle = 'Billing cycle is required';
  } else if (!VALID_BILLING_CYCLES.includes(body.billingCycle)) {
    errors.billingCycle = 'Billing cycle must be monthly or yearly';
  }

  // Start date
  if (!body.startDate || typeof body.startDate !== 'string' || body.startDate.trim() === '') {
    errors.startDate = 'Start date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) {
    errors.startDate = 'Start date must be in YYYY-MM-DD format';
  }

  // Status
  if (!body.status || typeof body.status !== 'string') {
    errors.status = 'Status is required';
  } else if (!VALID_STATUSES.includes(body.status)) {
    errors.status = 'Status must be active, free_trial, or cancelled';
  }

  // Conditional: free_trial requires trialEndDate
  if (body.status === 'free_trial') {
    if (!body.trialEndDate || typeof body.trialEndDate !== 'string' || body.trialEndDate.trim() === '') {
      errors.trialEndDate = 'Trial end date is required for Free Trial status';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(body.trialEndDate)) {
      errors.trialEndDate = 'Trial end date must be in YYYY-MM-DD format';
    } else if (
      body.startDate &&
      typeof body.startDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(body.startDate) &&
      body.trialEndDate < body.startDate
    ) {
      errors.trialEndDate = 'Trial end date must be on or after the start date';
    }
  }

  // Conditional: cancelled requires cancellationDate
  if (body.status === 'cancelled') {
    if (!body.cancellationDate || typeof body.cancellationDate !== 'string' || body.cancellationDate.trim() === '') {
      errors.cancellationDate = 'Cancellation date is required for Cancelled status';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(body.cancellationDate)) {
      errors.cancellationDate = 'Cancellation date must be in YYYY-MM-DD format';
    } else if (
      body.startDate &&
      typeof body.startDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(body.startDate) &&
      body.cancellationDate < body.startDate
    ) {
      errors.cancellationDate = 'Cancellation date must be on or after the start date';
    }
  }

  return errors;
}

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { errors: { _root: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    const validationErrors = validateSubscriptionInput(body);
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 422 });
    }

    const input = body as unknown as CreateSubscriptionInput;
    const cost = Math.round(Number(input.cost) * 100) / 100;
    const normalizedMonthlyCost = computeNormalizedMonthlyCost(cost, input.billingCycle);

    const subscription = await prisma.subscription.create({
      data: {
        name: input.name.trim(),
        category: input.category.toLowerCase(),
        cost,
        billingCycle: input.billingCycle,
        normalizedMonthlyCost,
        status: input.status,
        startDate: input.startDate,
        trialEndDate: input.status === 'free_trial' ? (input.trialEndDate ?? null) : null,
        cancellationDate: input.status === 'cancelled' ? (input.cancellationDate ?? null) : null,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
