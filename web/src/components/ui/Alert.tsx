import { cn } from '@/lib/utils';

interface AlertProps {
  variant: 'error' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
  role?: string;
}

/**
 * Styled alert box for error, success, and info messages.
 */
export function Alert({ variant, children, className, role = 'alert' }: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        'rounded-md border p-3 text-sm',
        variant === 'error' &&
          'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
        variant === 'success' &&
          'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
        variant === 'info' &&
          'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
        className
      )}
    >
      {children}
    </div>
  );
}
