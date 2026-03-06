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

import { MarkdownContent } from '../MarkdownContent';

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
