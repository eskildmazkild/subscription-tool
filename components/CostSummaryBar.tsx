import type { GrandTotals } from '@/lib/types';

interface CostSummaryBarProps {
  grandTotals: GrandTotals;
}

export default function CostSummaryBar({ grandTotals }: CostSummaryBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-medium text-gray-500">Monthly Total</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          €{grandTotals.totalMonthly.toFixed(2)}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">across all active subscriptions</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-medium text-gray-500">Yearly Total</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          €{grandTotals.totalYearly.toFixed(2)}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">projected annual spend</p>
      </div>
    </div>
  );
}
