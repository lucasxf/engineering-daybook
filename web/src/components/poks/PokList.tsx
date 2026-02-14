import { Pok } from '@/lib/pokApi';
import { PokCard } from './PokCard';
import { EmptyState } from './EmptyState';

interface PokListProps {
  poks: Pok[];
}

/**
 * List component for displaying POKs in a responsive grid layout.
 *
 * Features:
 * - Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Maps POKs to PokCard components
 * - Shows EmptyState when no POKs
 *
 * @param poks array of POKs to display
 */
export function PokList({ poks }: PokListProps) {
  if (poks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {poks.map((pok) => (
        <PokCard key={pok.id} pok={pok} />
      ))}
    </div>
  );
}
