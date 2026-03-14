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

const TextInput = ({ testID, ...props }) =>
  React.createElement('input', { 'data-testid': testID, ...props });

const Image = ({ testID, accessibilityLabel, ...props }) =>
  React.createElement('img', { 'data-testid': testID, 'aria-label': accessibilityLabel, ...props });

module.exports = { Text, View, Pressable, StyleSheet, TextInput, Image };
