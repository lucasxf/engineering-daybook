/**
 * Minimal react-native mock for the 'components' jest project.
 * This project uses node environment to avoid jest-expo setup.js failures on Node 22 + RN 0.76.
 */
const React = require('react');

const Text = ({ children, testID }) =>
  React.createElement('span', { 'data-testid': testID }, children);

const View = ({ children }) => React.createElement('div', null, children);

module.exports = { Text, View };
