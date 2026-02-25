'use client';

import { Subscription } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  free_trial: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  free_trial: 'Free Trial',
  cancelled: 'Cancelled',
};

export default function SubscriptionCard({ subscription, onEdit }: SubscriptionCardProps) {
  const statusStyle = STATUS_STYLES[subscription.status] ?? 'bg-gray-100 text-gray-600';
  const statusLabel = STATUS_LABELS[subscription.status] ?? subscription.status;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{subscription.name}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle}`}
          >
            {statusLabel}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {subscription.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} ·{' '}
          {formatCurrency(subscription.cost)}
        </span>
        {subscription.billingCycle === 'yearly' && (
          <span className="text-xs text-gray-400">
            ≈ {formatCurrency(subscription.normalizedMonthlyCost)}/month
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(subscription.normalizedMonthlyCost)}
            <span className="text-xs font-normal text-gray-500">/mo</span>
          </div>
        </div>
        <button
          onClick={() => onEdit(subscription)}
          className="ml-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
          aria-label={`Edit ${subscription.name}`}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
