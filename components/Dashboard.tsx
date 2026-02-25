'use client';

import { useEffect, useState, useCallback } from 'react';
import { groupByCategory, calcGrandTotals, formatCurrency } from '@/lib/utils';
import type { Subscription, CategoryGroup as CategoryGroupType, GrandTotals } from '@/lib/types';
import CostSummaryBar from './CostSummaryBar';
import CategoryGroup from './CategoryGroup';
import EmptyState from './EmptyState';
import Link from 'next/link';

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/subscriptions', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const data = await res.json() as { subscriptions: Subscription[] };
      setSubscriptions(data.subscriptions);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  const groups: CategoryGroupType[] = groupByCategory(subscriptions);
  const totals: GrandTotals = calcGrandTotals(subscriptions);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your subscriptions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">Something went wrong</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => { setLoading(true); void fetchSubscriptions(); }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Subscription Manager</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track your recurring costs</p>
          </div>
          <Link
            href="/subscriptions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add subscription
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Cost Summary Bar — always visible, shows £0.00 when empty */}
        <CostSummaryBar totals={totals} />

        <div className="mt-8">
          {subscriptions.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} across {groups.length} categor{groups.length !== 1 ? 'ies' : 'y'}
                </h2>
              </div>

              <div className="flex flex-col gap-8">
                {groups.map((group) => (
                  <CategoryGroup key={group.category} group={group} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
