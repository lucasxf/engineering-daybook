import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

/**
 * Reusable textarea with error state styling — mirrors Input.tsx API.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm transition-colors',
          'bg-white dark:bg-slate-800',
          'text-slate-900 dark:text-slate-50',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-300 dark:border-slate-600',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
