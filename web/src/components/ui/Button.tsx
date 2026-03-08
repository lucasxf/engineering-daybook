import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable button component with variants and sizes.
 * Uses Library at Dusk design tokens with ember-cta as primary.
 */
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-all',
        'active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        {
          /* Primary: ember-cta with proper disabled state */
          'bg-primary text-primary-foreground hover:bg-primary-hover': variant === 'primary' && !disabled,
          'bg-btn-disabled text-btn-disabled-text dark:bg-btn-disabled-dark dark:text-btn-disabled-text-dark cursor-not-allowed':
            variant === 'primary' && disabled,
          /* Secondary */
          'bg-card text-card-foreground border border-card-border hover:bg-muted/10':
            variant === 'secondary' && !disabled,
          'bg-card text-card-foreground border border-card-border opacity-50 cursor-not-allowed':
            variant === 'secondary' && disabled,
          /* Ghost */
          'hover:bg-muted/10 text-muted-foreground': variant === 'ghost' && !disabled,
          'text-muted-foreground opacity-50 cursor-not-allowed': variant === 'ghost' && disabled,
          /* Danger */
          'bg-destructive text-white hover:bg-destructive/90': variant === 'danger' && !disabled,
          'bg-destructive text-white opacity-50 cursor-not-allowed': variant === 'danger' && disabled,
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
