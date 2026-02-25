'use client';

import { useEffect, useState, useCallback } from 'react';
import { Subscription, CategoryGroup, GrandTotals } from '@/lib/types';
import CostSummaryBar from './CostSummaryBar';
import CategoryGroupComponent from './CategoryGroup';
import EmptyState from './EmptyState';
import AddSubscriptionModal from './AddSubscriptionModal';
import EditSubscriptionModal from './EditSubscriptionModal';
import ConfirmationDialog from './ConfirmationDialog';

function groupByCategory(subscriptions: Subscription[]): CategoryGroup[] {
  const map = new Map<string, Subscription[]>();
  for (const sub of subscriptions) {
    const existing = map.get(sub.category) ?? [];
    existing.push(sub);
    map.set(sub.category, existing);
  }
  const groups: CategoryGroup[] = [];
  for (const [category, subs] of map.entries()) {
    const totalMonthlyCost = subs.reduce((sum, s) => sum + s.normalizedMonthlyCost, 0);
    groups.push({ category, subscriptions: subs, totalMonthlyCost });
  }
  return groups.sort((a, b) => a.category.localeCompare(b.category));
}

function computeTotals(subscriptions: Subscription[]): GrandTotals {
  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.normalizedMonthlyCost, 0);
  return {
    totalMonthly,
    totalYearly: totalMonthly * 12,
  };
}

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Delete state
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/subscriptions');
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const data = (await res.json()) as { subscriptions: Subscription[] };
      setSubscriptions(data.subscriptions);
    } catch {
      setError('Failed to load subscriptions. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleAdd = (newSub: Subscription) => {
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  const handleEdit = (updated: Subscription) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleDeleteClick = (subscription: Subscription) => {
    setDeleteError(null);
    setDeletingSubscription(subscription);
  };

  const handleDeleteCancel = () => {
    if (deleteLoading) return;
    setDeletingSubscription(null);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubscription) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/subscriptions/${deletingSubscription.id}`, {
        method: 'DELETE',
      });

      if (res.status === 204) {
        // Success: remove from local state
        setSubscriptions((prev) =>
          prev.filter((s) => s.id !== deletingSubscription.id)
        );
        setDeletingSubscription(null);
        setDeleteError(null);
      } else if (res.status === 404) {
        setDeleteError(
          'This subscription could not be found. It may have already been deleted.'
        );
        // Refresh list to sync with server
        await fetchSubscriptions();
        setDeletingSubscription(null);
      } else {
        setDeleteError('Something went wrong. Please try again.');
      }
    } catch {
      setDeleteError('Something went wrong. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const categoryGroups = groupByCategory(subscriptions);
  const totals = computeTotals(subscriptions);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Loading subscriptions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => { setLoading(true); void fetchSubscriptions(); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Subscription Manager</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Add Subscription
          </button>
        </div>
      </header>

      {/* Cost Summary */}
      {subscriptions.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <CostSummaryBar totals={totals} />
        </div>
      )}

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        {subscriptions.length === 0 ? (
          <EmptyState onAdd={() => setShowAddModal(true)} />
        ) : (
          <div className="space-y-6">
            {categoryGroups.map((group) => (
              <CategoryGroupComponent
                key={group.category}
                group={group}
                onEdit={(sub) => setEditingSubscription(sub)}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <AddSubscriptionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Edit Modal */}
      {editingSubscription && (
        <EditSubscriptionModal
          subscription={editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onEdit={handleEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingSubscription !== null}
        title="Delete Subscription"
        message={`Are you sure you want to permanently delete "${deletingSubscription?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteLoading}
        errorMessage={deleteError}
        onConfirm={() => { void handleDeleteConfirm(); }}
        onCancel={handleDeleteCancel}
        destructive
      />
    </div>
  );
}
