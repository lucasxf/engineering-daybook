import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import PoksPage from '@/app/[locale]/poks/page';
import { pokApi, type Pok, type PokPage } from '@/lib/pokApi';
import { createMockRouter, poksMessages } from '@/test/page-test-utils';

const mockRouter = createMockRouter();

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/pokApi', () => ({
  pokApi: {
    getAll: vi.fn(),
  },
  ApiRequestError: class ApiRequestError extends Error {},
}));

vi.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {},
}));

const mockGetAll = vi.mocked(pokApi.getAll);

const makePok = (id: string, overrides?: Partial<Pok>): Pok => ({
  id,
  userId: 'user-1',
  title: `Learning ${id}`,
  content: `Content for learning ${id}`,
  deletedAt: null,
  createdAt: '2026-02-14T10:00:00Z',
  updatedAt: '2026-02-14T10:00:00Z',
  ...overrides,
});

const makePage = (poks: Pok[], total = poks.length): PokPage => ({
  content: poks,
  page: 0,
  size: 20,
  totalElements: total,
  totalPages: Math.ceil(total / 20),
  number: 0,
});

const renderPoksPage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={poksMessages}>
      <PoksPage />
    </NextIntlClientProvider>
  );

describe('PoksListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner while fetching', () => {
    // API never resolves during this test
    mockGetAll.mockReturnValue(new Promise(() => {}));
    renderPoksPage();
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
  });

  it('renders the page heading and create button', async () => {
    mockGetAll.mockResolvedValue(makePage([]));
    renderPoksPage();
    await waitFor(() => expect(screen.getByRole('heading', { name: /my learnings/i })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /new learning/i })).toHaveAttribute(
      'href',
      '/en/poks/new'
    );
  });

  it('shows empty state when no learnings exist', async () => {
    mockGetAll.mockResolvedValue(makePage([]));
    renderPoksPage();
    await waitFor(() =>
      expect(screen.getByText(/no learnings yet/i)).toBeInTheDocument()
    );
  });

  it('shows create CTA in empty state', async () => {
    mockGetAll.mockResolvedValue(makePage([]));
    renderPoksPage();
    await waitFor(() => {
      const ctaLink = screen.getByRole('link', { name: /create your first learning/i });
      expect(ctaLink).toHaveAttribute('href', expect.stringContaining('/poks/new'));
    });
  });

  it('renders pok cards when learnings exist', async () => {
    const poks = [makePok('1'), makePok('2')];
    mockGetAll.mockResolvedValue(makePage(poks));
    renderPoksPage();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /learning 1/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /learning 2/i })).toBeInTheDocument();
    });
  });

  it('pok card links navigate to the detail page', async () => {
    const poks = [makePok('abc-123')];
    mockGetAll.mockResolvedValue(makePage(poks));
    renderPoksPage();
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /learning abc-123/i });
      expect(link).toHaveAttribute('href', expect.stringContaining('/poks/abc-123'));
    });
  });

  it('shows an error alert when the API fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));
    renderPoksPage();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
