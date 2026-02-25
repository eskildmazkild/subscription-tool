"use client";

import Link from 'next/link';
import type { Subscription } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export default function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <Link
        href={`/subscriptions/${subscription.id}`}
        className="flex-1 min-w-0 cursor-pointer"
        data-testid={`subscription-card-${subscription.id}`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{subscription.name}</p>
            <p className="text-xs text-gray-500 truncate">
              €{subscription.normalizedMonthlyCost.toFixed(2)}/mo ·{' '}
              {subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </p>
          </div>
          <div className="ml-auto flex-shrink-0 mr-3">
            <StatusBadge status={subscription.status} />
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(subscription)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Edit subscription"
          data-testid={`edit-btn-${subscription.id}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(subscription)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete subscription"
          data-testid={`delete-btn-${subscription.id}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
