import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled,
  isLoading,
  loadingText,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 ease-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary:
      'bg-gradient-to-b from-[#143229] via-[#0f2720] to-[#0a1b16] text-white ring-1 ring-white/15 shadow-sm hover:shadow-md hover:shadow-emerald-950/25 hover:from-[#193e33] hover:via-[#133027] hover:to-[#0c201a] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    secondary:
      'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border border-zinc-200/80 shadow-2xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    outline:
      'border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 hover:border-zinc-400 shadow-2xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    ghost:
      'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 active:scale-[0.98]',
    danger:
      'bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white ring-1 ring-white/20 shadow-sm hover:shadow-rose-950/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-xl gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
