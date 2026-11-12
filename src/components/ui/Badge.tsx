import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'accent';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulseDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulseDot = false,
  ...props
}) => {
  const variants = {
    primary: 'bg-[#e8f8f0] text-[#14B866] border-[#14B866]/30',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-[#E7EFEA]/80 text-[#263B35] border-[#e1ede7]',
    accent: 'bg-[#142D27] text-white border-[#142D27]',
  };

  const dotColors = {
    primary: 'bg-[#14B866]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    danger: 'bg-rose-500',
    neutral: 'bg-[#557067]',
    accent: 'bg-[#14B866]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulseDot && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  );
};
