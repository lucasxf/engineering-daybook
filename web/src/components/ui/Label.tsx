import { type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

/**
 * Reusable form label using Library at Dusk design tokens.
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
