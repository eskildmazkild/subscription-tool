'use client';

import { CategoryGroup as CategoryGroupType, Subscription } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import SubscriptionCard from './SubscriptionCard';

interface CategoryGroupProps {
  group: CategoryGroupType;
  onEdit: (subscription: Subscription) => void;
}

export default function CategoryGroup({ group, onEdit }: CategoryGroupProps) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700">{group.category}</h2>
        <span className="text-sm text-gray-500">
          {formatCurrency(group.totalMonthlyCost)}/mo
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {group.subscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}
