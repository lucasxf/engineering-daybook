import { type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

/**
 * Reusable form label component.
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-slate-700 dark:text-slate-300',
        className
      )}
      {...props}
    />
  );
}
