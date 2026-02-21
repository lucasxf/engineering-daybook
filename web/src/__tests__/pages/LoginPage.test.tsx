import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LoginPage from '@/app/[locale]/login/page';
import { createMockAuth, createMockRouter, authMessages } from '@/test/page-test-utils';

// Stub out the heavy auth form components — their behavior is tested independently
vi.mock('@/components/auth/LoginForm', () => ({
  LoginForm: () => <form data-testid="login-form" />,
}));

// Stub out dynamically imported GoogleLoginButton
vi.mock('next/dynamic', () => ({
  default: () => () => <button data-testid="google-login-btn">Google</button>,
}));

let mockAuth = createMockAuth();
const mockRouter = createMockRouter();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

const renderLoginPage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={authMessages}>
      <LoginPage />
    </NextIntlClientProvider>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    mockAuth = createMockAuth();
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
  });

  describe('unauthenticated user', () => {
    it('renders the login page heading', () => {
      renderLoginPage();
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    it('renders the login form', () => {
      renderLoginPage();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('renders a link to the register page', () => {
      renderLoginPage();
      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toHaveAttribute('href', '/en/register');
    });

    it('does not redirect', () => {
      renderLoginPage();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      mockAuth = createMockAuth({
        isAuthenticated: true,
        user: { userId: 'u1', email: 'test@example.com', handle: 'testuser' },
      });
    });

    it('redirects to feed', () => {
      renderLoginPage();
      expect(mockRouter.replace).toHaveBeenCalledWith('/en/poks');
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockAuth = createMockAuth({ isLoading: true });
    });

    it('does not redirect while auth is loading', () => {
      renderLoginPage();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });
});
