import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article';
}

/**
 * Surface wrapper using Library at Dusk design tokens.
 * Provides consistent rounded border + card background.
 */
export function Card({ children, className, as: As = 'div' }: CardProps) {
  return (
    <As
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground',
        className
      )}
    >
      {children}
    </As>
  );
}
