import React from 'react';
import { GrandTotals } from '@/lib/types';

interface CostSummaryBarProps {
  totals: GrandTotals;
}

export default function CostSummaryBar({ totals }: CostSummaryBarProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
      <p className="text-sm font-medium text-blue-100 mb-1">Total Monthly Cost</p>
      <p className="text-3xl font-bold">£{totals.totalMonthly.toFixed(2)}</p>
      <p className="text-sm text-blue-200 mt-1">
        £{totals.totalYearly.toFixed(2)} per year
      </p>
      <p className="text-xs text-blue-300 mt-2">Cancelled subscriptions excluded</p>
    </div>
  );
}
