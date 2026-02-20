import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { HomeCta } from '@/components/home/HomeCta';
import { createMockAuth, homeMessages } from '@/test/page-test-utils';

let mockAuth = createMockAuth();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

const renderCta = (locale = 'en') =>
  render(
    <NextIntlClientProvider locale={locale} messages={homeMessages}>
      <HomeCta locale={locale} />
    </NextIntlClientProvider>
  );

describe('HomeCta', () => {
  beforeEach(() => {
    mockAuth = createMockAuth();
  });

  describe('unauthenticated user', () => {
    it('shows "Get Started" label', () => {
      renderCta();
      expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    });

    it('links to /register', () => {
      renderCta();
      expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute(
        'href',
        '/en/register'
      );
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      mockAuth = createMockAuth({
        isAuthenticated: true,
        user: { userId: 'u1', email: 'test@example.com', handle: 'testuser' },
      });
    });

    it('shows "View my learnings" label', () => {
      renderCta();
      expect(screen.getByRole('link', { name: /view my learnings/i })).toBeInTheDocument();
    });

    it('links to /poks', () => {
      renderCta();
      expect(screen.getByRole('link', { name: /view my learnings/i })).toHaveAttribute(
        'href',
        '/en/poks'
      );
    });

    it('does NOT show "Get Started"', () => {
      renderCta();
      expect(screen.queryByRole('link', { name: /get started/i })).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      mockAuth = createMockAuth({ isLoading: true });
    });

    it('shows "Get Started" as safe default while auth resolves', () => {
      renderCta();
      expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
    });

    it('links to /register while loading', () => {
      renderCta();
      expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute(
        'href',
        '/en/register'
      );
    });
  });

  describe('locale support', () => {
    it('authenticated user links to correct locale poks path', () => {
      mockAuth = createMockAuth({
        isAuthenticated: true,
        user: { userId: 'u1', email: 'test@example.com', handle: 'testuser' },
      });
      render(
        <NextIntlClientProvider locale="pt-BR" messages={homeMessages}>
          <HomeCta locale="pt-BR" />
        </NextIntlClientProvider>
      );
      expect(screen.getByRole('link')).toHaveAttribute('href', '/pt-BR/poks');
    });
  });
});
