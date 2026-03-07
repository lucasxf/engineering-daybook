import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article';
}

/**
 * Surface wrapper using Library at Dusk design tokens.
 * Light: white card with subtle border. Dark: primary-blue card with mid-blue border.
 */
export function Card({ children, className, as: As = 'div' }: CardProps) {
  return (
    <As
      className={cn(
        'rounded-lg border shadow-sm',
        /* Light mode */
        'bg-white border-[#E8E4DF]',
        /* Dark mode */
        'dark:bg-primary-blue dark:border-mid-blue',
        className
      )}
    >
      {children}
    </As>
  );
}
