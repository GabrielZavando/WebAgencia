import type { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
}

export default function StatsCard({ title, value, change, changeLabel, icon }: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="rounded-sm border border-gray-200 bg-surface p-6 shadow-default dark:border-gray-700 dark:bg-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="mt-2 text-2xl font-bold text-text dark:text-white">{value}</p>
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          {isPositive && (
            <>
              <ArrowUpIcon className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">+{change}%</span>
            </>
          )}
          {isNegative && (
            <>
              <ArrowDownIcon className="h-4 w-4 text-error" />
              <span className="text-sm font-medium text-error">{change}%</span>
            </>
          )}
          {changeLabel && (
            <span className="text-sm text-text-secondary">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}