import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import ViewPokPage from '@/app/[locale]/poks/[id]/page';
import { pokApi, type Pok } from '@/lib/pokApi';
import { createMockRouter, poksMessages } from '@/test/page-test-utils';

const mockRouter = createMockRouter();

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en', id: 'pok-123' }),
  useRouter: () => mockRouter,
}));

vi.mock('@/lib/pokApi', () => ({
  pokApi: {
    getById: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
  ApiRequestError: class ApiRequestError extends Error {},
}));

vi.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {},
}));

vi.mock('@/components/ui/Toast', () => ({
  Toast: ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
    <div role="status">
      {message}
      <button data-testid="toast-dismiss" onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}));

vi.mock('@/components/poks/DeletePokButton', () => ({
  DeletePokButton: ({ onDelete }: { onDelete: () => void }) => (
    <button data-testid="delete-btn" onClick={onDelete}>
      Delete
    </button>
  ),
}));

const mockGetById = vi.mocked(pokApi.getById);
const mockDelete = vi.mocked(pokApi.delete);

const mockPok: Pok = {
  id: 'pok-123',
  userId: 'user-1',
  title: 'My Test Learning',
  content: 'Some useful content I learned today.',
  deletedAt: null,
  createdAt: '2026-02-14T10:00:00Z',
  updatedAt: '2026-02-15T12:00:00Z',
};

const renderViewPage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={poksMessages}>
      <ViewPokPage />
    </NextIntlClientProvider>
  );

describe('ViewPokPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner initially', () => {
    mockGetById.mockReturnValue(new Promise(() => {}));
    renderViewPage();
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  describe('successful load', () => {
    beforeEach(() => {
      mockGetById.mockResolvedValue(mockPok);
    });

    it('renders the pok title', async () => {
      renderViewPage();
      await waitFor(() =>
        expect(screen.getByRole('heading', { name: /my test learning/i })).toBeInTheDocument()
      );
    });

    it('renders the pok content', async () => {
      renderViewPage();
      await waitFor(() =>
        expect(screen.getByText(/some useful content/i)).toBeInTheDocument()
      );
    });

    it('renders a back link to the poks list', async () => {
      renderViewPage();
      await waitFor(() => {
        const backLinks = screen.getAllByRole('link', { name: /back to list/i });
        expect(backLinks[0]).toHaveAttribute('href', '/en/poks');
      });
    });

    it('renders an edit link to the edit page', async () => {
      renderViewPage();
      await waitFor(() => {
        const editLink = screen.getByRole('link', { name: /edit/i });
        expect(editLink).toHaveAttribute('href', '/en/poks/pok-123/edit');
      });
    });

    it('renders the delete button', async () => {
      renderViewPage();
      await waitFor(() =>
        expect(screen.getByTestId('delete-btn')).toBeInTheDocument()
      );
    });

    describe('on delete', () => {
      beforeEach(() => {
        mockDelete.mockResolvedValue(undefined);
      });

      it('shows a success toast after delete', async () => {
        const user = userEvent.setup();
        renderViewPage();
        await waitFor(() => screen.getByTestId('delete-btn'));
        await user.click(screen.getByTestId('delete-btn'));
        await waitFor(() =>
          expect(screen.getByRole('status')).toHaveTextContent('Learning deleted successfully')
        );
      });

      it('redirects to the poks list when the toast is dismissed', async () => {
        const user = userEvent.setup();
        renderViewPage();
        await waitFor(() => screen.getByTestId('delete-btn'));
        await user.click(screen.getByTestId('delete-btn'));
        await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
        await user.click(screen.getByTestId('toast-dismiss'));
        await waitFor(() =>
          expect(mockRouter.push).toHaveBeenCalledWith('/en/poks')
        );
      });
    });
  });

  describe('pok without a title', () => {
    it('does not render an h1 heading', async () => {
      mockGetById.mockResolvedValue({ ...mockPok, title: null });
      renderViewPage();
      await waitFor(() => expect(screen.getByText(/some useful content/i)).toBeInTheDocument());
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows an error alert when the API fails', async () => {
      mockGetById.mockRejectedValue(new Error('Not found'));
      renderViewPage();
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    });

    it('shows a back link even in the error state', async () => {
      mockGetById.mockRejectedValue(new Error('Not found'));
      renderViewPage();
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /back to list/i })).toHaveAttribute(
          'href',
          '/en/poks'
        );
      });
    });
  });
});
