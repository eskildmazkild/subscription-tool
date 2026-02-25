'use client';

import { GrandTotals } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface CostSummaryBarProps {
  totals: GrandTotals;
}

export default function CostSummaryBar({ totals }: CostSummaryBarProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Monthly Total</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalMonthly)}</p>
      </div>
      <div className="hidden h-10 w-px bg-gray-200 sm:block" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Yearly Total</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalYearly)}</p>
      </div>
    </div>
  );
}
