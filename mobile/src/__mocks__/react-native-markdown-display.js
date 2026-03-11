/**
 * Minimal react-native-markdown-display mock for the 'components' jest project.
 */
const React = require('react');

const Markdown = ({ children, style: _style }) =>
  React.createElement('span', { 'data-testid': 'markdown' }, children);

module.exports = { __esModule: true, default: Markdown };
