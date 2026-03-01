import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/Textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Textarea ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('applies normal border classes when no error', () => {
    render(<Textarea aria-label="content" />);
    const el = screen.getByRole('textbox');
    expect(el.className).toContain('border-slate-300');
    expect(el.className).not.toContain('border-red-500');
  });

  it('applies error border classes when hasError is true', () => {
    render(<Textarea aria-label="content" hasError />);
    const el = screen.getByRole('textbox');
    expect(el.className).toContain('border-red-500');
    expect(el.className).toContain('focus:ring-red-500');
  });

  it('passes through HTML attributes', () => {
    render(<Textarea rows={5} placeholder="Type here" />);
    const el = screen.getByRole('textbox');
    expect(el).toHaveAttribute('rows', '5');
    expect(el).toHaveAttribute('placeholder', 'Type here');
  });

  it('merges custom className', () => {
    render(<Textarea className="resize-none" />);
    expect(screen.getByRole('textbox').className).toContain('resize-none');
  });
});
