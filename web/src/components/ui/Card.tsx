import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article';
}

/**
 * Surface wrapper: consistent rounded border + white/dark-slate background.
 * Use `className` to add padding, margin, or shadow overrides.
 */
export function Card({ children, className, as: As = 'div' }: CardProps) {
  return (
    <As
      className={cn(
        'rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      {children}
    </As>
  );
}
