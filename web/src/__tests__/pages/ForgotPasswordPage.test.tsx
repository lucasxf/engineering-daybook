import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ForgotPasswordPage from '@/app/[locale]/forgot-password/page';
import { authMessages } from '@/test/page-test-utils';

vi.mock('@/components/auth/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <form data-testid="forgot-password-form" />,
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

const renderPage = () =>
  render(
    <NextIntlClientProvider locale="en" messages={authMessages}>
      <ForgotPasswordPage />
    </NextIntlClientProvider>
  );

describe('ForgotPasswordPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: /forgot your password/i })
    ).toBeInTheDocument();
  });

  it('renders the forgot password form', () => {
    renderPage();
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('renders a back to login link', () => {
    renderPage();
    const link = screen.getByRole('link', { name: /back to login/i });
    expect(link).toHaveAttribute('href', '/en/login');
  });
});
