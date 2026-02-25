import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Pok } from '@/lib/pokApi';

// Mock PokCard to isolate grouping logic
vi.mock('@/components/poks/PokCard', () => ({
  PokCard: ({ pok }: { pok: Pok }) => (
    <div data-testid={`pok-card-${pok.id}`}>{pok.title}</div>
  ),
}));

// Mock useParams so MonthGroup can format locale-aware dates
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

import { TimelineView } from '@/components/poks/TimelineView';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePok(id: string, createdAt: string): Pok {
  return {
    id,
    userId: 'u1',
    title: `Learning ${id}`,
    content: 'content',
    deletedAt: null,
    createdAt,
    updatedAt: createdAt,
    pendingSuggestions: [],
    tags: [],
  };
}

// February 2026
const POK_FEB_A = makePok('1', '2026-02-15T10:00:00Z');
const POK_FEB_B = makePok('2', '2026-02-01T10:00:00Z');
// January 2026
const POK_JAN = makePok('3', '2026-01-20T10:00:00Z');
// March 2025
const POK_MAR_2025 = makePok('4', '2025-03-10T10:00:00Z');

describe('TimelineView', () => {
  // ─── Group rendering ─────────────────────────────────────────────────────

  it('renders one section per unique month-year', () => {
    render(<TimelineView poks={[POK_FEB_A, POK_JAN]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(2);
  });

  it('renders pok cards within each month group', () => {
    render(<TimelineView poks={[POK_FEB_A, POK_JAN]} />);

    expect(screen.getByTestId('pok-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('pok-card-3')).toBeInTheDocument();
  });

  it('poks from the same month appear in the same group', () => {
    render(<TimelineView poks={[POK_FEB_A, POK_FEB_B, POK_JAN]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(2); // Feb and Jan, not three groups
  });

  // ─── Group ordering ──────────────────────────────────────────────────────

  it('newest month group appears first', () => {
    render(<TimelineView poks={[POK_FEB_A, POK_JAN, POK_MAR_2025]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    // Feb 2026 > Jan 2026 > Mar 2025
    const firstHeading = headings[0].textContent ?? '';
    expect(firstHeading).toContain('2026');
    // The oldest month should be last
    const lastHeading = headings[headings.length - 1].textContent ?? '';
    expect(lastHeading).toContain('2025');
  });

  it('February 2026 comes before January 2026', () => {
    render(<TimelineView poks={[POK_FEB_A, POK_JAN]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    // Headings ordered newest-first; first should be Feb 2026
    const firstHeading = headings[0].textContent ?? '';
    // "February" appears in the first heading (en locale)
    expect(firstHeading.toLowerCase()).toContain('february');
  });

  // ─── Locale-aware headers ────────────────────────────────────────────────

  it('renders month-year labels using Intl.DateTimeFormat', () => {
    render(<TimelineView poks={[POK_FEB_A]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    const label = headings[0].textContent ?? '';
    // Should include the year
    expect(label).toContain('2026');
  });

  // ─── Empty ───────────────────────────────────────────────────────────────

  it('renders nothing when poks list is empty', () => {
    const { container } = render(<TimelineView poks={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
