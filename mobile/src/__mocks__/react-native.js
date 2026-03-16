/**
 * Minimal react-native mock for the 'components' and 'screens' jest projects.
 * These projects use node environment to avoid jest-expo setup.js failures on Node 22 + RN 0.76.
 */
const React = require('react');

const Text = ({ children, testID }) =>
  React.createElement('span', { 'data-testid': testID }, children);

const View = ({ children, style }) =>
  React.createElement('div', { style }, children);

const ScrollView = ({ children, contentContainerStyle }) =>
  React.createElement('div', { style: contentContainerStyle }, children);

const KeyboardAvoidingView = ({ children, style }) =>
  React.createElement('div', { style }, children);

const Pressable = ({ children, onPress, accessibilityRole, accessibilityLabel, style }) =>
  React.createElement(
    'button',
    { onClick: onPress, role: accessibilityRole, 'aria-label': accessibilityLabel },
    children
  );

const StyleSheet = {
  create: (styles) => styles,
};

const TextInput = ({ testID, accessibilityLabel, ...props }) =>
  React.createElement('input', { 'data-testid': testID, 'aria-label': accessibilityLabel, ...props });

const Image = ({ testID, accessibilityLabel, source, ...props }) => {
  const src = source && typeof source === 'object' ? source.uri : source;
  return React.createElement('img', { 'data-testid': testID, 'aria-label': accessibilityLabel, src, ...props });
};

const ActivityIndicator = () => React.createElement('span', null, 'loading');

const Modal = ({ children, visible }) =>
  visible ? React.createElement('div', { role: 'dialog' }, children) : null;

const Platform = { OS: 'ios', select: (obj) => obj.ios ?? obj.default };

module.exports = {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
};
