interface StatCardProps {
  label: string;
  value: string;
  change?: { value: string; positive: boolean };
  icon?: React.ReactNode;
}

export function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-edge bg-surface-raised p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-content-muted uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <span className="text-content-muted" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <span className="text-2xl font-bold text-content">{value}</span>
      {change && (
        <span
          className={`text-xs font-medium ${
            change.positive ? 'text-success' : 'text-danger'
          }`}
        >
          {change.positive ? '+' : ''}
          {change.value}
        </span>
      )}
    </div>
  );
}
