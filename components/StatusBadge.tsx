import React from 'react';
import { SubscriptionStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/statusMachine';
import { formatDate, getStatusBadgeClasses } from '@/lib/utils';

interface StatusBadgeProps {
  status: SubscriptionStatus;
  trialEndDate?: string | null;
  lastActiveDate?: string | null;
  showContextDate?: boolean;
}

export default function StatusBadge({
  status,
  trialEndDate,
  lastActiveDate,
  showContextDate = true,
}: StatusBadgeProps) {
  const badgeClasses = getStatusBadgeClasses(status);

  let contextDateText: string | null = null;
  if (showContextDate) {
    if (status === 'free_trial' && trialEndDate) {
      contextDateText = `Trial ends ${formatDate(trialEndDate)}`;
    } else if (status === 'cancelled' && lastActiveDate) {
      contextDateText = `Last active ${formatDate(lastActiveDate)}`;
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses}`}
      >
        {STATUS_LABELS[status]}
      </span>
      {contextDateText && (
        <span className="text-xs text-gray-500">{contextDateText}</span>
      )}
    </div>
  );
}
