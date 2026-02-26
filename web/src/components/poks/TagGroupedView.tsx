'use client';

import { useTranslations } from 'next-intl';
import type { Pok } from '@/lib/pokApi';
import { TagGroup } from './TagGroup';

interface TagGroupedViewProps {
  poks: Pok[];
}

/**
 * Groups learnings by tag and renders one section per tag.
 *
 * Behaviour:
 * - Sections ordered alphabetically by tag name (FR11)
 * - A learning with multiple tags appears in each of its tag sections (FR12)
 * - Learnings with no tags appear in an "Untagged" section at the bottom (FR13)
 * - If all learnings are untagged, a nudge to add tags is shown (FR14)
 *
 * Client-side grouping. Caller is responsible for fetching poks with
 * size=1000 so that all learnings are available for grouping (NFR1).
 */
export function TagGroupedView({ poks }: TagGroupedViewProps) {
  const t = useTranslations('poks.tagGroups');

  if (poks.length === 0) {
    return null;
  }

  // Build a map of tagName → Pok[]
  const tagMap = new Map<string, Pok[]>();
  const untagged: Pok[] = [];

  for (const pok of poks) {
    if (!pok.tags || pok.tags.length === 0) {
      untagged.push(pok);
    } else {
      for (const tag of pok.tags) {
        if (!tagMap.has(tag.name)) {
          tagMap.set(tag.name, []);
        }
        tagMap.get(tag.name)!.push(pok);
      }
    }
  }

  // Sort tag sections alphabetically
  const sortedEntries = Array.from(tagMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  const allUntagged = tagMap.size === 0 && untagged.length > 0;

  return (
    <div>
      {sortedEntries.map(([tagName, tagPoks]) => (
        <TagGroup key={tagName} label={tagName} poks={tagPoks} />
      ))}

      {untagged.length > 0 && (
        <TagGroup label={t('untagged')} poks={untagged} />
      )}

      {allUntagged && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('nudge')}</p>
      )}
    </div>
  );
}
