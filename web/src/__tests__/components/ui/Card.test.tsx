import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders a div by default', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('renders as article when as="article"', () => {
    const { container } = render(<Card as="article">Content</Card>);
    expect(container.firstChild?.nodeName).toBe('ARTICLE');
  });

  it('applies base card classes', () => {
    const { container } = render(<Card>Content</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-lg');
    expect(el.className).toContain('border-slate-200');
    expect(el.className).toContain('bg-white');
  });

  it('merges custom className', () => {
    const { container } = render(<Card className="p-6 shadow-sm">Content</Card>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('p-6');
    expect(el.className).toContain('shadow-sm');
  });
});
