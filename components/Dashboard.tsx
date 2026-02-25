'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Subscription, CategoryGroup, GrandTotals } from '@/lib/types';
import CostSummaryBar from './CostSummaryBar';
import CategoryGroupComponent from './CategoryGroup';
import EmptyState from './EmptyState';
import AddSubscriptionModal from './AddSubscriptionModal';

function computeDerivedData(subscriptions: Subscription[]): {
  categoryGroups: CategoryGroup[];
  grandTotals: GrandTotals;
} {
  const grouped = subscriptions.reduce<Record<string, Subscription[]>>((acc, sub) => {
    if (!acc[sub.category]) acc[sub.category] = [];
    acc[sub.category].push(sub);
    return acc;
  }, {});

  const categoryGroups: CategoryGroup[] = Object.entries(grouped).map(([category, subs]) => ({
    category,
    subscriptions: subs,
    totalMonthlyCost: subs.reduce((sum, s) => sum + s.normalizedMonthlyCost, 0),
  }));

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.normalizedMonthlyCost, 0);

  return {
    categoryGroups,
    grandTotals: {
      totalMonthly,
      totalYearly: totalMonthly * 12,
    },
  };
}

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/subscriptions');
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const data = (await res.json()) as { subscriptions: Subscription[] };
      setSubscriptions(data.subscriptions);
      setError(null);
    } catch {
      setError('Failed to load subscriptions. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSubscriptionAdded = (newSubscription: Subscription) => {
    setSubscriptions((prev) => [newSubscription, ...prev]);
  };

  const { categoryGroups, grandTotals } = computeDerivedData(subscriptions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Manager</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage your recurring costs</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Subscription
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-sm text-gray-500">Loading subscriptions...</span>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Cost summary */}
            <CostSummaryBar grandTotals={grandTotals} />

            {/* Subscription list */}
            {subscriptions.length === 0 ? (
              <EmptyState onAdd={() => setIsModalOpen(true)} />
            ) : (
              <div className="mt-8 space-y-6">
                {categoryGroups.map((group) => (
                  <CategoryGroupComponent key={group.category} group={group} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSubscriptionAdded}
      />
    </div>
  );
}
