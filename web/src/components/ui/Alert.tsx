import { cn } from '@/lib/utils';

interface AlertProps {
  variant: 'error' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
  role?: string;
}

/**
 * Styled alert box for error, success, and info messages.
 * Uses Library at Dusk design system tokens.
 */
export function Alert({ variant, children, className, role = 'alert' }: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        'rounded-md border p-3 text-sm',
        variant === 'error' &&
          'border-destructive/30 bg-destructive/10 text-destructive',
        variant === 'success' &&
          'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
        variant === 'info' &&
          'border-border bg-muted text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}
