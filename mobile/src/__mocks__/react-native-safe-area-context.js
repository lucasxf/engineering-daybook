/**
 * Minimal react-native-safe-area-context mock for the 'screens' jest project (node env).
 */
const React = require('react');

const SafeAreaView = ({ children, style }) =>
  React.createElement('div', { style }, children);

module.exports = { SafeAreaView };
