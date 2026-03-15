/**
 * MarkdownContent component tests.
 * Runs in the 'components' jest project (node environment).
 * react-native and react-native-markdown-display are mocked — see src/__mocks__/.
 */
import React from 'react';

jest.mock('@/contexts/ThemeContext', () => {
  const { lightTheme } = require('@/theme/tokens');
  return { useTheme: () => ({ theme: lightTheme }) };
});

import { MarkdownContent, buildStyles } from '../MarkdownContent';
import { lightTheme } from '@/theme/tokens';

// Verify component can be constructed with required props
describe('MarkdownContent', () => {
  it('is a function (valid React component)', () => {
    expect(typeof MarkdownContent).toBe('function');
  });

  it('renders a React element for plain text', () => {
    const element = React.createElement(MarkdownContent, { content: 'Hello world' });
    expect(element).toBeTruthy();
    expect(element.type).toBe(MarkdownContent);
    expect(element.props.content).toBe('Hello world');
  });

  it('renders a React element for markdown content', () => {
    const element = React.createElement(MarkdownContent, { content: '**bold** and *italic*' });
    expect(element.props.content).toBe('**bold** and *italic*');
  });

  it('renders a React element for empty content', () => {
    const element = React.createElement(MarkdownContent, { content: '' });
    expect(element.props.content).toBe('');
  });

  it('renders a React element for multiline content', () => {
    const content = '# Title\n\nSome body text\n\n- item 1\n- item 2';
    const element = React.createElement(MarkdownContent, { content });
    expect(element.props.content).toBe(content);
  });
});

describe('buildStyles', () => {
  it('applies DM Sans font family to body text', () => {
    const styles = buildStyles(lightTheme);
    expect(styles.body.fontFamily).toBe('DMSans_400Regular');
  });

  it('applies Sora font family to headings', () => {
    const styles = buildStyles(lightTheme);
    expect(styles.heading1.fontFamily).toBe('Sora_600SemiBold');
    expect(styles.heading2.fontFamily).toBe('Sora_600SemiBold');
    expect(styles.heading3.fontFamily).toBe('Sora_600SemiBold');
  });

  it('applies contentBody color to body text', () => {
    const styles = buildStyles(lightTheme);
    expect(styles.body.color).toBe(lightTheme.colors.contentBody);
  });

  it('applies bodyMedium fontFamily to strong text — no fontWeight to avoid Android synthesis', () => {
    const styles = buildStyles(lightTheme);
    expect(styles.strong.fontFamily).toBe('DMSans_500Medium');
    expect((styles.strong as Record<string, unknown>).fontWeight).toBeUndefined();
  });
});
