import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subscriptionSchema } from '@/lib/subscriptionSchema';
import Decimal from 'decimal.js';

function normalizeMonthly(cost: number, billingCycle: string): number {
  if (billingCycle === 'yearly') {
    return new Decimal(cost).div(12).toDecimalPlaces(2).toNumber();
  }
  return new Decimal(cost).toDecimalPlaces(2).toNumber();
}

export async function GET(
  _req: NextRequest,
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
    console.error('GET /api/subscriptions/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: unknown = await req.json();
    const parsed = subscriptionSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        errors[key] = issue.message;
      }
      return NextResponse.json({ errors }, { status: 422 });
    }

    const existing = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const data = parsed.data;
    const normalizedMonthlyCost = normalizeMonthly(data.cost, data.billingCycle);

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        name: data.name,
        category: data.category,
        cost: data.cost,
        billingCycle: data.billingCycle,
        normalizedMonthlyCost,
        status: data.status,
        startDate: data.startDate ?? null,
        trialEndDate: data.trialEndDate ?? null,
        cancellationDate: data.cancellationDate ?? null,
        lastActiveDate: data.lastActiveDate ?? null,
      },
    });

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error('PUT /api/subscriptions/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    await prisma.subscription.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/subscriptions/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
