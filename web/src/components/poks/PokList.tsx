'use client';

import { Pok } from '@/lib/pokApi';
import { PokCard } from './PokCard';

interface PokListProps {
  poks: Pok[];
  /** When provided, each PUBLIC PokCard will show a Re-learn button. */
  onSharePok?: (pok: Pok) => void;
}

/**
 * List component for displaying POKs in a single-column vertical layout.
 *
 * Renders POKs as PokCard components in LIFO chronological order.
 * Empty state handling is the responsibility of the parent page.
 *
 * @param poks array of POKs to display
 * @param onSharePok optional callback invoked with the pok when Re-learn is clicked
 */
export function PokList({ poks, onSharePok }: PokListProps) {
  return (
    <div className="flex flex-col gap-4">
      {poks.map((pok) => (
        <PokCard
          key={pok.id}
          pok={pok}
          onShare={onSharePok ? () => onSharePok(pok) : undefined}
        />
      ))}
    </div>
  );
}
