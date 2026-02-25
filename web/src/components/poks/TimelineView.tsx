'use client';

import type { Pok } from '@/lib/pokApi';
import { MonthGroup } from './MonthGroup';

interface TimelineViewProps {
  poks: Pok[];
}

/** Key that uniquely identifies a month: "YYYY-MM" */
function monthKey(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Groups learnings by month/year and renders them newest-group-first.
 *
 * Behaviour:
 * - One section per distinct month-year in createdAt (FR2)
 * - Newest group first (FR2); within each group, order reflects the
 *   sort applied by the API caller (FR3)
 * - Month headers use Intl.DateTimeFormat locale-aware formatting (NFR10)
 *
 * Client-side grouping. Caller is responsible for fetching poks with
 * size=1000 (NFR1).
 */
export function TimelineView({ poks }: TimelineViewProps) {
  if (poks.length === 0) {
    return null;
  }

  // Build an ordered map: monthKey → { representative date, poks[] }
  // poks are assumed to arrive in the API's sort order; we maintain that
  // relative order within each group.
  const monthMap = new Map<string, { date: string; poks: Pok[] }>();

  for (const pok of poks) {
    const key = monthKey(pok.createdAt);
    if (!monthMap.has(key)) {
      monthMap.set(key, { date: pok.createdAt, poks: [] });
    }
    monthMap.get(key)!.poks.push(pok);
  }

  // Sort months newest-first
  const sortedMonths = Array.from(monthMap.entries()).sort(
    ([a], [b]) => b.localeCompare(a) // "2026-02" > "2026-01"
  );

  return (
    <div>
      {sortedMonths.map(([key, { date, poks: monthPoks }]) => (
        <MonthGroup key={key} monthDate={date} poks={monthPoks} />
      ))}
    </div>
  );
}
