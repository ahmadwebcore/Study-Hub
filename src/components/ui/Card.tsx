import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-[#e1ede7] transition-all duration-150 ease-out relative overflow-hidden',
        hoverable && 'hover:border-[#14B866]/50',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('flex items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]/80', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('text-base sm:text-lg font-semibold text-[#142D27] tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-xs sm:text-sm text-[#557067] mt-0.5', className)} {...props}>
    {children}
  </p>
);
