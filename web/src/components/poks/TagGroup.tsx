'use client';

import type { Pok } from '@/lib/pokApi';
import { PokCard } from './PokCard';

interface TagGroupProps {
  /** Display label for this section's <h2> heading. */
  label: string;
  poks: Pok[];
}

/**
 * A single tag section within the tag-grouped view.
 *
 * Renders an accessible <h2> heading (NFR5) followed by a list of PokCard
 * components for every learning that carries this tag.
 */
export function TagGroup({ label, poks }: TagGroupProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{label}</h2>
      <div className="flex flex-col gap-3">
        {poks.map((pok) => (
          <PokCard key={pok.id} pok={pok} />
        ))}
      </div>
    </section>
  );
}
