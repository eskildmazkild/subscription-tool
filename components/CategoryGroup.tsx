'use client';

import React from 'react';
import { CategoryGroup as CategoryGroupType } from '@/lib/types';
import SubscriptionCard from './SubscriptionCard';

interface CategoryGroupProps {
  group: CategoryGroupType;
  onUpdated: () => void;
}

export default function CategoryGroup({ group, onUpdated }: CategoryGroupProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">{group.category}</h3>
        <span className="text-sm font-medium text-gray-600">
          £{group.totalMonthlyCost.toFixed(2)}
          <span className="text-xs text-gray-400">/mo</span>
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {group.subscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} onUpdated={onUpdated} />
        ))}
      </div>
    </div>
  );
}
