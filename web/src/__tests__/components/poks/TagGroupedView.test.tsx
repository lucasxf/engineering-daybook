import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Pok } from '@/lib/pokApi';

// Mock PokCard to isolate grouping logic from card rendering
vi.mock('@/components/poks/PokCard', () => ({
  PokCard: ({ pok }: { pok: Pok }) => (
    <div data-testid={`pok-card-${pok.id}`}>{pok.title}</div>
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

import { TagGroupedView } from '@/components/poks/TagGroupedView';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makePok(id: string, title: string, tagNames: string[]): Pok {
  return {
    id,
    userId: 'u1',
    title,
    content: 'content',
    deletedAt: null,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    pendingSuggestions: [],
    tags: tagNames.map((name, i) => ({
      id: `tag-${name}-${i}`,
      name,
      userId: 'u1',
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-01T10:00:00Z',
    })),
  };
}

const POK_REACT = makePok('1', 'React Hooks', ['React']);
const POK_ARCH = makePok('2', 'Clean Architecture', ['Architecture']);
const POK_MULTI = makePok('3', 'Testing Patterns', ['React', 'Testing']);
const POK_UNTAGGED = makePok('4', 'Quick note', []);

describe('TagGroupedView', () => {
  // ─── Section rendering ───────────────────────────────────────────────────

  it('renders one section per unique tag', () => {
    render(<TagGroupedView poks={[POK_REACT, POK_ARCH]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    const labels = headings.map((h) => h.textContent);
    expect(labels).toContain('React');
    expect(labels).toContain('Architecture');
    expect(headings).toHaveLength(2);
  });

  it('tag sections are alphabetically ordered', () => {
    render(<TagGroupedView poks={[POK_REACT, POK_ARCH]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0].textContent).toBe('Architecture');
    expect(headings[1].textContent).toBe('React');
  });

  it('renders pok cards inside the correct tag section', () => {
    render(<TagGroupedView poks={[POK_REACT, POK_ARCH]} />);

    expect(screen.getByTestId('pok-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('pok-card-2')).toBeInTheDocument();
  });

  // ─── Multi-tag poks ──────────────────────────────────────────────────────

  it('multi-tagged pok appears in each relevant section', () => {
    render(<TagGroupedView poks={[POK_MULTI]} />);

    // Should appear in both React and Testing sections
    const allCards = screen.getAllByTestId('pok-card-3');
    expect(allCards).toHaveLength(2);
  });

  it('multi-tag sections are alphabetically ordered', () => {
    render(<TagGroupedView poks={[POK_MULTI]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0].textContent).toBe('React');
    expect(headings[1].textContent).toBe('Testing');
  });

  // ─── Untagged section ────────────────────────────────────────────────────

  it('renders an Untagged section for poks with no tags', () => {
    render(<TagGroupedView poks={[POK_REACT, POK_UNTAGGED]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    const labels = headings.map((h) => h.textContent);
    expect(labels.some((l) => l?.toLowerCase().includes('untagged') || l?.includes('poks.tagGroups'))).toBe(true);
  });

  it('Untagged section appears after tagged sections', () => {
    render(<TagGroupedView poks={[POK_REACT, POK_UNTAGGED]} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    const lastHeading = headings[headings.length - 1].textContent ?? '';
    // The last section should NOT be React (which is alphabetically first)
    expect(lastHeading).not.toBe('React');
  });

  it('untagged pok appears in the Untagged section', () => {
    render(<TagGroupedView poks={[POK_REACT, POK_UNTAGGED]} />);

    expect(screen.getByTestId('pok-card-4')).toBeInTheDocument();
  });

  // ─── All-untagged nudge ──────────────────────────────────────────────────

  it('shows nudge when all poks are untagged', () => {
    render(<TagGroupedView poks={[POK_UNTAGGED]} />);

    // nudge text should be visible (i18n key includes "nudge")
    expect(screen.getByText(/nudge/i)).toBeInTheDocument();
  });

  it('does not show nudge when some poks have tags', () => {
    render(<TagGroupedView poks={[POK_REACT, POK_UNTAGGED]} />);

    expect(screen.queryByText(/nudge/i)).not.toBeInTheDocument();
  });

  // ─── Empty list ──────────────────────────────────────────────────────────

  it('renders nothing when poks list is empty', () => {
    const { container } = render(<TagGroupedView poks={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
