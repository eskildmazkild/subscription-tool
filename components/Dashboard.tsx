'use client';

import { useEffect, useState, useCallback } from 'react';
import { Subscription, CategoryGroup, GrandTotals } from '@/lib/types';
import { normalizeToMonthly } from '@/lib/utils';
import CostSummaryBar from './CostSummaryBar';
import CategoryGroupComponent from './CategoryGroup';
import EmptyState from './EmptyState';
import AddSubscriptionModal from './AddSubscriptionModal';
import EditSubscriptionModal from './EditSubscriptionModal';

function groupSubscriptions(subscriptions: Subscription[]): CategoryGroup[] {
  const map = new Map<string, Subscription[]>();
  for (const sub of subscriptions) {
    const existing = map.get(sub.category) ?? [];
    existing.push(sub);
    map.set(sub.category, existing);
  }

  return Array.from(map.entries())
    .map(([category, subs]) => ({
      category,
      subscriptions: subs,
      totalMonthlyCost:
        Math.round(
          subs.reduce((sum, s) => sum + normalizeToMonthly(s.cost, s.billingCycle), 0) * 100
        ) / 100,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

function computeTotals(subscriptions: Subscription[]): GrandTotals {
  const totalMonthly =
    Math.round(
      subscriptions.reduce((sum, s) => sum + normalizeToMonthly(s.cost, s.billingCycle), 0) * 100
    ) / 100;
  return {
    totalMonthly,
    totalYearly: Math.round(totalMonthly * 12 * 100) / 100,
  };
}

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/subscriptions');
      if (!res.ok) throw new Error('Failed to load subscriptions');
      const data = (await res.json()) as { subscriptions: Subscription[] };
      setSubscriptions(data.subscriptions);
    } catch {
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  function handleCreated(newSub: Subscription) {
    setSubscriptions((prev) => [newSub, ...prev]);
  }

  function handleUpdated(updated: Subscription) {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }

  function handleEditOpen(subscription: Subscription) {
    setEditingSubscription(subscription);
  }

  function handleEditClose() {
    setEditingSubscription(null);
  }

  const groups = groupSubscriptions(subscriptions);
  const totals = computeTotals(subscriptions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Subscription Manager</h1>
            <p className="text-sm text-gray-500">Track your recurring costs</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
          >
            + Add Subscription
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Cost Summary */}
            <div className="mb-6">
              <CostSummaryBar totals={totals} />
            </div>

            {/* Subscription Groups */}
            {subscriptions.length === 0 ? (
              <EmptyState onAdd={() => setShowAddModal(true)} />
            ) : (
              groups.map((group) => (
                <CategoryGroupComponent
                  key={group.category}
                  group={group}
                  onEdit={handleEditOpen}
                />
              ))
            )}
          </>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <AddSubscriptionModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Edit Modal */}
      {editingSubscription && (
        <EditSubscriptionModal
          subscription={editingSubscription}
          onClose={handleEditClose}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
