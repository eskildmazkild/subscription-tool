'use client';

import { Subscription } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export default function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const { name, cost, billingCycle, normalizedMonthlyCost, status, category } = subscription;

  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
      {/* Left: Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 truncate">{name}</span>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>{category}</span>
          <span>·</span>
          <span className="capitalize">{billingCycle}</span>
          {billingCycle === 'yearly' && (
            <>
              <span>·</span>
              <span>€{normalizedMonthlyCost.toFixed(2)}/mo equiv.</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Cost + Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            €{cost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
          </p>
        </div>

        <button
          onClick={() => onEdit(subscription)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Edit subscription"
          aria-label={`Edit ${name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>

        <button
          onClick={() => onDelete(subscription)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete subscription"
          aria-label={`Delete ${name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
