import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateNormalizedMonthlyCost } from '@/lib/utils';
import { subscriptionSchema } from '@/lib/subscriptionSchema';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('GET /api/subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse and validate
    const parseResult = subscriptionSchema.safeParse({
      ...body,
      cost: typeof body.cost === 'string' ? parseFloat(body.cost) : body.cost,
    });

    if (!parseResult.success) {
      const errors = formatZodErrors(parseResult.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const data = parseResult.data;
    const normalizedMonthlyCost = calculateNormalizedMonthlyCost(data.cost, data.billingCycle);

    // Clear inapplicable date fields based on status
    const trialEndDate = data.status === 'free_trial' ? (data.trialEndDate ?? null) : null;
    const cancellationDate = data.status === 'cancelled' ? (data.cancellationDate ?? null) : null;
    const lastActiveDate = data.status === 'cancelled' ? (data.lastActiveDate ?? null) : null;

    const subscription = await prisma.subscription.create({
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

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('POST /api/subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
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
