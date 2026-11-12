import React from 'react';
import { cn } from '../../lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading StudyHub data...',
  className,
}) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-[#E7EFEA] border-t-[#14B866]',
          sizes[size]
        )}
      />
      {label && <p className="text-xs font-medium text-[#557067] animate-pulse">{label}</p>}
    </div>
  );
};
