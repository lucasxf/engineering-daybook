/**
 * Minimal react-native mock for the 'components' and 'screens' jest projects.
 * These projects use node environment to avoid jest-expo setup.js failures on Node 22 + RN 0.76+.
 *
 * IMPORTANT: Keep testID as-is in props — RNTL's getByTestId searches the React fiber tree
 * for nodes where node.props.testID === id. If we rename it to data-testid, RNTL won't find it.
 */
const React = require('react');

const Text = ({ children, testID, style: _style, ...rest }) =>
  React.createElement('span', { testID, ...rest }, children);

const View = ({ children, testID, style: _style, accessible: _a, accessibilityLabel: _al, ...rest }) =>
  React.createElement('div', { testID, ...rest }, children);

const ScrollView = ({ children, testID, style: _style, contentContainerStyle: _ccs, ...rest }) =>
  React.createElement('div', { testID: testID || 'scroll-view', ...rest }, children);

const Pressable = ({ children, onPress, testID, disabled, style: _style, accessibilityRole: _ar, accessibilityLabel: _al, ...rest }) =>
  React.createElement(
    'button',
    { testID, onClick: onPress, disabled, ...rest },
    typeof children === 'function' ? children({ pressed: false }) : children,
  );

const TextInput = ({ value, onChangeText, testID, placeholder: _ph, maxLength: _ml, multiline: _mu, numberOfLines: _nl, style: _style, editable: _ed, ...rest }) =>
  React.createElement('input', {
    testID,
    value: value ?? '',
    // Keep onChangeText in props so RNTL's fireEvent.changeText can find it
    onChangeText,
    onChange: (e) => onChangeText && onChangeText(e.target.value),
    ...rest,
  });

const ActivityIndicator = ({ testID, size: _size, color: _color }) =>
  React.createElement('span', { testID: testID || 'activity-indicator' });

const Image = ({ source: _source, style: _style, accessibilityLabel: _al, testID }) =>
  React.createElement('img', { testID });

const Switch = ({ value: _v, onValueChange: _ovc, testID, ...rest }) =>
  React.createElement('input', { type: 'checkbox', testID, ...rest });

const Modal = ({ children, testID, visible: _v, ...rest }) =>
  React.createElement('div', { testID, role: 'dialog', ...rest }, children);

const Alert = {
  alert: jest.fn(),
};

const Linking = {
  openSettings: jest.fn(() => Promise.resolve()),
  openURL: jest.fn(() => Promise.resolve()),
};

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
};

module.exports = {
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
  Switch,
  Modal,
  Alert,
  Linking,
  StyleSheet,
};
