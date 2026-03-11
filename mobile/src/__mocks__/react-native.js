/**
 * Minimal react-native mock for the 'components' jest project.
 * This project uses node environment to avoid jest-expo setup.js failures on Node 22 + RN 0.76.
 */
const React = require('react');

const Text = ({ children, testID }) =>
  React.createElement('span', { 'data-testid': testID }, children);

const View = ({ children }) => React.createElement('div', null, children);

const Pressable = ({ children, onPress, accessibilityRole, accessibilityLabel, style }) =>
  React.createElement(
    'button',
    { onClick: onPress, role: accessibilityRole, 'aria-label': accessibilityLabel },
    children
  );

const StyleSheet = {
  create: (styles) => styles,
};

module.exports = { Text, View, Pressable, StyleSheet };
