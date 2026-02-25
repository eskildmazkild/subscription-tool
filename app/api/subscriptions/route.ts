import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subscriptionSchema } from '@/lib/subscriptionSchema';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse multi-value filter params
    const statusParams = searchParams.getAll('status');
    const categoryParams = searchParams.getAll('category');
    const sortBy = searchParams.get('sortBy') ?? 'name';
    const sortOrder = (searchParams.get('sortOrder') ?? 'asc') as 'asc' | 'desc';

    // Build where clause
    const where: Prisma.SubscriptionWhereInput = {};

    if (statusParams.length > 0) {
      where.status = { in: statusParams };
    }

    if (categoryParams.length > 0) {
      where.category = { in: categoryParams };
    }

    // Build order by
    let orderBy: Prisma.SubscriptionOrderByWithRelationInput | Prisma.SubscriptionOrderByWithRelationInput[];

    if (sortBy === 'monthlyCost') {
      orderBy = [
        { normalizedMonthlyCost: sortOrder },
        { name: 'asc' },
      ];
    } else if (sortBy === 'startDate') {
      orderBy = [
        { startDate: sortOrder },
        { name: 'asc' },
      ];
    } else {
      // default: name
      orderBy = { name: sortOrder };
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy,
    });

    return NextResponse.json({ data: subscriptions, total: subscriptions.length });
  } catch (error) {
    console.error('GET /api/subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = subscriptionSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        errors[key] = issue.message;
      }
      return NextResponse.json({ errors }, { status: 422 });
    }

    const data = parsed.data;
    const normalizedMonthlyCost =
      data.billingCycle === 'yearly' ? data.cost / 12 : data.cost;

    const subscription = await prisma.subscription.create({
      data: {
        name: data.name,
        category: data.category,
        cost: data.cost,
        billingCycle: data.billingCycle,
        normalizedMonthlyCost,
        status: data.status,
        startDate: data.startDate,
        trialEndDate: data.trialEndDate ?? null,
        cancellationDate: data.cancellationDate ?? null,
        lastActiveDate: data.lastActiveDate ?? null,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('POST /api/subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
