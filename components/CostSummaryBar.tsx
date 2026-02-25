interface CostSummaryBarProps {
  totalMonthly: number;
  totalYearly: number;
}

export default function CostSummaryBar({ totalMonthly, totalYearly }: CostSummaryBarProps) {
  const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between" data-testid="cost-summary-bar">
      <div>
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Monthly</p>
        <p className="text-xl font-bold text-blue-900" data-testid="total-monthly">{formatter.format(totalMonthly)}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Yearly</p>
        <p className="text-xl font-bold text-blue-900" data-testid="total-yearly">{formatter.format(totalYearly)}</p>
      </div>
    </div>
  );
}
