import { CategoryGroup as CategoryGroupType } from '@/lib/types';
import SubscriptionCard from './SubscriptionCard';

interface CategoryGroupProps {
  group: CategoryGroupType;
  onSubscriptionUpdated: () => void;
  onSubscriptionDeleted: () => void;
}

export default function CategoryGroup({ group, onSubscriptionUpdated, onSubscriptionDeleted }: CategoryGroupProps) {
  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-base font-semibold text-gray-800">{group.category}</h2>
        <span className="text-sm text-gray-500">
          {formatter.format(group.totalMonthlyCost)}/mo
        </span>
      </div>
      <div className="space-y-3">
        {group.subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onUpdated={onSubscriptionUpdated}
            onDeleted={onSubscriptionDeleted}
          />
        ))}
      </div>
    </div>
  );
}
