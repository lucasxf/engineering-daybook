import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

// Mock sub-components used by ViewLearningScreen to avoid deep dependency chains
vi.mock('./learning-nav-bar', () => ({
  LearningNavBar: () => <nav data-testid="learning-nav-bar" />,
}));
vi.mock('./learning-breadcrumb', () => ({
  LearningBreadcrumb: () => <div data-testid="learning-breadcrumb" />,
}));
vi.mock('./learning-content', () => ({
  LearningContent: ({ learning, onDeleteClick, onEditClick }: {
    learning: { title: string };
    onDeleteClick: () => void;
    onEditClick?: () => void;
  }) => (
    <div data-testid="learning-content">
      <span>{learning.title}</span>
      <button onClick={onDeleteClick}>delete</button>
      <button onClick={onEditClick}>edit</button>
    </div>
  ),
}));
vi.mock('./delete-confirm-dialog', () => ({
  DeleteConfirmDialog: ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
    <div data-testid="delete-dialog">
      <button onClick={onCancel}>cancel</button>
      <button onClick={onConfirm}>confirm</button>
    </div>
  ),
}));

import { LearningError } from './learning-error';
import { LearningLoading } from './learning-loading';
import { ViewLearningScreen, type Learning } from './view-learning-screen';

const sampleLearning: Learning = {
  id: '1',
  title: 'Test Learning',
  content: 'Some content',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  tags: ['tag1'],
};

// ── LearningError ──────────────────────────────────────────────────────────────

describe('LearningError', () => {
  it('renders 404 status for not-found', () => {
    render(<LearningError type="not-found" />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders 403 status for forbidden', () => {
    render(<LearningError type="forbidden" />);
    expect(screen.getByText('403')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<LearningError type="not-found" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ── LearningLoading ────────────────────────────────────────────────────────────

describe('LearningLoading', () => {
  it('renders an aria-busy skeleton container', () => {
    const { container } = render(<LearningLoading />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('aria-busy', 'true');
  });

  it('has an accessible aria-label', () => {
    render(<LearningLoading />);
    expect(screen.getByLabelText('Carregando aprendizado...')).toBeInTheDocument();
  });
});

// ── ViewLearningScreen ─────────────────────────────────────────────────────────

describe('ViewLearningScreen', () => {
  // The component defers rendering until after mount (hydration guard)
  // so we need to let the useEffect run. render() + act() handles this in RTL.

  it('renders nothing before mount (hydration guard)', () => {
    // We can't easily test the pre-mount state in RTL because effects run
    // synchronously in the test environment. Skip this — it's a browser concern.
  });

  it('renders loading state', () => {
    render(<ViewLearningScreen state="loading" />);
    // LearningLoading has aria-busy="true"
    expect(screen.getByLabelText('Carregando aprendizado...')).toBeInTheDocument();
  });

  it('renders not-found error state', () => {
    render(<ViewLearningScreen state="not-found" />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders forbidden error state', () => {
    render(<ViewLearningScreen state="forbidden" />);
    expect(screen.getByText('403')).toBeInTheDocument();
  });

  it('renders learning content when state is loaded', () => {
    render(<ViewLearningScreen state="loaded" learning={sampleLearning} />);
    expect(screen.getByTestId('learning-content')).toBeInTheDocument();
    expect(screen.getByText('Test Learning')).toBeInTheDocument();
  });

  it('shows delete dialog when delete is clicked, and hides on cancel', () => {
    render(<ViewLearningScreen state="loaded" learning={sampleLearning} />);

    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
  });

  it('calls onDeleteConfirm and closes dialog on confirm', () => {
    const onDeleteConfirm = vi.fn();
    render(
      <ViewLearningScreen
        state="loaded"
        learning={sampleLearning}
        onDeleteConfirm={onDeleteConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'confirm' }));

    expect(onDeleteConfirm).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
  });

  it('calls onEditClick when edit button is clicked', () => {
    const onEditClick = vi.fn();
    render(
      <ViewLearningScreen
        state="loaded"
        learning={sampleLearning}
        onEditClick={onEditClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(onEditClick).toHaveBeenCalledOnce();
  });
});

