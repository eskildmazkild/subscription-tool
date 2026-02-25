import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { BillingCycle, SubscriptionStatus } from '@/lib/types';
import CostBreakdownSection from '@/components/CostBreakdownSection';
import StatusHistoryTimeline from '@/components/StatusHistoryTimeline';
import StatusBadge from '@/components/StatusBadge';

interface PageProps {
  params: { id: string };
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatBillingCycle(cycle: string): string {
  return cycle === 'monthly' ? 'Monthly' : 'Yearly';
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'free_trial':
      return 'Free Trial';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const { id } = params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: { changedAt: 'desc' },
      },
    },
  }).catch(() => null);

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center" data-testid="not-found-state">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription not found</h1>
          <p className="text-gray-500 mb-6">The subscription you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="back-to-subscriptions-link"
          >
            ← Back to Subscriptions
          </Link>
        </div>
      </div>
    );
  }

  const statusHistoryEntries = subscription.statusHistory.map((entry) => ({
    id: entry.id,
    subscriptionId: entry.subscriptionId,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    changedAt: entry.changedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            data-testid="back-to-subscriptions-link"
          >
            ← All Subscriptions
          </Link>
          <Link
            href={`/subscriptions/${subscription.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="edit-subscription-btn"
          >
            ✏️ Edit
          </Link>
        </div>

        {/* Subscription name + status */}
        <div className="bg-white rounded-xl shadow p-6 mb-4" data-testid="subscription-metadata">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="subscription-name">
              {subscription.name}
            </h1>
            <div data-testid="subscription-status">
              <StatusBadge status={subscription.status as SubscriptionStatus} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Category</p>
              <p className="font-medium text-gray-900" data-testid="subscription-category">
                {subscription.category}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Billing Cycle</p>
              <p className="font-medium text-gray-900" data-testid="subscription-billing-cycle">
                {formatBillingCycle(subscription.billingCycle)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Start Date</p>
              <p className="font-medium text-gray-900" data-testid="subscription-start-date">
                {formatDate(subscription.startDate)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Cost</p>
              <p className="font-medium text-gray-900" data-testid="subscription-cost">
                €{subscription.cost.toFixed(2)} / {subscription.billingCycle === 'monthly' ? 'month' : 'year'}
              </p>
            </div>
          </div>

          {/* Status-specific dates */}
          {subscription.status === 'free_trial' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Trial End Date</p>
              <p className="font-medium text-gray-900" data-testid="trial-end-date">
                {formatDate(subscription.trialEndDate)}
              </p>
            </div>
          )}

          {subscription.status === 'cancelled' && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Cancellation Date</p>
                <p className="font-medium text-gray-900" data-testid="cancellation-date">
                  {formatDate(subscription.cancellationDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Last Active Date</p>
                <p className="font-medium text-gray-900" data-testid="last-active-date">
                  {formatDate(subscription.lastActiveDate)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <CostBreakdownSection
          cost={subscription.cost}
          billingCycle={subscription.billingCycle as BillingCycle}
        />

        {/* Status History */}
        <StatusHistoryTimeline
          statusHistory={statusHistoryEntries}
          createdAt={subscription.createdAt.toISOString()}
          initialStatus={subscription.status}
        />
      </div>
    </div>
  );
}
