import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import EditPokPage from '@/app/[locale]/poks/[id]/edit/page';
import { pokApi, type Pok } from '@/lib/pokApi';
import { createMockRouter, poksMessages } from '@/test/page-test-utils';

const mockRouter = createMockRouter();

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en', id: 'pok-456' }),
  useRouter: () => mockRouter,
}));

vi.mock('@/lib/pokApi', () => ({
  pokApi: {
    getById: vi.fn(),
    update: vi.fn(),
  },
  ApiRequestError: class ApiRequestError extends Error {},
}));

vi.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {},
}));

vi.mock('@/components/poks/PokForm', () => ({
  PokForm: ({ onSubmit, initialData }: { onSubmit: (d: { title: string; content: string }) => void; initialData?: { title: string; content: string } }) => (
    <div>
      <span data-testid="initial-title">{initialData?.title}</span>
      <span data-testid="initial-content">{initialData?.content}</span>
      <button
        data-testid="submit-form"
        onClick={() => onSubmit({ title: 'Updated title', content: 'Updated content' })}
      >
        Save
      </button>
    </div>
  ),
}));

const mockGetById = vi.mocked(pokApi.getById);
const mockUpdate = vi.mocked(pokApi.update);

const existingPok: Pok = {
  id: 'pok-456',
  userId: 'user-1',
  title: 'Original title',
  content: 'Original content',
  deletedAt: null,
  createdAt: '2026-02-14T10:00:00Z',
  updatedAt: '2026-02-15T12:00:00Z',
};

const renderEditPage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={poksMessages}>
      <EditPokPage />
    </NextIntlClientProvider>
  );

describe('EditPokPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner initially', () => {
    mockGetById.mockReturnValue(new Promise(() => {}));
    renderEditPage();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  describe('successful load', () => {
    beforeEach(() => {
      mockGetById.mockResolvedValue(existingPok);
    });

    it('renders the edit page heading', async () => {
      renderEditPage();
      await waitFor(() =>
        expect(screen.getByRole('heading', { name: /edit learning/i })).toBeInTheDocument()
      );
    });

    it('pre-populates form with existing pok title', async () => {
      renderEditPage();
      await waitFor(() =>
        expect(screen.getByTestId('initial-title')).toHaveTextContent('Original title')
      );
    });

    it('pre-populates form with existing pok content', async () => {
      renderEditPage();
      await waitFor(() =>
        expect(screen.getByTestId('initial-content')).toHaveTextContent('Original content')
      );
    });

    it('renders a cancel link back to the detail page', async () => {
      renderEditPage();
      await waitFor(() => {
        const cancelLink = screen.getByRole('link', { name: /cancel/i });
        expect(cancelLink).toHaveAttribute('href', '/en/poks/pok-456');
      });
    });
  });

  describe('on successful submit', () => {
    beforeEach(() => {
      mockGetById.mockResolvedValue(existingPok);
      mockUpdate.mockResolvedValue({ ...existingPok, title: 'Updated title', content: 'Updated content' });
    });

    it('calls pokApi.update with form data', async () => {
      const user = userEvent.setup();
      renderEditPage();
      await waitFor(() => screen.getByTestId('submit-form'));
      await user.click(screen.getByTestId('submit-form'));
      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith('pok-456', {
          title: 'Updated title',
          content: 'Updated content',
        })
      );
    });

    it('redirects to the detail page after update', async () => {
      const user = userEvent.setup();
      renderEditPage();
      await waitFor(() => screen.getByTestId('submit-form'));
      await user.click(screen.getByTestId('submit-form'));
      await waitFor(() =>
        expect(mockRouter.push).toHaveBeenCalledWith('/en/poks/pok-456')
      );
    });
  });

  describe('error state', () => {
    it('shows an error alert when fetch fails', async () => {
      mockGetById.mockRejectedValue(new Error('Not found'));
      renderEditPage();
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    });
  });
});
