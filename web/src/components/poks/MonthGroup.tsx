'use client';

import { useParams } from 'next/navigation';
import type { Pok } from '@/lib/pokApi';
import { PokCard } from './PokCard';

interface MonthGroupProps {
  /** ISO date string for any day within the target month (used to format the header). */
  monthDate: string;
  poks: Pok[];
}

/**
 * A single month section within the timeline view.
 *
 * Renders a locale-aware "Month Year" <h2> heading (NFR4, NFR10) followed by
 * a list of PokCard components for every learning captured that month.
 */
export function MonthGroup({ monthDate, poks }: MonthGroupProps) {
  const params = useParams<{ locale: string }>();

  // timeZone: 'UTC' keeps the header consistent with the UTC-based bucket keys
  // in TimelineView.monthKey() — without this, timestamps near month boundaries
  // (e.g. 2026-02-01T00:30:00Z in UTC-8) would group into February but render
  // a "January" header.
  const label = new Intl.DateTimeFormat(params.locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(monthDate));

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold capitalize text-gray-900 dark:text-gray-100">
        {label}
      </h2>
      <div className="flex flex-col gap-3">
        {poks.map((pok) => (
          <PokCard key={pok.id} pok={pok} dateField="createdAt" />
        ))}
      </div>
    </section>
  );
}
