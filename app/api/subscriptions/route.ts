import { NextResponse } from 'next/server';
import { getAllSubscriptions } from '@/lib/queries';
import type { ApiSubscriptionsResponse } from '@/lib/types';

export async function GET(request: Request): Promise<NextResponse<ApiSubscriptionsResponse | { error: string }>> {
  try {
    // Support future filtering via query params (story 6)
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const categoryFilter = searchParams.get('category');

    let subscriptions = await getAllSubscriptions();

    if (statusFilter) {
      subscriptions = subscriptions.filter((s) => s.status === statusFilter);
    }

    if (categoryFilter) {
      subscriptions = subscriptions.filter(
        (s) => s.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
