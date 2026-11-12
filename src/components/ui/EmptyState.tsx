import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#e1ede7] bg-white/50',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7EFEA] text-[#142D27] mb-4 shadow-subtle">
        {icon || <Inbox className="h-7 w-7 text-[#14B866]" />}
      </div>
      <h4 className="text-base font-semibold text-[#142D27]">{title}</h4>
      <p className="mt-1 text-sm text-[#557067] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
