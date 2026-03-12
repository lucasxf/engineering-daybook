import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LearningMarkdown } from './learning-markdown';

describe('LearningMarkdown', () => {
  it('renders plain text paragraphs', () => {
    render(<LearningMarkdown content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders bold text with <strong>', () => {
    const { container } = render(<LearningMarkdown content="This is **bold** text" />);
    expect(container.querySelector('strong')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
  });

  it('renders italic text with <em>', () => {
    const { container } = render(<LearningMarkdown content="This is *italic* text" />);
    expect(container.querySelector('em')).toBeInTheDocument();
  });

  it('renders inline code with <code>', () => {
    const { container } = render(<LearningMarkdown content="Use `console.log`" />);
    expect(container.querySelector('code')).toBeInTheDocument();
    expect(screen.getByText('console.log')).toBeInTheDocument();
  });

  it('renders fenced code blocks with <pre>', () => {
    const { container } = render(
      <LearningMarkdown content={"```js\nconst x = 1;\n```"} />
    );
    expect(container.querySelector('pre')).toBeInTheDocument();
    expect(screen.getByText('js')).toBeInTheDocument();
  });

  it('renders ## as h2', () => {
    const { container } = render(<LearningMarkdown content="## Section Title" />);
    const h2 = container.querySelector('h2');
    expect(h2).toBeInTheDocument();
    expect(h2?.textContent).toContain('Section Title');
  });

  it('renders ### as h3', () => {
    const { container } = render(<LearningMarkdown content="### Subsection" />);
    const h3 = container.querySelector('h3');
    expect(h3).toBeInTheDocument();
    expect(h3?.textContent).toContain('Subsection');
  });

  it('renders bullet lists', () => {
    const { container } = render(
      <LearningMarkdown content={"- item one\n- item two"} />
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(screen.getByText('item one')).toBeInTheDocument();
    expect(screen.getByText('item two')).toBeInTheDocument();
  });

  it('renders blockquotes', () => {
    const { container } = render(<LearningMarkdown content="> A wise quote" />);
    const bq = container.querySelector('blockquote');
    expect(bq).toBeInTheDocument();
    expect(bq?.textContent).toContain('A wise quote');
  });

  it('renders # as h2 (h1 mapped to h2)', () => {
    const { container } = render(<LearningMarkdown content="# Big Heading" />);
    const h2 = container.querySelector('h2');
    expect(h2).toBeInTheDocument();
    expect(h2?.textContent).toContain('Big Heading');
  });

  it('inserts spacer divs for empty lines', () => {
    const { container } = render(
      <LearningMarkdown content={"Para one\n\nPara two"} />
    );
    // Empty line produces a spacer div with aria-hidden
    const spacer = container.querySelector('[aria-hidden="true"]');
    expect(spacer).toBeInTheDocument();
  });
});
