/**
 * Minimal react-native-safe-area-context mock for the 'screens' jest project (node env).
 */
const React = require('react');

const SafeAreaView = ({ children, style: _style }) =>
  React.createElement('div', { 'data-testid': 'safe-area-view' }, children);

module.exports = { SafeAreaView };
