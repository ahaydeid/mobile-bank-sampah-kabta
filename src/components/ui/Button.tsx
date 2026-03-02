import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'purple';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {
    const variants = {
      primary: 'bg-sky-600 text-white hover:bg-sky-700',
      secondary: 'bg-slate-800 text-white hover:bg-slate-900',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
      ghost: 'bg-transparent hover:bg-slate-50 text-slate-600',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      purple: 'bg-purple-600 text-white hover:bg-purple-700',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-sm',
      md: 'h-10 px-4 text-sm rounded-sm',
      lg: 'h-11 px-6 text-base rounded-sm',
      icon: 'h-9 w-9 p-2 rounded-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
