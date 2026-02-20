import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import NewPokPage from '@/app/[locale]/poks/new/page';
import { pokApi } from '@/lib/pokApi';
import { createMockRouter, poksMessages } from '@/test/page-test-utils';

const mockRouter = createMockRouter();

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => mockRouter,
}));

vi.mock('@/lib/pokApi', () => ({
  pokApi: { create: vi.fn() },
  ApiRequestError: class ApiRequestError extends Error {},
}));

vi.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {},
}));

// Stub PokForm so we can control submit without needing full form interaction
vi.mock('@/components/poks/PokForm', () => ({
  PokForm: ({ onSubmit }: { onSubmit: (data: { title: string; content: string }) => void }) => (
    <button
      data-testid="submit-form"
      onClick={() => onSubmit({ title: 'Test title', content: 'Test content' })}
    >
      Submit
    </button>
  ),
}));

const mockCreate = vi.mocked(pokApi.create);

const renderNewPokPage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={poksMessages}>
      <NewPokPage />
    </NextIntlClientProvider>
  );

describe('NewPokPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    renderNewPokPage();
    expect(screen.getByRole('heading', { name: /new learning/i })).toBeInTheDocument();
  });

  it('renders the form', () => {
    renderNewPokPage();
    expect(screen.getByTestId('submit-form')).toBeInTheDocument();
  });

  describe('on successful submit', () => {
    beforeEach(() => {
      mockCreate.mockResolvedValue({
        id: 'new-pok',
        userId: 'user-1',
        title: 'Test title',
        content: 'Test content',
        deletedAt: null,
        createdAt: '2026-02-14T10:00:00Z',
        updatedAt: '2026-02-14T10:00:00Z',
      });
    });

    it('calls pokApi.create with the form data', async () => {
      const user = userEvent.setup();
      renderNewPokPage();
      await user.click(screen.getByTestId('submit-form'));
      await waitFor(() =>
        expect(mockCreate).toHaveBeenCalledWith({
          title: 'Test title',
          content: 'Test content',
        })
      );
    });

    it('redirects to poks list after creation', async () => {
      const user = userEvent.setup();
      renderNewPokPage();
      await user.click(screen.getByTestId('submit-form'));
      await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/en/poks'));
    });
  });

  describe('on API error', () => {
    it('shows an error alert when creation fails', async () => {
      mockCreate.mockRejectedValue(new Error('Server error'));
      const user = userEvent.setup();
      renderNewPokPage();
      await user.click(screen.getByTestId('submit-form'));
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    });

    it('does not redirect on error', async () => {
      mockCreate.mockRejectedValue(new Error('Server error'));
      const user = userEvent.setup();
      renderNewPokPage();
      await user.click(screen.getByTestId('submit-form'));
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
