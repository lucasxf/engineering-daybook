import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cta';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable button component with variants and sizes.
 * Uses Library at Dusk design system tokens.
 */
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-all',
        'active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          // Primary - primary-blue
          'bg-primary text-primary-foreground hover:bg-primary-600': variant === 'primary',
          // Secondary - muted background
          'bg-secondary text-secondary-foreground hover:bg-muted':
            variant === 'secondary',
          // Ghost - transparent with hover
          'hover:bg-muted': variant === 'ghost',
          // Danger - destructive red
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'danger',
          // CTA - ember orange for primary actions
          'bg-accent text-accent-foreground hover:bg-accent-700': variant === 'cta',
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
