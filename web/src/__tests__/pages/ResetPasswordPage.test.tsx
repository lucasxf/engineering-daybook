import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ResetPasswordPage from '@/app/[locale]/reset-password/page';
import { authMessages } from '@/test/page-test-utils';

vi.mock('@/components/auth/ResetPasswordForm', () => ({
  ResetPasswordForm: ({ token }: { token: string }) => (
    <form data-testid="reset-password-form" data-token={token} />
  ),
}));

vi.mock('@/lib/auth', () => ({
  validatePasswordResetTokenApi: vi.fn(),
}));

let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useSearchParams: () => mockSearchParams,
}));

import { validatePasswordResetTokenApi } from '@/lib/auth';

const renderPage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={authMessages}>
      <ResetPasswordPage />
    </NextIntlClientProvider>
  );

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
  });

  describe('valid token', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams({ token: 'valid-token-abc' });
      vi.mocked(validatePasswordResetTokenApi).mockResolvedValue({ valid: 'true' });
    });

    it('renders the reset password form after token validation', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
      });
    });

    it('passes the token to the form', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByTestId('reset-password-form')).toHaveAttribute(
          'data-token',
          'valid-token-abc'
        );
      });
    });

    it('renders the wordmark link to home', async () => {
      renderPage();
      await waitFor(() => {
        const link = screen.getByRole('link', { name: /learnimo/i });
        expect(link).toHaveAttribute('href', '/en');
      });
    });

    it('renders the page heading', async () => {
      renderPage();
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /set a new password/i })
        ).toBeInTheDocument();
      });
    });

    it('renders the back to login link below the card', async () => {
      renderPage();
      await waitFor(() => {
        const links = screen.getAllByRole('link', { name: /back to login/i });
        expect(links.length).toBeGreaterThan(0);
      });
    });
  });

  describe('invalid/expired token', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams({ token: 'stale-token' });
      vi.mocked(validatePasswordResetTokenApi).mockRejectedValue(
        new Error('Invalid token')
      );
    });

    it('shows an error message for invalid token', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /link expired or invalid/i })).toBeInTheDocument();
      });
    });

    it('shows an error icon', async () => {
      renderPage();
      await waitFor(() => {
        const icons = screen.getAllByRole('img', { hidden: true });
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it('shows a link to request a new reset link', async () => {
      renderPage();
      await waitFor(() => {
        const link = screen.getByRole('link', { name: /request a new link/i });
        expect(link).toHaveAttribute('href', '/en/forgot-password');
      });
    });

    it('does not render the reset form', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.queryByTestId('reset-password-form')).not.toBeInTheDocument();
      });
    });

    it('shows the back to login link', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
      });
    });
  });

  describe('missing token', () => {
    beforeEach(() => {
      // No token in searchParams
      vi.mocked(validatePasswordResetTokenApi).mockResolvedValue({ valid: 'true' });
    });

    it('shows an error when no token is present', async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /link expired or invalid/i })).toBeInTheDocument();
      });
    });

    it('does not call the API when no token is present', async () => {
      renderPage();
      await waitFor(() => {
        expect(validatePasswordResetTokenApi).not.toHaveBeenCalled();
      });
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams({ token: 'valid-token' });
      vi.mocked(validatePasswordResetTokenApi).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
    });

    it('shows a spinner while validating the token', () => {
      renderPage();
      expect(screen.getByText(/validating reset link/i)).toBeInTheDocument();
    });
  });
});
