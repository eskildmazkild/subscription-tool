'use client';

import { SubscriptionStatus, SortBy, SortOrder, FilterState } from '@/lib/types';

const STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'free_trial', label: 'Free Trial' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS: { value: string; label: string; sortBy: SortBy; sortOrder: SortOrder }[] = [
  { value: 'name_asc', label: 'Name A→Z', sortBy: 'name', sortOrder: 'asc' },
  { value: 'name_desc', label: 'Name Z→A', sortBy: 'name', sortOrder: 'desc' },
  { value: 'monthlyCost_desc', label: 'Monthly Cost High→Low', sortBy: 'monthlyCost', sortOrder: 'desc' },
  { value: 'monthlyCost_asc', label: 'Monthly Cost Low→High', sortBy: 'monthlyCost', sortOrder: 'asc' },
  { value: 'startDate_desc', label: 'Start Date Newest→Oldest', sortBy: 'startDate', sortOrder: 'desc' },
  { value: 'startDate_asc', label: 'Start Date Oldest→Newest', sortBy: 'startDate', sortOrder: 'asc' },
];

interface SubscriptionFiltersProps {
  filters: FilterState;
  availableCategories: string[];
  onFiltersChange: (filters: FilterState) => void;
  isFiltersActive: boolean;
}

export default function SubscriptionFilters({
  filters,
  availableCategories,
  onFiltersChange,
  isFiltersActive,
}: SubscriptionFiltersProps) {
  const currentSortValue = `${filters.sortBy}_${filters.sortOrder}`;

  function toggleStatus(status: SubscriptionStatus) {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: next });
  }

  function toggleCategory(category: string) {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: next });
  }

  function handleSortChange(value: string) {
    const option = SORT_OPTIONS.find((o) => o.value === value);
    if (option) {
      onFiltersChange({ ...filters, sortBy: option.sortBy, sortOrder: option.sortOrder });
    }
  }

  function handleClearFilters() {
    onFiltersChange({
      statuses: [],
      categories: [],
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4" data-testid="subscription-filters">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Filters &amp; Sort</h3>
        <button
          data-testid="clear-filters-btn"
          onClick={handleClearFilters}
          disabled={!isFiltersActive}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Clear filters
        </button>
      </div>

      {/* Status Filter */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = filters.statuses.includes(option.value);
            return (
              <button
                key={option.value}
                data-testid={`status-filter-${option.value}`}
                onClick={() => toggleStatus(option.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => {
              const isSelected = filters.categories.includes(category);
              return (
                <button
                  key={category}
                  data-testid={`category-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400 hover:text-purple-600'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Sort By</p>
        <select
          data-testid="sort-select"
          value={currentSortValue}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
