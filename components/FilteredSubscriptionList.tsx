'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Subscription, FilterState, SortBy, SortOrder, SubscriptionStatus, ApiSubscriptionsResponse } from '@/lib/types';
import SubscriptionFilters from './SubscriptionFilters';
import SubscriptionCard from './SubscriptionCard';
import CategoryGroup from './CategoryGroup';
import CostSummaryBar from './CostSummaryBar';
import AddSubscriptionModal from './AddSubscriptionModal';

interface FilteredSubscriptionListProps {
  allCategories: string[];
}

function buildUrl(filters: FilterState): string {
  const params = new URLSearchParams();
  filters.statuses.forEach((s) => params.append('status', s));
  filters.categories.forEach((c) => params.append('category', c));
  if (filters.sortBy !== 'name' || filters.sortOrder !== 'asc') {
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);
  }
  return params.toString();
}

function parseFiltersFromSearchParams(searchParams: URLSearchParams): FilterState {
  const statuses = searchParams.getAll('status') as SubscriptionStatus[];
  const categories = searchParams.getAll('category');
  const sortBy = (searchParams.get('sortBy') ?? 'name') as SortBy;
  const sortOrder = (searchParams.get('sortOrder') ?? 'asc') as SortOrder;
  return { statuses, categories, sortBy, sortOrder };
}

function isFiltersActive(filters: FilterState): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.categories.length > 0 ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc'
  );
}

function groupByCategory(subscriptions: Subscription[]): { category: string; subscriptions: Subscription[]; totalMonthlyCost: number }[] {
  const map = new Map<string, Subscription[]>();
  for (const sub of subscriptions) {
    if (!map.has(sub.category)) map.set(sub.category, []);
    map.get(sub.category)!.push(sub);
  }
  return Array.from(map.entries()).map(([category, subs]) => ({
    category,
    subscriptions: subs,
    totalMonthlyCost: subs.reduce((sum, s) => sum + s.normalizedMonthlyCost, 0),
  }));
}

export default function FilteredSubscriptionList({ allCategories }: FilteredSubscriptionListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromSearchParams(searchParams)
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSubscriptions = useCallback(async (currentFilters: FilterState) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      currentFilters.statuses.forEach((s) => params.append('status', s));
      currentFilters.categories.forEach((c) => params.append('category', c));
      params.set('sortBy', currentFilters.sortBy);
      params.set('sortOrder', currentFilters.sortOrder);

      const res = await fetch(`/api/subscriptions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const json: ApiSubscriptionsResponse = await res.json();
      setSubscriptions(json.data);
      setTotal(json.total);
    } catch (err) {
      setError('Failed to load subscriptions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, read from URL
  useEffect(() => {
    const initialFilters = parseFiltersFromSearchParams(searchParams);
    setFilters(initialFilters);
    fetchSubscriptions(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiltersChange(newFilters: FilterState) {
    setFilters(newFilters);

    // Update URL
    const qs = buildUrl(newFilters);
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });

    // Debounce fetch
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSubscriptions(newFilters);
    }, 200);
  }

  function handleSubscriptionChange() {
    fetchSubscriptions(filters);
  }

  const active = isFiltersActive(filters);
  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.normalizedMonthlyCost, 0);
  const totalYearly = totalMonthly * 12;

  // When filters are active, show flat list; otherwise group by category
  const showGrouped = !active;
  const categoryGroups = showGrouped ? groupByCategory(subscriptions) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-1" data-testid="visible-count">
            {loading ? 'Loading...' : `${total} subscription${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <AddSubscriptionModal onSubscriptionAdded={handleSubscriptionChange} />
      </div>

      <SubscriptionFilters
        filters={filters}
        availableCategories={allCategories}
        onFiltersChange={handleFiltersChange}
        isFiltersActive={active}
      />

      {!loading && !error && subscriptions.length > 0 && (
        <CostSummaryBar totalMonthly={totalMonthly} totalYearly={totalYearly} />
      )}

      {loading && (
        <div className="flex items-center justify-center py-12" data-testid="loading-state">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm" data-testid="error-state">
          {error}
        </div>
      )}

      {!loading && !error && subscriptions.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-testid="empty-filtered-state"
        >
          {active ? (
            <>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No subscriptions match your current filters.
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting or clearing your filters to see more results.
              </p>
              <button
                data-testid="empty-state-clear-filters-btn"
                onClick={() =>
                  handleFiltersChange({
                    statuses: [],
                    categories: [],
                    sortBy: 'name',
                    sortOrder: 'asc',
                  })
                }
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No subscriptions yet</h3>
              <p className="text-sm text-gray-500">
                Add your first subscription to get started.
              </p>
            </>
          )}
        </div>
      )}

      {!loading && !error && subscriptions.length > 0 && (
        <div data-testid="subscription-list">
          {showGrouped ? (
            <div className="space-y-6">
              {categoryGroups.map((group) => (
                <CategoryGroup
                  key={group.category}
                  group={group}
                  onSubscriptionUpdated={handleSubscriptionChange}
                  onSubscriptionDeleted={handleSubscriptionChange}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onUpdated={handleSubscriptionChange}
                  onDeleted={handleSubscriptionChange}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
