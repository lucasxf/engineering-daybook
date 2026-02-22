'use client';

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
 * - Single-column vertical layout (LIFO chronological reading)
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
    <div className="flex flex-col gap-4">
      {poks.map((pok) => (
        <PokCard key={pok.id} pok={pok} />
      ))}
    </div>
  );
}
