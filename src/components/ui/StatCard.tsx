import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon: React.ReactNode;
  iconBg?: string;
  badgeText?: string;
  subtext?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBg = 'bg-[#e8f8f0] text-[#14B866]',
  badgeText,
  subtext,
  onClick,
  className,
}) => {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={cn('group cursor-default', onClick && 'cursor-pointer', className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#557067] tracking-wide uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#142D27] tracking-tight">
              {value}
            </span>
            {badgeText && (
              <Badge variant="neutral" size="sm">
                {badgeText}
              </Badge>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-subtle',
            iconBg
          )}
        >
          {icon}
        </div>
      </div>

      {(change || subtext) && (
        <div className="mt-4 pt-3 border-t border-[#e1ede7]/70 flex items-center justify-between text-xs text-[#557067]">
          {change ? (
            <div className="flex items-center gap-1.5 font-medium">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold',
                  change.trend === 'up' && 'bg-emerald-50 text-emerald-700',
                  change.trend === 'down' && 'bg-rose-50 text-rose-700',
                  change.trend === 'neutral' && 'bg-zinc-100 text-zinc-700'
                )}
              >
                {change.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                {change.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                {change.trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                {change.value}
              </span>
              <span className="text-[#7d9990]">{change.label || 'vs previous period'}</span>
            </div>
          ) : (
            <span className="text-[#7d9990]">{subtext}</span>
          )}
        </div>
      )}
    </Card>
  );
};
