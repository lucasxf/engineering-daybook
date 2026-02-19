import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

let mockLocale: string = 'en';
let mockPathname: string = '/en/poks';

vi.mock('next-intl', () => ({
  useLocale: () => mockLocale,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    mockLocale = 'en';
    mockPathname = '/en/poks';
    // Reset window.location.href spy
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  it('renders "EN" label when locale is en', () => {
    render(<LanguageToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('EN');
  });

  it('renders "PT" label when locale is pt-BR', () => {
    mockLocale = 'pt-BR';
    render(<LanguageToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('PT');
  });

  it('has aria-label "Switch to Português (Brasil)" when locale is en', () => {
    mockLocale = 'en';
    render(<LanguageToggle />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to Português (Brasil)'
    );
  });

  it('has aria-label "Switch to English" when locale is pt-BR', () => {
    mockLocale = 'pt-BR';
    render(<LanguageToggle />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to English');
  });

  it('navigates to pt-BR path when clicked in EN', () => {
    mockLocale = 'en';
    mockPathname = '/en/poks';
    render(<LanguageToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(window.location.href).toBe('/pt-BR/poks');
  });

  it('navigates to en path when clicked in pt-BR', () => {
    mockLocale = 'pt-BR';
    mockPathname = '/pt-BR/poks';
    render(<LanguageToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(window.location.href).toBe('/en/poks');
  });
});
