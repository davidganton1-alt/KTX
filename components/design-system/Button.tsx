'use client';

import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-[var(--gold)] to-[color-mix(in_srgb,var(--gold)_85%,#000)] text-black font-semibold shadow-sm hover:brightness-110 hover:shadow-md',
  secondary: 'border border-[var(--border)] text-[var(--fg)] hover:border-[var(--gold)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/5',
  ghost: 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--card)]',
  danger: 'bg-[#F87171] text-white font-semibold hover:brightness-110 shadow-sm',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[12px] rounded-md',
  md: 'px-5 py-2.5 text-[14px] rounded-lg',
  lg: 'px-6 py-3 text-[15px] rounded-lg',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
