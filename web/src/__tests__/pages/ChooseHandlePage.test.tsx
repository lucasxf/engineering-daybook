import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ChooseHandlePage from '@/app/[locale]/choose-handle/page';
import { createMockAuth, createMockRouter, authMessages } from '@/test/page-test-utils';

vi.mock('@/components/auth/ChooseHandleForm', () => ({
  ChooseHandleForm: ({ tempToken }: { tempToken: string }) => (
    <form data-testid="choose-handle-form" data-token={tempToken} />
  ),
}));

let mockAuth = createMockAuth();
const mockRouter = createMockRouter();
let mockSearchParams = new URLSearchParams();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

const renderChooseHandlePage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={authMessages}>
      <ChooseHandlePage />
    </NextIntlClientProvider>
  );

describe('ChooseHandlePage', () => {
  beforeEach(() => {
    mockAuth = createMockAuth();
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
  });

  describe('unauthenticated user with temp token', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams({ t: 'some-temp-token' });
    });

    it('renders the choose handle heading', () => {
      renderChooseHandlePage();
      expect(screen.getByRole('heading', { name: /choose your handle/i })).toBeInTheDocument();
    });

    it('renders the handle form', () => {
      renderChooseHandlePage();
      expect(screen.getByTestId('choose-handle-form')).toBeInTheDocument();
    });

    it('passes the decoded temp token to the form', () => {
      mockSearchParams = new URLSearchParams({ t: 'my-temp-token' });
      renderChooseHandlePage();
      expect(screen.getByTestId('choose-handle-form')).toHaveAttribute(
        'data-token',
        'my-temp-token'
      );
    });

    it('does not redirect', () => {
      renderChooseHandlePage();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated user without temp token', () => {
    it('redirects to login', () => {
      renderChooseHandlePage();
      expect(mockRouter.replace).toHaveBeenCalledWith('/en/login');
    });

    it('renders nothing visible', () => {
      renderChooseHandlePage();
      expect(screen.queryByTestId('choose-handle-form')).not.toBeInTheDocument();
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      mockAuth = createMockAuth({
        isAuthenticated: true,
        user: { userId: 'u1', email: 'test@example.com', handle: 'testuser' },
      });
      mockSearchParams = new URLSearchParams({ t: 'some-temp-token' });
    });

    it('redirects to feed', () => {
      renderChooseHandlePage();
      expect(mockRouter.replace).toHaveBeenCalledWith('/en/poks');
    });

    it('renders nothing visible', () => {
      renderChooseHandlePage();
      expect(screen.queryByTestId('choose-handle-form')).not.toBeInTheDocument();
    });
  });

  describe('loading state with temp token', () => {
    beforeEach(() => {
      mockAuth = createMockAuth({ isLoading: true });
      mockSearchParams = new URLSearchParams({ t: 'some-temp-token' });
    });

    it('renders the handle form while auth resolves', () => {
      renderChooseHandlePage();
      expect(screen.getByTestId('choose-handle-form')).toBeInTheDocument();
    });

    it('does not redirect while loading', () => {
      renderChooseHandlePage();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });
});
