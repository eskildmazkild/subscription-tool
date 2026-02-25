'use client';

import { CategoryGroup, Subscription } from '@/lib/types';
import SubscriptionCard from './SubscriptionCard';

interface CategoryGroupProps {
  group: CategoryGroup;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export default function CategoryGroupComponent({ group, onEdit, onDelete }: CategoryGroupProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Category Header */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{group.category}</h2>
        <span className="text-sm text-gray-500">
          €{group.totalMonthlyCost.toFixed(2)}/mo
        </span>
      </div>

      {/* Subscription List */}
      <div className="divide-y divide-gray-100">
        {group.subscriptions.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
