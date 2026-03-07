import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

// next/image renders a plain <img> in test environments
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; width?: number; height?: number }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} {...rest} />
  ),
}));

describe('Avatar', () => {
  const baseProps = { displayName: 'Alice Smith', handle: 'alice' };

  it('renders image when avatarUrl is provided', () => {
    render(<Avatar {...baseProps} avatarUrl="https://example.com/alice.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/alice.jpg');
    expect(img).toHaveAttribute('alt', "Alice Smith's avatar");
  });

  it('renders initials placeholder when avatarUrl is absent', () => {
    render(<Avatar {...baseProps} />);
    expect(screen.queryByRole('img')).toBeNull();
    const placeholder = screen.getByLabelText("Alice Smith's avatar");
    expect(placeholder.textContent).toBe('A');
  });

  it('renders initials placeholder when avatarUrl is null', () => {
    render(<Avatar {...baseProps} avatarUrl={null} />);
    expect(screen.queryByRole('img')).toBeNull();
    const placeholder = screen.getByLabelText("Alice Smith's avatar");
    expect(placeholder.textContent).toBe('A');
  });

  it('uses first letter of displayName as initial', () => {
    render(<Avatar displayName="Bob Jones" handle="bob" />);
    const placeholder = screen.getByLabelText("Bob Jones's avatar");
    expect(placeholder.textContent).toBe('B');
  });

  it('same handle always yields the same background color class', () => {
    const { container: c1 } = render(<Avatar {...baseProps} />);
    const { container: c2 } = render(<Avatar displayName="Alice Smith" handle="alice" />);
    const span1 = c1.querySelector('span');
    const span2 = c2.querySelector('span');
    expect(span1?.className).toBe(span2?.className);
  });

  it('applies custom size', () => {
    render(<Avatar {...baseProps} size={32} />);
    const placeholder = screen.getByLabelText("Alice Smith's avatar");
    expect(placeholder).toHaveStyle('width: 32px');
    expect(placeholder).toHaveStyle('height: 32px');
  });

  it('shows ? initial for empty displayName', () => {
    render(<Avatar displayName="" handle="ghost" />);
    const placeholder = screen.getByLabelText("'s avatar");
    expect(placeholder.textContent).toBe('?');
  });
});
