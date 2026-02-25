'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Subscription } from '@/lib/types';
import { groupByCategory, computeGrandTotals } from '@/lib/queries';
import CostSummaryBar from './CostSummaryBar';
import CategoryGroup from './CategoryGroup';
import EmptyState from './EmptyState';
import AddSubscriptionModal from './AddSubscriptionModal';

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      const data = await response.json();
      setSubscriptions(
        (data.subscriptions as Subscription[]).map((s) => ({
          ...s,
          status: s.status as Subscription['status'],
          billingCycle: s.billingCycle as Subscription['billingCycle'],
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  const groups = groupByCategory(subscriptions);
  const totals = computeGrandTotals(subscriptions);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your recurring payments</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subscription
          </button>
        </div>

        {/* Cost Summary */}
        {subscriptions.length > 0 && <CostSummaryBar totals={totals} />}

        {/* Content */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
              <button
                onClick={() => void fetchSubscriptions()}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : subscriptions.length === 0 ? (
            <EmptyState onAdd={() => setIsAddOpen(true)} />
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <CategoryGroup
                  key={group.category}
                  group={group}
                  onUpdated={() => void fetchSubscriptions()}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddSubscriptionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => void fetchSubscriptions()}
      />
    </div>
  );
}
