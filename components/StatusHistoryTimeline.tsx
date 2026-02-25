import type { StatusHistoryEntry } from '@/lib/types';

interface StatusHistoryTimelineProps {
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  initialStatus: string;
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'free_trial':
      return 'Free Trial';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusPill({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    free_trial: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const colorClass = colorMap[status] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {formatStatusLabel(status)}
    </span>
  );
}

export default function StatusHistoryTimeline({
  statusHistory,
  createdAt,
  initialStatus,
}: StatusHistoryTimelineProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6" data-testid="status-history-section">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Status History</h2>

      {statusHistory.length === 0 ? (
        <div className="text-center py-4" data-testid="no-status-history">
          <p className="text-gray-400 text-sm mb-4">No status changes recorded yet</p>
          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 text-left">
            <div className="flex items-center gap-2 mb-1">
              <StatusPill status={initialStatus} />
              <span className="text-xs text-gray-400 italic">Initial status</span>
            </div>
            <p className="text-xs text-gray-400">{formatDateTime(createdAt)}</p>
          </div>
        </div>
      ) : (
        <ol className="relative border-l border-gray-200 ml-3 space-y-4" data-testid="status-history-list">
          {statusHistory.map((entry, index) => (
            <li key={entry.id} className="ml-4" data-testid={`status-history-entry-${index}`}>
              <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusPill status={entry.fromStatus} />
                  <span className="text-gray-400 text-xs">→</span>
                  <StatusPill status={entry.toStatus} />
                </div>
                <p className="text-xs text-gray-400" data-testid={`status-history-date-${index}`}>
                  {formatDateTime(entry.changedAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
