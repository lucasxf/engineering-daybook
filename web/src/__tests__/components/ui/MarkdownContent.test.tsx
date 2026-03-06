import { render, screen } from '@testing-library/react';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

describe('MarkdownContent', () => {
  describe('rendering', () => {
    it('renders plain text', () => {
      render(<MarkdownContent content="Hello world" />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders bold text as <strong>', () => {
      render(<MarkdownContent content="**bold**" />);
      expect(document.querySelector('strong')).toBeInTheDocument();
      expect(document.querySelector('strong')?.textContent).toBe('bold');
    });

    it('renders italic text as <em>', () => {
      render(<MarkdownContent content="*italic*" />);
      expect(document.querySelector('em')).toBeInTheDocument();
      expect(document.querySelector('em')?.textContent).toBe('italic');
    });

    it('renders headings', () => {
      render(<MarkdownContent content="# Heading 1" />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders code blocks as <pre><code>', () => {
      render(<MarkdownContent content={'```\nconst x = 1;\n```'} />);
      expect(document.querySelector('pre')).toBeInTheDocument();
      expect(document.querySelector('code')).toBeInTheDocument();
    });

    it('renders inline code', () => {
      render(<MarkdownContent content="use `console.log` here" />);
      expect(document.querySelector('code')).toBeInTheDocument();
    });

    it('renders links as <a>', () => {
      render(<MarkdownContent content="[example](https://example.com)" />);
      const link = document.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.textContent).toBe('example');
    });

    it('renders GFM tables', () => {
      const table = `| A | B |\n|---|---|\n| 1 | 2 |`;
      render(<MarkdownContent content={table} />);
      expect(document.querySelector('table')).toBeInTheDocument();
    });

    it('renders GFM task lists as list items', () => {
      render(<MarkdownContent content="- [x] done\n- [ ] todo" />);
      // rehype-sanitize strips input elements, but list items still render
      expect(document.querySelector('ul')).toBeInTheDocument();
      expect(screen.getByText(/done/)).toBeInTheDocument();
      expect(screen.getByText(/todo/)).toBeInTheDocument();
    });
  });

  describe('XSS sanitization', () => {
    it('strips <script> tags from raw HTML', () => {
      render(<MarkdownContent content={'<script>alert("xss")</script>'} />);
      // rehype-sanitize strips script elements entirely
      expect(document.querySelector('script')).not.toBeInTheDocument();
    });

    it('strips onerror attributes from img tags', () => {
      render(<MarkdownContent content={'<img src="x" onerror="alert(1)" />'} />);
      // rehype-sanitize either strips the img entirely or removes the onerror attribute
      const img = document.querySelector('img');
      if (img) {
        expect(img.getAttribute('onerror')).toBeNull();
      } else {
        // img was stripped entirely — also safe
        expect(img).toBeNull();
      }
    });

    it('strips javascript: href from links', () => {
      render(<MarkdownContent content={'[click](javascript:alert(1))'} />);
      const link = document.querySelector('a');
      // rehype-sanitize removes javascript: hrefs; link may have no href or be stripped
      if (link) {
        const href = link.getAttribute('href');
        expect(href ?? '').not.toContain('javascript:');
      } else {
        // link was stripped entirely — also safe
        expect(link).toBeNull();
      }
    });
  });

  describe('variants', () => {
    it('applies prose class in full variant', () => {
      const { container } = render(<MarkdownContent content="text" variant="full" />);
      expect(container.firstChild).toHaveClass('prose');
    });

    it('applies prose-sm class in compact variant', () => {
      const { container } = render(<MarkdownContent content="text" variant="compact" />);
      expect(container.firstChild).toHaveClass('prose-sm');
    });

    it('defaults to full variant', () => {
      const { container } = render(<MarkdownContent content="text" />);
      expect(container.firstChild).toHaveClass('prose');
      expect(container.firstChild).not.toHaveClass('prose-sm');
    });

    it('accepts a custom className', () => {
      const { container } = render(<MarkdownContent content="text" className="mt-4" />);
      expect(container.firstChild).toHaveClass('mt-4');
    });
  });
});
