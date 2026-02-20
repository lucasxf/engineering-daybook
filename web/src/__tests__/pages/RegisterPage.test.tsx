import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import RegisterPage from '@/app/[locale]/register/page';
import { createMockAuth, createMockRouter, authMessages } from '@/test/page-test-utils';

vi.mock('@/components/auth/RegisterForm', () => ({
  RegisterForm: () => <form data-testid="register-form" />,
}));

vi.mock('next/dynamic', () => ({
  default: () => () => <button data-testid="google-register-btn">Google</button>,
}));

let mockAuth = createMockAuth();
const mockRouter = createMockRouter();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => mockRouter,
}));

const renderRegisterPage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={authMessages}>
      <RegisterPage />
    </NextIntlClientProvider>
  );

describe('RegisterPage', () => {
  beforeEach(() => {
    mockAuth = createMockAuth();
    vi.clearAllMocks();
  });

  describe('unauthenticated user', () => {
    it('renders the register page heading', () => {
      renderRegisterPage();
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });

    it('renders the registration form', () => {
      renderRegisterPage();
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
    });

    it('renders a link to the login page', () => {
      renderRegisterPage();
      const loginLink = screen.getByRole('link', { name: /log in/i });
      expect(loginLink).toHaveAttribute('href', '/en/login');
    });

    it('does not redirect', () => {
      renderRegisterPage();
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

    it('redirects to home — prevents the "Começar" loop', () => {
      renderRegisterPage();
      expect(mockRouter.replace).toHaveBeenCalledWith('/en');
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockAuth = createMockAuth({ isLoading: true });
    });

    it('does not redirect while auth is loading', () => {
      renderRegisterPage();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });
});
