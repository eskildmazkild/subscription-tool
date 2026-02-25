import { formatCurrency } from '@/lib/utils';
import SubscriptionCard from './SubscriptionCard';
import type { CategoryGroup as CategoryGroupType } from '@/lib/types';

interface CategoryGroupProps {
  group: CategoryGroupType;
}

export default function CategoryGroup({ group }: CategoryGroupProps) {
  return (
    <section aria-labelledby={`category-${group.category}`}>
      <div className="flex items-center justify-between mb-3">
        <h2
          id={`category-${group.category}`}
          className="text-base font-semibold text-gray-900"
        >
          {group.category}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({group.subscriptions.length} subscription{group.subscriptions.length !== 1 ? 's' : ''})
          </span>
        </h2>
        <div className="text-right">
          <span
            className="text-sm font-semibold text-indigo-700"
            aria-label={`${group.category} category total: ${formatCurrency(group.totalMonthlyCost)} per month`}
          >
            {formatCurrency(group.totalMonthlyCost)}
            <span className="text-xs font-normal text-gray-400 ml-0.5">/mo</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {group.subscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} />
        ))}
      </div>
    </section>
  );
}
