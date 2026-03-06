import { stripMarkdown } from '../stripMarkdown';

describe('stripMarkdown', () => {
  it('returns plain text unchanged', () => {
    expect(stripMarkdown('Hello world')).toBe('Hello world');
  });

  it('strips heading markers', () => {
    expect(stripMarkdown('# Heading 1')).toBe('Heading 1');
    expect(stripMarkdown('## Heading 2')).toBe('Heading 2');
    expect(stripMarkdown('### Heading 3')).toBe('Heading 3');
  });

  it('strips bold markers', () => {
    expect(stripMarkdown('**bold text**')).toBe('bold text');
    expect(stripMarkdown('__bold text__')).toBe('bold text');
  });

  it('strips italic markers', () => {
    expect(stripMarkdown('*italic*')).toBe('italic');
    expect(stripMarkdown('_italic_')).toBe('italic');
  });

  it('strips strikethrough markers', () => {
    expect(stripMarkdown('~~deleted~~')).toBe('deleted');
  });

  it('strips inline code backticks', () => {
    expect(stripMarkdown('use `console.log`')).toBe('use console.log');
  });

  it('strips fenced code blocks', () => {
    expect(stripMarkdown('```\nconst x = 1;\n```')).toBe('');
    expect(stripMarkdown('text before\n```\ncode\n```\ntext after')).toBe('text before text after');
  });

  it('strips unordered list markers', () => {
    expect(stripMarkdown('- item one')).toBe('item one');
    expect(stripMarkdown('* item two')).toBe('item two');
    expect(stripMarkdown('+ item three')).toBe('item three');
  });

  it('strips ordered list markers', () => {
    expect(stripMarkdown('1. first')).toBe('first');
    expect(stripMarkdown('10. tenth')).toBe('tenth');
  });

  it('extracts link text and strips URL', () => {
    expect(stripMarkdown('[click here](https://example.com)')).toBe('click here');
  });

  it('extracts image alt text and strips URL', () => {
    expect(stripMarkdown('![alt text](https://example.com/img.png)')).toBe('alt text');
  });

  it('strips blockquote markers', () => {
    expect(stripMarkdown('> quoted text')).toBe('quoted text');
  });

  it('collapses multiple newlines to a single space', () => {
    expect(stripMarkdown('line one\n\nline two')).toBe('line one line two');
  });

  it('collapses multiple spaces', () => {
    expect(stripMarkdown('word1   word2')).toBe('word1 word2');
  });

  it('returns empty string for empty input', () => {
    expect(stripMarkdown('')).toBe('');
  });

  it('handles mixed markdown', () => {
    const md = '## Title\n\n**Bold** and *italic* with [a link](url) and `code`';
    const result = stripMarkdown(md);
    expect(result).toBe('Title Bold and italic with a link and code');
  });
});
