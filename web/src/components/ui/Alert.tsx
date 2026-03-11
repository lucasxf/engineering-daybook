import { cn } from '@/lib/utils';

interface AlertProps {
  variant: 'error' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
  role?: string;
}

/**
 * Styled alert box using Library at Dusk design tokens.
 */
export function Alert({ variant, children, className, role = 'alert' }: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        'rounded-md border p-3 text-sm',
        /* Error: red/alert styling per spec */
        variant === 'error' &&
          'border-[#F5C6C6] bg-[#FFF0F0] text-[#C0392B] dark:border-[#5A2A2A] dark:bg-[#2D1A1A] dark:text-[#FF8A8A]',
        /* Success: green variant */
        variant === 'success' &&
          'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
        /* Info: muted styling */
        variant === 'info' &&
          'border-card-border bg-card text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}
