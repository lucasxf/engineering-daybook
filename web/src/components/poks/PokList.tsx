'use client';

import type { FeedItem, Pok } from '@/lib/pokApi';
import { PokCard } from './PokCard';
import { ReLearningCard } from './ReLearningCard';

interface PokListProps {
  poks: FeedItem[];
  /** When provided, each PUBLIC PokCard will show a Re-learn button. */
  onSharePok?: (pok: Pok) => void;
}

/**
 * List component for displaying POKs in a single-column vertical layout.
 *
 * Renders owned POKs as PokCard components and re-learnings as ReLearningCard
 * components, in LIFO chronological order (caller is responsible for ordering).
 * Empty state handling is the responsibility of the parent page.
 *
 * @param poks       array of feed items (owned POKs and/or re-learnings) to display
 * @param onSharePok optional callback invoked with the pok when Re-learn is clicked
 */
export function PokList({ poks, onSharePok }: PokListProps) {
  return (
    <div className="flex flex-col gap-4">
      {poks.map((item) =>
        'originalPokId' in item ? (
          <ReLearningCard key={item.id} share={item} isOwner={true} />
        ) : (
          <PokCard
            key={item.id}
            pok={item}
            onShare={onSharePok ? () => onSharePok(item) : undefined}
          />
        )
      )}
    </div>
  );
}
