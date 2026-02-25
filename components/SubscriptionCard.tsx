'use client';

import React, { useState } from 'react';
import { Subscription } from '@/lib/types';
import StatusBadge from './StatusBadge';
import EditSubscriptionModal from './EditSubscriptionModal';

interface SubscriptionCardProps {
  subscription: Subscription;
  onUpdated: () => void;
}

export default function SubscriptionCard({ subscription, onUpdated }: SubscriptionCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isCancelled = subscription.status === 'cancelled';

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
          isCancelled
            ? 'bg-gray-50 border-gray-200 opacity-60'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <p
              className={`text-sm font-medium truncate ${
                isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}
            >
              {subscription.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} ·{' '}
              £{subscription.cost.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
          <StatusBadge
            status={subscription.status}
            trialEndDate={subscription.trialEndDate}
            lastActiveDate={subscription.lastActiveDate}
          />

          {!isCancelled && (
            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
              £{subscription.normalizedMonthlyCost.toFixed(2)}
              <span className="text-xs font-normal text-gray-500">/mo</span>
            </p>
          )}

          <button
            onClick={() => setIsEditOpen(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
            aria-label={`Edit ${subscription.name}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>
      </div>

      <EditSubscriptionModal
        subscription={subscription}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={onUpdated}
      />
    </>
  );
}
