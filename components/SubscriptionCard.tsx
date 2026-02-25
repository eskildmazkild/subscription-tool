import type { Subscription } from '@/lib/types';

interface SubscriptionCardProps {
  subscription: Subscription;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  free_trial: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  free_trial: 'Free Trial',
  cancelled: 'Cancelled',
};

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const statusStyle = STATUS_STYLES[subscription.status] ?? 'bg-gray-100 text-gray-700';
  const statusLabel = STATUS_LABELS[subscription.status] ?? subscription.status;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{subscription.name}</p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle}`}
          >
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Started {subscription.startDate}
          {subscription.status === 'free_trial' && subscription.trialEndDate && (
            <> · Trial ends {subscription.trialEndDate}</>
          )}
          {subscription.status === 'cancelled' && subscription.cancellationDate && (
            <> · Cancelled {subscription.cancellationDate}</>
          )}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          €{subscription.cost.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          {subscription.billingCycle === 'yearly'
            ? `€${subscription.normalizedMonthlyCost.toFixed(2)}/mo`
            : '/month'}
        </p>
      </div>
    </div>
  );
}
