import type { CategoryGroup as CategoryGroupType } from '@/lib/types';
import SubscriptionCard from './SubscriptionCard';

interface CategoryGroupProps {
  group: CategoryGroupType;
}

export default function CategoryGroup({ group }: CategoryGroupProps) {
  const label = group.category.charAt(0).toUpperCase() + group.category.slice(1);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-700">{label}</h2>
        <span className="text-sm text-gray-500">
          €{group.totalMonthlyCost.toFixed(2)}/mo
        </span>
      </div>
      <div className="space-y-2">
        {group.subscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} />
        ))}
      </div>
    </section>
  );
}
