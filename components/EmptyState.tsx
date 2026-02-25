'use client';

interface EmptyStateProps {
  onAdd: () => void;
}

export default function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl">📋</div>
      <h2 className="mb-2 text-lg font-semibold text-gray-800">No subscriptions yet</h2>
      <p className="mb-6 max-w-xs text-sm text-gray-500">
        Start tracking your recurring costs by adding your first subscription.
      </p>
      <button
        onClick={onAdd}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        + Add Subscription
      </button>
    </div>
  );
}
