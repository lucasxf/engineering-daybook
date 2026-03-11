import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  autoExpand?: boolean;
}

/**
 * Reusable textarea with error state styling and optional auto-expand.
 * Uses Library at Dusk design tokens.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, autoExpand = false, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoExpand && ref && 'current' in ref && ref.current) {
        ref.current.style.height = 'auto';
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <textarea
        ref={ref}
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm transition-colors resize-none',
          /* Light mode */
          'bg-white border-input-border text-foreground',
          'placeholder:text-input-placeholder',
          /* Dark mode */
          'dark:bg-deep-navy dark:border-mid-blue dark:text-parchment',
          'dark:placeholder:text-input-placeholder',
          /* Focus state - ember-cta accent */
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-destructive focus:border-destructive focus:ring-destructive/25'
            : '',
          className
        )}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
