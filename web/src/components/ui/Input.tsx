import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/**
 * Reusable text input with error state styling.
 * Uses Library at Dusk design system tokens.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm transition-colors',
          'bg-card',
          'text-foreground',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-destructive focus:ring-destructive'
            : 'border-border',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
