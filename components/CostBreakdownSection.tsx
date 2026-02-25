import type { BillingCycle } from '@/lib/types';
import { normalizeToMonthly, normalizeToYearly } from '@/lib/billing';

interface CostBreakdownSectionProps {
  cost: number;
  billingCycle: BillingCycle;
}

export default function CostBreakdownSection({ cost, billingCycle }: CostBreakdownSectionProps) {
  const monthlyEquivalent = normalizeToMonthly(cost, billingCycle);
  const yearlyEquivalent = normalizeToYearly(cost, billingCycle);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-4" data-testid="cost-breakdown-section">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Cost Breakdown</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Original cost</span>
          <span className="font-semibold text-gray-900" data-testid="original-cost">
            €{cost.toFixed(2)} / {billingCycle === 'monthly' ? 'month' : 'year'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Monthly equivalent</span>
          <span className="font-semibold text-gray-900" data-testid="monthly-equivalent">
            €{monthlyEquivalent.toFixed(2)} / month
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Yearly equivalent</span>
          <span className="font-semibold text-gray-900" data-testid="yearly-equivalent">
            €{yearlyEquivalent.toFixed(2)} / year
          </span>
        </div>
      </div>
    </div>
  );
}
