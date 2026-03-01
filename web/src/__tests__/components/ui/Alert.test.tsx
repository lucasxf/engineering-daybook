import { render, screen } from '@testing-library/react';
import { Alert } from '@/components/ui/Alert';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert variant="error">Something went wrong</Alert>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="alert" by default', () => {
    render(<Alert variant="error">Error</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('accepts a custom role', () => {
    render(<Alert variant="success" role="status">Done</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies error variant classes', () => {
    render(<Alert variant="error">Error</Alert>);
    const el = screen.getByRole('alert');
    expect(el.className).toContain('border-red-300');
    expect(el.className).toContain('bg-red-50');
    expect(el.className).toContain('text-red-700');
  });

  it('applies success variant classes', () => {
    render(<Alert variant="success">OK</Alert>);
    const el = screen.getByRole('alert');
    expect(el.className).toContain('border-green-300');
    expect(el.className).toContain('bg-green-50');
    expect(el.className).toContain('text-green-700');
  });

  it('applies info variant classes', () => {
    render(<Alert variant="info">Note</Alert>);
    const el = screen.getByRole('alert');
    expect(el.className).toContain('border-slate-300');
  });

  it('merges custom className', () => {
    render(<Alert variant="error" className="mb-4">Error</Alert>);
    expect(screen.getByRole('alert').className).toContain('mb-4');
  });
});
