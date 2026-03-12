/**
 * Tests for individual view-learning components (not the screen container).
 * These are separate from view-learning.test.tsx because the screen test mocks
 * these sub-components, and vi.mock is module-scoped.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ locale: 'en' }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock UI primitives used by LearningNavBar
vi.mock('@/components/ui/LogoLink', () => ({
  LogoLink: () => <a data-testid="logo-link" href="/" />,
}));
vi.mock('@/components/ui/Avatar', () => ({
  Avatar: ({ displayName }: { displayName: string }) => (
    <span data-testid="avatar">{displayName}</span>
  ),
}));

// Mock LearningMarkdown for LearningContent tests
vi.mock('./learning-markdown', () => ({
  LearningMarkdown: ({ content }: { content: string }) => (
    <div data-testid="learning-markdown">{content}</div>
  ),
}));

import { LearningBreadcrumb } from './learning-breadcrumb';
import { LearningNavBar } from './learning-nav-bar';
import { LearningContent } from './learning-content';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

// ── LearningBreadcrumb ─────────────────────────────────────────────────────────

describe('LearningBreadcrumb', () => {
  it('renders a navigation landmark', () => {
    render(<LearningBreadcrumb />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders a back link', () => {
    render(<LearningBreadcrumb />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});

// ── LearningNavBar ─────────────────────────────────────────────────────────────

describe('LearningNavBar', () => {
  it('renders the logo link', () => {
    render(<LearningNavBar />);
    expect(screen.getByTestId('logo-link')).toBeInTheDocument();
  });

  it('renders the user avatar button', () => {
    render(<LearningNavBar />);
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });
});

// ── LearningContent ────────────────────────────────────────────────────────────

describe('LearningContent', () => {
  const baseLearning = {
    id: '1',
    title: 'My Learning Title',
    content: 'Some learning content',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    tags: [],
  };

  it('renders the title when provided', () => {
    render(<LearningContent learning={baseLearning} onDeleteClick={vi.fn()} />);
    expect(screen.getByText('My Learning Title')).toBeInTheDocument();
  });

  it('derives title from content when title is empty', () => {
    render(
      <LearningContent
        learning={{ ...baseLearning, title: '', content: 'Content as fallback title' }}
        onDeleteClick={vi.fn()}
      />
    );
    expect(screen.getAllByText('Content as fallback title').length).toBeGreaterThan(0);
  });

  it('calls onDeleteClick when delete button is clicked', () => {
    const onDeleteClick = vi.fn();
    render(<LearningContent learning={baseLearning} onDeleteClick={onDeleteClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'delete.button' }));
    expect(onDeleteClick).toHaveBeenCalledOnce();
  });

  it('renders tags when present', () => {
    render(
      <LearningContent
        learning={{ ...baseLearning, tags: ['react', 'typescript'] }}
        onDeleteClick={vi.fn()}
      />
    );
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('renders the markdown content area', () => {
    render(<LearningContent learning={baseLearning} onDeleteClick={vi.fn()} />);
    expect(screen.getByTestId('learning-markdown')).toBeInTheDocument();
  });
});

// ── DeleteConfirmDialog ────────────────────────────────────────────────────────

describe('DeleteConfirmDialog', () => {
  it('renders the dialog', () => {
    render(<DeleteConfirmDialog onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmDialog onCancel={vi.fn()} onConfirm={onConfirm} />);
    const buttons = screen.getAllByRole('button');
    const confirmBtn = buttons[buttons.length - 1];
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Escape key is pressed', () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmDialog onCancel={onCancel} onConfirm={vi.fn()} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

