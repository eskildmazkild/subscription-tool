import { formatCurrency } from '@/lib/utils';
import type { GrandTotals } from '@/lib/types';

interface CostSummaryBarProps {
  totals: GrandTotals;
}

export default function CostSummaryBar({ totals }: CostSummaryBarProps) {
  return (
    <div className="rounded-xl bg-indigo-600 text-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg">
      <div>
        <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide">Total Spend</p>
        <h2 className="text-2xl font-bold mt-1">Subscription Overview</h2>
      </div>
      <div className="flex gap-8">
        <div>
          <p className="text-indigo-200 text-xs uppercase tracking-wide font-medium">Monthly</p>
          <p
            className="text-3xl font-bold mt-1"
            aria-label={`Total monthly cost: ${formatCurrency(totals.totalMonthly)}`}
          >
            {formatCurrency(totals.totalMonthly)}
          </p>
          <p className="text-indigo-200 text-xs mt-0.5">per month</p>
        </div>
        <div className="w-px bg-indigo-400" />
        <div>
          <p className="text-indigo-200 text-xs uppercase tracking-wide font-medium">Yearly</p>
          <p
            className="text-3xl font-bold mt-1"
            aria-label={`Total yearly cost: ${formatCurrency(totals.totalYearly)}`}
          >
            {formatCurrency(totals.totalYearly)}
          </p>
          <p className="text-indigo-200 text-xs mt-0.5">per year</p>
        </div>
      </div>
    </div>
  );
}
