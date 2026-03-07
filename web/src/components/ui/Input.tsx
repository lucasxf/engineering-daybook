import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/**
 * Reusable text input with error state styling.
 * Uses Library at Dusk design tokens.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm transition-colors',
          /* Light mode */
          'bg-white border-input-border text-foreground',
          'placeholder:text-input-placeholder',
          /* Dark mode */
          'dark:bg-deep-navy dark:border-mid-blue dark:text-parchment',
          'dark:placeholder:text-[#4A5A6A]',
          /* Focus state - ember-cta accent */
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-destructive focus:border-destructive focus:ring-destructive/25'
            : '',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
