import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockUsePathname, mockUseSearchParams } = vi.hoisted(() => ({
  mockUsePathname: vi.fn().mockReturnValue('/en/poks'),
  mockUseSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  usePathname: mockUsePathname,
  useSearchParams: mockUseSearchParams,
}));

// Render Link as a plain <a> so we can inspect href
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

import { ViewSwitcher } from '@/components/poks/ViewSwitcher';

function renderViewSwitcher() {
  return render(<ViewSwitcher />);
}

describe('ViewSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/en/poks');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  // ─── Structure ─────────────────────────────────────────────────────────────

  it('renders a tablist container', () => {
    renderViewSwitcher();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders three tab options', () => {
    renderViewSwitcher();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('tab labels are Feed, Tags, Timeline', () => {
    renderViewSwitcher();
    expect(screen.getByRole('tab', { name: /feed/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tags/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /timeline/i })).toBeInTheDocument();
  });

  // ─── Active state ──────────────────────────────────────────────────────────

  it('Feed tab is selected on the feed route', () => {
    mockUsePathname.mockReturnValue('/en/poks');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    renderViewSwitcher();

    const feedTab = screen.getByRole('tab', { name: /feed/i });
    expect(feedTab).toHaveAttribute('aria-selected', 'true');
  });

  it('Tags tab is selected when view=tags', () => {
    mockUsePathname.mockReturnValue('/en/poks');
    mockUseSearchParams.mockReturnValue(new URLSearchParams('view=tags'));
    renderViewSwitcher();

    const tagsTab = screen.getByRole('tab', { name: /tags/i });
    expect(tagsTab).toHaveAttribute('aria-selected', 'true');

    const feedTab = screen.getByRole('tab', { name: /feed/i });
    expect(feedTab).toHaveAttribute('aria-selected', 'false');
  });

  it('Timeline tab is selected on the timeline route', () => {
    mockUsePathname.mockReturnValue('/en/poks/timeline');
    renderViewSwitcher();

    const timelineTab = screen.getByRole('tab', { name: /timeline/i });
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');

    const feedTab = screen.getByRole('tab', { name: /feed/i });
    expect(feedTab).toHaveAttribute('aria-selected', 'false');
  });

  // ─── Href construction ─────────────────────────────────────────────────────

  it('Feed tab href is /en/poks (no view param)', () => {
    renderViewSwitcher();
    const feedTab = screen.getByRole('tab', { name: /feed/i });
    const href = feedTab.getAttribute('href') ?? '';
    expect(href).toMatch(/^\/en\/poks(\?|$)/);
    expect(href).not.toContain('view=');
  });

  it('Tags tab href is /en/poks?view=tags', () => {
    renderViewSwitcher();
    const tagsTab = screen.getByRole('tab', { name: /tags/i });
    const href = tagsTab.getAttribute('href') ?? '';
    expect(href).toContain('/en/poks');
    expect(href).toContain('view=tags');
    expect(href).not.toContain('/timeline');
  });

  it('Timeline tab href is /en/poks/timeline', () => {
    renderViewSwitcher();
    const timelineTab = screen.getByRole('tab', { name: /timeline/i });
    const href = timelineTab.getAttribute('href') ?? '';
    expect(href).toContain('/en/poks/timeline');
  });

  // ─── State preservation ────────────────────────────────────────────────────

  it('carries keyword in all tab hrefs', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('keyword=react'));
    renderViewSwitcher();

    const tabs = screen.getAllByRole('tab');
    for (const tab of tabs) {
      expect(tab.getAttribute('href')).toContain('keyword=react');
    }
  });

  it('carries non-default sort in all tab hrefs', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('sortBy=updatedAt&sortDirection=DESC')
    );
    renderViewSwitcher();

    const tabs = screen.getAllByRole('tab');
    for (const tab of tabs) {
      const href = tab.getAttribute('href') ?? '';
      expect(href).toContain('sortBy=updatedAt');
      expect(href).toContain('sortDirection=DESC');
    }
  });

  it('omits sort params from hrefs when using default (createdAt DESC)', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('sortBy=createdAt&sortDirection=DESC')
    );
    renderViewSwitcher();

    const tabs = screen.getAllByRole('tab');
    for (const tab of tabs) {
      const href = tab.getAttribute('href') ?? '';
      expect(href).not.toContain('sortBy=');
      expect(href).not.toContain('sortDirection=');
    }
  });
});
