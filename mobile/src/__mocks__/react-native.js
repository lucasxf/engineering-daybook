/**
 * Minimal react-native mock for the 'components' jest project.
 * This project uses node environment to avoid jest-expo setup.js failures on Node 22 + RN 0.76.
 */
const React = require('react');

const Text = ({ children, testID, style: _style }) =>
  React.createElement('span', { 'data-testid': testID }, children);

const View = ({ children, testID, style: _style, accessible: _a, accessibilityLabel: _al }) =>
  React.createElement('div', { 'data-testid': testID }, children);

const Pressable = ({ children, onPress, testID, disabled: _d, style: _style }) =>
  React.createElement(
    'button',
    { 'data-testid': testID, onClick: onPress },
    typeof children === 'function' ? children({ pressed: false }) : children,
  );

const ActivityIndicator = ({ testID, size: _size, color: _color }) =>
  React.createElement('span', { 'data-testid': testID || 'activity-indicator' });

const Image = ({ source: _source, style: _style, accessibilityLabel: _al }) =>
  React.createElement('img', {});

const Alert = {
  alert: jest.fn(),
};

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
};

module.exports = { Text, View, Pressable, ActivityIndicator, Image, Alert, StyleSheet };
