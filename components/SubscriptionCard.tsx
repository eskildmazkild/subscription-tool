'use client';

import { useState } from 'react';
import { Subscription } from '@/lib/types';
import StatusBadge from './StatusBadge';
import EditSubscriptionModal from './EditSubscriptionModal';
import ConfirmationDialog from './ConfirmationDialog';
import SubscriptionStatusControl from './SubscriptionStatusControl';

interface SubscriptionCardProps {
  subscription: Subscription;
  onUpdated: () => void;
  onDeleted: () => void;
}

export default function SubscriptionCard({ subscription, onUpdated, onDeleted }: SubscriptionCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted();
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors"
      data-testid={`subscription-card-${subscription.id}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{subscription.name}</h3>
          <StatusBadge status={subscription.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{subscription.category}</span>
          <span>•</span>
          <span className="capitalize">{subscription.billingCycle}</span>
          <span>•</span>
          <span>Started {new Date(subscription.startDate).toLocaleDateString('en-GB')}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {formatter.format(subscription.cost)}
          </p>
          <p className="text-xs text-gray-500">
            {formatter.format(subscription.normalizedMonthlyCost)}/mo
          </p>
        </div>

        <SubscriptionStatusControl
          subscription={subscription}
          onStatusUpdated={onUpdated}
        />

        <EditSubscriptionModal subscription={subscription} onSubscriptionUpdated={onUpdated} />

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
          title="Delete subscription"
          data-testid={`delete-btn-${subscription.id}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <ConfirmationDialog
        open={showDeleteConfirm}
        title="Delete Subscription"
        description={`Are you sure you want to delete "${subscription.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
