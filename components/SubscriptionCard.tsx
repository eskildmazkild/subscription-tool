import { formatCurrency } from '@/lib/utils';
import type { Subscription } from '@/lib/types';

interface SubscriptionCardProps {
  subscription: Subscription;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const isCancelled = subscription.status === 'cancelled';
  const isTrial = subscription.status === 'trial';

  return (
    <div
      className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${
        isCancelled
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-semibold text-sm ${
                isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}
            >
              {subscription.name}
            </span>

            {isCancelled && (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
                Cancelled
              </span>
            )}

            {isTrial && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Free Trial
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 capitalize">
              {subscription.billingCycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}
            </span>

            {subscription.billingCycle === 'yearly' && (
              <span className="text-xs text-gray-400">
                ({formatCurrency(subscription.cost)}/year)
              </span>
            )}

            {isTrial && subscription.trialEndDate && (
              <span className="text-xs text-amber-600">
                Trial ends: {formatDate(subscription.trialEndDate)}
              </span>
            )}

            {isCancelled && subscription.cancellationDate && (
              <span className="text-xs text-gray-400">
                Cancelled: {formatDate(subscription.cancellationDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <span
          className={`text-base font-bold ${
            isCancelled ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {formatCurrency(subscription.monthlyCostEquivalent)}
          <span className="text-xs font-normal text-gray-500 ml-0.5">/mo</span>
        </span>

        {subscription.billingCycle === 'yearly' && !isCancelled && (
          <span className="text-xs text-gray-400 mt-0.5">
            {formatCurrency(subscription.cost)}/yr
          </span>
        )}
      </div>
    </div>
  );
}
