'use client';

import { Pok } from '@/lib/pokApi';
import { PokCard } from './PokCard';

interface PokListProps {
  poks: Pok[];
}

/**
 * List component for displaying POKs in a single-column vertical layout.
 *
 * Renders POKs as PokCard components in LIFO chronological order.
 * Empty state handling is the responsibility of the parent page.
 *
 * @param poks array of POKs to display
 */
export function PokList({ poks }: PokListProps) {
  return (
    <div className="flex flex-col gap-4">
      {poks.map((pok) => (
        <PokCard key={pok.id} pok={pok} />
      ))}
    </div>
  );
}
